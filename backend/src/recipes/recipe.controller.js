const express = require('express');
const router = express.Router();
const HttpStatusCodes = require('http-status-codes').StatusCodes;
const recipeService = require('./recipe.service')

const getAllRecipes = (req, res) => {
    recipeService.getAllRecipes()
        .then(recipes => res.send(recipes))
        .catch(err => handleError(err, res));
}

const getRecipe = (req, res) => {
    const id = req.params.id;

    recipeService.getRecipe(id)
        .then(recipe => res.send(recipe))
        .catch(err => handleError(err, res));
}

const addRecipe = (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const rating = req.body.rating;

    recipeService.addRecipe(name, description, rating)
        .then((result) => res.send({ id: result.insertId, message: 'Recipe created' }))
        .catch(err => handleError(err, res));
}

const deleteRecipe = (req, res) => {
    const id = req.params.id;

    recipeService.deleteRecipe(id)
        .then(() => res.send({ message: 'Recipe deleted' }))
        .catch(err => handleError(err, res));
}

const updateRecipe = (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const description = req.body.description;
    const rating = req.body.rating;

    recipeService.updateRecipe(id, name, description, rating)
        .then(() => res.send({ message: 'Recipe updated' }))
        .catch(err => handleError(err, res));
}

const getIngredientsOfRecipe = (req, res) => {
    const id = req.params.id;

    recipeService.getIngredientsOfRecipe(id)
        .then(ingredients => res.send(ingredients))
        .catch(err => handleError(err, res));
}

const getRecipePrice = (req, res) => {
    const id = req.params.id;

    recipeService.getIngredientsOfRecipe(id)
        .then(ingredients => {
            let current_price = 0;

            ingredients.forEach(ingredient => {
                if (ingredient.bonus_price != null) {
                    current_price += ingredient.bonus_price;
                } else {
                    current_price += ingredient.price;
                }
            });

            let full_price = 0;

            ingredients.forEach(ingredient => {
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

            current_price = current_price.toFixed(2);
            full_price = full_price.toFixed(2);

            res.send({
                current_price: current_price,
                full_price: full_price
            });            
        })
        .catch(err => handleError(err, res));
}

const getBonusRecipes = (req, res) => {
    recipeService.getBonusRecipes()
        .then(bonusRecipes => res.send(bonusRecipes))
        .catch(err => handleError(err, res));
}

const handleError = (err, res) => {
    res.status(HttpStatusCodes.BAD_REQUEST).send({ message: err.message })
}


router.get('/', getAllRecipes);
router.get('/:id(\\d+)', getRecipe);
router.post('/', addRecipe);
router.delete("/:id", deleteRecipe);
router.put("/:id", updateRecipe);
router.get('/:id/ingredients', getIngredientsOfRecipe);
router.get('/:id/price', getRecipePrice);
router.get('/bonus', getBonusRecipes);

module.exports = router;