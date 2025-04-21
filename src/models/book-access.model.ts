// change this name to book-borrow-request.model.ts
import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Book } from './book.model';
import { Library } from './library.model';

@Table({ tableName: 'book_access' })
export class BookRequest extends Model<BookRequest> {
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
}
