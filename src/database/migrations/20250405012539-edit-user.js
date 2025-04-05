// src/database/migrations/XXXXXX-your-migration-name.ts
import { DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('new_table', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // other columns...
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('new_table');
  }
};