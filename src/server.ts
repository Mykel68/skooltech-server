import app from "./app";
import sequelize from "./config/db";

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
    return sequelize.sync({ alter: true, force: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Visit ${PORT}/api-docs for documentation`);
    });
  })
  .catch((error: Error) => {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  });
