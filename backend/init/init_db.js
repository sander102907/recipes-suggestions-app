const initDatabase = (db) => {    
    const recipesTable = "CREATE TABLE IF NOT EXISTS recipe(id int(11) NOT NULL AUTO_INCREMENT, name varchar(50) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;"
    
    db.query(recipesTable, (err) => {
        if (err) throw err;
    })
    
    const ingredientsTable = "CREATE TABLE IF NOT EXISTS ingredient(id int(11) NOT NULL AUTO_INCREMENT, ah_id int(11), name varchar(50) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;"

    db.query(ingredientsTable, (err) => {
        if (err) throw err;
    })

    const recipeIngredientsTable = "CREATE TABLE IF NOT EXISTS recipe_ingredients (recipe_id int(11) NOT NULL, ingredient_id int(11) NOT NULL, FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON DELETE RESTRICT ON UPDATE CASCADE, FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON DELETE RESTRICT ON UPDATE CASCADE, PRIMARY KEY (recipe_id, ingredient_id));"

    db.query(recipeIngredientsTable, (err) => {
        if (err) throw err;
    })
}

module.exports = {
    initDatabase
}