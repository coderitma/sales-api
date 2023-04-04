const {
  DB_MARIA_HOST,
  DB_MARIA_PORT,
  DB_MARIA_USERNAME,
  DB_MARIA_PASSWORD,
  DB_MARIA_NAME,
} = require("./config");

module.exports = require("knex")({
  client: "mysql",
  connection: {
    host: DB_MARIA_HOST,
    port: DB_MARIA_PORT,
    user: DB_MARIA_USERNAME,
    password: DB_MARIA_PASSWORD,
    database: DB_MARIA_NAME,
  },
});
