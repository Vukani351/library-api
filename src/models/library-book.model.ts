import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Book } from './book.model';
import { Library } from './library.model';
import { User } from './user.model';

@Table({
  tableName: 'library_book',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat',
})
export class LibraryBook extends Model<LibraryBook> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Book)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare book_id: number;

  @ForeignKey(() => Library)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare library_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare owner_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onDelete: 'SET NULL',
  })
  declare borrower_id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_private: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare borrowed_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare return_by_date: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    defaultValue: 'active',
  })
  declare status: string;

  @BelongsTo(() => Book)
  declare book?: Book;

  @BelongsTo(() => Library)
  declare library?: Library;

  @BelongsTo(() => User, 'owner_id')
  declare owner?: User;

  @BelongsTo(() => User, 'borrower_id')
  declare borrower?: User;

  @HasMany(() => require('./book-access.model').BookRequest)
  declare book_requests?: any[];

  @HasMany(() => require('./book-handover.model').BookHandover)
  declare book_handovers?: any[];
}
