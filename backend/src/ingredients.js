const db = require('./database');
const HttpStatusCodes = require('http-status-codes').StatusCodes;


  //get all of the ingredients in the database
  const getIngredient = (req, res) => {
    const ingredientId = req.params.ingredientId;
    const SelectQuery = " SELECT * FROM ingredient WHERE id = ?";
    db.query(SelectQuery, ingredientId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
};

  //get all of the ingredients in the database
const getIngredients = (req, res) => {
    const SelectQuery = " SELECT * FROM ingredient";
    db.query(SelectQuery, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
};

// add a ingredient to the database
const addIngredient = (req, res) => {
    const ingredientName = req.body.name;
    const ahId = req.body.ah_id;
    const InsertQuery = "INSERT INTO ingredient (name, ah_id) VALUES (?, ?)";
    db.query(InsertQuery, [ingredientName, ahId], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.status(HttpStatusCodes.OK).send({ "id": result.insertId, "name": ingredientName }); // 200
    })
};

// delete a ingredient from the database
const deleteIngredient = (req, res) => {
    const ingredientId = req.params.ingredientId;
    const DeleteQuery = "DELETE FROM ingredient WHERE id = ?";
    db.query(DeleteQuery, ingredientId, (err, result) => {
      if (err) {
        res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
      }

      res.sendStatus(HttpStatusCodes.OK)
    })
};

// update a ingredient
const updateIngredient = (req, res) => {
    const ingredientName = req.body.name;
    const ingredientId = req.params.ingredientId;
    const UpdateQuery = "UPDATE ingredient SET name = ? WHERE id = ?";
    db.query(UpdateQuery, [ingredientName, ingredientId], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          }
    
          res.status(HttpStatusCodes.OK).send({ "id": ingredientId, "name": ingredientName }); // 200
    })
};

module.exports = {
    getIngredient,
    getIngredients,
    addIngredient,
    deleteIngredient,
    updateIngredient
}