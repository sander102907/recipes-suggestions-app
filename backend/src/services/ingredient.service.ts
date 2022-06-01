import prisma from '../client';
import IngredientCreateParams from '../interfaces/IngredientCreateParams';
import IngredientUpdateParams from '../interfaces/IngredientUpdateParams';

export class IngredientService {
    static getAllIngredients(take = 20, page = 0) {
        return prisma.ingredient.findMany({
            skip: take * page,
            take: take
        })
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

    static createIngredient(ingredientParams: IngredientCreateParams) {
        return prisma.ingredient.create({
            data: ingredientParams
        })
    }

    static updateIngredient(id: number, ingredientParams: IngredientUpdateParams) {
        return prisma.ingredient.update({
            where: {
                id: id
            },
            data: ingredientParams
        })
    }

    static updateOrCreateIngredients(ingredientParams: IngredientCreateParams[]) {
        const transactions = ingredientParams.map(param => {
            return prisma.ingredient.upsert({
                where: {
                    ahId: param.ahId
                },
                update: param,
                create: param
            });
        });

        return prisma.$transaction(transactions);
    }

    static deleteIngredient(id: number) {
        return prisma.ingredient.delete({
            where: {
                id: id
            }
        })
    }
}