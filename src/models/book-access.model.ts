import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Library } from './library.model';

@Table({
  tableName: 'book_access',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat'
})
export class BookRequest extends Model<BookRequest> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => require('./library-book.model').LibraryBook)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare library_book_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare borrower_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare owner_id: number;

  @ForeignKey(() => Library)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare library_id: number;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  })
  declare status: 'pending' | 'approved' | 'rejected';

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare approved_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare return_by_date: Date;

  @BelongsTo(() => require('./library-book.model').LibraryBook)
  declare library_book?: any;

  @BelongsTo(() => User, 'borrower_id')
  declare borrower?: User;

  @BelongsTo(() => User, 'owner_id')
  declare owner?: User;

  @BelongsTo(() => Library)
  declare library?: Library;
}
