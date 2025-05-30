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
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from '../models/book.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { ImageFactory } from 'src/cloudinary/image.factory';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly imageFactory: ImageFactory
  ) { }

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
    // console.log({ bookId: bookId, borrowerId: borrowerId, returnByDate: returnByDate }); return [123, 456, 789];
    return this.bookService.requestBorrow(bookId, borrowerId, returnByDate);
  }

  @UseGuards(AuthGuard)
  @Post('borrow/:requestId/approve')
  async approveBorrow(@Param('requestId') requestId: number) {
    return this.bookService.respondToBorrow(requestId, "approved");
  }

  @UseGuards(AuthGuard)
  @Post('borrow/:requestId/reject')
  async rejectBorrow(@Param('requestId') requestId: number) {
    return this.bookService.respondToBorrow(requestId, "rejected");
  }

  @UseGuards(AuthGuard)
  @Get('borrow-requests/:ownerId')
  async getBorrowRequests(@Param('ownerId') ownerId: number) {
    /* TODO:
     * fix this to return the borrow requests
     * remove this comment so that we have this errror fixed for the entire application
     */
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

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @Post(':bookId/thumbnail')
  async updateThumbnail(
    @Param('bookId') bookId: number,
    @UploadedFile() thumbnail: Express.Multer.File,
  ): Promise<Book> {
    if (!thumbnail) {
      throw new NotFoundException('Thumbnail is required'); 
    }
    // Save image to Cloudinary
    const publicUrl = await this.imageFactory.saveImage(
      'book_thumbnail',
      thumbnail,
    );
    return this.bookService.updateThumbnail(bookId, publicUrl);
  }

  @UseGuards(AuthGuard)
  @Post(':bookId/handover')
  async createBookHandover(
    @Param('bookId') bookId: number,
    @Body('lender_id') lenderId: number,
    @Body('borrower_id') borrowerId: number,
    @Body('meeting_location') meetingLocation: string,
    @Body('meeting_date') meetingDate: Date,
    @Body('meeting_time') meetingTime: string,
    @Body('borrower_phone_number') borrowerPhoneNumber: string,
    @Body('lender_phone_number') lenderPhoneNumber: string,
  ) {
    return this.bookService.createBookHandover({
      book_id: bookId,
      lender_id: lenderId,
      borrower_id: borrowerId,
      meeting_date: meetingDate,
      meeting_time: meetingTime,
      meeting_location: meetingLocation,
      borrower_phone_number: borrowerPhoneNumber,
      lender_phone_number: lenderPhoneNumber,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':bookId/handover')
  async getBookHandover(@Param('bookId') bookId: number) {
    return this.bookService.getBookHandoverByBookId(bookId);
  }
}
