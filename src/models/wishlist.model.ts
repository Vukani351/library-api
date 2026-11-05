import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import type { Book } from './book.model';

@Table({
  tableName: 'wishlist',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat',
})
export class Wishlist extends Model<Wishlist> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare user_id: number;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare accessibility: boolean;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'active',
  })
  declare status: 'active' | 'inactive';
}
