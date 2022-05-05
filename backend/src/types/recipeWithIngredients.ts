import { Ingredient, IngredientsInGroup, Recipe, RecipeIngredientsGroup, File } from '@prisma/client';

export type RecipeWithIngredientsAndImage = (Recipe & {
    recipeIngredientsGroups: (RecipeIngredientsGroup & {
        ingredientsInGroup: (IngredientsInGroup & {
            ingredient: Ingredient;
        })[];
    })[];
    image: File | null;
});