const express = require('express');
const router = express.Router();
const HttpStatusCodes = require('http-status-codes').StatusCodes;
const recipeService = require('./recipe.service')
const groupService = require('../groups/group.service');
const sanitizeHtml = require('sanitize-html');

const __getRecipePrice = (id) => {
    let bonus_price = 0;
    let min_price = 0;
    let max_price = 0;

    return groupService.getGroupsOfRecipe(id)
        .then(groups => {
            const promises = [];
            groups.forEach(group => {
                promises.push(groupService.getIngredientsOfGroup(group.id));
            });

            return Promise.all(promises).then((groupIngredients) => {
                    groupIngredients.forEach((ingredients) => {
                        const group_min = Math.min.apply(null, ingredients.map(x => x.price));
                        const group_bonus = Math.min.apply(null, ingredients.map(x => x.bonus_price));

                        bonus_price += group_bonus > 0 ? group_bonus : group_min;
                        min_price += group_min;
                        max_price += Math.max.apply(null, ingredients.map(x => x.price));
                    });

                return {
                    bonus_price: bonus_price.toFixed(2),
                    min_price: min_price.toFixed(2),
                    max_price: max_price.toFixed(2)  
                };
            });
        })
}

const getAllRecipes = (req, res) => {
    recipeService.getAllRecipes()
        .then(recipes => {
            console.log(recipes);
            let recipesResp = [];
            let promises = [];
            recipes.forEach(recipe => {
                promises.push(__getRecipePrice(recipe.id));
            });

            Promise.all(promises).then((prices) => {
                recipes.forEach((recipe, index) => {
                    recipesResp.push({...recipe, ...prices[index]});
                });
                res.send(recipesResp);
            });
        })
        .catch(err => handleError(err, res));
}

const getRecipe = (req, res) => {
    const id = req.params.id;

    recipeService.getRecipe(id)
        .then(recipe => {
            console.log(recipe)
            __getRecipePrice(id)
            .then(price => res.send({...recipe, ...price}))
            .catch(err => handleError(err, res));
        })
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
    __getRecipePrice(id).then(price => res.send(price))
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

                        let recipesResp = [];
                        let promises2 = [];
                        suggestRecipes.forEach(recipe => {
                            promises2.push(__getRecipePrice(recipe.id));
                        });
            
                        Promise.all(promises2).then((prices) => {
                            suggestRecipes.forEach((recipe, index) => {
                                recipesResp.push({...recipe, ...prices[index]});
                            });
                            res.send({ recipes: recipesResp, shareText: shareText });
                        });
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