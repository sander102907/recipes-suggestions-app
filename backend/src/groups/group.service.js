let db = require('../database');
db = db.promise();

//get all groups
const getAllGroups = async () => {
    const query = `SELECT * 
                   FROM recipe_ingredients_group;`;

    const [rows] = await db.query(query);
    return rows;
};

//get a group by ID
const getGroup = async (id) => {
    const query =  `SELECT * 
                    FROM recipe_ingredients_group 
                    WHERE id = ?`;

    const [rows] = await db.query(query, id);
    return rows;
};

// get all groups of a recipe
const getGroupsOfRecipe = async (recipe_id) => {
    const query =  `SELECT g.id AS id 
                    FROM recipe r
                    JOIN recipe_ingredients_group g 
                    ON r.id = g.recipe_id
                    WHERE r.id = ?;`;

    const [rows] = await db.query(query, recipe_id);
    return rows;
}

// get all groups of a recipe
const getIngredientsOfGroup = async (group_id) => {
    const query =  `SELECT 
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
                    i.image_large AS image_large, 
                    g.id AS group_id,
                    ig.amount AS amount
                    FROM recipe_ingredients_group g 
                    JOIN ingredients_in_group ig on (ig.group_id=g.id) 
                    JOIN ingredient i on (ig.ingredient_id=i.id) 
                    WHERE g.id = ?
                    ORDER BY i.is_bonus;`;

    const [rows] = await db.query(query, group_id);
    return rows;
}

// add a new group to a recipe
const addGroup = async (recipe_id) => {
    const query = `INSERT INTO recipe_ingredients_group (recipe_id) 
                   VALUES (?);`;

    const [result] =  await db.query(query, [recipe_id]);
    return result
}

// remove groups from a recipe
const removeGroupsromRecipe = async (recipe_id) => {
    const query = `DELETE FROM recipe_ingredients_group 
                   WHERE recipe_id = ?;`;

    const [rows] = await db.query(query, recipe_id);
    return rows;
};

module.exports = {
    getAllGroups,
    getGroupsOfRecipe,
    getGroup,
    addGroup,
    removeGroupsromRecipe,
    getIngredientsOfGroup
}