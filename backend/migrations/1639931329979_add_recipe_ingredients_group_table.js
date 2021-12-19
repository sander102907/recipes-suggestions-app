module.exports = {
    "up": "CREATE TABLE recipe_ingredients_group(id int(11) NOT NULL AUTO_INCREMENT, recipe_id INT NOT NULL, PRIMARY KEY (id), CONSTRAINT tb_fk FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;",
    "down": "DROP TABLE recipe_ingredients_group"
}