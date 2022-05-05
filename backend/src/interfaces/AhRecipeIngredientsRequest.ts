export interface AhRecipeIngredientsRequest {
    ingredients: Ingredient[];
    recipe: Recipe;
}

export interface Ingredient {
    id: number;
    name: Name;
}

export interface Name {
    singular: string;
}

export interface Recipe {
    id: number;
    servings: number;
}
