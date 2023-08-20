import { Prisma } from "@prisma/client";

export default interface AhProductsResponse {
    cards: Card[];
    page: Page;
    aggregation: Aggregation;
    taxonomies: AhProductTaxonomy[];
}

interface Aggregation {
    properties: Brand[];
    brands: Brand[];
    taxonomies: AggregationTaxonomy[];
    prices: PriceElement[];
}

interface Brand {
    name?: string;
    count: number;
    id: string;
    label: string;
    attributes?: Attributes;
}

interface Attributes {
    icon: string;
}

interface PriceElement {
    count: number;
    min: number;
    max: number;
    label: string;
}

interface AggregationTaxonomy {
    count: number;
    id: number;
    shown: boolean;
    level: number;
    parentIds: number[];
    rank: number;
    relevant: boolean;
    label: string;
}

interface Card {
    id: number;
    type: string;
    products: Product[];
}

export interface Product {
    id: number;
    title: string;
    link: string;
    availableOnline: boolean;
    orderable: boolean;
    propertyIcons: PropertyIcon[];
    images: ProductImage[];
    price: ProductPrice;
    itemCatalogId: number;
    brand: string;
    category: string;
    hqId: number;
    gtins: number[];
    summary: string;
    descriptionFull: string;
    taxonomyId: number;
    taxonomies: ProductTaxonomy[];
    contributionMargin?: number;
    properties: Properties;
    shield?: Shield;
    discount?: Discount;
    smartLabel?: Shield;
}

interface Discount {
    bonusType: string;
    segmentType: string;
    startDate: string;
    endDate: string;
    tieredOffer: any[];
    subtitle?: string;
}

interface ProductImage {
    height: number;
    width: number;
    title: string;
    url: string;
}

interface ProductPrice {
    unitInfo?: UnitInfo;
    now: Prisma.Decimal;
    was?: Prisma.Decimal;
    unitSize: string;
}

interface UnitInfo {
    price: number;
    description: string;
}

interface Properties {
    nutriscore?: Nutriscore;
    lifestyle: string[];
}

enum Nutriscore {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
}

interface PropertyIcon {
    name: string;
    title: string;
}

interface Shield {
    title?: string;
    text: string;
}

interface ProductTaxonomy {
    id: number;
    name: string;
    imageSiteTarget: string;
    images: any[];
    shown: boolean;
    level: number;
    sortSequence: number;
    parentIds: number[];
}

interface Page {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
}

interface AhProductTaxonomy {
    id: number;
    name: string;
    images: TaxonomyImage[];
    sortSequence: number;
}

interface TaxonomyImage {
    height: number;
    width: number;
    url: string;
    imageFormat: ImageFormat;
}

enum ImageFormat {
    GIF = "GIF",
    Jpg = "JPG",
}