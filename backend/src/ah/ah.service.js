const axios = require('axios');
let db = require('../database');

db = db.promise();

// get anonymous access token
const getAccessToken = () => {
    return axios.post('https://ms.ah.nl/create-anonymous-member-token')
        .then(res => res.data.access_token);
};

// search products
const searchProducts = (query) => {
    return getAccessToken().then((access_token) => {
        return axios.get(
            'https://ms.ah.nl/mobile-services/product/search/v2?sortOn=RELEVANCE', { 
                params: {
                    "query": query, 
                    "size": 8
                },
                headers: { Authorization: `Bearer ${access_token}` }
        }).then(res => res.data.products)
        .catch(err => err);
    });
}

// get a page of bonus products
const getBonusProducts = (page=0, size=1000) => {
    return getAccessToken().then((access_token) => {
        return axios.get('https://ms.ah.nl/mobile-services/product/search/v2', {
            params: {
                query: "", 
                filters: "bonus=true", 
                size: size, 
                page: page, 
                sortOn: "PRICELOWHIGH"
            },
            headers: { Authorization: `Bearer ${access_token}` }
        }).then(res => res.data)
        .catch(err => err);
    });
}

// get a product by web shop ID
const getProduct = (webshopId) => {
    return getAccessToken().then((access_token) => {
        return axios.get("https://www.ah.nl/zoeken/api/products/product", {
            params: {
                "webshopId": webshopId
            },
            headers: { Authorization: `Bearer ${access_token}` }
        }).then(res => res.data)
        .catch(err => err);
    });
}

const getProductsWithAhIds = async (ah_ids) => {
    const query = `SELECT ah_id 
                   FROM ingredient 
                   WHERE ah_id IN (${ah_ids.join(',')});`
    const [rows] = await db.query(query);
    return rows
}

const removeBonusProperties = async () => {
    const query = `UPDATE ingredient 
                   SET is_bonus = 0, 
                   bonus_mechanism = NULL, 
                   bonus_price = NULL
                   WHERE is_bonus = 1;`
    const [rows] = await db.query(query);
    return rows;
}

const setBonusProperties = async (ah_id, is_bonus, bonus_mechanism, bonus_price) => {
    const query = `UPDATE ingredient 
                   SET is_bonus = ?, 
                   bonus_mechanism = ?, 
                   bonus_price = ? 
                   WHERE ah_id = ?;`
    const [rows] = await db.query(updateQuery, [is_bonus, bonus_mechanism, bonus_price, ah_id]);
    return rows
}

module.exports = {
    searchProducts,
    getBonusProducts,
    getProduct,
    getProductsWithAhIds,
    removeBonusProperties,
    setBonusProperties
}