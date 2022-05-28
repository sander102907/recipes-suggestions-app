export interface AhIngredient {
    id: number;
    title: string;
    availableOnline: boolean;
    orderable: boolean;
    propertyIcons: PropertyIcon[];
    images: Image[];
    price: Price;
    itemCatalogId: number;
    brand: string;
    category: string;
    theme: string;
    summary: string;
    descriptionFull: string;
    taxonomyId: number;
    taxonomies: Taxonomy[];
    properties: Properties;
    shield?: Shield;
    discount?: Discount;
}

export interface Discount {
    bonusType: string;
    segmentType: string;
    theme: string;
    startDate: string;
    endDate: string;
    tieredOffer: any[];
}


export interface Image {
    height: number;
    width: number;
    title: string;
    url: string;
}

export interface Price {
    unitInfo?: UnitInfo;
    now: number;
    unitSize: string;
    theme?: string;
    was?: number;
}

export interface UnitInfo {
    price: number;
    description: string;
}

export interface Properties {
    nutriscore: string;
    lifestyle: string[];
}

export interface PropertyIcon {
    name: string;
    title: string;
}

export interface Shield {
    theme: string;
    text: string;
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
