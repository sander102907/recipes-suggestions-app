import prisma from '../client';
import GroupParams from '../interfaces/GroupParams';
import IngredientsInGroupParams from '../interfaces/IngredientsInGroupParams';

export class GroupService {
    static readonly withIngredients = {
        ingredientsInGroup: true
    }

    static getAllGroups() {
        return prisma.recipeIngredientsGroup.findMany({
            include: this.withIngredients
        });
    }

    static getGroup(id: number) {
        return prisma.recipeIngredientsGroup.findUnique({
            where: {
                id: id
            },
            include: this.withIngredients
        });
    }

    static getGroupsOfRecipe(recipeId: number) {
        return prisma.recipeIngredientsGroup.findMany({
            where: {
                recipeId: recipeId
            },
            include: this.withIngredients
        })
    }

    static getGroupsWithIngredient(ingredientId: number) {
        return prisma.recipeIngredientsGroup.findMany({
            where: {
                ingredientsInGroup: {
                    some: {
                        ingredientId: ingredientId
                    }
                }
            },
            include: this.withIngredients
        })
    }

    static createGroup(groupParams: GroupParams) {
        if (groupParams.ingredientsInGroup) {
            return prisma.recipeIngredientsGroup.create({
                data: {
                    recipeId: groupParams.recipeId,
                    ingredientsInGroup: {
                        createMany: {
                            data: groupParams.ingredientsInGroup,
                            skipDuplicates: true
                        }
                    }
                }
            })
        } else {
            return prisma.recipeIngredientsGroup.create({
                data: {
                    recipeId: groupParams.recipeId,
                }
            })
        }
    }

    static addIngredientToGroup(ingredientsInGroupParams: IngredientsInGroupParams) {
        let amount = 1;

        if (ingredientsInGroupParams.amount) {
            amount = ingredientsInGroupParams.amount;
        }

        return prisma.ingredientsInGroup.upsert({
            where: {
                groupId_ingredientId: {
                    groupId: ingredientsInGroupParams.groupId,
                    ingredientId: ingredientsInGroupParams.ingredientId
                }
            },
            update: {
                amount: {
                    increment: amount
                }
            },
            create: {
                groupId: ingredientsInGroupParams.groupId,
                ingredientId: ingredientsInGroupParams.ingredientId,
                amount: amount
            }
        })
    }

    static removeAllGroupsFromRecipe(recipeId: number) {
        return prisma.recipeIngredientsGroup.deleteMany({
            where: {
                recipeId: recipeId
            }
        })
    }

    static removeAllIngredientsFromGroup(groupId: number) {
        return prisma.ingredientsInGroup.deleteMany({
            where: {
                groupId: groupId
            }
        })
    }

    static async subtractIngredientFromGroup(ingredientsInGroupParams: IngredientsInGroupParams) {
        let amount = 1;

        if (ingredientsInGroupParams.amount) {
            amount = ingredientsInGroupParams.amount;
        }

        const filter = {
            groupId_ingredientId: {
                groupId: ingredientsInGroupParams.groupId,
                ingredientId: ingredientsInGroupParams.ingredientId
            }
        }

        const ingredientsInGroup = await prisma.ingredientsInGroup.findUnique({
            where: filter
        });

        if (ingredientsInGroup) {
            if (ingredientsInGroup.amount <= amount) {
                return prisma.ingredientsInGroup.delete({
                    where: filter
                })
            } else {
                return prisma.ingredientsInGroup.update({
                    where: filter,
                    data: {
                        amount: {
                            decrement: amount
                        }
                    }
                })
            }
        }
    }
}