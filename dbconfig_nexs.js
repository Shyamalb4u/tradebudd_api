const { prototype } = require("jsonwebtoken/lib/JsonWebTokenError");
require("dotenv").config();

const config = {
  user: process.env.DB_USER_NEXUS, // Database username
  password: process.env.DB_PASS_NEXUS, // Database password
  server: process.env.DB_SERVER_NEXUS, // Server IP address
  database: process.env.DB_DATABASE_NEXUS, // Database name
  options: {
    encrypt: false, // Disable encryption
  },
  port: parseInt(process.env.DB_PORT_NEXUS),
};

module.exports = config;
