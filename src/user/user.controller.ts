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
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { AuthGuard } from '../auth/auth.guard';
import { ImageFactory } from 'src/cloudinary/image.factory';
import { FileInterceptor } from '@nestjs/platform-express';

type LoginCredentials = {
  email: string;
  password: string;
};

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageFactory: ImageFactory
  ) { }

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

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post(':userId/thumbnail')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async updateUserThumbnail(
    @Param('userId') userId: string,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    // Save image to Cloudinary
    const publicUrl = await this.imageFactory.saveImage(
      'user_thumbnail',
      thumbnail,
    );

    const updatedUser = await this.userService.updateThumbnail(Number(userId), publicUrl);
    return {
      message: 'Thumbnail updated successfully',
      data: updatedUser,
    };
  }
}
