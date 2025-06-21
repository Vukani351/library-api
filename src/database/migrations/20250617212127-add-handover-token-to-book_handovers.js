'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn('book_handovers', 'handover_token', {
    //   type: Sequelize.STRING,
    //   allowNull: true, // Or false if it should always have a value once set
    // });
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn('book_handovers', 'handover_token');
  }
};
