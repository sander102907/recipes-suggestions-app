
export interface Ingredient {
    id: number;
    ahId: number;
    name: string;
    unitSize: string;
    price: number;
    category: string;
    isBonus: boolean;
    bonusMechanism: null | string;
    bonusPrice: number | null;
    image: string;
}
