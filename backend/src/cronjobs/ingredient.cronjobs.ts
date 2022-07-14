import schedule from "node-schedule";
import { AH } from "../apis/ah";
import { IngredientHelper } from "../utils/ingredientHelper";

export class IngredientCronjobs {
    private readonly ahClient: AH;
    private readonly ingredientHelper: IngredientHelper;

    constructor() {
        this.ahClient = new AH();
        this.ingredientHelper = new IngredientHelper(this.ahClient);
    }

    // Default cronTime: every night at 1:00 AM UTC
    public syncIngredients(cronTime = '0 0 1 * * *') {
        cronTime = '*/30 * * * * *'
        // Synchronize all ingredients
        schedule.scheduleJob('sync ingredients', cronTime, () => {
            console.log("running daily cron schedule to update ingredients");
            this.ingredientHelper.syncAllIngredients();
        });
    }
}