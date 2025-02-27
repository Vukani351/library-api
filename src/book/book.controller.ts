import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from '../models/book.model';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async findAll(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Post('/new')
  async create(@Body() bookData: Partial<Book>): Promise<Book> {
    return this.bookService.create({
      thumbnail: bookData.thumbnail,
      borrower_id: bookData.borrower_id,
      description: bookData.description,
      owner_id: bookData.owner_id,
      library_id: bookData.library_id,
      title: bookData.title,
      author: bookData.author,
      status: 'active',
      is_private: bookData.is_private || true,
    });
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateData: Partial<Book>,
  ): Promise<Book> {
    return this.bookService.update(id, updateData);
  }

  @UseGuards(AuthGuard)
  @Post(':bookId/request-borrow')
  async requestBorrow(
    @Param('bookId') bookId: number,
    @Body('borrowerId') borrowerId: number,
    @Body('returnByDate') returnByDate: Date,
  ) {
    return this.bookService.requestBorrow(bookId, borrowerId, returnByDate);
  }

  @UseGuards(AuthGuard)
  @Post('borrow/:requestId/approve')
  async approveBorrow(@Param('requestId') requestId: number) {
    return this.bookService.approveBorrow(requestId);
  }

  @UseGuards(AuthGuard)
  @Get('borrow-requests/:ownerId')
  async getBorrowRequests(@Param('ownerId') ownerId: number) {
    return this.bookService.getBorrowRequests(ownerId);
  }
}
