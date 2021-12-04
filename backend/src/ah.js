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

// const getBonusProducts = (req, res) => {
    
//     request.get('https://www.ah.nl/bonus/api/segments?segmentType=-PREMIUM', function(err, resp, body) {
//         if (err || resp.statusCode !== HttpStatusCodes.OK) {
//             res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
//           } else {
//               let bonus = JSON.parse(body).collection;
//               let bonusProducts = bonus.filter(function (item) {
//                   return item.promotionType !== "INCENTIVE";
//               })
//               res.send(bonusProducts);

//           }
//     });
// }

const getBonusProducts = () => {
    return new Promise((resolve, reject) => {
        request.get('https://www.ah.nl/bonus/api/segments?segmentType=-PREMIUM', function(err, resp, body) {
            if (err || resp.statusCode !== HttpStatusCodes.OK) {
                reject('Could not get the bonus products', err);
            } else {
                let bonus = JSON.parse(body).collection;
                let bonusProducts = bonus.filter(function (item) {
                    return item.promotionType !== "INCENTIVE";
                })
                resolve(bonusProducts);

            }
        });
    });
};

const getProduct = async (req, res) => {
    const webshopId = req.query.webshopId;

    const access_token = await getAccessToken();
    request.get({url: "https://www.ah.nl/zoeken/api/products/product?webshopId=94782", qs:{"webshopId": webshopId}}, function(err, resp, body) {
        if (err || resp.statusCode !== HttpStatusCodes.OK) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          }
        else {
          res.send(JSON.parse(body).card);
        }
    })
    .auth(null, null, true, access_token);
}

// const getBonusProductDetails = (req, res) => {
//     const bonusId = req.params.bonusId
    
//     request.get(`https://www.ah.nl/bonus/api/segments/${bonusId}`, function(err, resp, body) {
//         if (err || resp.statusCode !== HttpStatusCodes.OK) {
//             res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
//           }
//         else {
//           res.send(JSON.parse(body));
//         }
//     });
// }

const getBonusProductDetails = (bonusId) => {
    return new Promise((resolve, reject) => {
        request.get(`https://www.ah.nl/bonus/api/segments/${bonusId}`, function(err, resp, body) {
            if (err || resp.statusCode !== HttpStatusCodes.OK) {
                reject('Could not get bonus product details', err);
            }
            else {
                resolve(JSON.parse(body));
            }
        });
    });
}

const suggestWeeklyRecipes = async (req, res) => {
    getBonusProducts().then((bonus_products) => {
        const bonusRecipes = [];

        for (const bonus_product of bonus_products) {
            console.log("bonus product details: ", bonus_product.id);
            getBonusProductDetails(bonus_product.id).then((bonusProductDetails) => {
                for (const productId of bonusProductDetails.productIds) {
                    const SelectQuery =  "SELECT recipe.id AS id, recipe.name AS name FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE ingredient.id = ?;"; 
                    db.query(SelectQuery, productId, (err, result) => {
                        if (err) {
                            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
                        } else {
                            bonusRecipes.push(result);
                        }
                    });
                }
            }).catch((msg) => {
                // do nothing
            });
        }
    }).catch((msg) => {
        res.status(HttpStatusCodes.BAD_REQUEST).send({ message: msg }); // 400
    });
};

module.exports = {
    searchProducts,
    // getBonusProducts,
    getProduct,
    suggestWeeklyRecipes
    // getBonusProductDetails
}