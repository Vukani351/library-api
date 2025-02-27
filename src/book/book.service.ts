import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from '../models/book.model';
import { BookRequest } from 'src/models/book-request.model';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book) private bookModel: typeof Book,
    @InjectModel(BookRequest)
    private bookRequestModel: typeof BookRequest,
  ) {}

  async findAll(): Promise<Book[]> {
    return this.bookModel.findAll();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookModel.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return book;
  }

  async create(book: Partial<Book>): Promise<Book> {
    return this.bookModel.create(book as Book);
  }

  async update(id: number, updateData: Partial<Book>): Promise<Book> {
    const book = await this.findOne(id);
    return book.update(updateData);
  }

  async requestBorrow(bookId: number, borrowerId: number, returnByDate: Date) {
    // Check if book exists
    const book = await this.bookModel.findByPk(bookId);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.status !== 'available') {
      throw new BadRequestException('Book is not available for borrowing');
    }

    // Check if request already exists
    const existingRequest = await this.bookRequestModel.findOne({
      where: { book_id: bookId, borrower_id: borrowerId, status: 'pending' },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'You have already requested to borrow this book',
      );
    }

    return this.bookRequestModel.create({
      book_id: bookId,
      borrower_id: borrowerId,
      owner_id: book.owner_id,
      return_by_date: returnByDate,
      status: 'pending',
    } as BookRequest);
  }

  async approveBorrow(requestId: number) {
    const request = await this.bookRequestModel.findByPk(requestId);
    if (!request) {
      throw new NotFoundException('Borrow request not found');
    }

    // Update the book status
    const book = await this.bookModel.findByPk(request.book_id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    book.borrower_id = request.borrower_id;
    book.status = 'borrowed';
    book.return_by_date = request.return_by_date;
    await book.save();

    request.status = 'approved';
    request.approved_at = new Date();
    return request.save();
  }

  async getBorrowRequests(ownerId: number) {
    return this.bookRequestModel.findAll({
      where: { owner_id: ownerId, status: 'pending' },
      include: [Book],
    });
  }
}
