import { Sequelize } from "sequelize";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in Doppler");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // If your host (like Neon or Heroku) requires SSL
    },
  },
});

export default sequelize;
