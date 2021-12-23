const express = require('express');
const router = express.Router();
const HttpStatusCodes = require('http-status-codes').StatusCodes;
const ingredientService = require('./ingredient.service')
const ingredientGroupService = require('../ingredients_groups/ingredient_group.service');

const getAllIngredients = (req, res) => {
    ingredientService.getAllIngredients()
        .then(ingredients => res.send(ingredients))
        .catch(err => handleError(err, res));
}

const getIngredient = (req, res) => {
    const id = req.params.id;

    ingredientService.getIngredient(id)
        .then(ingredient => res.send(ingredient))
        .catch(err => handleError(err, res));
}

const addIngredient = (req, res) => {
    const ah_id = req.params.id
    const name = req.query.name;
    const price = req.query.price;
    const unit_size = req.query.unit_size;
    const category = req.query.category;
    const bonus_price = req.query.bonus_price;
    const is_bonus = req.query.is_bonus === 'true' ? 1 : 0;
    const bonus_mechanism = req.query.bonus_mechanism;
    const image_tiny = req.query.image_tiny;
    const image_small = req.query.image_small;
    const image_medium = req.query.image_medium;
    const image_large = req.query.image_large;

    ingredientService.addIngredient(name, ah_id, price, unit_size, category, bonus_price, is_bonus, bonus_mechanism, image_tiny, image_small, image_medium, image_large)
        .then(() => res.send({ message: 'Ingredient created' }))
        .catch(err => handleError(err, res));
}

const deleteIngredient = (req, res) => {
    const id = req.params.id;

    ingredientService.deleteIngredient(id)
        .then(() => res.send({ message: 'Ingredient deleted' }))
        .catch(err => handleError(err, res));
}

const getIngredientFromAhId = (req, res) => {
    const ah_id = req.params.id;

    ingredientService.getIngredientFromAhId(ah_id)
        .then((rows) => {
            if (rows.length === 0) {
                addIngredient(req, res);
            } else {
                res.send(rows[0]);
            }
        })
        .catch(err => handleError(err, res));
}

const handleError = (err, res) => {
    res.status(HttpStatusCodes.BAD_REQUEST).send({ message: err.message })
}

const getIngredientsOfGroup = (req, res) => {
    const group_id = req.params.groupId;
    ingredientGroupService.getIngredientsOfGroup(group_id)
        .then(ingredients => res.send(ingredients))
        .catch(err => handleError(err, res));
}


router.get('/', getAllIngredients);
router.get('/:id', getIngredient);
router.get('/ah/:id', getIngredientFromAhId);
router.post('/', addIngredient);
router.delete("/:id", deleteIngredient);
router.delete("/group/:groupId", getIngredientsOfGroup);

module.exports = router;