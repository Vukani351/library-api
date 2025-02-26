import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Library } from './library.model';

@Table({ tableName: 'library_access' })
export class LibraryAccess extends Model<LibraryAccess> {
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
  })
  user_id: number; // The user requesting access

  @ForeignKey(() => Library)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  library_id: number; // The library they want access to

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string; // Tracks the request status

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approved_at: Date;
}
