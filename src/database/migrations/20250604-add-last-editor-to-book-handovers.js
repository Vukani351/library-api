'use strict';

const { QueryInterface, DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('book_handovers', 'last_editor_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      after: 'borrower_phone_number',
      references: {
        model: 'user',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('book_handovers', 'last_editor_id');
  }
};
