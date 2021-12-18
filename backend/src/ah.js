const HttpStatusCodes = require('http-status-codes').StatusCodes;
var request = require('request');
const db = require('./database');
var cron = require('node-cron');

function getAccessToken() {
    return new Promise((resolve, reject) => {
        request.post('https://ms.ah.nl/create-anonymous-member-token', function(err, resp, body) {
            if (err || resp.statusCode !== HttpStatusCodes.OK) {
                console.log('error getting ah access token', err.statusCode, err.ErrorMessage);
                reject();
            }
            resolve(JSON.parse(body).access_token);
        });
    });
}

const searchProducts = async (req, res) => {
    const query = req.query.query;

    const access_token = await getAccessToken();
    request.get({url:'https://ms.ah.nl/mobile-services/product/search/v2?sortOn=RELEVANCE', qs:{"query": query, "size": 8}}, function(err, resp, body) {
        if (err || resp.statusCode !== HttpStatusCodes.OK) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          }
        else {
          res.send(JSON.parse(body).products);
        }
    })
    .auth(null, null, true, access_token);
}

const getBonusProducts = async (get_all, page=0, size=1000, tries=0, products=[]) => {
    const access_token = await getAccessToken();

    return new Promise((resolve, reject) => {
        request.get(
            {
            url:'https://ms.ah.nl/mobile-services/product/search/v2',
            qs:{query: "", filters: "bonus=true", size: size, page: page, sortOn: "PRICELOWHIGH"}
            }, function(err, resp, body) {
                if (err || resp.statusCode !== HttpStatusCodes.OK) {
                    if (tries < 10) {
                        resolve(getBonusProducts(get_all, page, size, tries + 1, products));
                    } else {
                        reject('Could not get the bonus products', err);
                    }
                } else {
                    const json = JSON.parse(body);
                    products.push(...json.products);

                    if (page == json.page.totalPages - 1 || page == 2  || !get_all) {
                        resolve(products);
                    } else {
                        resolve(getBonusProducts(get_all, page + 1, size, 0, products));
                    }
                }
            }
        ).auth(null, null, true, access_token);
    });
};

const getProduct = async (req, res) => {
    const webshopId = req.query.webshopId;

    const access_token = await getAccessToken();
    request.get({url: "https://www.ah.nl/zoeken/api/products/product", qs:{"webshopId": webshopId}}, function(err, resp, body) {
        if (err || resp.statusCode !== HttpStatusCodes.OK) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          }
        else {
          res.send(JSON.parse(body).card);
        }
    })
    .auth(null, null, true, access_token);
}

const filterBonusProductsOnCurrentWeek = (prod) => {
    // get end date and correct it by adding 24 hours (e.g. end date is 12-12-2021 at 00:00, set it to 13-12-2021 at 00:00)
    const endDate = new Date(prod.bonusEndDate).setHours(new Date(prod.bonusEndDate).getHours() + 24);
    const startDate = new Date(prod.bonusStartDate);

    return endDate >= Date.now() && startDate <= Date.now();
}

const syncBonus = () => {
    return new Promise((resolve, reject) => {
        // Get bonus products
        getBonusProducts(true).then((bonus_products) => {
            bonus_products = bonus_products.filter(filterBonusProductsOnCurrentWeek);
            console.log(bonus_products.filter((prod) => prod.title === 'Fanta Orange'));
            const product_ids = bonus_products.map((i) => i.webshopId);
            const query = `SELECT ah_id FROM ingredient WHERE ah_id IN (${product_ids.join(',')});`
            // Select bonus ingredients in database
            db.query(query, (err, result) => {
                if (err) {
                    reject(`Could not get bonus products from DB in for updating bonus ingredients, error: ${err}`);
                } else {
                    // Remove old bonus properties from ingredients
                    const removeBonusQuery = "UPDATE ingredient SET is_bonus = 0, bonus_mechanism = NULL, bonus_price = NULL WHERE is_bonus = 1;"
                    db.query(removeBonusQuery, (err, result) => {
                        if (err) {
                            reject(`Could not remove bonus products from DB for updating bonus ingredients, error: ${err}`);
                        }
                    });

                    // Set bonus properties for ingredients
                    result.forEach((ingredient, _) => {
                        const product = bonus_products.filter(p => p.webshopId == ingredient.ah_id)[0];
                        const updateQuery = "UPDATE ingredient SET is_bonus = ?, bonus_mechanism = ?, bonus_price = ? WHERE ah_id = ?;"
                        db.query(updateQuery, [product.isBonus, product.bonusMechanism, product.currentPrice, product.webshopId], (err, result) => {
                            if (err) {
                                reject(`Could not update bonus products from DB for updating bonus ingredients, error: ${err}`);
                            }
                        });
                    });
                    resolve();
                }
            });
        });
    });
}

// Sync bonus products every night at 02:00
cron.schedule('* 2 * * *', () => {
    console.log("running daily cron schedule to update bonus products");

    syncBonus();    
});

const syncBonusRequest = async (req, res) => {
    await syncBonus()
        .then(() => res.sendStatus(HttpStatusCodes.OK))
        .catch((err) => res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message })); // 500
}

const suggestWeeklyRecipes = (req, res) => {
    let bonusRecipes = [];
    const SelectQuery = `SELECT DISTINCT recipe.id AS id, recipe.name AS name, recipe.description AS description, recipe.rating AS rating FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE ingredient.is_bonus = 1;`; 
    db.query(SelectQuery, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        } else {
            bonusRecipes.push(...result);
            res.send(bonusRecipes);
        }
    });
};


const updateProducts = async (req, res) => {
    const access_token = await getAccessToken();

    const SelectQuery = `SELECT * FROM ingredient`; 
    db.query(SelectQuery, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        } else {
            result.forEach((ingredient) => {
            request.get({url:'https://ms.ah.nl/mobile-services/product/search/v2?sortOn=RELEVANCE', qs:{"query": ingredient.name}}, function(err, resp, body) {
                if (err || resp.statusCode !== HttpStatusCodes.OK) {
                    res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
                }
                else {
                    const suggestions = JSON.parse(body).products;
                    const suggestion = suggestions.filter((sug) => sug.webshopId == ingredient.ah_id)[0];

                    const updateQuery = 'UPDATE ingredient SET image_tiny = ?, image_small = ?, image_medium = ?, image_large = ?, price = ?, unit_size = ?, category = ? WHERE id = ?';
                    db.query(updateQuery, [suggestion.images[0].url, suggestion.images[1].url, suggestion.images[2].url, suggestion.images[3].url, suggestion.priceBeforeBonus, suggestion.salesUnitSize, suggestion.mainCategory, ingredient.id], (err, result) => {
                        if (err) {
                            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
                        }
                
                        // res.status(HttpStatusCodes.OK).send({}); // 200
                    })
                }
    })
    .auth(null, null, true, access_token);
            })
        }
    });

}

module.exports = {
    searchProducts,
    getProduct,
    suggestWeeklyRecipes,
    syncBonusRequest,
    updateProducts
}