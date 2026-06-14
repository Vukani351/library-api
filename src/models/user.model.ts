import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'user',
  timestamps: true,
  createdAt: 'createdat',
  updatedAt: 'updatedat',
})
export class User extends Model<User> {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: 'active',
  })
  declare status: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare address: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare thumbnail: string;
}
