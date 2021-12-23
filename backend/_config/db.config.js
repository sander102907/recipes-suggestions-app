module.exports = {
    HOST: process.env.MYSQL_HOST,
    USER: "root",
    PASSWORD: process.env.MYSQL_ROOT_PASSWORD,
    DB: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_DOCKER_PORT,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };