import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Book } from './book.model';
import { User } from './user.model';

@Table({ tableName: 'book_handovers', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export class BookHandover extends Model<BookHandover> {
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
  })
  declare book_id: number;

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
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updated_at: Date;
}