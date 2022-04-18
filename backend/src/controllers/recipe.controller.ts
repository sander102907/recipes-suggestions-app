import { RecipeWithIngredientsAndImage } from '../types/recipeWithIngredients';
import { RecipeHelper } from '../utils/recipeHelper';
import { RecipeService } from '../services/recipe.service';
import RecipeParams from "../interfaces/RecipeParams";
import { StatusCodes } from 'http-status-codes';
import {
    Body,
    Controller,
    Get,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
    Tags,
    Res,
    TsoaResponse,
    Delete,
    Patch,
} from "tsoa";
import { WithPrices } from '../types/withPrices';
import { Recipe } from '@prisma/client';
import { FileService } from '../services/file.service';

@Route("recipes")
@Tags("Recipe")
export class RecipeController extends Controller {
    /**
     * Get a list of recipes. Can get all recipes, only recipes with bonus ingredients or only recipes without bonus ingredients.
     * @summary Get a list of recipes
     * @param bonus a boolean value whether to only retrieve recipes with bonus ingredients, or no bonus ingredients at all. Exclude this parameter to retrieve all recipes
     */
    @Get("/")
    public async getRecipes(
        @Query() bonus?: boolean
    ): Promise<WithPrices<RecipeWithIngredientsAndImage>[]> {

        let recipes: RecipeWithIngredientsAndImage[];

        if (bonus === undefined) {
            recipes = await RecipeService.getAllRecipes();
        } else if (bonus) {
            recipes = await RecipeService.getBonusRecipes();
        } else {
            recipes = await RecipeService.getNonBonusRecipes();
        }

        const recipesWithPrices = recipes.map(RecipeHelper.computePrices);

        return recipesWithPrices;
    }

    /**
    * Suggest 7 recipes for the current week.
    * Recipes with bonus ingredients are selected first and filled with random recipes to the limit of 7
    * @summary Suggest current week's recipes
    */
    @Get("/suggest")
    public async suggestRecipes(): Promise<WithPrices<RecipeWithIngredientsAndImage>[]> {
        const bonusRecipes = await RecipeService.getBonusRecipes();
        const nonBonusRecipes = await RecipeService.getNonBonusRecipes();

        const randNonBonusRecipes = nonBonusRecipes.sort(() => 0.5 - Math.random()).slice(0, 7 - bonusRecipes.length);

        const recipesWithPrices = [...bonusRecipes, ...randNonBonusRecipes].map(RecipeHelper.computePrices);

        return recipesWithPrices
    }

    /**
     * Search recipes on recipe name or ingredient name
     * @summary Search recipes
     * @param query The search query
     * @minLength 2 query the search query should exist of at least 2 characters
     */
    @Get("/search")
    public async searchRecipes(
        @Query() query: string
    ): Promise<WithPrices<RecipeWithIngredientsAndImage>[]> {
        const recipes = await RecipeService.searchRecipes(String(query).trim());
        const recipesWithPrices = recipes.map(RecipeHelper.computePrices)

        return recipesWithPrices;
    }

    /**
     * Get a recipe by ID
     * @summary Get a recipe by ID
     * @param id The recipe's identifier
     * @isInt id id should be an integer value
     */
    @Get("/{id}")
    public async getRecipe(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<WithPrices<RecipeWithIngredientsAndImage>> {
        const recipe = await RecipeService.getRecipe(id);

        if (recipe) {
            return RecipeHelper.computePrices(recipe);
        } else {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No recipe with ID ${id} exists in the database` });
        }
    }

    /**
     * Create a new recipe
     * @summary Create a new recipe
     */
    @SuccessResponse(StatusCodes.CREATED, "Created")
    @Post("/")
    public async createRecipe(
        @Body() recipeParams: RecipeParams,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<Recipe> {
        if (recipeParams.imageId) {
            const image = FileService.getFile(recipeParams.imageId);

            if (!image) {
                return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No file with ID ${recipeParams.imageId} exists in the database` });
            }
        }

        this.setStatus(StatusCodes.CREATED);
        return await RecipeService.createRecipe(recipeParams);
    }

    /**
     * Update a recipe by ID
     * @summary Update a recipe
     * @param id The recipe's identifier
     */
    @Patch("/{id}")
    public async updateRecipe(
        @Path() id: number,
        @Body() recipeParams: RecipeParams,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<Recipe> {
        const recipe = await RecipeService.getRecipe(id);

        if (!recipe) {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No recipe with ID ${id} exists in the database` });
        }

        if (recipeParams.imageId != undefined) {
            const image = await FileService.getFile(recipeParams.imageId);

            if (!image) {
                return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No file with ID ${recipeParams.imageId} exists in the database` });
            }
        }

        return await RecipeService.updateRecipe(id, recipeParams);
    }

    /**
     * / Delete a recipe by ID
     * @summary Delete a recipe
     * @param id The recipe's identifier
     * @isInt id id should be an integer value
     */
    @Delete("/{id}")
    public async deleteRecipe(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<404, { reason: string }>
    ): Promise<Recipe> {
        const recipe = await RecipeService.getRecipe(id);

        if (recipe) {
            return await RecipeService.deleteRecipe(id);
        } else {
            return notFoundResponse(404, { reason: `No recipe with ID ${id} exists in the database` });
        }
    }
}