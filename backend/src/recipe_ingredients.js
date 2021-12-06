const db = require('./database');
const HttpStatusCodes = require('http-status-codes').StatusCodes;
  
  //get all of the ingredients of a recipe
  const getIngredientsOfRecipe = (req, res) => {
    const recipeId = req.params.recipeId;
    const SelectQuery =  "SELECT ingredient.id AS id, ingredient.name AS name, ingredient.ah_id AS ah_id FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE recipe.id = ?;";
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
    const InsertQuery = "INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (?, ?)";
    db.query(InsertQuery, [recipeId, ingredientId], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          }
    
          res.status(HttpStatusCodes.OK).send({ "recipe_id": recipeId, "ingredient_id": ingredientId }); // 200
    })
};


module.exports = {
    getIngredientsOfRecipe,
    getRecipesWithIngredient,
    addIngredientToRecipe
}