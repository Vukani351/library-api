import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../models/user.model';

type LoginCredentials = {
  email: string;
  password: string;
};
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  create(@Body() user: Partial<User>) {
    return this.userService.register(user);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Post('login')
  findOne(@Body() { email, password }: Partial<LoginCredentials>) {
    return this.userService.login(email!, password!);
  }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateUser: Partial<User>) {
  //   return this.userService.update(+id, updateUser);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
