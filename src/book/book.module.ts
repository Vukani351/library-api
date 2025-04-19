import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookController } from './book.controller';
import { Book } from '../models/book.model';
import { BookService } from './book.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwtConstants';
import { BookRequest } from 'src/models/book-access.model';
import { LibraryAccess } from 'src/models/library-access.model';
import { Library } from 'src/models/library.model';
import { ImageFactory } from 'src/cloudinary/image.factory';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Book, BookRequest, LibraryAccess, Library]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  controllers: [BookController],
  providers: [BookService, CloudinaryService, ImageFactory],
})
export class BookModule {}
