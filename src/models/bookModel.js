const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Library = require('./libraryModel');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  owner: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  library_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Library,
      key: 'id',
    },
    onDelete: 'CASCADE', // Cascade delete if library is deleted
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'book',
  timestamps: false, // Disable Sequelize's automatic timestamps
});

// Define the association with Library
Book.belongsTo(Library, { foreignKey: 'library_id' });
Library.hasMany(Book, { foreignKey: 'library_id' });

module.exports = Book;
