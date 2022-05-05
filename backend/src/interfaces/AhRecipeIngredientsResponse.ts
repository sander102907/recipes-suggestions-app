export interface AhRecipeIngredientsResponse {
    ingredientProducts: IngredientProduct[];
}

export interface IngredientProduct {
    suggestion: Suggestion;
}

export interface Suggestion {
    proposer: Proposer;
    quantity: number;
    current: Current;
    alternatives: Alternative[];
    reusable: boolean;
}

export interface Alternative {
    card: Card;
    proposer: Proposer;
    quantity: number;
}

export interface Card {
    type: Type;
    id: number;
    products: CardProduct[];
}

export interface CardProduct {
    id: number;
    control: Control;
    title: string;
    link: string;
    availableOnline: boolean;
    orderable: boolean;
    highlight?: Highlight;
    propertyIcons: PropertyIcon[];
    images: Image[];
    price: Price;
    itemCatalogId: number;
    brand: string;
    category: string;
    theme: Theme;
    hqId: number;
    gtins: number[];
    summary: string;
    descriptionFull: string;
    taxonomyId: number;
    taxonomies: Taxonomy[];
    contributionMargin?: number;
    properties: Properties;
    availabilityLabel?: Label;
    interactionLabel?: Label;
}

export interface Label {
    text: string;
}


export interface Control {
    theme: Theme;
    type: Type;
}

export enum Theme {
    Ah = "ah",
}

export enum Type {
    Default = "default",
}

export interface Highlight {
    name: string;
}

export interface Image {
    height: number;
    width: number;
    title: string;
    url: string;
    ratio: Ratio;
}

export enum Ratio {
    The11 = "1-1",
}

export interface Price {
    unitInfo: UnitInfo;
    now: number;
    unitSize: string;
}

export interface UnitInfo {
    price: number;
    description: string;
}

export interface Properties {
    nutriscore?: string;
    lifestyle: string[];
}

export interface PropertyIcon {
    name: string;
    title: string;
}

export interface Taxonomy {
    id: number;
    name: string;
    imageSiteTarget?: string;
    images: any[];
    shown: boolean;
    level: number;
    sortSequence: number;
    parentIds: number[];
}

export enum Proposer {
    N = "N",
}

export interface Current {
    type: Type;
    id: number;
    products: CurrentProduct[];
}

export interface CurrentProduct {
    id: number;
    control: Control;
    title: string;
    link: string;
    availableOnline: boolean;
    orderable: boolean;
    highlight: Highlight;
    propertyIcons: PropertyIcon[];
    images: Image[];
    price: Price;
    itemCatalogId: number;
    brand: string;
    category: string;
    theme: Theme;
    hqId: number;
    gtins: number[];
    summary: string;
    descriptionFull: string;
    taxonomyId: number;
    taxonomies: Taxonomy[];
    contributionMargin: number;
    properties: Properties;
}
