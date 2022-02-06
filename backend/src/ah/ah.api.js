const axios = require('axios');

class AH {
    constructor() {
        this.client = axios.create({baseURL:'https://www.ah.nl'});
    }

    /**
     * Get products from given product name
     * @param query Product name to search for
     * @param categoryId Category Id to get products from (null for all categories)
     * @param isBonus Get only products that are currently in the bonus
     * @param sortBy sort options (e.g. price or -price)
     * @param size Amount of products to retrieve
     * @param page the product page to retrieve
     */
    async getProductsByName(
        query,
        categoryId=null,
        size=8, 
        page=0,
        isBonus=false, 
        sortBy=null, 
    ) {
        return (await this.client.get(
            '/zoeken/api/products/search', {
                params: {
                    query: query,
                    size: size,
                    page: page,
                    sortBy: sortBy,
                    taxonomy: categoryId,
                    ...(isBonus && {properties: "bonus"}),
                }
            }
        )).data;
    }

    /**
     * Get a product by the AH webshop ID
     * @param webshopId AH webshop ID of the product to retrieve
     */
    async getProductById(webshopId) {
        return (await this.client.get(
            'zoeken/api/products/product', {
                params: {
                    webshopId: webshopId
                }
            }
        )).data;
    }

    /**
     * Get all categories (taxonomies) of the products
     */
    async getCategories() {
        return (await this.client.get(
            'features/api/mega-menu/products'
        )).data;
    }
}

module.exports = AH;