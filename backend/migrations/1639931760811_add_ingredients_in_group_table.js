module.exports = {
    "up": "CREATE TABLE ingredients_in_group (group_id int(11) NOT NULL, ingredient_id int(11) NOT NULL, FOREIGN KEY (group_id) REFERENCES recipe_ingredients_group (id) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY (group_id, ingredient_id));",
    "down": "DROP TABLE ingredients_in_group"
}