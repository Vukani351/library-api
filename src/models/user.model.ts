import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'user' })
export class User extends Model<User> {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    defaultValue: 'active',
  })
  status: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  address: string; // New column for address

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  thumbnail: string; // New column for thumbnail
}
