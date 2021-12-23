let db = require('../database');
db = db.promise();

//get all ingredients
const getAllIngredients = async () => {
    const query = `SELECT * 
                   FROM ingredient;`;

    const [rows] = await db.query(query);
    return rows;
};

//get a ingredient by ID
const getIngredient = async (id) => {
    const query =  `SELECT * 
                    FROM ingredient 
                    WHERE id = ?`;

    const [rows] = await db.query(query, id);
    return rows;
};

const getIngredientFromAhId = async (id) => {
    const query =  `SELECT * 
                    FROM ingredient 
                    WHERE ah_id = ?`;

    const [rows] = await db.query(query, id);
    return rows;
}

// add a ingredient
const addIngredient = async (name, ah_id, price, unit_size, category, bonus_price, is_bonus, bonus_mechanism, image_tiny, image_small, image_medium, image_large) => {
    const query = `INSERT INTO ingredient (name, ah_id, price, unit_size, category, bonus_price, is_bonus, bonus_mechanism, image_tiny, image_small, image_medium, image_large)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    const [rows] = await db.query(query, [name, ah_id, price, unit_size, category, bonus_price, is_bonus, bonus_mechanism, image_tiny, image_small, image_medium, image_large]);
    return rows;
};

// delete a ingredient
const deleteIngredient = async (id) => {
    const query = `DELETE FROM ingredient 
                   WHERE id = ?;`;

    const [rows] = await db.query(query, id);
    return rows;
};

module.exports = {
    getAllIngredients,
    getIngredient,
    getIngredientFromAhId,
    addIngredient,
    deleteIngredient,
}