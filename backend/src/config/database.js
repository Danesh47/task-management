const { Sequelize } = require("sequelize");
const env = require("./env");

module.exports = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: "mysql",
  timezone: "+00:00",
  logging: false,
  pool: { max: 5, min: 0, acquire: 10000, idle: 10000 },
  retry: { max: 0 },
  define: { charset: "utf8mb4", collate: "utf8mb4_0900_as_cs" },
});
