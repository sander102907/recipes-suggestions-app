/**
 * Ingredient parameters to create/update a ingredient entity
 */

import { Prisma } from "@prisma/client";

export default interface IngredientParams {
    /**
     * The Albert Heijn Product ID
     * @isInt ahId should be an integer value
     */
    ahId?: number;

    /**
     * The unit size of the ingredient
     * @example "150 g"
     */
    unitSize?: string;

    /**
     * The price of the ingredient
     * @isFloat price should be a float value
     * @minimum 0.00 price should be larger than 0.00
     * @example "1.29"
     */
    price?: Prisma.Decimal;

    /**
     * The category of the ingredient
     * @example "Kaas, vleeswaren, tapas"
     */
    category?: string;

    /**
     * A boolean value indicating whether the ingredient is currently in the bonus (discounted)
     */
    isBonus?: boolean;

    /**
     * The bonus mechanism of the ingredient (if the ingredient is currently in the bonus)
     * @example "25% korting"
     */
    bonusMechanism?: string;

    /**
     * The bonus price of the ingredient (if the ingredient is currently in the bonus)
     * @isFloat bonusPrice should be a float value
     * @minimum 0.00 bonusPrice should be larger than 0.00 
     * @example "0.97"
     */
    bonusPrice?: Prisma.Decimal;

    /**
     * A URL to a image of the ingredient
     * @pattern https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*) image should be a URL
     */
    image?: string;

    /**
     * A boolean value indicating whether the ingredient is currently in your card (checked off on the grocery list)
     */
    isInCart?: boolean;
}
