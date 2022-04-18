import prisma from '../client';
import IngredientParams from '../interfaces/IngredientParams';

export class IngredientService {
    static getAllIngredients() {
        return prisma.ingredient.findMany({})
    }

    static getIngredient(id: number) {
        return prisma.ingredient.findUnique({
            where: {
                id: id
            }
        })
    }

    static getIngredientFromAhId(ahId: number) {
        return prisma.ingredient.findUnique({
            where: {
                ahId: ahId
            }
        })
    }

    static getIngredientsFromAhIds(ahIds: number[]) {
        return prisma.ingredient.findMany({
            where: {
                ahId: {
                    in: ahIds
                }
            }
        })
    }

    static createIngredient(ingredientParams: IngredientParams) {
        return prisma.ingredient.create({
            data: ingredientParams
        })
    }

    static updateIngredient(ahId: number, ingredientParams: IngredientParams) {
        return prisma.ingredient.update({
            where: {
                ahId: ahId
            },
            data: ingredientParams
        })
    }

    static updateOrCreateIngredient(ahId: number, ingredientParams: IngredientParams) {
        return prisma.ingredient.upsert({
            where: {
                ahId: ahId
            },
            update: ingredientParams,
            create: ingredientParams
        });
    }

    static deleteIngredient(id: number) {
        return prisma.ingredient.delete({
            where: {
                id: id
            }
        })
    }

    static getIngredientsOfGroup(groupId: number) {
        return prisma.ingredient.findMany({
            where: {
                ingredientsInGroup: {
                    some: {
                        groupId: groupId
                    }
                }
            }
        })
    }
}