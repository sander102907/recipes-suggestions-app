import { RecipeIngredientsGroup } from "../interfaces/RecipeIngredientsGroup";

export default class IngredientHelper {
    public static ingredientToShow(group: RecipeIngredientsGroup) {
        return group.ingredientsInGroup.reduce((prev, curr) => {
            if (prev.ingredient.isBonus && !curr.ingredient.isBonus) {
                return prev;
            }

            if (curr.ingredient.isBonus && !prev.ingredient.isBonus) {
                return curr;
            }

            if (curr.ingredient.bonusPrice && prev.ingredient.bonusPrice) {
                return curr.ingredient.bonusPrice < prev.ingredient.bonusPrice ? curr : prev;
            }

            return curr.ingredient.price < prev.ingredient.price ? curr : prev;
        });
    }

    public static alternatives(group: RecipeIngredientsGroup) {
        return group.ingredientsInGroup.filter(ingr => ingr !== this.ingredientToShow(group));
    }
}