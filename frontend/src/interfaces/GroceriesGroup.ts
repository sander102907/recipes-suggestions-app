import { RecipeIngredientsGroup } from "./RecipeIngredientsGroup";


export interface GroceriesGroup extends RecipeIngredientsGroup {
    recipeIds: number[];
}
