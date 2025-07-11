"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "users";

    // Check if created_at exists before adding
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='${table}' AND column_name='created_at'
    `);

    if (results.length === 0) {
      await queryInterface.addColumn(table, "created_at", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }

    const [results2] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='${table}' AND column_name='updated_at'
    `);

    if (results2.length === 0) {
      await queryInterface.addColumn(table, "updated_at", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "created_at");
    await queryInterface.removeColumn("users", "updated_at");
  },
};
