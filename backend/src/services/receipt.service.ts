import prisma from '../client';
import ReceiptItemParams from '../interfaces/ReceiptParams';

export class ReceiptService {
    static processReceiptItem(receiptItemParams: ReceiptItemParams) {
        let price = receiptItemParams.price;

        if (price === undefined) {
            if (receiptItemParams.amount === undefined || receiptItemParams.totalPrice === undefined) {
                return;
            }

            price = receiptItemParams.totalPrice / receiptItemParams.amount;
        }

        return prisma.ingredient.findMany({
            where: {
                price: price
            }
        })
    }
}