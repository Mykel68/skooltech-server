module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "school_id", {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "school_id", {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
