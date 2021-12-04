# Readme backend

## initialize to allow for migrations
We need to have the variables used in db.config.js as the environment variables, so export those to the desired values:
`export MYSQL_HOST=...`

## Create a migration (change to database)
`node migration.js add migration create_table_users`