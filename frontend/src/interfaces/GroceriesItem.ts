import { Ingredient } from "./Ingredient";

export interface GroceryItem {
    amount: number,
    isCheckedOff: boolean,
    isPermanent: boolean,
    ingredient: Ingredient,
    groupIds: number[],
    recipeIds: number[]
}
