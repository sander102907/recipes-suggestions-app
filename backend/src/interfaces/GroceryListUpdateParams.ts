/**
 * Grocery list parameters to create a grocery list item
 */

export default interface GroceryListUpdateParams {
    /**
     * The identifier of the ingredient to add to the grocery list
     * @isInt ingredientId should be an integer value
     */
    ingredientId: number;

    /**
     * The quantity of the ingredient to put on the grocery list
     * @isInt amount should be an integer value
     * @minimum 0 amount should be at least 0
     */
    amount?: number;

    /**
     * Boolean value indicating whether the ingredient should be put on the grocery list permanently. For example, ingredients you require every week that should not be removed from the grocery list at the end of the week.
     */
    isPermanent?: boolean;

    /**
     * Boolean value whether the ingredient should be checked off from the grocery list
     */
    isCheckedOff?: boolean;
}

