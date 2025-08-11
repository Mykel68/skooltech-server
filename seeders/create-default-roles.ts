// @ts-nocheck
"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete("roles", null, {}); // clears the table

    await queryInterface.bulkInsert("roles", [
      {
        role_id: 1,
        name: "Super Admin",
        description: "Has full system access",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: 2,
        name: "Admin",
        description: "Manages school-level operations",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: 3,
        name: "Teacher",
        description: "Manages classes and students",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: 4,
        name: "Student",
        description: "Attends classes and accesses learning materials",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_id: 5,
        name: "Parent",
        description: "Views student progress",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log("🚀 Default roles created with integer IDs");
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("roles", null, {});
    console.log("🗑️ Default roles deleted");
  },
};
