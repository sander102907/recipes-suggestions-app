import { Image } from "./Image";
import { RecipeIngredientsGroup } from "./RecipeIngredientsGroup";

export interface Recipe {
    id: number;
    name: string;
    description?: string;
    isSuggested?: boolean;
    excludeFromSuggestions?: boolean;
    suggestionEndDate?: Date;
    rating?: number;
    imageId?: number;
    recipeIngredientsGroups: RecipeIngredientsGroup[];
    image?: Image;
    bonusPrice: string;
    minPrice: string;
    maxPrice: string;
}
