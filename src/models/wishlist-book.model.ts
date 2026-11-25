import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Book } from './book.model';
import { Wishlist } from './wishlist.model';

@Table({
  tableName: 'wishlist_book',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: false,
})
export class WishlistBook extends Model<WishlistBook> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Wishlist)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare wishlist_id: number;

  @ForeignKey(() => Book)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare book_id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare category: string | null;
}
