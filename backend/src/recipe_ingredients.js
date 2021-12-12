const db = require('./database');
const HttpStatusCodes = require('http-status-codes').StatusCodes;
  
  //get all of the ingredients of a recipe
  const getIngredientsOfRecipe = (req, res) => {
    const recipeId = req.params.recipeId;
    const SelectQuery =  "SELECT ingredient.id AS id, ingredient.name AS name, ingredient.ah_id AS ah_id, ingredient.is_bonus AS is_bonus, ingredient.unit_size AS unit_size, ingredient.bonus_price AS bonus_price, ingredient.price AS price, ingredient.bonus_mechanism AS bonus_mechanism, ingredient.category AS category FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE recipe.id = ?;";
    db.query(SelectQuery, recipeId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
};

//get all of the ingredients of a recipe
const getRecipesWithIngredient = (req, res) => {
    const ingredientId = req.params.ingredientId;
    const SelectQuery =  "SELECT recipe.id AS id, recipe.name AS name FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE ingredient.id = ?;"; 
    db.query(SelectQuery, ingredientId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
};

// add a ingredient to a recipe
const addIngredientToRecipe = (req, res) => {
    const recipeId = req.body.recipe_id;
    const ingredientId = req.body.ingredient_id;

    const query = "SELECT * FROM recipe_ingredients WHERE recipe_id = ? AND ingredient_id = ?";
    db.query(query, [recipeId, ingredientId], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }
        else if (result.length == 0) {
            const InsertQuery = "INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (?, ?)";
            db.query(InsertQuery, [recipeId, ingredientId], (err, result) => {
                if (err) {
                    res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
                }
            
                res.status(HttpStatusCodes.OK).send({ "recipe_id": recipeId, "ingredient_id": ingredientId }); // 200
            })
        } else {
            const InsertQuery = "UPDATE recipe_ingredients SET amount = amount + 1 WHERE recipe_id = ? AND ingredient_id = ?";
            db.query(InsertQuery, [recipeId, ingredientId], (err, result) => {
                if (err) {
                    res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
                }
            
                res.status(HttpStatusCodes.OK).send({ "recipe_id": recipeId, "ingredient_id": ingredientId }); // 200
            });
        }
    });
};


module.exports = {
    getIngredientsOfRecipe,
    getRecipesWithIngredient,
    addIngredientToRecipe
}