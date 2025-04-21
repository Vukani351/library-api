'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn('book_access', 'library_id', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   defaultValue: 1,
    //   onDelete: 'CASCADE',
    //   references: {
    //     model: 'library',
    //     key: 'id',
    //   },
    // });
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn('book_access', 'library_id');
  },
};