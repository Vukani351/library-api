// 'use strict';

// const { QueryInterface, DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  //  /**
  //   * Add altering commands here.
  //   *
  //   * Example:
  //   * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
  //   */
  //  await queryInterface.addColumn('library', 'thumbnail', {
  //    type: DataTypes.STRING(255),
  //    allowNull: true,
  //    comment: 'URL to the library thumbnail image'
  //  });
  // await queryInterface.addColumn('library', 'address', {
  //    type: DataTypes.STRING(255),
  //    allowNull: true,
  //    comment: 'Physical address of the library'
  //     });
  // await queryInterface.addColumn('user', 'address', {
  //   type: Sequelize.STRING(255),
  //   allowNull: true,
  // });

  // await queryInterface.addColumn('user', 'createdAt', {
  //   type: Sequelize.DATE,
  //   allowNull: false,
  //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  // });

  // await queryInterface.addColumn('user', 'updatedAt', {
  //   type: Sequelize.DATE,
  //   allowNull: false,
  //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  //   onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
  // });
  },

  async down (queryInterface, Sequelize) {
//     /**
//      * Add reverting commands here.
//      *
//      * Example:
//      * await queryInterface.dropTable('users');
//      */
//     await queryInterface.removeColumn('library', 'thumbnail');
//     await queryInterface.removeColumn('library', 'address');
// await queryInterface.removeColumn('user', 'address');
// await queryInterface.removeColumn('user', 'createdAt');
// await queryInterface.removeColumn('user', 'updatedAt');
  }
};
