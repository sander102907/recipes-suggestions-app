module.exports = {
    "up": "ALTER TABLE ingredient ADD is_bonus BOOLEAN, ADD bonus_mechanism VARCHAR(50), ADD bonus_price VARCHAR(50)",
    "down": "ALTER TABLE ingredient DROP COLUMN is_bonus, DROP COLUMN bonus_mechanism, DROP COLUMN bonus_price"
}