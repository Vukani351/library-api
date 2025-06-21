'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // await queryInterface.addColumn('book_handovers', 'bookhandoverType', {
        //     type: Sequelize.ENUM('return', 'borrow'),
        //     allowNull: false,
        //     defaultValue: 'borrow',
        //     after: 'handover_status',
        // });
    },

    async down(queryInterface, Sequelize) {
        // await queryInterface.removeColumn('book_handovers', 'bookhandoverType');
    },
};