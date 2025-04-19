const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  X_API_KEY: process.env.X_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
};
