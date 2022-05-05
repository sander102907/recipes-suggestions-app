import prisma from '../../client'

export default async function clearDatabase() {
    const deleteRecipes = prisma.recipe.deleteMany();
    const deleteIngredients = prisma.ingredient.deleteMany();
    const deleteGroups = prisma.recipeIngredientsGroup.deleteMany();
    const deleteIngredientsInGroups = prisma.ingredientsInGroup.deleteMany();
    const deleteFiles = prisma.file.deleteMany();
    const deletePriceHistories = prisma.ingredientPriceHistory.deleteMany();

    await prisma.$transaction([
        deletePriceHistories,
        deleteRecipes,
        deleteIngredients,
        deleteGroups,
        deleteIngredientsInGroups,
        deleteFiles
    ]);

    await prisma.$disconnect();
}