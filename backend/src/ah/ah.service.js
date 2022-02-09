const axios = require('axios');
let db = require('../database');

db = db.promise();

const getProductsWithAhIds = async (ah_ids) => {
    const query = `SELECT ah_id 
                   FROM ingredient 
                   WHERE ah_id IN (${ah_ids.join(',')});`
    const [rows] = await db.query(query);
    return rows
}

const updateProduct = async (ah_id, price, is_bonus, bonus_mechanism, bonus_price) => {
    const query = `UPDATE ingredient
                   SET price = ?,
                   is_bonus = ?, 
                   bonus_mechanism = ?, 
                   bonus_price = ? 
                   WHERE ah_id = ?;`
    const [rows] = await db.query(query, [price, is_bonus, bonus_mechanism, bonus_price, ah_id]);
    return rows
}

module.exports = {
    getProductsWithAhIds,
    updateProduct
}