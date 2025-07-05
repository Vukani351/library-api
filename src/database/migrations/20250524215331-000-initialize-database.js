'use strict';

const fs = require('fs');
const path = require('path');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // load and run your full SQL script
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../library_psg.sql'),
      'utf8'
    );
    return queryInterface.sequelize.query(sql);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP DATABASE IF EXISTS library_db;');
  },
  config: { transaction: false }
};
