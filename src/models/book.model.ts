import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';

@Table({
  tableName: 'book',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat',
})
export class Book extends Model<Book> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare author: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare isbn: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    unique: 'unique_isbn_key',
  })
  declare isbn_unique: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare thumbnail: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @HasMany(() => require('./library-book.model').LibraryBook)
  declare library_books?: any[];
}
