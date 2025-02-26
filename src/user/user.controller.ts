import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { AuthGuard } from '../auth/auth.guard';

type LoginCredentials = {
  email: string;
  password: string;
};
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  SignUp(@Body() user: Partial<User>) {
    return this.userService.register(user);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getProfile(@Param('id') id: number) {
    return this.userService.getProfile(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  SignIn(@Body() { email, password }: Partial<LoginCredentials>) {
    return this.userService.login(email!, password!);
  }

  @UseGuards(AuthGuard)
  @Put(':id') // add prefix 'update' to the route
  update(@Param('id') id: string, @Body() updateUser: Partial<User>) {
    return this.userService.updateUser(Number(id), updateUser);
  }
}
