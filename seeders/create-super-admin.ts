// @ts-nocheck
"use strict";

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface) => {
    const [role] = await queryInterface.sequelize.query(
      `SELECT role_id FROM roles WHERE name = 'Super Admin' LIMIT 1`
    );

    await queryInterface.bulkInsert("users", [
      {
        user_id: uuidv4(),
        school_id: null,
        role_id: role[0].role_id,
        username: "superadmin",
        password_hash: bcrypt.hashSync("password123", 10),
        email: "superadmin@skooltech.com",
        first_name: "Super",
        last_name: "Admin",
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
