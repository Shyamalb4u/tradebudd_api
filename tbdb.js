const sql = require("mssql");
const config = require("./dbconfig");

const pool1 = new sql.ConnectionPool(config).connect();
module.exports = { sql, pool1 };
