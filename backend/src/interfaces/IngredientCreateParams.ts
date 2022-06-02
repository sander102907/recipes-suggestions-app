/**
 * Ingredient parameters to create/update a ingredient entity
 */

import IngredientParams from "./IngredientParams";

export default interface IngredientCreateParams extends IngredientParams {
    /**
     * The name of the ingredient
     * @minLength 1 name may not be empty
     * @example "Salami"
     */
    name: string;
}
