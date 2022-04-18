import prisma from '../../client'

export async function seedDatabaseWithData() {
    // create recipes
    await prisma.recipe.createMany({
        data: Array.from(new Array(3), (_, index) => {
            return {
                name: `test recipe ${index}`,
                description: `test description ${index}`,
                isSuggested: null,
                excludeFromSuggestions: null,
                suggestionEndDate: null,
                rating: Math.floor(Math.random() * 4) + 1, // Random number between 1 and 4 (so we can test if update works with 5)
            }
        })
    })

    const recipeIds = (await prisma.recipe.findMany()).map(recipe => recipe.id);

    // create recipe ingredients groups
    await prisma.recipeIngredientsGroup.createMany({
        data: Array.from(new Array(6), (_, index) => {
            return {
                recipeId: recipeIds[Math.floor(index / 2)]
            }
        })
    })

    const isBonus = [
        false, false, false, false, // recipe 1
        false, false, false, true,  // recipe 2
        false, true, false, true    // recipe 3
    ]

    // create ingredients
    await prisma.ingredient.createMany({
        data: Array.from(new Array(12), (_, index) => {
            return {
                name: `test ingredient ${index}`,
                price: 1,
                bonusPrice: isBonus[index] ? 0.5 : null,
                isBonus: isBonus[index]
            }
        })
    })

    const groupIds = (await prisma.recipeIngredientsGroup.findMany()).map(group => group.id);
    const ingredientIds = (await prisma.ingredient.findMany()).map(ingredient => ingredient.id);

    // create ingredients in groups
    await prisma.ingredientsInGroup.createMany({
        data: Array.from(new Array(12), (_, index) => {
            return {
                groupId: groupIds[Math.floor(index / 2)],
                ingredientId: ingredientIds[index]
            }
        })
    })
}

export async function clearDatabase() {
    const deleteRecipes = prisma.recipe.deleteMany()
    const deleteIngredients = prisma.ingredient.deleteMany()
    const deleteGroups = prisma.recipeIngredientsGroup.deleteMany()
    const deleteIngredientsInGroups = prisma.ingredientsInGroup.deleteMany()

    await prisma.$transaction([
        deleteRecipes,
        deleteIngredients,
        deleteGroups,
        deleteIngredientsInGroups
    ])
}