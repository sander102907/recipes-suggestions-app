import { WithPrices } from "../types/withPrices";
import { RecipeWithIngredients } from "../types/recipeWithIngredients";

export class RecipeHelper {
    static computePrices(recipe: RecipeWithIngredients): WithPrices<RecipeWithIngredients> {
        if (!recipe.recipeIngredientsGroups) {
            return {
                ...recipe,
                bonusPrice: "0.00",
                minPrice: "0.00",
                maxPrice: "0.00"
            }
        }

        let bonusPrice = 0;
        let minPrice = 0;
        let maxPrice = 0;

        function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
            return value !== null && value !== undefined;
        }

        recipe.recipeIngredientsGroups.forEach((group) => {
            if (group.ingredientsInGroup.length > 0) {
                const prices: number[] = group.ingredientsInGroup.map(x => x.ingredient.price).filter(notEmpty);
                const group_min = Math.min(...prices);

                const bonusPrices: number[] = group.ingredientsInGroup.map(x => x.ingredient.bonusPrice).filter(notEmpty);
                const group_bonus = Math.min(...bonusPrices);

                bonusPrice += group_bonus > 0 && group_bonus < Infinity ? group_bonus : group_min;
                minPrice += group_min;
                maxPrice += Math.max(...prices);
            }
        });

        const bonusPriceRounded = (Math.round(bonusPrice * 100) / 100).toFixed(2);
        const minPriceRounded = (Math.round(minPrice * 100) / 100).toFixed(2);
        const maxPriceRounded = (Math.round(maxPrice * 100) / 100).toFixed(2);

        return {
            ...recipe,
            bonusPrice: bonusPriceRounded,
            minPrice: minPriceRounded,
            maxPrice: maxPriceRounded
        }
    }
}