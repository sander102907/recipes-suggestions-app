import { StatusCodes } from 'http-status-codes';
import {
    Body,
    Controller,
    Get,
    Post,
    Route,
    SuccessResponse,
    Tags,
    Res,
    TsoaResponse,
    Patch,
} from "tsoa";
import { GroceryList } from "@prisma/client";
import { IngredientService } from "../services/ingredient.service";
import { GroceryListService } from "../services/grocerylist.service";
import GroceryListCreateParams from "../interfaces/GroceryListCreateParams";
import GroceryListUpdateParams from "../interfaces/GroceryListUpdateParams";

@Route("grocerylist")
@Tags("Grocery List")
export class GroceryListController extends Controller {
    /**
     * Get ingredients on the grocery list. This includes ingredients of the weekly suggested recipes, permanently added ingredients and currently added ingredients
     * @summary Get ingredients on the grocery list
     */
    @Get("/")
    public async getGroceryList() {
        const groceryList = await GroceryListService.getGroceryList();

        const groceryListWithGroups = groceryList.map(item => {
            const groups = item.ingredient.ingredientsInGroup;
            return {
                ...item,
                groupIds: groups.map(group => group.recipeIngredientsGroup.id),
                recipeIds: groups.filter(group => group.recipeIngredientsGroup.recipe.isSuggested).map(group => group.recipeIngredientsGroup.recipe.id)
            }
        });

        return groceryListWithGroups;
    }

    /**
     * Add a ingredient to the grocery list
     * @summary Add a ingredient to the grocery list
     */
    @SuccessResponse(StatusCodes.CREATED, "Created")
    @Post("/")
    public async addGroceryListIngredient(
        @Body() groceryListParams: GroceryListCreateParams,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<GroceryList> {
        const ingredient = await IngredientService.getIngredient(groceryListParams.ingredientId);

        if (!ingredient) {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No ingredient with ID ${groceryListParams.ingredientId} exists in the database` });
        }

        this.setStatus(StatusCodes.CREATED);
        return await GroceryListService.addGroceryListIngredient(groceryListParams);
    }

    /**
     * Update a ingredient on the grocery list
     * @summary Update a ingredient on the grocery list
     */
    @Patch("/")
    public async updateGroceryListIngredient(
        @Body() groceryListParams: GroceryListUpdateParams,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<GroceryList> {
        const groceryList = await GroceryListService.getGroceryList();

        if (groceryList.findIndex(item => item.ingredientId === groceryListParams.ingredientId) === -1) {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No ingredient with ID ${groceryListParams.ingredientId} on the grocery list` });
        }

        return await GroceryListService.updateGroceryListIngredient(groceryListParams);
    }
}