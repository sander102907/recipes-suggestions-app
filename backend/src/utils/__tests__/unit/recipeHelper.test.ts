import { RecipeHelper } from '../../recipeHelper';

const recipe = {
    id: 1,
    name: 'test recipe 1',
    description: 'test description 1',
    isSuggested: null,
    excludeFromSuggestions: null,
    suggestionEndDate: null,
    rating: Math.floor(Math.random() * 5) + 1, // Random number between 1 and 5
    recipeIngredientsGroups: []
} as any;

describe('Compute recipe prices', () => {
    it('should set prices to 0 when there are no groups', async () => {
        // Act
        const recipeWithPrices = RecipeHelper.computePrices(recipe);

        // Assert
        expect(recipeWithPrices.bonusPrice).toBe("0.00");
        expect(recipeWithPrices.minPrice).toBe("0.00");
        expect(recipeWithPrices.maxPrice).toBe("0.00");
    })

    it('should set prices to 0 when there are groups but no ingredients', async () => {
        // Arrange
        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: []
        })

        // Act
        const recipeWithPrices = RecipeHelper.computePrices(recipe);

        // Assert
        expect(recipeWithPrices.bonusPrice).toBe("0.00");
        expect(recipeWithPrices.minPrice).toBe("0.00");
        expect(recipeWithPrices.maxPrice).toBe("0.00");
    })

    it('should set correct prices with bonus articles', async () => {
        // Arrange
        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 1,
                        bonusPrice: 0.5
                    }
                }, {
                    ingredient: {
                        price: 0.7,
                        bonusPrice: null
                    }
                },
            ]
        })

        // Act
        const recipeWithPrices = RecipeHelper.computePrices(recipe);

        // Assert
        expect(recipeWithPrices.bonusPrice).toBe("0.50");
        expect(recipeWithPrices.minPrice).toBe("0.70");
        expect(recipeWithPrices.maxPrice).toBe("1.00");
    })
})