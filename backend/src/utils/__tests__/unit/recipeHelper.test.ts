import { RecipeHelper } from '../../recipeHelper';

let recipe: any

beforeEach(() => {
    recipe = {
        id: 1,
        name: 'test recipe 1',
        description: 'test description 1',
        isSuggested: null,
        excludeFromSuggestions: null,
        suggestionEndDate: null,
        rating: Math.floor(Math.random() * 5) + 1, // Random number between 1 and 5
        recipeIngredientsGroups: []
    };
})

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

    it('1 bonus article & 1 non-bonus article -> bonus article is cheaper than the non-bonus article', async () => {
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

    it('1 bonus article & 1 non-bonus article -> bonus article is not cheaper than the non-bonus article', async () => {
        // Arrange
        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 1,
                        bonusPrice: 0.8
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
        expect(recipeWithPrices.bonusPrice).toBe("0.70");
        expect(recipeWithPrices.minPrice).toBe("0.70");
        expect(recipeWithPrices.maxPrice).toBe("1.00");
    })

    it('no bonus articles', async () => {
        // Arrange
        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 1,
                        bonusPrice: null
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
        expect(recipeWithPrices.bonusPrice).toBe("0.70");
        expect(recipeWithPrices.minPrice).toBe("0.70");
        expect(recipeWithPrices.maxPrice).toBe("1.00");
    })

    it('multiple bonus articles should take the cheapest bonus price', async () => {
        // Arrange
        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 1,
                        bonusPrice: 0.6
                    }
                }, {
                    ingredient: {
                        price: 0.7,
                        bonusPrice: 0.4
                    }
                },
            ]
        })

        // Act
        const recipeWithPrices = RecipeHelper.computePrices(recipe);

        // Assert
        expect(recipeWithPrices.bonusPrice).toBe("0.40");
        expect(recipeWithPrices.minPrice).toBe("0.70");
        expect(recipeWithPrices.maxPrice).toBe("1.00");
    })

    it('multiple recipe groups should compute correct total recipe price (one bonus group)', async () => {
        // Arrange
        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 1,
                        bonusPrice: 0.6
                    }
                }, {
                    ingredient: {
                        price: 0.7,
                        bonusPrice: null
                    }
                },
            ]
        })

        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 3,
                        bonusPrice: null
                    }
                }, {
                    ingredient: {
                        price: 4,
                        bonusPrice: null
                    }
                },
            ]
        })

        // Act
        const recipeWithPrices = RecipeHelper.computePrices(recipe);

        // Assert
        expect(recipeWithPrices.bonusPrice).toBe("3.60");
        expect(recipeWithPrices.minPrice).toBe("3.70");
        expect(recipeWithPrices.maxPrice).toBe("5.00");
    })

    it('multiple recipe groups should compute correct total recipe price (multiple bonus groups)', async () => {
        // Arrange
        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 1,
                        bonusPrice: 0.6
                    }
                }, {
                    ingredient: {
                        price: 0.7,
                        bonusPrice: null
                    }
                },
            ]
        })

        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 3,
                        bonusPrice: null
                    }
                }, {
                    ingredient: {
                        price: 4,
                        bonusPrice: 3.5
                    }
                },
            ]
        })

        recipe.recipeIngredientsGroups.push({
            id: 1,
            recipeId: 2,
            ingredientsInGroup: [
                {
                    ingredient: {
                        price: 3,
                        bonusPrice: 2.8
                    }
                }, {
                    ingredient: {
                        price: 4,
                        bonusPrice: null
                    }
                },
            ]
        })

        // Act
        const recipeWithPrices = RecipeHelper.computePrices(recipe);

        // Assert
        expect(recipeWithPrices.bonusPrice).toBe("6.40");
        expect(recipeWithPrices.minPrice).toBe("6.70");
        expect(recipeWithPrices.maxPrice).toBe("9.00");
    })
})