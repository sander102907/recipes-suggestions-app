/**
 * Recipe parameters to update a recipe entity
 */

import RecipeParams from "./RecipeParams";

export default interface RecipeUpdateParams extends RecipeParams {
    /**
     * The name of the recipe
     * @minLength 1 name may not be empty
     * @example "Pizza"
     */
    name?: string;
}
