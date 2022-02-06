const express = require('express');
const router = express.Router();
const HttpStatusCodes = require('http-status-codes').StatusCodes;
const AH = require('./ah.api');
const ahService = require('./ah.service')
var cron = require('node-cron');

const ah = new AH();

const searchProducts = (req, res) => {
    const query = req.query.query;

    ah.getProductsByName(query)
        .then(response => res.send(response.cards.map(x => x.products[0])))
        .catch(err => handleError(err, res));
}

const getAllProductsOfCategory = (categoryId, page=0, allProducts=[]) => {
    console.log(categoryId);
    return ah.getProductsByName(query=null, categoryId=categoryId, size=1000, page=page)
        .then((response) => {
            allProducts.push(...response.cards.map(x => x.products[0]));
            if (page == response.page.totalPages - 1 || page == 2) {
                return allProducts;
            } else {
                return getAllProductsOfCategory(categoryId, page + 1, allProducts);
            }
        });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const isCurrentlyInBonus = (prod) => {
    if (prod.discount != null) {
        // get end date and correct it by adding 24 hours (e.g. end date is 12-12-2021 at 00:00, set it to 13-12-2021 at 00:00)
        const endDate = new Date(prod.discount.endDate).setHours(new Date(prod.discount.endDate).getHours() + 24);
        const startDate = new Date(prod.discount.startDate);

        return endDate >= Date.now() && startDate <= Date.now();
    } else {
        return false
    }
}

const syncAllProducts = async () => {
    return ah.getCategories()
        .then(resp => {
            let promises = [];
            resp.reduce(function(promise, cat) {
                return promise.then(function(result) {
                  return Promise.all([delay(10000), getAllProductsOfCategory(cat.id)
                    .then(products => {
                      products.forEach(product => {
                        promises.push(ahService.updateProduct(
                            product.id, 
                            product.price.was != null ? product.price.was : product.price.now, 
                            isCurrentlyInBonus(product), 
                            isCurrentlyInBonus(product) ? product.shield.text: null, 
                            isCurrentlyInBonus(product) ? product.price.now: null
                            ));
                        });
                    })]);
                });
            }, Promise.resolve());
        }); 
}

const syncProductsRequest = async (req, res) => {
    await syncAllProducts()
        .then(() => res.sendStatus(HttpStatusCodes.OK))
        .catch((err) => handleError(err, res));
}

const getCategories = (req, res) => {
    ah.getCategories()
        .then(response => res.send(response.map(x => {
            return {
                id: x.id,
                name: x.name,
                slugifiedName: x.slugifiedName,
                image: x.image
            }
        })))
        .catch(err => handleError(err, res));
}

// Sync bonus products every night at 02:00
cron.schedule('* 2 * * *', () => {
    console.log("running daily cron schedule to update products");

    syncAllProducts();    
});


const handleError = (err, res) => {
    res.status(HttpStatusCodes.BAD_REQUEST).send({ message: err.message })
}

router.get('/search', searchProducts);
router.get('/syncproducts', syncProductsRequest);
router.get('/categories', getCategories);

module.exports = router;