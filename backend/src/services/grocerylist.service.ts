import prisma from '../client';
import GroceryListCreateParams from '../interfaces/GroceryListCreateParams';
import GroceryListUpdateParams from '../interfaces/GroceryListUpdateParams';

export class GroceryListService {
    static getGroceryList() {
        return prisma.groceryList.findMany({
            include: {
                ingredient: {
                    include: {
                        ingredientsInGroup: {
                            select: {
                                recipeIngredientsGroup: {
                                    select: {
                                        id: true,
                                        recipe: {
                                            select: {
                                                id: true,
                                                isSuggested: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    static addGroceryListIngredient(groceryListParams: GroceryListCreateParams) {
        return prisma.groceryList.upsert({
            where: {
                ingredientId: groceryListParams.ingredientId
            },
            create: groceryListParams,
            update: {
                amount: {
                    increment: groceryListParams.amount
                }
            }
        });
    }

    static updateGroceryListIngredient(groceryListParams: GroceryListUpdateParams) {
        if (groceryListParams.amount != undefined && groceryListParams.amount <= 0) {
            return prisma.groceryList.delete({
                where: {
                    ingredientId: groceryListParams.ingredientId
                }
            });
        }

        return prisma.groceryList.update({
            where: {
                ingredientId: groceryListParams.ingredientId
            },
            data: groceryListParams
        });
    }

    static resetGroceryList() {
        return prisma.groceryList.deleteMany({
            where: {
                isPermanent: false
            }
        })
    }
}