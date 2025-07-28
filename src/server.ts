import app from "./app";
import sequelize from "./config/db";

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ DB connection OK");
    return sequelize.sync({ alter: true, force: false });
  })
  .then(() => {
    console.log("✅ Sequelize sync done");
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error during init:", err);
    process.exit(1);
  });
