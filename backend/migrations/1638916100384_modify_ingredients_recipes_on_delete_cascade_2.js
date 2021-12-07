module.exports = {
    "up": "ALTER TABLE recipe_ingredients ADD FOREIGN KEY (recipe_id) REFERENCES recipe (id) ON DELETE CASCADE ON UPDATE CASCADE, ADD FOREIGN KEY (ingredient_id) REFERENCES ingredient (id) ON DELETE CASCADE ON UPDATE CASCADE;",
    "down": "ALTER TABLE DROP FOREIGN KEY recipe_ingredients_ibfk_1, DROP FOREIGN KEY recipe_ingredients_ibfk_2;"
}


