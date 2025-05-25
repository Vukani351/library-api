'use strict';

const fs   = require('fs');
const path = require('path');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // load and run your full SQL script
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../library.sql'),
      'utf8'
    );
    return queryInterface.sequelize.query(sql);
  },

  down: async (queryInterface, Sequelize) => {
    // You can DROP the database (or leave this empty if you never need to roll back)
    return queryInterface.sequelize.query('DROP DATABASE IF EXISTS library_db;');
  }
};
