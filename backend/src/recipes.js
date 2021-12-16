const db = require('./database');
const HttpStatusCodes = require('http-status-codes').StatusCodes;


  //get all a recipe by ID
  const getRecipe = (req, res) => {
    const recipeId = req.params.recipeId;
    const SelectQuery =  "SELECT * FROM recipe WHERE id = ?";
    db.query(SelectQuery, recipeId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
};

  //get all of the recipes in the database
const getRecipes = (req, res) => {
    const SelectQuery = " SELECT * FROM recipe";
    db.query(SelectQuery, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
};

// add a recipe to the database
const addRecipe = (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const rating = req.body.rating;

    const InsertQuery = "INSERT INTO recipe (name, description, rating) VALUES (?, ?, ?)";
    db.query(InsertQuery, [name, description, rating], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.status(HttpStatusCodes.OK).send({ "id": result.insertId}); // 200
    })
};

// delete a recipe from the database
const deleteRecipe = (req, res) => {
    const recipeId = req.params.recipeId;
    const DeleteQuery = "DELETE FROM recipe WHERE id = ?";
    db.query(DeleteQuery, recipeId, (err, result) => {
      if (err) {
        res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
      }

      res.sendStatus(HttpStatusCodes.OK)
    })
};

// update a recipe
const updateRecipe = (req, res) => {
    const recipeName = req.body.name;
    const recipeId = req.params.recipeId;
    const UpdateQuery = "UPDATE recipe SET name = ? WHERE id = ?";
    db.query(UpdateQuery, [recipeName, recipeId], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          }
    
          res.status(HttpStatusCodes.OK).send({ "id": recipeId, "name": recipeName }); // 200
    })
};



module.exports = {
    getRecipe,
    getRecipes,
    addRecipe,
    deleteRecipe,
    updateRecipe,
}