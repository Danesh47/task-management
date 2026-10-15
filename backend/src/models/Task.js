const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const statuses = require("../constants/taskStatus");

module.exports = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    status: {
      type: DataTypes.ENUM(...statuses),
      allowNull: false,
      defaultValue: "Pending",
    },
    due_date: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
    created_at: { type: DataTypes.DATE(3), allowNull: false },
    updated_at: { type: DataTypes.DATE(3), allowNull: false },
  },
  {
    tableName: "tasks",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
