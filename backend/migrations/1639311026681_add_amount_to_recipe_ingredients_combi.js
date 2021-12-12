module.exports = {
    "up": "ALTER TABLE recipe_ingredients ADD amount INT NOT NULL DEFAULT 1",
    "down": "ALTER TABLE recipe_ingredients DROP COLUMN amount"
}