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

  async login(email: string, password: string): Promise<{ data: any }> {
    const user = await this.userModel.findOne({
      where: { email: email, password: password },
      raw: true,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email, username: user.name };
    const token = this.jwtService.sign(payload);

    return { data: { user: payload, token } };
  }

  async register(user: Partial<User>): Promise<any> {
    try {
      const new_user = await this.userModel.create(user as User);
      const parsed_user = new_user.get({ plain: true });
      const payload = { email: parsed_user.email, username: parsed_user.name };
      const token = this.jwtService.sign(payload);
      return {
        data: {
          user: {
            email: parsed_user.email,
            name: parsed_user.name,
          },
          token: token,
        },
      };
    } catch (error) {
      console.log('error: \n', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.userModel.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      await user.update(updateData);
      return user;
    } catch (error) {
      console.log('error: \n', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async getProfile(id: number): Promise<User | null> {
    return await this.userModel.findByPk(id);
  }
}
