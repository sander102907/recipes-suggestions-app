import { addHours, isFuture, isPast } from "date-fns";
import { AH } from "../apis/ah";
import { Product } from "../interfaces/AhProductsResponse";
import { IngredientService } from "../services/ingredient.service";
import { IngredientPriceHistoryService } from "../services/ingredientPriceHistory.service";

export class IngredientHelper {
    private readonly ahClient: AH;
    private synchronizing = false;

    constructor(ahClient: AH) {
        this.ahClient = ahClient;
    }

    async syncAllIngredients(): Promise<void> {
        // Do not synchronize in parallel
        if (this.synchronizing) {
            return;
        }

        this.synchronizing = true;

        const categoriesResponse = await this.ahClient.getCategories();

        for (const category of categoriesResponse.data) {
            const products = await this.getAllProductsOfCategory(category.id);

            const ingredientParams = products.map(this.productToIngredient, this);

            const ingredients = await IngredientService.updateOrCreateIngredients(ingredientParams);

            const priceHistoryParams = [];

            for (let index = 0; index < ingredients.length; index++) {
                const ingredient = ingredients[index];
                const product = products[index];

                const currentPriceHistory = await IngredientPriceHistoryService.getCurrentPrice(ingredient.id);
                const isBonus = this.isInBonus(product);

                if (currentPriceHistory?.price != product.price.now || isBonus != currentPriceHistory.isBonus) {
                    if (currentPriceHistory) {
                        // If the price has updated, set the until date of the old price record to the current date
                        await IngredientPriceHistoryService.addUntilDateToIngredientPrice(currentPriceHistory.id, new Date())
                    }

                    priceHistoryParams.push({
                        price: product.price.now,
                        isBonus: isBonus,
                        bonusMechanism: this.getBonusMechanism(product),
                        from: new Date(),
                        ingredientId: ingredient.id
                    });
                }
            }

            await IngredientPriceHistoryService.addIngredientPrices(priceHistoryParams);
        }
    }

    private async getAllProductsOfCategory(categoryId: number, page = 0, products: Product[] = []): Promise<Product[]> {
        const prodResponse = await this.ahClient.searchProducts(undefined, categoryId, 1000, page);

        products.push(...prodResponse.data.cards.filter(card => card.type == "default").map(card => card.products[0]));

        if (page == prodResponse.data.page.totalPages - 1 || page == 2) {
            return products;
        } else {
            return this.getAllProductsOfCategory(categoryId, page + 1, products);
        }
    }

    private productToIngredient(product: Product) {
        const isBonus = this.isInBonus(product);

        return {
            name: product.title,
            ahId: product.id,
            unitSize: product.price.unitSize,
            price: isBonus ? (product.price.was ? product.price.was : undefined) : product.price.now,
            bonusPrice: isBonus ? product.price.now : null!,
            bonusMechanism: this.getBonusMechanism(product),
            isBonus: isBonus,
            category: product.taxonomies[0].name,
            image: product.images[0]?.url,
        }
    }

    private getBonusMechanism(product: Product) {
        const isBonus = this.isInBonus(product);

        return isBonus && product.shield ? `${product.shield.title ? product.shield.title : ""} ${product.shield.text}`.trim() : null!;
    }

    private isInBonus(product: Product): boolean {
        if (product.discount != null) {
            // get end date and correct it by adding 24 hours (e.g. end date is 12-12-2021 at 00:00, set it to 13-12-2021 at 00:00)
            const endDate = addHours(new Date(product.discount.endDate), 24);
            const startDate = new Date(product.discount.startDate);

            return isFuture(endDate) && isPast(startDate);
        }

        return false
    }
}