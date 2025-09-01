const { prototype } = require("jsonwebtoken/lib/JsonWebTokenError");

const config = {
  user: "tradebudd_user", // Database username
  password: "TdRC597Cn*Dat", // Database password
  server: "78.47.118.224", // Server IP address
  database: "tradebuddysql", // Database name
  options: {
    encrypt: false, // Disable encryption
  },
  port: 1533,
};

module.exports = config;
