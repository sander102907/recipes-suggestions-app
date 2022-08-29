import prisma from '../client';
import IngredientPriceHistoryParams from '../interfaces/IngredientPriceHistoryParams';

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

    static addIngredientPrices(data: IngredientPriceHistoryParams[]) {
        return prisma.ingredientPriceHistory.createMany({
            data: data
        });
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

    static async getAvgPriceHistory(date: Date, inclBonus: boolean) {
        const bonusFilter = inclBonus ? {} : {
            isBonus: {
                equals: false
            }
        };

        return prisma.ingredientPriceHistory.aggregate({
            _avg: {
                price: true
            },
            _count: {
                price: true
            },
            where: {
                AND: [{
                    from: {
                        lte: date
                    }
                },
                {
                    OR: [{
                        until: {
                            gte: date
                        }
                    },
                    {
                        until: {
                            equals: null
                        }
                    }]
                },
                    bonusFilter
                ]
            }
        });
    }

    static getFirstPriceHistoryRecord() {
        return prisma.ingredientPriceHistory.findFirst({
            orderBy: {
                from: 'asc'
            }
        });
    }
}