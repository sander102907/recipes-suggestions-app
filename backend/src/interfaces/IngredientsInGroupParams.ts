/**
 * Ingredients in Group parameters to match ingredients to a group of a recipe
 */

export default interface IngredientsInGroupParams {
    /**
     * The identifier of a group
     * @isInt groupId should be an integer value
     */
    groupId: number;
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
