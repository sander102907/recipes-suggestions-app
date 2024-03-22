import prisma from '../client';

export class IngredientCategoryService {
    static getAllIngredientCategories() {
        return prisma.ingredientCategory.findMany();
    }
}