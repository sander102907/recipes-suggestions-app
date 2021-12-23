module.exports = {
    "up": "ALTER TABLE ingredients_in_group ADD amount INT NOT NULL DEFAULT 1",
    "down": "ALTER TABLE ingredients_in_group DROP COLUMN amount"
}