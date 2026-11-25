import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Library } from '../models/library.model';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwtConstants';
import { LibraryAccess } from 'src/models/library-access.model';
import { User } from '../models/user.model';
import { Book } from '../models/book.model';
import { LibraryBook } from '../models/library-book.model';
import { ImageFactory } from 'src/cloudinary/image.factory';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Library, LibraryAccess, User, Book, LibraryBook]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    BookModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryService, ImageFactory, CloudinaryService],
})
export class LibraryModule {}
