const express = require('express');
const router = express.Router();
const HttpStatusCodes = require('http-status-codes').StatusCodes;
const recipeService = require('./recipe.service')
const groupService = require('../groups/group.service');
const sanitizeHtml = require('sanitize-html');

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
    const description = sanitizeHtml(req.body.description);
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
    const description = sanitizeHtml(req.body.description);
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
    let bonus_price = 0;
    let min_price = 0;
    let max_price = 0;

    groupService.getGroupsOfRecipe(id)
        .then(groups => {
            const promises = [];
            groups.forEach(group => {
                promises.push(groupService.getIngredientsOfGroup(group.id));
            });

            Promise.all(promises).then((groupIngredients) => {
                    // Calculate bonus price
                    groupIngredients.forEach((ingredients) => {
                        if (ingredients.length > 0) {

                            let min_p = 10e20;
                            ingredients.forEach(ingredient => {
                                if (ingredient.bonus_price != null && ingredient.bonus_price < min_p) {
                                    min_p = ingredient.bonus_price;
                                } else if (ingredient.price < min_p) {
                                    min_p = ingredient.price;
                                }
                            });
                            bonus_price += min_p;
                        }
                    });

                    // Calculate min/max price
                    groupIngredients.forEach((ingredients) => {
                        if (ingredients.length > 0) {
                            let min_p = 10e20;
                            let max_p = 0;
                            ingredients.forEach(ingredient => {
                                if (ingredient.price != null) {
                                    min_p = Math.min(min_p, ingredient.price);
                                    max_p = Math.max(max_p, ingredient.price);
                                } else if (ingredient.bonus_price != null) {
                                    if (ingredient.bonus_mechanism.includes('KORTING')) {
                                        let percentage = ingredient.bonus_mechanism.match(/\d+/)[0];
                                        let price = ingredient.bonus_price / (1-(percentage/100));

                                        min_p = Math.min(min_p, price);
                                        max_p = Math.max(max_p, price);                                
                                    } else {
                                        min_p = Math.min(min_p, ingredient.bonus_price);
                                        max_p = Math.max(max_p, ingredient.bonus_price); 
                                    }
                                }
                            });
                            min_price += min_p;
                            max_price += max_p;
                        }
                    });

                res.send({
                    bonus_price: bonus_price.toFixed(2),
                    min_price: min_price.toFixed(2),
                    max_price: max_price.toFixed(2)
                });      
            });
        })
        .catch(err => handleError(err, res));
}

const getBonusRecipes = (req, res) => {
    recipeService.getBonusRecipes()
        .then(bonusRecipes => res.send(bonusRecipes))
        .catch(err => handleError(err, res));
}

const suggestRecipes = (req, res) => {
    recipeService.getBonusRecipes()
        .then(bonusRecipes => {
            if (bonusRecipes.length < 7) {
                recipeService.getRandomNonBonusRecipes(7 - bonusRecipes.length).then((rows) => {
                    const suggestRecipes = bonusRecipes.concat(rows);
                    let ingredients = [];
                    const promises = [];
                    let shareText = '';
                    let lastCategory = '';

                    suggestRecipes.forEach((recipe) => {
                        promises.push(recipeService.getIngredientsOfRecipe(recipe.id));
                    });

                    Promise.all(promises).then((recipesIngredients) => {
                        recipesIngredients.forEach((recipeIngredients) => {
                            recipeIngredients.forEach((ingredient) => {
                                ingredients.push(ingredient);
                            });
                        });
                        ingredients = ingredients.sort((a, b) => {
                            return a.category.localeCompare(b.category);
                        });

                        ingredients.forEach((ingredient, index) => {
                            if (lastCategory !== ingredient.category) {
                                if (shareText.length > 0) {
                                    shareText += '\n';
                                }

                                shareText += `*${ingredient.category}:*\n\n`;
                                lastCategory = ingredient.category;
                            }

                            shareText += `- ${ingredient.name} (${ingredient.unit_size})\n`
                        });

                        shareText += '\n';

                        res.send({recipes: suggestRecipes, shareText: shareText });
                    });
                    
                });
            }
        })
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
router.get('/suggest', suggestRecipes);

module.exports = router;