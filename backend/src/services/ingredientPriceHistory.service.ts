import prisma from '../client';
import IngredientPriceHistoryParams from '../interfaces/ingredientPriceHistoryParams';

export class IngredientPriceHistoryService {
    static readonly withIngredients = {
        ingredientsInGroup: true
    }

    static getPriceHistory(ingredientId: number) {
        return prisma.ingredientPriceHistory.findMany({
            where: {
                ingredientId: ingredientId
            }
        });
    }

    static getCurrentPrice(ingredientId: number) {
        return prisma.ingredientPriceHistory.findFirst({
            where: {
                ingredientId: ingredientId,
                until: null
            }
        });
    }

    static addIngredientPrice(data: IngredientPriceHistoryParams) {
        return prisma.ingredientPriceHistory.create({
            data: data
        })
    }

    static addUntilDateToIngredientPrice(id: number, until: Date) {
        return prisma.ingredientPriceHistory.update({
            where: {
                id: id
            },
            data: {
                until: until
            }
        })
    }
}