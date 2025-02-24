import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';
import { raw } from 'mysql2';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<User[]> {
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
      const payload = { email: new_user.email, username: new_user.name };
      const token = this.jwtService.sign(payload);

      return {
        data: { user: { email: new_user.email, name: new_user.name }, token },
      };
    } catch (error) {
      console.log('error: \n', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  // async update(id: number, updateData: Partial<User>): Promise<User> {
  //   const user = await this.findOne(id);
  //   return user.update(updateData);
  // }

  // async remove(id: number): Promise<void> {
  //   const user = await this.findOne(id);
  //   await user.destroy();
  // }
}
