import { addHours, isFuture, isPast } from "date-fns";
import { AH } from "../apis/ah";
import { Product } from "../interfaces/AhProductsResponse";
import { IngredientService } from "../services/ingredient.service";
import { IngredientPriceHistoryService } from "../services/ingredientPriceHistory.service";
import { IngredientCategoryService } from "../services/ingredientCategory.service";
import logger from "../logger";
import { AxiosError } from "axios";

export class IngredientHelper {
    private readonly ahClient: AH;

    constructor(ahClient: AH) {
        this.ahClient = ahClient;
    }

    async syncAllIngredients(): Promise<number> {
        logger.info("Start syncing ingredients..");
        const categories = await IngredientCategoryService.getAllIngredientCategories();
        let updatedCount = 0;
        let productAhIds: number[] = [];

        await this.ahClient.getBaseSite();

        for (const category of categories) {
            let updatedCategoryCount = 0;
            logger.info(`Syncing ingredients of category "${category.name}" (${category.id})`);
            const products = await this.getAllProductsOfCategory(category.id);

            logger.info(`Retrieved ${products.length} products in category "${category.name}" (${category.id})`);

            const ingredientParams = products.map(this.productToIngredient, this);

            const ingredients = await IngredientService.updateOrCreateIngredients(ingredientParams);

            const priceHistoryParams = [];

            for (let index = 0; index < ingredients.length; index++) {
                const ingredient = ingredients[index];
                const product = products[index];

                productAhIds.push(product.id);

                const currentPriceHistory = await IngredientPriceHistoryService.getCurrentPrice(ingredient.id);
                const isBonus = this.isInBonus(product);

                if ((currentPriceHistory?.price != product.price.now && !isBonus && product.price.was === null) ||
                    isBonus != currentPriceHistory?.isBonus ||
                    currentPriceHistory === null) {
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

                    updatedCount++;
                    updatedCategoryCount++;
                }
            }

            await IngredientPriceHistoryService.addIngredientPrices(priceHistoryParams);

            logger.info(`Updated ${updatedCategoryCount}/${products.length} ingredients of category "${category.name}" (${category.id})`);

            break;

        }

        const ingredientAhIdsObj = await IngredientService.getAllIngredientAhIds();
        const ingredientAhIds = ingredientAhIdsObj.map(i => i.ahId);

        const outOfAssortmentAhIds = ingredientAhIds.filter((i): i is number => i !== null && !productAhIds.includes(i));

        await IngredientService.updateIngredientsInAssortment(outOfAssortmentAhIds, false);

        logger.info(`Syncing ingredients finished. Updated and/or created ${updatedCount} ingredients and
            ${outOfAssortmentAhIds.length} ingredients have been discontinued (total ${productAhIds.length} 
            ingredients retrieved from AH)`);

        return updatedCount;
    }

    private async getAllProductsOfCategory(categoryId: number, page = 0, products: Product[] = []): Promise<Product[]> {
        const prodResponse = await this.ahClient.searchProducts(undefined, categoryId, 1000, page).catch((err: Error | AxiosError) => { throw(err) });

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