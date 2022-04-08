import express from 'express';
import cors from 'cors';
import recipesRouter from './api/recipe/recipe.routes';

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

// api routes
// app.use('/recipes', require('./recipes/recipe.controller'));
// app.use('/ingredients', require('./ingredients/ingredient.controller'));
// app.use('/groups', require('./groups/group.controller'));
// app.use('/ah', require('./ah/ah.controller'));

app.use('/recipes', recipesRouter);


// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 3001;

let server = app.listen(PORT, () => { console.log(`Server listening on port: ${PORT}`) });

export default server;