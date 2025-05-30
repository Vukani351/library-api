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
  timestamps: true, // Enables createdAt and updatedAt fields
})
export class LibraryAccess extends Model {

  @ForeignKey(() => Library)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  library_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  owner_id: number;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  requested_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approved_at: Date;
}
