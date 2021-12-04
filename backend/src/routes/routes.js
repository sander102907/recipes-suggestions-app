const express = require('express');
const recipes = require('../recipes');
const ingredients = require('../ingredients');
const recipe_ingredients = require('../recipe_ingredients');
const ah = require('../ah');
const router = new express.Router();

router.get('/recipe/:recipeId', recipes.getRecipe);
router.get('/recipes', recipes.getRecipes);
router.post('/recipe', recipes.addRecipe);
router.delete("/recipe/:recipeId", recipes.deleteRecipe);
router.put("/recipe/:recipeId", recipes.updateRecipe);

router.get('/ingredient/:ingredientId', ingredients.getIngredient);
router.get('/ingredients', ingredients.getIngredients);
router.post('/ingredient', ingredients.addIngredient);
router.delete("/ingredient/:ingredientId", ingredients.deleteIngredient);
router.put("/ingredient/:ingredientId", ingredients.updateIngredient);
router.get('/ingredient/ah/:ahId', ingredients.getIngredientFromAhId);

router.get('/recipe/:recipeId/ingredients', recipe_ingredients.getIngredientsOfRecipe);
router.post('/recipe/ingredient', recipe_ingredients.addIngredientToRecipe);
router.get('/ingredient/:ingredientId/recipes', recipe_ingredients.getRecipesWithIngredient);

router.get('/ah/search', ah.searchProducts);
// router.get('/ah/bonus', ah.getBonusProducts);
router.get('/ah/product', ah.getProduct);
router.get('/suggest', ah.suggestWeeklyRecipes);

module.exports = router;