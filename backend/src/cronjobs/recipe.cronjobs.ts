import schedule from "node-schedule";
import { RecipeHelper } from "../utils/recipeHelper";

export class RecipeCronjobs {
    // Default cronTime: every monday at 2:00 AM UTC
    public setRecipeSuggestions(cronTime = '0 0 2 * * 1') {
        // Synchronize all ingredients
        schedule.scheduleJob('set recipe suggestions', cronTime, async () => {
            console.log("running weekly cron schedule to update recipe suggestions");

            await RecipeHelper.setRecipeSuggestions();
        });
    }
}