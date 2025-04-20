import sequelize from "../config/db";
import School from "../models/school.model";
import User from "../models/user.model";

async function syncDatabase() {
  try {
    // Synchronize all models with the database
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
