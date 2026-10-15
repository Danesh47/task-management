const env = require("../src/config/env");

const config = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: "mysql",
  timezone: "+00:00",
  logging: false,
};
module.exports = { development: config, production: config };
