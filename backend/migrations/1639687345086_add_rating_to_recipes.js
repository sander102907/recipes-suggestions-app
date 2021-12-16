module.exports = {
    "up": "ALTER TABLE recipe ADD rating INT",
    "down": "ALTER TABLE recipe_ingredients DROP COLUMN rating"
}