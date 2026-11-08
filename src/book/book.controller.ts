/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from '../models/book.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { ImageFactory } from 'src/cloudinary/image.factory';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateWishlistBookDto,
  CreateWishlistDto,
} from 'src/dto/CreateWishlistDto';
import { UpdateWishlistDto } from 'src/dto/UpdateWishlistDto';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly imageFactory: ImageFactory,
  ) {}

  @UseGuards(AuthGuard)
  @Get('library/:libraryId')
  async getAllLibraryBooks(
    @Param('libraryId') id: number,
    @Req() req: any,
  ): Promise<Book[]> {
    return this.bookService.libraryCollection(id, req);
  }

  @UseGuards(AuthGuard)
  @Get(':libraryBookId')
  async findOne(@Param('libraryBookId') libraryBookId: number): Promise<any> {
    return this.bookService.findOne(libraryBookId);
  }

  @UseGuards(AuthGuard)
  @Post('/new')
  async create(@Body() bookData: any, @Req() req: any): Promise<any> {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    return await this.bookService.create({
      thumbnail: bookData.thumbnail,
      description: bookData.description,
      library_id: bookData.library_id,
      title: bookData.title,
      author: bookData.author,
      isbn: bookData['isbn'] || null,
      owner_id: userId,
      status: 'active',
      is_private: bookData.is_private ?? false,
    });
  }

  @UseGuards(AuthGuard)
  @Put('update/:libraryBookId')
  async update(
    @Param('libraryBookId') libraryBookId: number,
    @Body() updateData: Partial<any>,
  ): Promise<any> {
    return this.bookService.updateBook(libraryBookId, updateData);
  }

  @UseGuards(AuthGuard)
  @Post(':libraryBookId/request-borrow')
  async requestBorrow(
    @Param('libraryBookId') libraryBookId: number,
    @Body('borrowerId') borrowerId: number,
    @Body('returnByDate') returnByDate: Date,
  ) {
    return this.bookService.requestBorrow(libraryBookId, borrowerId, returnByDate);
  }

  @UseGuards(AuthGuard)
  @Post('borrow/:requestId/approve')
  async approveBorrow(@Param('requestId') requestId: number) {
    return this.bookService.respondToBorrow(requestId, 'approved');
  }

  @UseGuards(AuthGuard)
  @Post('borrow/:requestId/reject')
  async rejectBorrow(@Param('requestId') requestId: number) {
    return this.bookService.respondToBorrow(requestId, 'rejected');
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
  @Get('requests/:libraryBookId')
  async getLibraryBorrowRequests(@Param('libraryBookId') libraryBookId: number) {
    return this.bookService.getLibraryBorrowRequests(libraryBookId);
  }

  @UseGuards(AuthGuard)
  @Get(':libraryBookId')
  async getBookById(@Param('libraryBookId') libraryBookId: number): Promise<any> {
    return this.bookService.getById(libraryBookId);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @Post(':libraryBookId/thumbnail')
  async updateThumbnail(
    @Param('libraryBookId') libraryBookId: number,
    @UploadedFile() thumbnail: Express.Multer.File,
  ): Promise<any> {
    if (!thumbnail) {
      throw new NotFoundException('Thumbnail is required');
    }

    // Get the library_book to find the associated catalog book
    const copy = await this.bookService.getById(libraryBookId);

    const publicUrl = await this.imageFactory.saveImage(
      'book_thumbnail',
      thumbnail,
    );

    // Update the shared catalog book thumbnail
    return this.bookService.updateThumbnail(copy.book_id, publicUrl);
  }

  @UseGuards(AuthGuard)
  @Post(':libraryBookId/handover')
  async createBookHandover(
    @Param('libraryBookId') libraryBookId: number,
    @Body('meeting_location') meetingLocation: string,
    @Body('last_editor_id') lastEditorId: number,
    @Body('borrower_id') borrowerId: number,
    @Body('meeting_date') meetingDate: Date,
    @Body('meeting_time') meetingTime: string,
    @Body('borrower_phone_number') borrowerPhoneNumber: string,
    @Body('lender_phone_number') lenderPhoneNumber: string,
    @Body('handover_status')
    handoverStatus: 'pending' | 'approved' | 'rejected',
    @Body('handover_confirmed') handoverConfirmed: boolean,
    @Body('book_handover_type') bookHandoverType: 'return' | 'borrow',
  ) {
    return this.bookService.createBookHandover({
      library_book_id: libraryBookId,
      borrower_id: borrowerId,
      borrower_phone_number: borrowerPhoneNumber,
      lastEditorId: lastEditorId,
      lender_phone_number: lenderPhoneNumber,
      meeting_date: meetingDate,
      meeting_time: meetingTime,
      meeting_location: meetingLocation,
      handover_status: handoverStatus,
      handover_confirmed: handoverConfirmed,
      book_handover_type: bookHandoverType,
      handover_pin: handoverConfirmed
        ? Math.floor(100000 + Math.random() * 2000)
        : undefined,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':libraryBookId/handover')
  async getBookHandover(@Param('libraryBookId') libraryBookId: number) {
    return this.bookService.getBookHandoverByBookId(libraryBookId);
  }

  @UseGuards(AuthGuard)
  @Get(':borrowerId/borrowed')
  async find(@Param('borrowerId') borrowerId: number): Promise<any[]> {
    return this.bookService.borrowedBooks(borrowerId);
  }

  @UseGuards(AuthGuard)
  @Post('wishlist')
  createWishlist(@Body() wishlist: CreateWishlistDto, @Req() req: any) {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.bookService.createWishlist(userId, wishlist);
  }

  @UseGuards(AuthGuard)
  @Post('wishlist/:wishlistId/books')
  createWishlistBook(
    @Param('wishlistId', ParseIntPipe) wishlistId: number,
    @Body() wishlistBook: CreateWishlistBookDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.bookService.createWishlistBook(
      wishlistId,
      userId,
      wishlistBook,
    );
  }

  @UseGuards(AuthGuard)
  @Get('wishlist/user')
  getWishlists(@Req() req: any) {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.bookService.getWishlists(userId);
  }

  @UseGuards(AuthGuard)
  @Get('wishlist/:wishlistId')
  getWishlist(
    @Param('wishlistId', ParseIntPipe) wishlistId: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.bookService.getWishlist(wishlistId, userId);
  }

  @UseGuards(AuthGuard)
  @Put('wishlist/:wishlistId')
  updateWishlist(
    @Param('wishlistId', ParseIntPipe) wishlistId: number,
    @Body() updateData: UpdateWishlistDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.bookService.updateWishlist(wishlistId, userId, updateData);
  }

  @UseGuards(AuthGuard)
  @Delete('wishlist/:wishlistId')
  deactivateWishlist(
    @Param('wishlistId', ParseIntPipe) wishlistId: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.bookService.deactivateWishlist(wishlistId, userId);
  }
}
