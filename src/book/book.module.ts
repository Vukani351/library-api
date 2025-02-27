import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookController } from './book.controller';
import { Book } from '../models/book.model';
import { BookService } from './book.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwtConstants';
import { BookRequest } from 'src/models/book-request.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Book, BookRequest]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  providers: [BookService],
  controllers: [BookController],
})
export class BookModule {}
