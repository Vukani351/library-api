import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../user/user.model';

@Table({ tableName: 'library' })
export class Library extends Model<Library> {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: 'active',
  })
  status: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: 'This is a library...',
  })
  description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 1,
  })
  is_private: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  user_id: number;
}
