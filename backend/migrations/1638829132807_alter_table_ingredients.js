module.exports = {
    "up": "ALTER TABLE ingredient ADD unit_size varchar(50), ADD price varchar(50), ADD category varchar(50)",
    "down": "ALTER TABLE ingredient DROP COLUMN unit_size, DROP COLUMN price, DROP COLUMN category"
}