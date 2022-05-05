interface IngredientsInGroup {
    /**
     * The identifier of an ingredient
     * @isInt ingredientid should be an integer value
     */
    ingredientId: number;
    /**
     * The identifier of the recipe to attach this ingredients in group entity to (default = 1)
     * @isInt amount should be an integer value
     * @minimum 1 amount should be at least 1
     */
    amount?: number;
}

/**
 * Group parameters to create a recipe ingredient group entity
 */

export default interface GroupParams {
    /**
     * The identifier of the recipe to attach this ingredient group to
     * @isInt recipeId should be an integer value
     */
    recipeId: number;
    ingredientsInGroup?: IngredientsInGroup[];
}

