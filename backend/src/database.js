const mysql = require('mysql2');
const dbConfig = require("../config/db.config");

const database = mysql.createPool({
    host: dbConfig.HOST, // the host name MYSQL_DATABASE: node_mysql
    user: dbConfig.USER, // database user MYSQL_USER: MYSQL_USER
    password: dbConfig.PASSWORD, // database user password MYSQL_PASSWORD: MYSQL_PASSWORD
    database: dbConfig.DB // database name MYSQL_HOST_IP: mysql_db
})

module.exports = database;