
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create wishlist table
    await queryInterface.createTable('wishlist', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      accessibility: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
      },

      createdat: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      updatedat: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Create wishlist_book table
    await queryInterface.createTable('wishlist_book', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      wishlist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'wishlist',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'book',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      createdat: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Prevent the same book from being added twice to one wishlist
    await queryInterface.addConstraint('wishlist_book', {
      fields: ['wishlist_id', 'book_id'],
      type: 'unique',
      name: 'unique_wishlist_book',
    });

    // Improve wishlist lookups by owner
    await queryInterface.addIndex('wishlist', ['user_id'], {
      name: 'idx_wishlist_user_id',
    });

    // Improve public wishlist lookups
    await queryInterface.addIndex(
      'wishlist',
      ['user_id', 'accessibility'],
      {
        name: 'idx_wishlist_user_accessibility',
      },
    );

    // Improve book lookups within a wishlist
    await queryInterface.addIndex('wishlist_book', ['wishlist_id'], {
      name: 'idx_wishlist_book_wishlist_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('wishlist_book');
    await queryInterface.dropTable('wishlist');
  },
};