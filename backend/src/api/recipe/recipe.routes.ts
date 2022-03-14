
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import validate from '../../middleware/validateRequest';
import { RecipeController } from './recipe.controller';

let router = Router();

/**
* @api {get} /recipes Get all recipes
* @apiName Get all recipes
*
* @apiQuery  {Boolean} [optional] Bonus
*
* @apiSuccess (200) {Object[]} `Recipes` object list
*/
router.get("/",
    validate([query('bonus', "bonus should be a Boolean value").optional().isBoolean().toBoolean()]),
    RecipeController.getRecipes
);


/**
* @api {get} /recipes/:id Get a recipe by ID
* @apiName Get a recipe by ID
*
* @apiQuery  {Number} id

* @apiSuccess (200) {Object} `Recipes` object
*/
router.get("/:id(\\d+)",
    validate([param('id').isInt().toInt()]),
    RecipeController.getRecipe
);

/**
* @api {post} /recipes Create a recipe
* @apiName Create a recipe
*
* @apiBody  {String} name
* @apiBody  {String} [optional] description
* @apiBody  {Number} [optional] rating

* @apiSuccess (200) {Object} `Recipes` object
*/
router.post("/",
    validate([
        body('name', "A name is required when creating a new Recipe").isString().isLength({ min: 1 }),
        body('description', 'description should be a string').optional().isString(),
        body('rating', "Rating should be an integer from 1-5").optional().isInt({ min: 1, max: 5 })
    ]),
    RecipeController.createRecipe
);

/**
* @api {put} /recipes Update a recipe
* @apiName Update a recipe
*
* @apiParam {Number} id
* @apiBody  {String} name
* @apiBody  {String} [optional] description
* @apiBody  {Number} [optional] rating

* @apiSuccess (200) {Object} `Recipes` object
*/
router.put("/:id",
    validate([
        param('id').isInt().toInt(),
        body('name', "A name is required when creating a new Recipe").exists(),
        body('description', 'search query should be a string').optional(),
        body('rating', "Rating should be an integer from 1-5").optional().isInt({ min: 1, max: 5 })
    ]),
    RecipeController.updateRecipe
);

/**
* @api {delete} /recipes Delete a recipe
* @apiName Delete a recipe
*
* @apiParam {Number} id

* @apiSuccess (200) {Object} `Recipes` object
*/
router.delete("/:id",
    validate([
        param('id').isInt().toInt(),
    ]),
    RecipeController.deleteRecipe
);

/**
* @api {get} /recipes Suggest weekly recipes
* @apiName Suggest weekly recipes
*
* @apiSuccess (200) {Object[]} `Recipes` object list
*/
router.get("/suggest", RecipeController.suggestRecipes);


/**
* @api {put} /recipes Search for recipes (searches in names & ingredients)
* @apiName Search for recipes (searches in names & ingredients)
*
* @apiQuery {String} query

* @apiSuccess (200) {Object[]} `Recipes` object list
*/
router.get("/search",
    validate([query('query', "search query should be a string").isString()]),
    RecipeController.searchRecipes);

export default router;