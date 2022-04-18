import IngredientParams from "../interfaces/IngredientParams";
import { StatusCodes } from 'http-status-codes';
import { CronJob } from 'cron';
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
import { AH } from "../apis/ah.api";
import { IngredientHelper } from "../utils/ingredientHelper";
import { IngredientPriceHistoryService } from "../services/ingredientPriceHistory.service";

@Route("ingredients")
@Tags("Ingredient")
export class IngredientController extends Controller {
    private readonly ahClient: AH;
    private readonly ingredientHelper: IngredientHelper;

    constructor() {
        super();
        this.ahClient = new AH();
        this.ingredientHelper = new IngredientHelper(this.ahClient);

        // Synchronize all ingredients every night at 02:00
        new CronJob('* 2 * * *', () => {
            console.log("running daily cron schedule to update ingredients");

            this.ingredientHelper.syncAllIngredients();
        });
    }

    /**
     * Get a list of ingredients.
     * @summary Get a list of ingredients
     * @param ahIds filter ingredients on Albert Heijn product ID's
     * 
     */
    @Get("/")
    public async getIngredients(
        @Query() ahIds?: number[]
    ): Promise<Ingredient[]> {
        if (ahIds) {
            return await IngredientService.getIngredientsFromAhIds(ahIds);
        }

        return await IngredientService.getAllIngredients();
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
        @Res() externalErrorResponse: TsoaResponse<StatusCodes.EXPECTATION_FAILED, { reason: string }>
    ) {
        const response = await this.ahClient.SearchProducts(query);

        if (response.status != StatusCodes.OK) {
            return externalErrorResponse(StatusCodes.EXPECTATION_FAILED, { reason: `The Albert Heijn API returned an error. StatusCode: ${response.status}. ${response.data}` })
        }

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
        @Body() ingredientParams: IngredientParams,
    ): Promise<Ingredient> {
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
        @Body() ingredientParams: IngredientParams,
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