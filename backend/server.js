const express = require('express');
const cors = require('cors');
const errorHandler = require('./_middleware/error-handler');

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

// api routes
app.use('/recipes', require('./src/recipes/recipe.controller'));
app.use('/ingredients', require('./src/ingredients/ingredient.controller'));
app.use('/groups', require('./src/groups/group.controller'));
app.use('/ah', require('./src/ah/ah.controller'));

// global error handler
app.use(errorHandler);



// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });