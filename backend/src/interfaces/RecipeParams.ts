/**
 * Recipe parameters to create/update a recipe entity
 */

export default interface RecipeParams {
    /**
     * The name of the recipe
     * @minLength 1 name may not be empty
     * @example "Pizza"
     */
    name: string;
    /**
     * A description of the recipe, may include html context for rich text
     * @example "Home-cooked pizza with fresh tomato sauce. <a href='example.com/recipe/1'>Recipe steps</a>"
     */
    description?: string;

    /**
     * The identifier of the image to match to the recipe
     * @isInt imageId should be an integer value
     */
    imageId?: number;

    /**
     * An integer ranking the recipe ranging from 1 to 5
     * @isInt rating rating should be an integer value
     * @minimum 1 rating should be a value from 1 to 5
     * @maximum 5 rating should be a value from 1 to 5
     */
    rating?: number;
}
