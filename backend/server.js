const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const db = mysql.createPool({
    host: 'recipes_db', // the host name MYSQL_DATABASE: node_mysql
    user: 'root', // database user MYSQL_USER: MYSQL_USER
    password: 'cXGv6&2FM3op', // database user password MYSQL_PASSWORD: MYSQL_PASSWORD
    database: 'recipes' // database name MYSQL_HOST_IP: mysql_db
  })


const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())


app.get('/', (req, res) => {
    res.send('Hi There')
});

  //get all of the recipes in the database
app.get('/get', (req, res) => {
    const SelectQuery = " SELECT * FROM recipes";
    db.query(SelectQuery, (err, result) => {
      res.send(result)
    })
})

// add a recipe to the database
app.post("/insert", (req, res) => {
    const recipeName = req.body.setrecipeName;
    const InsertQuery = "INSERT INTO recipes (recipe_name) VALUES (?)";
    db.query(InsertQuery, [recipeName], (err, result) => {
      console.log(result)
    })
})

// delete a recipe from the database
app.delete("/delete/:recipeId", (req, res) => {
    const recipeId = req.params.recipeId;
    const DeleteQuery = "DELETE FROM recipes WHERE id = ?";
    db.query(DeleteQuery, recipeId, (err, result) => {
      if (err) console.log(err);
    })
})

// update a recipe review
app.put("/update/:recipeId", (req, res) => {
    const recipe = req.body.reviewUpdate;
    const recipeId = req.params.recipeId;
    const UpdateQuery = "UPDATE recipes SET recipe = ? WHERE id = ?";
    db.query(UpdateQuery, [recipe, recipeId], (err, result) => {
      if (err) console.log(err)
    })
})

app.listen('8001', () => { })