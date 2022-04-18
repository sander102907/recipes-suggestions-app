export default interface AhCategoriesResponse {
    id: number;
    name: string;
    slugifiedName: string;
    image: string;
    active: boolean;
    parents: number[];
    children: Child[];
    productIds: number[];
}

interface Child {
    id: number;
    name: string;
    slugifiedName: string;
    active: boolean;
    parents: number[];
    children: number[];
    productIds: number[];
    image: string;
}
