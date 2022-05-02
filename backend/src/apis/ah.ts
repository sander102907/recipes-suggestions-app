import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { addSeconds, isPast } from 'date-fns';
import { AhError } from "../errors/AhError";
import AhCategoriesResponse from "../interfaces/AhCategoriesResponse";
import AhProductsResponse from "../interfaces/AhProductsResponse";
import { AhRecipeIngredientsRequest } from "../interfaces/AhRecipeIngredientsRequest";
import { AhRecipeIngredientsResponse } from "../interfaces/AhRecipeIngredientsResponse";
import AhRecipeResponse from "../interfaces/AhRecipeResponse";
import AhRecipesResponse from "../interfaces/AhRecipesResponse";
import AhToken from "../interfaces/AhToken";

const publicBaseUrl = "https://www.ah.nl";
const apiBaseUrl = "https://api.ah.nl"

export class AH {
    private readonly publicClient: AxiosInstance;
    private readonly apiClient: AxiosInstance;
    private access_token?: string;
    private refresh_token?: string;
    private tokenExpireDate?: Date;

    constructor() {
        this.publicClient = axios.create({ baseURL: publicBaseUrl });
        this.apiClient = axios.create({ baseURL: apiBaseUrl });
    }

    /**
     * Search products by product name
     * @param query Product name to search for
     * @param categoryId Category Id to get products from (null for all categories)
     * @param isBonus Get only products that are currently in the bonus
     * @param sortBy sort options
     * @param size Amount of products to retrieve (default 8)
     * @param page the product page to retrieve (default 0)
     */
    public searchProducts(
        query?: string,
        categoryId?: number,
        size: number = 8,
        page: number = 0,
        isBonus?: boolean,
        sortBy?: 'price' | '-price',
    ): Promise<AxiosResponse<AhProductsResponse>> {
        return this.publicClient.get(
            '/zoeken/api/products/search', {
            params: {
                query: query,
                size: size,
                page: page,
                sortBy: sortBy,
                taxonomy: categoryId,
                ...(isBonus && { properties: "bonus" }),
            }
        });
    }

    /**
     * Get a product by the AH webshop ID
     * @param webshopId AH webshop ID of the product to retrieve
     */
    public getProductById(webshopId: number): Promise<AxiosResponse<AhProductsResponse>> {
        return this.publicClient.get(
            'zoeken/api/products/product', {
            params: {
                webshopId: webshopId
            }
        });
    }

    /**
     * Get all categories (taxonomies) of the products
     */
    public getCategories(): Promise<AxiosResponse<AhCategoriesResponse[]>> {
        return this.publicClient.get(
            'features/api/mega-menu/products'
        );
    }

    /**
     * Search recipes by recipe name
     * @param query Recipe name to search for
     * @param sortBy sort options
     * @param size Amount of products to retrieve (default 8)
     * @param page the product page to retrieve (default 0)
     */
    public async searchRecipes(
        query: string,
        size: number = 8,
        page: number = 0,
        sortBy?: 'NEWEST' | 'MOST_RELEVANT' | 'RATINGS' | 'TOTAL_TIME'
    ): Promise<AxiosResponse<AhRecipesResponse>> {
        await this.ensureToken();

        return this.apiClient.get(
            'mobile-services/recipes/v2/search', {
            params: {
                query: query,
                size: size,
                page: page,
                sortBy: sortBy
            },
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }

        });
    }

    /**
     * Get a recipe by ID
     * @param recipeId The recipe ID
     */
    public async getRecipeById(recipeId: number): Promise<AxiosResponse<AhRecipeResponse>> {
        await this.ensureToken();

        return this.apiClient.get(
            `mobile-services/recipes/v1/recipe/${recipeId}`, {
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }
        });
    }

    /**
     * Get the shopable ingredients from a recipe
     * @param data The request JSON body
     */
    public async getRecipeIngredients(data: AhRecipeIngredientsRequest): Promise<AxiosResponse<AhRecipeIngredientsResponse>> {
        return this.publicClient.post(
            `allerhande/api/shoppable-recipe`, data);
    }

    /**
     * Ensure that the api client has an access token
     */
    private async ensureToken() {
        if (!this.access_token) {
            const tokenResponse = await this.getAnonymousMemberToken()
                .catch((err: Error | AxiosError) => { throw new AhError(`Could not get Albert Heijn access token. ${err.message}`) });

            this.access_token = tokenResponse.data.access_token;
            this.refresh_token = tokenResponse.data.refresh_token;
            this.tokenExpireDate = addSeconds(new Date(), tokenResponse.data.expires_in);
        }

        if (this.access_token && this.tokenExpireDate && isPast(this.tokenExpireDate)) {
            const tokenResponse = await this.getTokenUsingRefreshToken()
                .catch((err: Error | AxiosError) => { throw new AhError(`Could not get Albert Heijn access token using refresh token. ${err.message}`) });

            this.access_token = tokenResponse.data.access_token;
            this.refresh_token = tokenResponse.data.refresh_token;
            this.tokenExpireDate = addSeconds(new Date(), tokenResponse.data.expires_in);
        }
    }

    /**
     * Gets an anonymous token
     */
    private getAnonymousMemberToken(): Promise<AxiosResponse<AhToken>> {

        return this.apiClient.post(
            'mobile-auth/v1/auth/token/anonymous',
            {
                clientId: 'appie'
            }
        );
    }

    /**
     * Refreshes access token using refresh token
     */
    private getTokenUsingRefreshToken() {
        return this.apiClient.post(
            'mobile-auth/v1/auth/token/refresh', {
            clientId: 'appie',
            refreshToken: this.refresh_token
        });
    }
}