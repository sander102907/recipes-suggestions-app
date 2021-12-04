module.exports = {
    "up": "ALTER TABLE recipe ADD description MEDIUMTEXT",
    "down": "ALTER TABLE recipe DROP COLUMN description"
}