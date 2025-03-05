import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookController } from './book.controller';
import { Book } from '../models/book.model';
import { BookService } from './book.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwtConstants';
import { BookRequest } from 'src/models/book-request.model';
import { LibraryAccess } from 'src/models/library-access.model';
import { Library } from 'src/models/library.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Book, BookRequest, LibraryAccess, Library]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  providers: [BookService],
  controllers: [BookController],
})
export class BookModule {}
