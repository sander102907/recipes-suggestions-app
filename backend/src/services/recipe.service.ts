import prisma from '../client';
import RecipeCreateParams from '../interfaces/RecipeCreateParams';
import RecipeUpdateParams from '../interfaces/RecipeUpdateParams';

export class RecipeService {
    static readonly withIngredientsAndImage = {
        recipeIngredientsGroups: {
            include: {
                ingredientsInGroup: {
                    include: {
                        ingredient: true
                    }
                }
            }
        },
        image: true
    }

    static getAllRecipes(take?: number) {
        return prisma.recipe.findMany({
            include: this.withIngredientsAndImage,
            take: take
        });
    }

    static getBonusRecipes(take?: number) {
        return prisma.recipe.findMany({
            include: this.withIngredientsAndImage,
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
            take: take
        });
    }

    static getNonBonusRecipes(take?: number) {
        return prisma.recipe.findMany({
            include: this.withIngredientsAndImage,
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
            take: take
        });
    }

    static getSuggestedRecipes() {
        return prisma.recipe.findMany({
            include: this.withIngredientsAndImage,
            where: {
                isSuggested: true
            },
        });
    }


    static getRecipe(id: number) {
        return prisma.recipe.findUnique({
            include: this.withIngredientsAndImage,
            where: {
                id: id
            }
        });
    }

    static createRecipe(recipeParams: RecipeCreateParams) {
        return prisma.recipe.create({
            data: recipeParams
        });
    }

    static updateRecipe(id: number, recipeParams: RecipeUpdateParams) {
        return prisma.recipe.update({
            where: {
                id: id
            },
            data: recipeParams
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
            include: this.withIngredientsAndImage,
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

    static setSuggested(ids: number[]) {
        return prisma.recipe.updateMany({
            where: {
                id: {
                    in: ids
                }
            },
            data: {
                isSuggested: true,
                excludeFromSuggestions: true
            }
        })
    }

    static resetSuggested() {
        return prisma.recipe.updateMany({
            data: {
                isSuggested: false,
                excludeFromSuggestions: false
            }
        })
    }
}