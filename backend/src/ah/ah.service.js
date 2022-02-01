const axios = require('axios');
let db = require('../database');

db = db.promise();

// search products
const searchProducts = (query, size=8) => {
    return axios.get(
        'https://www.ah.nl/zoeken/api/products/search', { 
            params: {
                "query": query, 
                "size": size
            },
    }).then(res => res.data)
    .catch(err => err);
}

// get a page of bonus products
const getBonusProducts = (page=0, size=1000) => {
    return axios.get('https://www.ah.nl/zoeken/api/products/search', {
        params: {
            properties: "bonus", 
            size: size, 
            page: page, 
            sortBy: "price"
        },
    }).then(res => res.data)
    .catch(err => err);
}

// get a product by web shop ID
const getProduct = (webshopId) => {
    return axios.get("https://www.ah.nl/zoeken/api/products/product", {
        params: {
            "webshopId": webshopId
        },
    }).then(res => res.data)
    .catch(err => err);
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
    const [rows] = await db.query(query, [is_bonus, bonus_mechanism, bonus_price, ah_id]);
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