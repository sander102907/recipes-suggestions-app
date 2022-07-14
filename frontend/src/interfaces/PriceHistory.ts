export interface PriceHistory {
    id: number;
    price: number;
    isBonus: boolean;
    bonusMechanism: null;
    from: string;
    until: string;
    ingredientId: number;
}
