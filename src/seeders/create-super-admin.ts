import { QueryInterface } from "sequelize";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export default {
  up: async (queryInterface: QueryInterface) => {
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
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("users", { username: "superadmin" });
  },
};
