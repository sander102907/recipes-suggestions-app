module.exports = {
    "up": "CREATE TABLE recipe(id int(11) NOT NULL AUTO_INCREMENT, name varchar(50) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;",
    "down": "DROP TABLE recipe"
}