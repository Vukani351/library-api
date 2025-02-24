/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Library } from './library.model';

@Table({ tableName: 'book' })
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
  title: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  author: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  thumbnail: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  owner_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  borrower_id: number;

  @ForeignKey(() => Library)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  library_id: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_private: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  borrowed_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  return_by_date: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  status: string;
}
