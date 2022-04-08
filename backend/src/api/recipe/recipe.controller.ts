import { Request, Response } from 'express';
import { RecipeWithIngredients } from '../../types/recipeWithIngredients';
import { RecipeHelper } from '../../utils/recipeHelper';
import { RecipeService } from './recipe.service';
import { StatusCodes } from 'http-status-codes';

// Get all recipes
export class RecipeController {
    static async getRecipes(req: Request, res: Response) {
        const { bonus } = req.query;

        let recipes: RecipeWithIngredients[];

        if (bonus === undefined) {
            recipes = await RecipeService.getAllRecipes();
        } else if (bonus) {
            recipes = await RecipeService.getBonusRecipes();
        } else {
            recipes = await RecipeService.getNonBonusRecipes();
        }

        const recipesWithPrices = recipes.map(RecipeHelper.computePrices);

        res.send(recipesWithPrices);
    }

    // Get a recipe by ID
    static async getRecipe(req: Request, res: Response) {
        const { id } = req.params;

        const recipe = await RecipeService.getRecipe(Number(id));

        if (recipe) {
            res.send(RecipeHelper.computePrices(recipe));
        } else {
            res.status(StatusCodes.NOT_FOUND).send({ errors: [{ msg: `No recipe with ID ${id} exists in the database` }] });
        }
    }

    // Create a new recipe
    static async createRecipe(req: Request, res: Response) {
        const { name, description, rating } = req.body;
        const result = await RecipeService.createRecipe(name, description, Number(rating));

        res.send(result);
    }

    // Update a recipe
    static async updateRecipe(req: Request, res: Response) {
        const { id } = req.params;
        const { name, description, rating } = req.body;

        const recipe = await RecipeService.getRecipe(Number(id));

        if (recipe) {
            const result = await RecipeService.updateRecipe(Number(id), name, description, Number(rating));
            res.send(result);
        } else {
            res.status(StatusCodes.NOT_FOUND).send({ errors: [{ msg: `No recipe with ID ${id} exists in the database` }] });
        }
    }

    // Delete a recipe
    static async deleteRecipe(req: Request, res: Response) {
        const { id } = req.params;

        const recipe = await RecipeService.getRecipe(Number(id));

        if (recipe) {
            await RecipeService.deleteRecipe(Number(id));
            res.send();
        } else {
            res.status(StatusCodes.NOT_FOUND).send({ errors: [{ msg: `No recipe with ID ${id} exists in the database` }] });
        }
    }

    // Suggest weekly recipes
    static async suggestRecipes(req: Request, res: Response) {
        const bonusRecipes = await RecipeService.getBonusRecipes();
        const nonBonusRecipes = await RecipeService.getNonBonusRecipes();

        const randNonBonusRecipes = nonBonusRecipes.sort(() => 0.5 - Math.random()).slice(0, 7 - bonusRecipes.length);

        const recipesWithPrices = [...bonusRecipes, ...randNonBonusRecipes].map(RecipeHelper.computePrices);

        res.send(recipesWithPrices);
    }

    // Search recipes
    static async searchRecipes(req: Request, res: Response) {
        const { query } = req.query;

        const recipes = await RecipeService.searchRecipes(String(query).trim());

        res.send(recipes);
    }
}