let db = require('../database');
db = db.promise();

//get all recipes
const getAllRecipes = async () => {
    const query = `SELECT * 
                   FROM recipe;`;

    const [rows] = await db.query(query);
    return rows
};

//get a recipe by ID
const getRecipe = async (id) => {
    const query = `SELECT * 
                    FROM recipe 
                    WHERE id = ?`;

    const [rows] = await db.query(query, id);
    return rows[0];
};

// add a recipe
const addRecipe = async (name, description, rating) => {
    const query = `INSERT INTO recipe (name, description, rating)
                   VALUES (?, ?, ?);`;

    const [result] = await db.query(query, [name, description, rating]);
    return result
};

// delete a recipe
const deleteRecipe = async (id) => {
    const query = `DELETE FROM recipe 
                   WHERE id = ?;`;

    const [rows] = await db.query(query, id);
    return rows;
};

// update a recipe
const updateRecipe = async (id, name, description, rating) => {
    const query = ` UPDATE recipe 
                    SET name = ?, description = ?, rating = ? 
                    WHERE id = ?;`;

    const [rows] = await db.query(query, [name, description, rating, id]);
    return rows;
};

// get all ingredients of a recipe
const getIngredientsOfRecipe = async (id) => {
    const query = ` SELECT 
                    i.id AS id,
                    i.name AS name, 
                    i.ah_id AS ah_id, 
                    i.is_bonus AS is_bonus, 
                    i.unit_size AS unit_size, 
                    i.bonus_price AS bonus_price, 
                    i.price AS price, 
                    i.bonus_mechanism AS bonus_mechanism, 
                    si.category AS category, 
                    i.image_tiny AS image_tiny, 
                    i.image_small AS image_small, 
                    i.image_medium AS image_medium, 
                    i.image_large AS image_large, 
                    g.id AS group_id 
                    FROM recipe_ingredients_group g 
                    JOIN recipe r on (g.recipe_id=r.id) 
                    JOIN ingredients_in_group ig on (ig.group_id=g.id) 
                    JOIN ingredient i on (ig.ingredient_id=i.id) 
                    WHERE r.id = ?
                    ORDER BY i.is_bonus;`;

    const [rows] = await db.query(query, [id]);
    return rows;
}

const getBonusRecipes = async () => {
    const query = `SELECT DISTINCT 
                   recipe.id AS id, 
                   recipe.name AS name, 
                   recipe.description AS description, 
                   recipe.rating AS rating 
                   FROM recipe 
                   JOIN recipe_ingredients_group g on (recipe.id=g.recipe_id) 
                   JOIN ingredients_in_group ig on (ig.group_id=g.id) 
                   JOIN ingredient i on (i.id=ig.ingredient_id) 
                   WHERE i.is_bonus = 1;`;
    const [rows] = await db.query(query);
    return rows;
}

const getRandomNonBonusRecipes = async (amount) => {
    const query = `SELECT 
                   recipe.id AS id, 
                   recipe.name AS name, 
                   recipe.description AS description, 
                   recipe.rating AS rating 
                   FROM recipe
                   JOIN recipe_ingredients_group g on (recipe.id=g.recipe_id) 
                   JOIN ingredients_in_group ig on (ig.group_id=g.id) 
                   JOIN ingredient i on (i.id=ig.ingredient_id) 
                   GROUP BY recipe.id
                   HAVING SUM(i.is_bonus)=0 OR SUM(i.is_bonus) IS NULL
                   ORDER BY RAND()
                   LIMIT ?;`

    const [rows] = await db.query(query, [amount]);
    return rows;
}

const searchRecipes = async (searchQuery) => {
    const query = `SELECT DISTINCT
                   r.id AS id, 
                   r.name AS name, 
                   r.description AS description, 
                   r.rating AS rating 
                   FROM recipe r
                   JOIN recipe_ingredients_group g on (r.id=g.recipe_id) 
                   JOIN ingredients_in_group ig on (ig.group_id=g.id) 
                   JOIN ingredient i on (i.id=ig.ingredient_id)
                   WHERE r.name LIKE CONCAT('%', ?,  '%') OR r.description LIKE CONCAT('%', ?,  '%') OR i.name LIKE CONCAT('%', ?,  '%');`

    const [rows] = await db.query(query, [searchQuery, searchQuery, searchQuery]);
    return rows;
}

module.exports = {
    getAllRecipes,
    getRecipe,
    addRecipe,
    deleteRecipe,
    updateRecipe,
    getIngredientsOfRecipe,
    getBonusRecipes,
    getRandomNonBonusRecipes,
    searchRecipes
}