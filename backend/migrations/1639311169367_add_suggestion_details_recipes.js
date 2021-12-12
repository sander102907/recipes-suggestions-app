module.exports = {
    "up": "ALTER TABLE recipe ADD is_suggested BOOLEAN, ADD exclude_from_suggestions BOOLEAN, ADD suggestion_end_date DATE",
    "down": "ALTER TABLE recipe_ingredients DROP COLUMN is_suggested, DROP COLUMN exclude_from_suggestions, DROP COLUMN suggestion_end_date"
}