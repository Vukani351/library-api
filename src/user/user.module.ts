import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwtConstants';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ImageFactory } from '../cloudinary/image.factory';
import { UserThumbnailService } from 'src/cloudinary/UserThumbnail.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }), 
  ],
  controllers: [UserController],
  providers: [UserService, CloudinaryService, UserThumbnailService, ImageFactory],
})
export class UserModule {}
