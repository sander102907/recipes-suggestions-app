let db = require('../database');
db = db.promise();

// get all of the ingredients of a group
const getIngredientsOfGroup = async (group_id) => {
    const query = `SELECT 
                   i.id AS id,
                   i.name AS name, 
                   i.ah_id AS ah_id, 
                   i.is_bonus AS is_bonus, 
                   i.unit_size AS unit_size, 
                   i.bonus_price AS bonus_price, 
                   i.price AS price, 
                   i.bonus_mechanism AS bonus_mechanism, 
                   i.category AS category, 
                   i.image_tiny AS image_tiny, 
                   i.image_small AS image_small, 
                   i.image_medium AS image_medium, 
                   i.image_large AS image_large 
                   FROM recipe_ingredients_group 
                   JOIN ingredients_in_group on (recipe_ingredients_group.id=ingredients_in_group.group_id) 
                   JOIN ingredient i on (i.id=ingredients_in_group.ingredient_id) 
                   WHERE recipe_ingredients_group.id = ?;`;

    const [rows] = await db.query(query, group_id);
    return rows
};

//get a recipe by ID
const getGroupsWithIngredient = async (ingredient_id) => {
    const query =  `SELECT recipe_ingredients_group.id AS id
                    FROM ingredients_in_group 
                    JOIN recipe_ingredients_group on (recipe_ingredients_group.id=ingredients_in_group.group_id) 
                    JOIN ingredient on (ingredient.id=ingredients_in_group.ingredient_id) 
                    WHERE ingredient.id = ?;`;

    const [rows] = await db.query(query, ingredient_id);
    return rows
};

// add a recipe
const addIngredientToGroup = async (group_id, ingredient_id) => {
    const query = `SELECT * 
                   FROM ingredients_in_group 
                   WHERE group_id = ? 
                   AND ingredient_id = ?;`;

    return db.query(query, [group_id, ingredient_id])
        .then(async (output) => {
            const [rows] = output;
            if (rows.length == 0) {
                const InsertQuery = `INSERT INTO ingredients_in_group (group_id, ingredient_id)
                                     VALUES (?, ?)`;
                const [result] = await db.query(InsertQuery, [group_id, ingredient_id]);
                return result;
            } else {
                const InsertQuery = `UPDATE ingredients_in_group 
                                     SET amount = amount + 1 
                                     WHERE group_id = ? 
                                     AND ingredient_id = ?`;
                const [result] = await db.query(InsertQuery, [group_id, ingredient_id]);
                return result;
            }
        }).catch(err => {throw err});
};

// delete a recipe
const removeIngredientsFromGroup = async (group_id) => {
    const query = `DELETE FROM ingredients_in_group 
                   WHERE group_id = ?;`;

    const [rows] = await db.query(query, group_id);
    return rows;
};

module.exports = {
    getIngredientsOfGroup,
    getGroupsWithIngredient,
    addIngredientToGroup,
    removeIngredientsFromGroup
}