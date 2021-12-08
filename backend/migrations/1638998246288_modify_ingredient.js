module.exports = {
    "up": "ALTER TABLE ingredient MODIFY price FLOAT(3), MODIFY bonus_price FLOAT(3);",
    "down": "ALTER TABLE ingredient MODIFY price VARCHAR(50), MODIFY bonus_price VARCHAR(50)"
}