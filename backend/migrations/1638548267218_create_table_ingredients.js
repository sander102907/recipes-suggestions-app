module.exports = {
    "up": "CREATE TABLE ingredient(id int(11) NOT NULL AUTO_INCREMENT, ah_id int(11), name varchar(50) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;",
    "down": "DROP TABLE ingredient"
}