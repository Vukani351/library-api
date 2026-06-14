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
    type: DataType.TEXT,
    allowNull: true,
  })
  declare thumbnail: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare owner_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare borrower_id: number;

  @ForeignKey(() => Library)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare library_id: number;

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
  })
  declare status: string;
}
