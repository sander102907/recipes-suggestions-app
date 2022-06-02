import { Ingredient } from "./Ingredient";


export interface IngredientsInGroup {
    groupId?: number;
    ingredientId: number;
    amount: number;
    ingredient: Ingredient;
}
