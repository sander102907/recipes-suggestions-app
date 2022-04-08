import prisma from '../../client';

export class RecipeService {
    static readonly withIngredients = {
        recipeIngredientsGroups: {
            include: {
                ingredientsInGroup: {
                    include: {
                        ingredient: true
                    }
                }
            }
        }
    }

    static getAllRecipes(amount?: number) {
        return prisma.recipe.findMany({
            include: this.withIngredients,
            take: amount
        });
    }

    static getBonusRecipes(amount?: number) {
        return prisma.recipe.findMany({
            include: this.withIngredients,
            where: {
                recipeIngredientsGroups: {
                    some: {
                        ingredientsInGroup: {
                            some: {
                                ingredient: {
                                    isBonus: true
                                }
                            }
                        }
                    }
                }
            },
            take: amount
        });
    }

    static getNonBonusRecipes(amount?: number) {
        return prisma.recipe.findMany({
            include: this.withIngredients,
            where: {
                recipeIngredientsGroups: {
                    every: {
                        ingredientsInGroup: {
                            none: {
                                ingredient: {
                                    isBonus: true
                                }
                            }
                        }
                    }
                }
            },
            take: amount
        });
    }


    static getRecipe(id: number) {
        return prisma.recipe.findUnique({
            include: this.withIngredients,
            where: {
                id: id
            }
        });
    }

    static createRecipe(name: string, description: string, rating: number) {
        return prisma.recipe.create({
            data: {
                name,
                description,
                ...(rating && { rating })
            }
        });
    }

    static updateRecipe(id: number, name: string, description: string, rating: number) {
        return prisma.recipe.update({
            where: {
                id: id
            },
            data: {
                name,
                description,
                ...(rating && { rating })
            }
        });
    }

    static deleteRecipe(id: number) {
        return prisma.recipe.delete({
            where: {
                id: id
            }
        });
    }

    static searchRecipes(query: string) {
        return prisma.recipe.findMany({
            include: this.withIngredients,
            where: {
                OR: [
                    {
                        name: {
                            contains: query
                        }
                    },
                    {
                        recipeIngredientsGroups: {
                            some: {
                                ingredientsInGroup: {
                                    some: {
                                        ingredient: {
                                            name: {
                                                contains: query
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        })
    }
}