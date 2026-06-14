import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'library',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat',
})
export class Library extends Model<Library> {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: 'active',
  })
  declare status: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: 'This is a library...',
  })
  declare description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 1,
  })
  declare is_private: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
  })
  declare user_id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'URL to the library thumbnail image',
  })
  declare thumbnail: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: 'Physical address of the library',
  })
  declare address: string;
}
