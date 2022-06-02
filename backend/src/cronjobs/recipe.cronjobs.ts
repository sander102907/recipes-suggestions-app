import { CronJob } from "cron";
import { RecipeHelper } from "../utils/recipeHelper";

export class RecipeCronjobs {

    constructor() {
    }

    // Default cronTime: every monday at 3:00 AM
    public setRecipeSuggestions(cronTime = '00 00 3 * * 1') {
        // Synchronize all ingredients
        new CronJob(cronTime, async () => {
            console.log("running weekly cron schedule to update recipe suggestions");

            await RecipeHelper.setRecipeSuggestions();
        },
            null, // onComplete
            true, // start (Specifies whether to start the job just before exiting the constructor)
            'Europe/Amsterdam' // timezone
        );
    }
}