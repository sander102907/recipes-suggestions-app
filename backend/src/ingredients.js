const db = require('./database');
const HttpStatusCodes = require('http-status-codes').StatusCodes;


  //get all of the ingredients in the database
  const getIngredient = (req, res) => {
    const ingredientId = req.params.ingredientId;
    const SelectQuery = "SELECT * FROM ingredient WHERE id = ?";
    db.query(SelectQuery, ingredientId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
};

  //get all of the ingredients in the database
const getIngredients = (req, res) => {
    const SelectQuery = "SELECT * FROM ingredient";
    db.query(SelectQuery, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
};

// add a ingredient to the database
const addIngredient = (req, res) => {
    const name = req.body.name;
    const ahId = req.body.ah_id;
    const InsertQuery = "INSERT INTO ingredient (name, ah_id) VALUES (?, ?)";
    db.query(InsertQuery, [name, ahId], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.status(HttpStatusCodes.OK).send({ "id": result.insertId, "ahId": ahId, "name": ingredientName }); // 200
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

const getIngredientFromAhId = (req, res) => {
    const ahId = req.params.ahId;

    const query = "SELECT * FROM ingredient WHERE ah_id = ?";
    db.query(query, ahId, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }
        else if (result.length == 0) {
            const name = req.query.name;
            const price = req.query.price;
            const unitSize = req.query.unit_size;
            const category = req.query.category;
            const bonusPrice = req.query.bonus_price;
            const isBonus = req.query.is_bonus === 'true' ? 1 : 0;
            const bonusMechanism = req.query.bonus_mechanism;

            const InsertQuery = "INSERT INTO ingredient (name, ah_id, price, unit_size, category, bonus_price, is_bonus, bonus_mechanism) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(InsertQuery, [name, ahId, price, unitSize, category, bonusPrice, isBonus, bonusMechanism], (err, result) => {
                if (err) {
                    res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
                }
                else {
                    res.status(HttpStatusCodes.OK).send({ "id": result.insertId, "ahId": ahId, "name": name }); // 200
                }
            })
        }
        else {
            res.status(HttpStatusCodes.OK).send(result[0]);
        }
    })
}

module.exports = {
    getIngredient,
    getIngredients,
    addIngredient,
    deleteIngredient,
    updateIngredient,
    getIngredientFromAhId
}