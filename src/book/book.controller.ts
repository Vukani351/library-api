/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from '../models/book.model';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(AuthGuard)
  @Get('library/:libraryId')
  async getAllLibraryBooks(
    @Param('libraryId') id: number,
    @Req() req: any,
  ): Promise<Book[]> {
    return this.bookService.libraryCollection(id, req);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post('/new')
  async create(@Body() bookData: Partial<Book>): Promise<Book> {
    return await this.bookService.create({
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
    return this.bookService.updateBook(id, updateData);
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
    /* TODO:
     * fix this to return the borrow requests
     * remove this comment so that we have this errror fixed for the entire application
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.bookService.getBorrowRequests(ownerId);
  }

  @UseGuards(AuthGuard)
  @Get('requests/:bookId')
  async getLibraryBorrowRequests(@Param('bookId') bookId: number) {
    return this.bookService.getLibraryBorrowRequests(bookId);
  }

  @UseGuards(AuthGuard)
  @Get(':bookId')
  async getBookById(@Param('bookId') bookId: number): Promise<Book> {
    return this.bookService.getById(bookId);
  }
}
