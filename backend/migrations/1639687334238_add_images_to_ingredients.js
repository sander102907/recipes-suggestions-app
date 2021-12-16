module.exports = {
    "up": "ALTER TABLE ingredient ADD image_tiny VARCHAR(200), ADD image_small VARCHAR(200), ADD image_medium VARCHAR(200), ADD image_large VARCHAR(200)",
    "down": "ALTER TABLE recipe_ingredients DROP COLUMN image_tiny, DROP COLUMN image_small, DROP COLUMN image_medium, DROP COLUMN image_large"
}