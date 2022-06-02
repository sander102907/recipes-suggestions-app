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
    Put,
} from "tsoa";
import { Ingredient, IngredientPriceHistory } from "@prisma/client";
import { IngredientService } from "../services/ingredient.service";
import { AH } from "../apis/ah";
import { IngredientHelper } from "../utils/ingredientHelper";
import { IngredientPriceHistoryService } from "../services/ingredientPriceHistory.service";
import { AhError } from "../errors/AhError";
import { AxiosError } from "axios";
import IngredientCreateParams from "../interfaces/IngredientCreateParams";
import IngredientUpdateParams from "../interfaces/IngredientUpdateParams";

@Route("ingredients")
@Tags("Ingredient")
export class IngredientController extends Controller {
    private readonly ahClient: AH;
    private readonly ingredientHelper: IngredientHelper;

    constructor() {
        super();
        this.ahClient = new AH();
        this.ingredientHelper = new IngredientHelper(this.ahClient);
    }

    /**
     * Get a list of ingredients.
     * @summary Get a list of ingredients
     * @param take the number of ingredients to return
     * @isInt take limit should be an integer value
     * @minimum take 1 must retrieve at least one item, set limit to > 0
     * @maximum take 1000 can only retrieve a maximum of 1000 items, set limit to <= 1000
     * 
     * @param page the page of ingredients to retrieve
     * @isInt page page should be an integer value
     * @minimum page 0 page may not be a negative value
     */
    @Get("/")
    public async getIngredients(
        @Query("limit") take = 20,
        @Query() page = 0,
    ): Promise<Ingredient[]> {
        return await IngredientService.getAllIngredients(take, page);
    }

    /**
     * Get a ingredient by ID
     * @summary Get a ingredient
     * @param id The ingredient's identifier
     * @isInt id id should be an integer value
     */
    @Get("/{id}")
    public async getIngredient(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<Ingredient> {
        const ingredient = await IngredientService.getIngredient(id);

        if (ingredient) {
            return ingredient;
        } else {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No ingredient with ID ${id} exists in the database` });
        }
    }

    /**
     * Get the price history of an ingredient
     * @summary Get the price history of an ingredient
     * @param id The ingredient's identifier
     * @isInt id id should be an integer value
     */
    @Get("/{id}/priceHistory")
    public async getIngredientPriceHistory(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<IngredientPriceHistory[]> {
        const ingredient = await IngredientService.getIngredient(id);

        if (ingredient) {
            return await IngredientPriceHistoryService.getPriceHistory(id);
        } else {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No ingredient with ID ${id} exists in the database` });
        }
    }

    /**
     * Search a ingredient via the Albert Heijn API
     * @summary Search a ingredient
     * @param query The search query
     * @isString query should be a string
     * @minLength query 2 The search query should be at least 2 characters
     */
    @Get("/ah/search")
    public async SearchIngredients(
        @Query() query: string,
    ) {
        const response = await this.ahClient.searchProducts(query)
            .catch((err: Error | AxiosError) => { throw new AhError(`Could not get Albert Heijn ingredients. ${err.message}`) });

        return response.data.cards.map(card => card.products[0]);
    }

    /**
     * Get a ingredient by the Albert Heijn product ID
     * @summary Get a ingredient by the Albert Heijn product ID
     * @param id The Albert Heijn's product identifier
     * @isInt id id should be an integer value
     */
    @Get("/ah/{id}")
    public async getIngredientFromAhId(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<Ingredient> {
        const ingredient = await IngredientService.getIngredientFromAhId(id);

        if (ingredient) {
            return ingredient;
        } else {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No ingredient with Albert Heijn Product ID ${id} exists in the database` });
        }
    }

    /**
     * Create a new ingredient
     * @summary Create a new ingredient
     */
    @Post("/")
    @SuccessResponse(StatusCodes.CREATED, "Created")
    public async createIngredient(
        @Body() ingredientParams: IngredientCreateParams,
        @Res() conflictResponse: TsoaResponse<StatusCodes.CONFLICT, { reason: string }>
    ): Promise<Ingredient> {
        if (ingredientParams.ahId != undefined) {
            const ingredient = await IngredientService.getIngredientFromAhId(ingredientParams.ahId);

            if (ingredient) {
                return conflictResponse(StatusCodes.CONFLICT, { reason: `A ingredient with ahId ${ingredientParams.ahId} already exists in the database` });
            }
        }

        this.setStatus(StatusCodes.CREATED);
        return await IngredientService.createIngredient(ingredientParams);
    }

    /**
     * Update a ingredient by ID
     * @summary Update a ingredient
     * @param id The ingredient's identifier
     */
    @Patch("/{id}")
    public async updateIngredient(
        @Path() id: number,
        @Body() ingredientParams: IngredientUpdateParams,
        @Res() notFoundResponse: TsoaResponse<StatusCodes.NOT_FOUND, { reason: string }>
    ): Promise<Ingredient> {
        const ingredient = await IngredientService.getIngredient(id);

        if (ingredient) {
            return await IngredientService.updateIngredient(id, ingredientParams);
        } else {
            return notFoundResponse(StatusCodes.NOT_FOUND, { reason: `No ingredient with ID ${id} exists in the database` });
        }
    }

    /**
     * / Delete a ingredient by ID
     * @summary Delete a ingredient
     * @param id The ingredient's identifier
     * @isInt id id should be an integer value
     */
    @Delete("/{id}")
    public async deleteIngredient(
        @Path() id: number,
        @Res() notFoundResponse: TsoaResponse<404, { reason: string }>
    ): Promise<Ingredient> {
        const ingredient = await IngredientService.getIngredient(id);

        if (ingredient) {
            return await IngredientService.deleteIngredient(id);
        } else {
            return notFoundResponse(404, { reason: `No ingredient with ID ${id} exists in the database` });
        }
    }

    /**
     * Synchronize the ingredients with the Albert Heijn API. Update current ingredient bonuses and price updates etc.
     * @summary Synchronize the ingredients
     */
    @Put("/sync")
    public async syncIngredients() {
        this.ingredientHelper.syncAllIngredients();

        return { message: "Started synchronizing ingredients.." };
    }
}