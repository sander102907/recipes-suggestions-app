import schedule from "node-schedule";
import { RecipeHelper } from "../utils/recipeHelper";

export class RecipeCronjobs {

    constructor() {
    }

    // Default cronTime: every monday at 2:00 AM UTC
    public setRecipeSuggestions(cronTime = '0 0 2 * * 1') {
        // Synchronize all ingredients
        schedule.scheduleJob('sync ingredients', cronTime, async () => {
            console.log("running weekly cron schedule to update recipe suggestions");

            await RecipeHelper.setRecipeSuggestions();
        });
    }
}