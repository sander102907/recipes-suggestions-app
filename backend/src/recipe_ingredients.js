const db = require('./database');
const HttpStatusCodes = require('http-status-codes').StatusCodes;
  
  //get all of the ingredients of a recipe
  const getIngredientsOfRecipe = (req, res) => {
    const recipeId = req.params.recipeId;
    const SelectQuery =  "SELECT ingredient.id AS id, ingredient.name AS name, ingredient.ah_id AS ah_id, ingredient.is_bonus AS is_bonus, ingredient.unit_size AS unit_size, ingredient.bonus_price AS bonus_price, ingredient.price AS price, ingredient.bonus_mechanism AS bonus_mechanism, ingredient.category AS category, ingredient.image_tiny AS image_tiny, ingredient.image_small AS image_small, ingredient.image_medium AS image_medium, ingredient.image_large AS image_large FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE recipe.id = ?;";
    db.query(SelectQuery, recipeId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        } else {
            // Sort, bonus items first
            result.sort((a, b) => {
                return b.is_bonus - a.is_bonus;
            });
            res.send(result);
        }
    });
};

//get all of the ingredients of a recipe
const getRecipesWithIngredient = (req, res) => {
    const ingredientId = req.params.ingredientId;
    const SelectQuery =  "SELECT recipe.id AS id, recipe.name AS name FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE ingredient.id = ?;"; 
    db.query(SelectQuery, ingredientId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        } else {
            res.send(result);
        }
    });
};

const getRecipePrice = (req, res) => {
    const recipeId = req.params.recipeId;
    const SelectQuery =  "SELECT ingredient.id AS id, ingredient.name AS name, ingredient.ah_id AS ah_id, ingredient.is_bonus AS is_bonus, ingredient.unit_size AS unit_size, ingredient.bonus_price AS bonus_price, ingredient.price AS price, ingredient.bonus_mechanism AS bonus_mechanism, ingredient.category AS category FROM recipe JOIN recipe_ingredients on (recipe.id=recipe_ingredients.recipe_id) JOIN ingredient on (ingredient.id=recipe_ingredients.ingredient_id) WHERE recipe.id = ?;";
    db.query(SelectQuery, recipeId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        } else {
            let current_price = 0;

            result.forEach(ingredient => {
                if (ingredient.bonus_price != null) {
                    current_price += ingredient.bonus_price;
                } else {
                    current_price += ingredient.price;
                }
            });

            current_price = current_price.toFixed(2);

            let full_price = 0;

            result.forEach(ingredient => {
                if (ingredient.price != null) {
                    full_price += ingredient.price;
                } else if (ingredient.bonus_price != null) {
                    if (ingredient.bonus_mechanism.includes('KORTING')) {
                        let percentage = ingredient.bonus_mechanism.match(/\d+/)[0];
                        full_price += ingredient.bonus_price / (1-(percentage/100));
                    } else {
                        full_price += ingredient.bonus_price
                    }
                }
            });

            full_price = full_price.toFixed(2);

            res.send({
                current_price: current_price,
                full_price: full_price
            });            
        }
    });
}

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
            const InsertQuery = "INSERT INTO recipe_ingredients recipe_id = ?, ingredient_id = ?, interchangeable_group = (SELECT MAX(interchangeable_group) FROM recipe_ingredients) + 1";
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

const removeIngredientsFromRecipe = (req, res) => {
    const recipeId = req.params.recipeId;

    console.log(recipeId);

    const query = "DELETE FROM recipe_ingredients WHERE recipe_id = ?";
    db.query(query, [recipeId], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }
        else {
            res.sendStatus(HttpStatusCodes.OK);
        }
    });
}


module.exports = {
    getIngredientsOfRecipe,
    getRecipesWithIngredient,
    addIngredientToRecipe,
    getRecipePrice,
    removeIngredientsFromRecipe
}