const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Library = require('./libraryModel');
const User = require('./userModel');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  thumbnail: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  borrower_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  library_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Library,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  is_private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  returned_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  return_by_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  borrowed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
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
