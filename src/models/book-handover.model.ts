import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'book_handovers',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat'
})
export class BookHandover extends Model<BookHandover> {
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
  })
  declare library_book_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare lender_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare borrower_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare meeting_location: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare meeting_date: Date;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  declare meeting_time: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare handover_confirmed: boolean;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare handover_status: 'pending' | 'approved' | 'rejected';

  @Column({
    type: DataType.ENUM('return', 'borrow'),
    allowNull: false,
    defaultValue: 'borrow',
  })
  declare book_handover_type: 'return' | 'borrow';

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: [10, 10],
    },
  })
  declare borrower_phone_number: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare last_editor_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: [10, 10],
    },
  })
  declare lender_phone_number: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare handover_pin: number;

  @BelongsTo(() => require('./library-book.model').LibraryBook)
  declare library_book?: any;

  @BelongsTo(() => User, 'lender_id')
  declare lender?: User;

  @BelongsTo(() => User, 'borrower_id')
  declare borrower?: User;

  @BelongsTo(() => User, 'last_editor_id')
  declare last_editor?: User;
}