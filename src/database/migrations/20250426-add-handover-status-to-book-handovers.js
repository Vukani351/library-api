'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn('book_handovers', 'handover_status', {
    //   type: Sequelize.ENUM('pending', 'approved', 'rejected'),
    //   allowNull: false,
    //   defaultValue: 'pending',
    //   after: 'meeting_time', // Add the column after 'meeting_time'
    // });
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn('book_handovers', 'handover_status');
  },
};