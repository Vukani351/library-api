// 'use strict';

// const { QueryInterface, DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
//     /**
//      * Add altering commands here.
//      *
//      * Example:
//      * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
//      */
//     await queryInterface.addColumn('library', 'thumbnail', {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//       comment: 'URL to the library thumbnail image'
//     });

//     await queryInterface.addColumn('library', 'address', {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//       comment: 'Physical address of the library'
//     });
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
  }
};
