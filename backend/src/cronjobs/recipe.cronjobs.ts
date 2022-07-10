import cron from "node-cron";
import { RecipeHelper } from "../utils/recipeHelper";

export class RecipeCronjobs {

    constructor() {
    }

    // Default cronTime: every monday at 3:00 AM
    public setRecipeSuggestions(cronTime = '0 0 3 * * 1') {
        // Synchronize all ingredients
        cron.schedule(cronTime, async () => {
            console.log("running weekly cron schedule to update recipe suggestions");

            await RecipeHelper.setRecipeSuggestions();
        }, {
            timezone: "Europe/Amsterdam"
        });
    }
}