export type WithPrices<T> = T & {
    bonusPrice: string,
    minPrice: string,
    maxPrice: string
}