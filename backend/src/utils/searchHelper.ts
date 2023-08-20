import { Ingredient } from "@prisma/client";

export default class SearchHelper {
    /**
     * Takes a string and a list of ingredients and returns the ingredient which name most closely matches the string,
     * based on the levenshtein distance
     * @param str the string to find the ingredient for
     * @param options the list of ingredients
     */
    static searchClosest(str: string, options: Ingredient[], maxDistance = 3) {
        let minDistance = Number.MAX_SAFE_INTEGER;
        let closest = undefined;

        for (let j = 0; j < options.length; j++) {
            const distance = SearchHelper.levenshteinDistance(str.toLowerCase(), options[j].name.toLowerCase());
            if (distance < minDistance && distance < maxDistance) {
                closest = options[j];
                minDistance = distance;
            }
        }

        console.log(closest, minDistance);

        return closest
    }

    /**
     * Takes two strings and returns an altered version of the levenshtein distance between them, 
     * where string insertions do not add to the distance
     * @param str1 the first string to compute the distance for 
     * @param str2 the second string to compute the distance for 
     */
    static levenshteinDistance(str1: string, str2: string) {
        const track = Array(str2.length + 1).fill(null).map(() =>
            Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i += 1) {
            track[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j += 1) {
            track[j][0] = j;
        }

        for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 0.1, // insertion
                    track[j - 1][i - 1] + indicator, // substitution
                );
            }
        }
        return track[str2.length][str1.length];
    }
}