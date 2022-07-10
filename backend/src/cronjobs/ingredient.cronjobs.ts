import cron from "node-cron";
import { AH } from "../apis/ah";
import { IngredientHelper } from "../utils/ingredientHelper";

export class IngredientCronjobs {
    private readonly ahClient: AH;
    private readonly ingredientHelper: IngredientHelper;

    constructor() {
        this.ahClient = new AH();
        this.ingredientHelper = new IngredientHelper(this.ahClient);
    }

    // Default cronTime: every night at 2:00 AM
    public syncIngredients(cronTime = '0 0 2 * * *') {
        // Synchronize all ingredients
        cron.schedule(cronTime, () => {
            console.log("running daily cron schedule to update ingredients");
            this.ingredientHelper.syncAllIngredients();
        }, {
            timezone: "Europe/Amsterdam"
        });
    }
}