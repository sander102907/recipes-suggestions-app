import { AH } from "../apis/ah.api";
import { Product } from "../interfaces/AhProductsResponse";
import { IngredientService } from "../services/ingredient.service";
import { IngredientPriceHistoryService } from "../services/ingredientPriceHistory.service";

export class IngredientHelper {
    private readonly ahClient: AH;
    private synchronizing = false;

    constructor(ahClient: AH) {
        this.ahClient = ahClient;
    }

    // Can probably be improved with createMany and updateMany..
    async syncAllIngredients(): Promise<void> {
        // Do not synchronize in parallel
        if (this.synchronizing) {
            return;
        }

        this.synchronizing = true;

        const categoriesResponse = await this.ahClient.getCategories();

        for (const category of categoriesResponse.data) {
            const products = await this.getAllProductsOfCategory(category.id);
            for (const product of products) {
                const isBonus = this.isInBonus(product);

                // Map the product to an ingredient in the database (update changes or create a new ingredient)
                const ingredient = await this.updateOrCreateIngredient(product, isBonus);

                // Get the current price history record
                const currentPriceHistory = await IngredientPriceHistoryService.getCurrentPrice(ingredient.id);

                // If the price of the product has changed (or this is a new product)
                if (currentPriceHistory?.price != product.price.now) {
                    if (currentPriceHistory) {
                        // If the price has updated, set the until date of the old price record to the current date
                        await IngredientPriceHistoryService.addUntilDateToIngredientPrice(currentPriceHistory.id, new Date())
                    }

                    // Add a new price history record
                    await IngredientPriceHistoryService.addIngredientPrice({
                        price: product.price.now,
                        isBonus: isBonus,
                        from: new Date(),
                        ingredientId: ingredient.id
                    });
                }
            }
        }
    }

    private async getAllProductsOfCategory(categoryId: number, page = 0, products: Product[] = []): Promise<Product[]> {
        const prodResponse = await this.ahClient.SearchProducts(undefined, categoryId, 1000, 0);

        products.push(...prodResponse.data.cards.filter(card => card.type == "default").map(card => card.products[0]));

        if (page == prodResponse.data.page.totalPages - 1 || page == 2) {
            return products;
        } else {
            return this.getAllProductsOfCategory(categoryId, page + 1, products);
        }
    }

    private isInBonus(product: Product): boolean {
        if (product.discount != null) {
            // get end date and correct it by adding 24 hours (e.g. end date is 12-12-2021 at 00:00, set it to 13-12-2021 at 00:00)
            const endDate = new Date(product.discount.endDate).setHours(new Date(product.discount.endDate).getHours() + 24);
            const startDate = new Date(product.discount.startDate).getDate();

            return endDate >= Date.now() && startDate <= Date.now();
        }

        return false
    }

    private updateOrCreateIngredient(product: Product, isBonus: boolean) {
        return IngredientService.updateOrCreateIngredient(
            product.id,
            {
                name: product.title,
                ahId: product.id,
                unitSize: product.price.unitSize,
                price: isBonus ? (product.price.was ? product.price.was : undefined) : product.price.now,
                bonusPrice: isBonus ? product.price.now : null!,
                bonusMechanism: isBonus ? product.shield?.text : null!,
                isBonus: isBonus,
                category: product.taxonomies[0].name,
                imageTiny: product.images[0]?.url.replace("200x200_JPG.JPG", "48x48_GIF.GIF"),
                imageSmall: product.images[0]?.url.replace("200x200", "80x80"),
                imageMedium: product.images[0]?.url,
                imageLarge: product.images[1]?.url,
            }
        )
    }
}