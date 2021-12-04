module.exports = {
    "up": "CREATE TABLE recipe_ingredients (recipe_id int(11) NOT NULL, ingredient_id int(11) NOT NULL, FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON DELETE RESTRICT ON UPDATE CASCADE, FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON DELETE RESTRICT ON UPDATE CASCADE, PRIMARY KEY (recipe_id, ingredient_id));",
    "down": "DROP TABLE recipe_ingredients"
}