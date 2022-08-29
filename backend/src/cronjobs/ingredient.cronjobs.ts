import schedule from "node-schedule";
import { AH } from "../apis/ah";
import FileHelper from "../utils/fileHelper";
import { IngredientHelper } from "../utils/ingredientHelper";
import { freemem, totalmem, loadavg } from "os";

export class IngredientCronjobs {
    private readonly ahClient: AH;
    private readonly ingredientHelper: IngredientHelper;

    constructor() {
        this.ahClient = new AH();
        this.ingredientHelper = new IngredientHelper(this.ahClient);
    }

    // Default cronTime: every night at 1:00 AM UTC
    public syncIngredients(cronTime = '0 0 1 * * *') {
        // Synchronize all ingredients
        schedule.scheduleJob('sync ingredients', cronTime, async () => {
            console.log("running daily cron schedule to update ingredients");

            FileHelper.appendFile("logs/log.txt", `${new Date().toUTCString()} - running daily cron schedule to update ingredients. Memory usage: ${(freemem() / 10e6).toFixed(1)}MB/${(totalmem() / 10e6).toFixed(1)}MB. Load average (5min): ${loadavg()[1]} \n`)
            const updatedCount = await this.ingredientHelper.syncAllIngredients();
            FileHelper.appendFile("logs/log.txt", `${new Date().toUTCString()} - Daily cron schedule to update ingredients finished. Ingredients updated: ${updatedCount} \n`)
        });
    }
}