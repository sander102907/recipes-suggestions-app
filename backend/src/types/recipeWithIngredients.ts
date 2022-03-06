import { Ingredient, IngredientsInGroup, Recipe, RecipeIngredientsGroup } from '@prisma/client';

export type RecipeWithIngredients = (Recipe & {
    recipeIngredientsGroups: (RecipeIngredientsGroup & {
        ingredientsInGroup: (IngredientsInGroup & {
            ingredient: Ingredient;
        })[];
    })[];
});