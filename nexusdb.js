const sql = require("mssql");
const config = require("./dbconfig_nexs");

const pool2 = new sql.ConnectionPool(config).connect();
module.exports = { sql, pool2 };
