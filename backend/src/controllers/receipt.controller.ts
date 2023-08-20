import { Ingredient } from "@prisma/client";
import {
    Body,
    Controller,
    Post,
    Route,
    Tags,
} from "tsoa";
import ReceiptItemParams from '../interfaces/ReceiptParams';
import { ReceiptService } from '../services/receipt.service';
import { WithAmount } from "../types/withAmount";
import SearchHelper from "../utils/searchHelper";

@Route("receipt")
@Tags("Receipt")
export class ReceiptController extends Controller {
    /**
     * Add a ingredient to the grocery list
     * @summary Add a ingredient to the grocery list
     */
    @Post("/")
    public async processReceipt(
        @Body() receiptParams: ReceiptItemParams[],
    ): Promise<WithAmount<Ingredient>[]> {
        const receiptItems: WithAmount<Ingredient>[] = [];

        for (let i = 0; i < receiptParams.length; i++) {
            let items = await ReceiptService.processReceiptItem(receiptParams[i]);

            if (items !== undefined) {
                const closestProduct = SearchHelper.searchClosest(receiptParams[i].name, items);
                if (closestProduct !== undefined) {
                    receiptItems.push({
                        ...closestProduct,
                        amount: receiptParams[i].amount ?? 1
                    });
                }
            }
        }
        return receiptItems;
    }
}