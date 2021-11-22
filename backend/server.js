const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const HttpStatusCodes = require('http-status-codes').StatusCodes;


const db = mysql.createPool({
    host: '2fa231a0073c', // the host name MYSQL_DATABASE: node_mysql
    user: 'sander', // database user MYSQL_USER: MYSQL_USER
    password: 'cXGv6&2FM3op', // database user password MYSQL_PASSWORD: MYSQL_PASSWORD
    database: 'MYSQL_DATABASE' // database name MYSQL_HOST_IP: mysql_db
  })


const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())


app.get('/', (req, res) => {
    res.send('The API is setup correctly!')
});

  //get all of the recipes in the database
app.get('/recipe', (req, res) => {
    const SelectQuery = " SELECT * FROM recipes";
    db.query(SelectQuery, (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.send(result)
    })
})

// add a recipe to the database
app.post("/recipe", (req, res) => {
    const recipeName = req.body.name;
    const InsertQuery = "INSERT INTO recipes (name) VALUES (?)";
    db.query(InsertQuery, [recipeName], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
        }

        res.status(HttpStatusCodes.OK).send({ "id": result.insertId, "name": recipeName }); // 200
    })
})

// delete a recipe from the database
app.delete("/recipe/:recipeId", (req, res) => {
    const recipeId = req.params.recipeId;
    const DeleteQuery = "DELETE FROM recipes WHERE id = ?";
    db.query(DeleteQuery, recipeId, (err, result) => {
      if (err) {
        res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
      }

      res.sendStatus(HttpStatusCodes.OK)
    })
})

// update a recipe review
app.put("/recipe/:recipeId", (req, res) => {
    const recipeName = req.body.name;
    const recipeId = req.params.recipeId;
    const UpdateQuery = "UPDATE recipes SET name = ? WHERE id = ?";
    db.query(UpdateQuery, [recipeName, recipeId], (err, result) => {
        if (err) {
            res.status(HttpStatusCodes.BAD_REQUEST).send({ error: err, message: err.message }); // 400
          }
    
          res.status(HttpStatusCodes.OK).send({ "id": recipeId, "name": recipeName }); // 200
    })
})

app.listen('3001', () => { })