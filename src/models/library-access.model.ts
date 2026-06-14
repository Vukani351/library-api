import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Library } from './library.model';
import { User } from './user.model';

@Table({
  tableName: 'library_access',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat',
})
export class LibraryAccess extends Model {
  @ForeignKey(() => Library)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare library_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare owner_id: number;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  })
  declare status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare requested_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare approved_at: Date;
}
