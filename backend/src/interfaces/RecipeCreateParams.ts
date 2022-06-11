/**
 * Recipe parameters to create a recipe entity
 */

import RecipeParams from "./RecipeParams";

export default interface RecipeCreateParams extends RecipeParams {
    /**
     * The name of the recipe
     * @minLength 1 name may not be empty
     * @example "Pizza"
     */
    name: string;
}
