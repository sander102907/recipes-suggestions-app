export default interface AhRecipesResponse {
    filters: Filter[];
    content: Content[];
    links: Link[];
    page: Page;
    totalCount: number;
    mmiBannerUrl: string;
}

export interface Content {
    id: number;
    title: string;
    cookTime: number;
    recipeImage: RecipeImage[];
}

export interface RecipeImage {
    width: number;
    height: number;
    url: string;
}

export interface Filter {
    type: string;
    label: string;
    booleanFilter: boolean;
    options: Option[];
}

export interface Option {
    id: string;
    label: string;
    count: number;
    display: boolean;
}

export interface Link {
    rel: string;
    href: string;
}

export interface Page {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
}
