/**
 * Parameters to create/update a Ingredient Price History record
 */

export default interface IngredientPriceHistoryParams {
    /**
     * The (new) price of the ingredient
     * @isFloat price should be a float value
     * @minimum 0.00 price should be larger than 0.00
     * @example "1.29"
     */
    price: number;

    /**
     * Whether the ingredient price is a bonus price
     */
    isBonus: boolean;

    /**
     * The date from which the price is valid
     */
    from: Date;

    /**
     * The date until which the price is valid
     */
    until?: Date;

    /**
     * The identifier of the ingredient to which the price is linked
     * @isInt ingredientid should be an integer value
     */
    ingredientId: number;
}
