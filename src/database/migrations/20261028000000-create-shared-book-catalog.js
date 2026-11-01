'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Starting migration: create-shared-book-catalog');

      // 1. Add isbn columns to book table (if not already added)
      console.log('Adding isbn columns to book table...');
      try {
        await queryInterface.addColumn('book', 'isbn', {
          type: Sequelize.STRING(255),
          allowNull: true,
        });
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log('  isbn column already exists, skipping');
        } else {
          throw e;
        }
      }

      try {
        await queryInterface.addColumn('book', 'isbn_unique', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: 'unique_isbn_key',
        });
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log('  isbn_unique column already exists, skipping');
        } else {
          throw e;
        }
      }

      // 2. Create library_book table (if not already created)
      console.log('Creating library_book table...');
      try {
        await queryInterface.createTable('library_book', {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          book_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'book',
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          library_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'library',
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          owner_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          borrower_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'SET NULL',
          },
          is_private: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          borrowed_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
          },
          return_by_date: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          status: {
            type: Sequelize.STRING(100),
            allowNull: false,
            defaultValue: 'active',
          },
          createdat: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          updatedat: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        });
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log('  library_book table already exists, skipping');
        } else {
          throw e;
        }
      }

      // 3. Check if book_access needs column rename (check if book_id exists)
      console.log('Checking book_access table...');
      const [bookAccessColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'book_access' AND table_schema = 'public'`
      );
      const hasBookId = bookAccessColumns.some(col => col.column_name === 'book_id');
      const hasLibraryBookId = bookAccessColumns.some(col => col.column_name === 'library_book_id');

      if (hasBookId && !hasLibraryBookId) {
        console.log('  Renaming book_access.book_id to library_book_id...');
        try {
          await queryInterface.removeConstraint('book_access', 'book_access_book_id_foreign');
        } catch (e) {
          console.log('    Could not remove foreign key constraint');
        }

        await queryInterface.renameColumn('book_access', 'book_id', 'library_book_id');

        await queryInterface.addConstraint('book_access', {
          fields: ['library_book_id'],
          type: 'foreign key',
          references: {
            table: 'library_book',
            field: 'id',
          },
          onDelete: 'CASCADE',
        });
      } else if (hasLibraryBookId) {
        console.log('  book_access already uses library_book_id');
      }

      // 4. Check if book_handovers needs column rename
      console.log('Checking book_handovers table...');
      const [handoverColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'book_handovers' AND table_schema = 'public'`
      );
      const hasHandoverBookId = handoverColumns.some(col => col.column_name === 'book_id');
      const hasHandoverLibraryBookId = handoverColumns.some(col => col.column_name === 'library_book_id');

      if (hasHandoverBookId && !hasHandoverLibraryBookId) {
        console.log('  Renaming book_handovers.book_id to library_book_id...');
        try {
          await queryInterface.removeConstraint('book_handovers', 'book_handovers_book_id_foreign');
        } catch (e) {
          console.log('    Could not remove foreign key constraint');
        }

        await queryInterface.renameColumn('book_handovers', 'book_id', 'library_book_id');

        await queryInterface.addConstraint('book_handovers', {
          fields: ['library_book_id'],
          type: 'foreign key',
          references: {
            table: 'library_book',
            field: 'id',
          },
          onDelete: 'CASCADE',
        });
      } else if (hasHandoverLibraryBookId) {
        console.log('  book_handovers already uses library_book_id');
      }

      // 5. Remove per-copy columns from book table (if they exist)
      console.log('Checking book table for per-copy columns...');
      const [bookColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'book' AND table_schema = 'public'`
      );
      const bookColumnNames = bookColumns.map(col => col.column_name);

      if (bookColumnNames.includes('owner_id')) {
        console.log('  Removing owner_id column...');
        try {
          await queryInterface.removeConstraint('book', 'book_owner_id_foreign');
        } catch (e) {
          console.log('    Could not remove constraint');
        }
        await queryInterface.removeColumn('book', 'owner_id');
      }

      if (bookColumnNames.includes('library_id')) {
        console.log('  Removing library_id column...');
        try {
          await queryInterface.removeConstraint('book', 'book_library_id_foreign');
        } catch (e) {
          console.log('    Could not remove constraint');
        }
        await queryInterface.removeColumn('book', 'library_id');
      }

      const columnsToRemove = ['borrower_id', 'is_private', 'borrowed_at', 'return_by_date', 'status'];
      for (const col of columnsToRemove) {
        if (bookColumnNames.includes(col)) {
          console.log(`  Removing ${col} column...`);
          await queryInterface.removeColumn('book', col);
        }
      }

      console.log('Migration completed successfully!');
    } catch (err) {
      console.error('Migration failed:', err.message);
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Starting rollback: create-shared-book-catalog');

      // This is a complex rollback - just drop and recreate the table structure
      // For now, warn the user
      console.warn('WARNING: Rollback for this migration is complex. Consider restoring from backup instead.');

      console.log('Rollback skipped for safety');
    } catch (err) {
      console.error('Rollback error:', err.message);
      throw err;
    }
  }
};
