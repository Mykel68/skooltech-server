// @ts-nocheck
"use strict";

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface) => {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT * FROM users WHERE role = 'SuperAdmin'`
    );

    if (rows.length > 0) {
      console.log("✅ SuperAdmin already exists. Skipping creation.");
      return;
    }

    const passwordHash = await bcrypt.hash("SuperAdmin@123", 10);

    await queryInterface.bulkInsert("users", [
      {
        user_id: uuidv4(),
        school_id: null,
        role: "SuperAdmin",
        username: "superadmin",
        password_hash: passwordHash,
        email: "superadmin@skooltech.com",
        first_name: "Super",
        last_name: "Admin",
        gender: null,
        is_approved: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log("🚀 SuperAdmin account created successfully!");
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("users", { username: "superadmin" });
    console.log("🗑️ SuperAdmin account deleted.");
  },
};
