const HttpStatusCodes = require('http-status-codes').StatusCodes;
var request = require('request');
const db = require('./database');


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
    request.get({url:'https://ms.ah.nl/mobile-services/product/search/v2?sortOn=RELEVANCE', qs:{"query": query, "size": 6}}, function(err, resp, body) {
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

const suggestWeeklyRecipes = async (req, res) => {
    getBonusProducts(true).then((bonus_products) => {
        let bonusRecipes = [];
        const product_ids = bonus_products.map((i) => i.webshopId);
        const SelectQuery = `SELECT DISTINCT recipe.id AS id, recipe.name AS name FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE ingredient.ah_id IN (${product_ids.join(',')});`; 
        db.query(SelectQuery, (err, result) => {
            if (err) {
                res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
            } else {
                bonusRecipes.push(...result);
                res.send(bonusRecipes);
            }
        });
    });
};

module.exports = {
    searchProducts,
    getProduct,
    suggestWeeklyRecipes
}