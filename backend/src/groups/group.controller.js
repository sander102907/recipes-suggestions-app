const express = require('express');
const router = express.Router();
const HttpStatusCodes = require('http-status-codes').StatusCodes;
const groupService = require('./group.service')
const ingredientGroupService = require('../ingredients_groups/ingredient_group.service')


const getAllGroups = (req, res) => {
    groupService.getAllGroups()
        .then(groups => res.send(groups))
        .catch(err => handleError(err, res));
}

const getGroup = (req, res) => {
    const id = req.params.id;

    groupService.getGroup(id)
        .then(group => res.send(group))
        .catch(err => handleError(err, res));
}

const getGroupsOfRecipe = (req, res) => {
    const recipe_id = req.params.recipeId;
    const is_suggesion = req.query.is_suggesion;
    const groupsResp = [];

    groupService.getGroupsOfRecipe(recipe_id)
        .then(groups => {
            const promises = [];
            groups.forEach(group => {
                groupsResp.push({ id: group.id });
                promises.push(groupService.getIngredientsOfGroup(group.id));
            });

            Promise.all(promises).then((groupIngredients) => {
                groupIngredients.forEach((ingredients, index) => {
                    groupsResp[index]['ingredients'] = ingredients;
                });

                res.send(groupsResp);
            });
        })
        .catch(err => handleError(err, res));
}

const addGroup = (req, res) => {
    const recipe_id = req.body.recipe_id;

    groupService.addGroup(recipe_id)
        .then((result) => res.send({ id: result.insertId, message: 'Group created' }))
        .catch(err => handleError(err, res));
}

const removeGroupsromRecipe = (req, res) => {
    const recipe_id = req.params.recipeId;

    groupService.removeGroupsromRecipe(recipe_id)
        .then(() => res.send({ message: 'Groups removed from recipe' }))
        .catch(err => handleError(err, res));
}

const getGroupsWithIngredient = (req, res) => {
    const ingredient_id = req.params.ingredientId;

    ingredientGroupService.getGroupsWithIngredient(ingredient_id)
        .then(groups => res.send(groups))
        .catch(err => handleError(err, res));
}

const addIngredientToGroup = (req, res) => {
    const group_id = req.body.group_id;
    const ingredient_id = req.body.ingredient_id;

    ingredientGroupService.addIngredientToGroup(group_id, ingredient_id)
        .then(() => res.send({ message: 'Ingredient added' }))
        .catch(err => handleError(err, res));
}

const removeIngredientsFromGroup = (req, res) => {
    const group_id = req.params.groupId;

    ingredientGroupService.removeIngredientsFromGroup(group_id)
        .then(() => res.send({ message: 'Ingredients removed' }))
        .catch(err => handleError(err, res));
}

const handleError = (err, res) => {
    res.status(HttpStatusCodes.BAD_REQUEST).send({ message: err.message })
}


router.get('/', getAllGroups);
router.get('/:id', getGroup);
router.get('/recipe/:recipeId', getGroupsOfRecipe);
router.post('/', addGroup);
router.delete("/recipe/:recipeId", removeGroupsromRecipe);
router.get('/ingredient/:ingredientId', getGroupsWithIngredient);
router.post('/ingredient', addIngredientToGroup);
router.delete('/:groupId/ingredients', removeIngredientsFromGroup);

module.exports = router;