import { IngredientsInGroup } from "./IngredientsInGroup";


export interface RecipeIngredientsGroup {
    id?: number;
    recipeId: number;
    ingredientsInGroup: IngredientsInGroup[];
}
