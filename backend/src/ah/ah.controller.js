const express = require('express');
const router = express.Router();
const HttpStatusCodes = require('http-status-codes').StatusCodes;
const ahService = require('./ah.service')
var cron = require('node-cron');

const searchProducts = (req, res) => {
    const query = req.query.query;
    ahService.searchProducts(query)
        .then(products => res.send(products))
        .catch(err => handleError(err, res));
}

const getAllBonusProducts = (page=0, size=1000, allProducts=[]) => {
    return ahService.getBonusProducts(page).then((response) => {
        allProducts.push(...response.products);
            if (page == response.page.totalPages - 1 || page == 2) {
                return allProducts;
            } else {
                return getAllBonusProducts(page + 1, size, allProducts);
            }
    });s
}

const getBonusProducts = (req, res) => {
    getAllBonusProducts()
        .then(products => res.send(products))
        .catch(err => handleError(err, res));
}

const filterBonusProductsOnCurrentWeek = (prod) => {
    // get end date and correct it by adding 24 hours (e.g. end date is 12-12-2021 at 00:00, set it to 13-12-2021 at 00:00)
    const endDate = new Date(prod.bonusEndDate).setHours(new Date(prod.bonusEndDate).getHours() + 24);
    const startDate = new Date(prod.bonusStartDate);

    return endDate >= Date.now() && startDate <= Date.now();
}

const syncBonus = () => {
    return getAllBonusProducts().then((products) => {
        const bonus_products = products.filter(filterBonusProductsOnCurrentWeek);
        const product_ids = bonus_products.map((i) => i.webshopId);
        return ahService.getProductsWithAhIds(product_ids)
            .then(products => {
                return ahService.removeBonusProperties()
                    .then(() => {
                        let promises = [];
                        // Set bonus properties for ingredients
                        products.forEach((ingredient) => {
                            const product = bonus_products.filter(p => p.webshopId == ingredient.ah_id)[0];
                            promises.push(ahService.setBonusProperties(product.webshopId, product.isBonus, product.bonusMechanism, product.currentPrice));
                        });

                        Promise.all(promises).then(() => {
                            return;
                        });
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

const handleError = (err, res) => {
    res.status(HttpStatusCodes.BAD_REQUEST).send({ message: err.message })
}

router.get('/search', searchProducts);
router.get('/bonus', getBonusProducts);
router.get('/syncbonus', syncBonusRequest);

module.exports = router;