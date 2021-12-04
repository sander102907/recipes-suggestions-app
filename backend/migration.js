var migration = require('mysql-migrations');
var db = require('./src/database');

migration.init(db, __dirname + '/migrations', function() { console.log("finished running migrations"); }, ["--update-schema"]);