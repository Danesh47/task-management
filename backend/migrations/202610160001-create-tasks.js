"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "tasks",
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        title: { type: Sequelize.STRING(255), allowNull: false },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: null,
        },
        status: {
          type: Sequelize.ENUM("Pending", "In Progress", "Completed"),
          allowNull: false,
          defaultValue: "Pending",
        },
        due_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          defaultValue: null,
        },
        created_at: { type: Sequelize.DATE(3), allowNull: false },
        updated_at: { type: Sequelize.DATE(3), allowNull: false },
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_as_cs" },
    );
    await queryInterface.addIndex("tasks", ["status", "id"], {
      name: "tasks_status_id_idx",
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("tasks");
  },
};
