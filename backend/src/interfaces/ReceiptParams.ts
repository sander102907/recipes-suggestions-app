/**
 * Receipt item parameters
 */

export default interface ReceiptItemParams {
    /**
     * The quantity of the receipt item
     * @isInt amount should be an integer value
     * @minimum 0 amount should be at least 0
     */
    amount?: number;

    /**
     * The name of the receipt item
     */
    name: string;

    /**
     * The price of the single receipt item
     * @isFloat price should be a float value
     */
    price?: number;

    /**
     * The price of the receipt item times the quantity of the receipt item
     * @isFloat totalPrice should be a float value
     */
    totalPrice?: number;
}

