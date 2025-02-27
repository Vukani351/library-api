import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Book } from './book.model';

@Table({ tableName: 'book_request' })
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
  book_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  borrower_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  owner_id: number;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approved_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  return_by_date: Date;
}
