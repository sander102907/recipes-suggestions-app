import express from 'express';
import cors from 'cors';
import swaggerUi from "swagger-ui-express";
import bodyParser from "body-parser";
import { RegisterRoutes } from "../build/routes";
import swaggerDocument from "../build/swagger.json";
import errorHandler from './middleware/error-handler';
import notFoundHandler from './middleware/notfound-handler';
import fs from 'fs';
import path from 'path';
import { IngredientCronjobs } from './cronjobs/ingredient.cronjobs';
import { RecipeCronjobs } from './cronjobs/recipe.cronjobs';

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const swaggerOptions = {
    customCss: fs.readFileSync(path.join(__dirname, '/swaggerDarkTheme.css'), 'utf8')
}


app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

RegisterRoutes(app);

app.use(notFoundHandler);

app.use(errorHandler);

const ingredientCronjobs = new IngredientCronjobs();
ingredientCronjobs.syncIngredients();

const recipeCronjobs = new RecipeCronjobs();
recipeCronjobs.setRecipeSuggestions();

export default app;
