'use strict';

const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
//         await queryInterface.addColumn('library', 'thumbnail', {
//             type: DataTypes.STRING(255),
//             allowNull: true,
//             comment: 'URL to the library thumbnail image'
    //     });

  //       await queryInterface.addColumn('library', 'address', {
  //           type: DataTypes.STRING(255),
  //           allowNull: true,
  //           comment: 'Physical address of the library',
  //           after: 'description'
  //       });
  },

  down: async (queryInterface) => {
//         await queryInterface.removeColumn('library', 'thumbnail');
//         await queryInterface.removeColumn('library', 'address');
  }
};