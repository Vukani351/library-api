import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly jwtService: JwtService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({
      where: { email: email, password: password },
      raw: true,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email, username: user.name, id: user.id };
    const token = this.jwtService.sign(payload);

    return { token: token };
  }

  async register(user: Partial<User>): Promise<any> {
    try {
      const new_user = await this.userModel.create(user as User);
      const parsed_user = new_user.get({ plain: true });
      const payload = { email: parsed_user.email, username: parsed_user.name };
      const token = this.jwtService.sign(payload);
      return {
        token: token,
      };
    } catch (error) {
      console.log('error: \n', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    try {
        // Filter out only the fields that are allowed to be updated
        const allowedFields = ['name', 'email', 'status'];
        const filteredData = Object.keys(updateData)
            .filter((key) => allowedFields.includes(key) && updateData[key] !== undefined)
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        if (Object.keys(filteredData).length === 0) {
            throw new Error('No valid fields provided for update');
        }

        // Use the update method to apply changes without affecting other fields
        await this.userModel.update(filteredData, { where: { id } });

        // Return the updated user
        const updatedUser = await this.userModel.findByPk(id);
        if (!updatedUser) {
            throw new Error('User not found after update');
        }
        return updatedUser;
    } catch (error) {
        console.log('error: \n', error);
        throw new InternalServerErrorException('Failed to update user');
    }
}

async getProfile(id: number): Promise<Partial<User>> {
  const user = (await this.userModel.findByPk(id))?.toJSON();
  return {
    id: user?.id,
    name: user?.name || "",
    email: user?.email || "",
  };
}
}
