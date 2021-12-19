module.exports = {
    "up": "ALTER TABLE recipe ADD rating INT",
    "down": "ALTER TABLE recipe DROP COLUMN rating"
}