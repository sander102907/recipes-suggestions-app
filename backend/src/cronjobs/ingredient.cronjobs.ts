import { CronJob } from "cron";
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
    public syncIngredients(cronTime = '00 00 2 * * *') {
        // Synchronize all ingredients
        new CronJob(cronTime, () => {
            console.log("running daily cron schedule to update ingredients");

            this.ingredientHelper.syncAllIngredients();
        },
            null, // onComplete
            true, // start (Specifies whether to start the job just before exiting the constructor)
            'Europe/Amsterdam' // timezone
        );
    }
}