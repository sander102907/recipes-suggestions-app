import { WithPrices } from "../types/withPrices";
import { RecipeWithIngredientsAndImage } from "../types/recipeWithIngredients";

export class RecipeHelper {
    // Filter out any empty values of a list of any type
    private static notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }

    // Round the recipe prices to a fixed number with 2 decimals in string format
    private static roundPrice(price: number): string {
        return (Math.round(price * 100) / 100).toFixed(2);
    }

    // Adds prices (min, max and bonus) to a Recipe Object
    // Pay attention: Bonus price is always at most the minimum price
    static computePrices(recipe: RecipeWithIngredientsAndImage): WithPrices<RecipeWithIngredientsAndImage> {
        let bonusPrice = 0;
        let minPrice = 0;
        let maxPrice = 0;

        recipe.recipeIngredientsGroups.forEach((group) => {
            if (group.ingredientsInGroup.length > 0) {
                // Get all non-empty prices of the ingredient group
                const prices: number[] = group.ingredientsInGroup.map(x => x.ingredient.price).filter(RecipeHelper.notEmpty);

                // Compute the minimum group price
                const group_min = Math.min(...prices);

                // Get all non-empty bonus prices of the ingredient group
                const bonusPrices: number[] = group.ingredientsInGroup.map(x => x.ingredient.bonusPrice).filter(RecipeHelper.notEmpty);

                // Compute the minimum group bonus price
                const group_bonus = Math.min(...bonusPrices);

                // update the total bonus price with the group bonus price, or group minimum price if this is lower than the bonus price
                bonusPrice += group_bonus > 0 && group_bonus < group_min ? group_bonus : group_min;
                minPrice += group_min;
                maxPrice += Math.max(...prices);
            }
        });

        return {
            ...recipe,
            bonusPrice: RecipeHelper.roundPrice(bonusPrice),
            minPrice: RecipeHelper.roundPrice(minPrice),
            maxPrice: RecipeHelper.roundPrice(maxPrice)
        }
    }
}