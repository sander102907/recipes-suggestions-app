import axios, { AxiosInstance, AxiosResponse } from "axios";
import AhCategoriesResponse from "../interfaces/AhCategoriesResponse";
import AhProductsResponse from "../interfaces/AhProductsResponse";

const baseUrl = "https://www.ah.nl";

export class AH {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({ baseURL: baseUrl });
    }

    /**
     * Search products by product name
     * @param query Product name to search for
     * @param categoryId Category Id to get products from (null for all categories)
     * @param isBonus Get only products that are currently in the bonus
     * @param sortBy sort options
     * @param size Amount of products to retrieve
     * @param page the product page to retrieve
     */
    public SearchProducts(
        query?: string,
        categoryId?: number,
        size: number = 8,
        page: number = 0,
        isBonus: boolean = false,
        sortBy?: 'price' | '-price',
    ): Promise<AxiosResponse<AhProductsResponse>> {
        return this.client.get(
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
        return this.client.get(
            'zoeken/api/products/product', {
            params: {
                webshopId: webshopId
            }
        }
        );
    }

    /**
     * Get all categories (taxonomies) of the products
     */
    public getCategories(): Promise<AxiosResponse<AhCategoriesResponse[]>> {
        return this.client.get(
            'features/api/mega-menu/products'
        );
    }
}