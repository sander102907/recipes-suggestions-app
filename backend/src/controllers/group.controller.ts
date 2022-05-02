import GroupParams from "../interfaces/GroupParams";
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
    Put,
} from "tsoa";
import { IngredientsInGroup, RecipeIngredientsGroup } from "@prisma/client";
import { GroupService } from "../services/group.service";
import IngredientsInGroupParams from "../interfaces/IngredientsInGroupParams";
import { IngredientService } from "../services/ingredient.service";
import { RecipeService } from "../services/recipe.service";

@Route("groups")
@Tags("Ingredient Group")
export class GroupController extends Controller {
    /**
     * Get a list of ingredient groups. Can get all groups, groups of a certain recipe, or groups with a certain ingredient
     * @summary Get a list of ingredient groups
     * @param recipeId Get the groups of a recipe
     * @isInt recipeId recipeId should be an integer value
     * @param ingredientId Get the groups with an ingredient
     * @isInt ingredientId ingredientId should be an integer value
     */
    @Get("/")
    public async getGroups(
        @Res() badRequestResponse: TsoaResponse<StatusCodes.BAD_REQUEST, { reason: string }>,
        @Query() recipeId?: number,
        @Query() ingredientId?: number
    ): Promise<RecipeIngredientsGroup[]> {
        if (recipeId && ingredientId) {
            return badRequestResponse(StatusCodes.BAD_REQUEST, { reason: 'recipeId and ingredientId cannot both be set. Include either one of them, or none.' })
        }

        if (recipeId) {
            return await GroupService.getGroupsOfRecipe(recipeId);
        }

        if (ingredientId) {
            return await GroupService.getGroupsWithIngredient(ingredientId)
        }

        return await GroupService.getAllGroups();
    }

    /**
     * Get a ingredient group by ID
     * @summary Get a ingredient group by ID
     * @param id The group's identifier
     * @isInt id id should be an integer value
     */
    @Get("/{id}")
    public async getGroup(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<RecipeIngredientsGroup> {
        const group = await GroupService.getGroup(id);

        if (group) {
            return group;
        } else {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No group with ID ${id} exists in the database` });
        }
    }

    /**
     * Create a new ingredient group
     * @summary Create a new ingredient group
     */
    @SuccessResponse(StatusCodes.CREATED, "Created")
    @Post("/")
    public async createGroup(
        @Body() groupParams: GroupParams,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<RecipeIngredientsGroup> {
        const recipe = await RecipeService.getRecipe(groupParams.recipeId);

        if (!recipe) {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No recipe with ID ${groupParams.recipeId} exists in the database` });
        }

        this.setStatus(StatusCodes.CREATED);
        return await GroupService.createGroup(groupParams);
    }

    /**
     * Add a ingredient to a ingredient group
     * @summary Add a ingredient to a ingredient group
     */
    @Put("/ingredient/add")
    public async addIngredientToGroup(
        @Body() ingredientsInGroupParams: IngredientsInGroupParams,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<IngredientsInGroup> {
        const group = await GroupService.getGroup(ingredientsInGroupParams.groupId);

        if (!group) {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No group with ID ${ingredientsInGroupParams.groupId} exists in the database` });
        }

        const ingredient = await IngredientService.getIngredient(ingredientsInGroupParams.ingredientId);

        if (!ingredient) {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No ingredient with ID ${ingredientsInGroupParams.ingredientId} exists in the database` });
        }

        return await GroupService.addIngredientToGroup(ingredientsInGroupParams);
    }

    /**
     * Subtract a ingredient from a ingredient group
     * @summary Subtract a ingredient from a ingredient group
     */
    @Put("/ingredient/subtract")
    public async subtractIngredientFromGroup(
        @Body() ingredientsInGroupParams: IngredientsInGroupParams,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<{ result: string }> {
        const group = await GroupService.getGroup(ingredientsInGroupParams.groupId);

        if (!group) {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No group with ID ${ingredientsInGroupParams.groupId} exists in the database` });
        }

        const ingredient = await IngredientService.getIngredient(ingredientsInGroupParams.ingredientId);

        if (!ingredient) {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No ingredient with ID ${ingredientsInGroupParams.ingredientId} exists in the database` });
        }

        await GroupService.subtractIngredientFromGroup(ingredientsInGroupParams);

        return { result: 'success' }
    }

    /**
     * Remove all groups from a recipe
     * @summary Remove all groups from a recipe
     * @param recipeId The recipe's identifier
     * @isInt id id should be an integer value
     */
    @Delete("/recipe/{recipeId}")
    public async removeAllGroupsFromRecipe(
        @Path() recipeId: number,
    ): Promise<{ result: string }> {
        await GroupService.removeAllGroupsFromRecipe(recipeId);
        return { result: 'success' };
    }

    /**
     * Remove all ingredients from a ingredient group
     * @summary Remove all ingredients from a ingredient group
     * @param groupId The group's identifier
     * @isInt id id should be an integer value
     */
    @Delete("/ingredient/{groupId}")
    public async removeAllIngredientsFromGroup(
        @Path() groupId: number,
    ): Promise<{ result: string }> {
        await GroupService.removeAllIngredientsFromGroup(groupId);
        return { result: 'success' };
    }
}