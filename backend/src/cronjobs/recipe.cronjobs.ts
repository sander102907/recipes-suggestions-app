import schedule from "node-schedule";
import { freemem, loadavg, totalmem } from "os";
import FileHelper from "../utils/fileHelper";
import { RecipeHelper } from "../utils/recipeHelper";

export class RecipeCronjobs {
    // Default cronTime: every monday at 2:00 AM UTC
    public setRecipeSuggestions(cronTime = '0 0 2 * * 1') {
        // Synchronize all ingredients
        schedule.scheduleJob('set recipe suggestions', cronTime, async () => {
            console.log("running weekly cron schedule to update recipe suggestions");

            FileHelper.appendFile("logs/log.txt", `${new Date().toUTCString()} - running weekly cron schedule to update recipe suggestions. Memory usage: ${(freemem() / 10e6).toFixed(1)}MB/${(totalmem() / 10e6).toFixed(1)}MB. Load average (5min): ${loadavg()[1]} \n`)
            await RecipeHelper.setRecipeSuggestions();

        });
    }
}