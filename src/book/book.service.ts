import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from '../models/book.model';
import { jwtConstants } from 'src/constants/jwtConstants';
import { BookRequest } from 'src/models/book-access.model';
import { JwtService } from '@nestjs/jwt';
import { LibraryAccess } from 'src/models/library-access.model';
import { Library } from 'src/models/library.model';
import { User } from 'src/models/user.model';
import { BookHandover } from 'src/models/book-handover.model';

type HandoverStatus = 'pending' | 'approved' | 'rejected';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book) private bookModel: typeof Book,
    @InjectModel(BookRequest)
    private bookRequestModel: typeof BookRequest,
    @InjectModel(LibraryAccess)
    private libraryAccessModel: typeof LibraryAccess,
    @InjectModel(Library)
    private libraryModel: typeof Library,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(BookHandover)
    private bookHandoverModel: typeof BookHandover,
    private readonly jwtService: JwtService,
  ) {}

  async libraryCollection(libraryId: number, req: any): Promise<Book[]> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        throw new Error('Token not found');
      }

      const userId = await this.jwtService
        .verifyAsync(token, {
          secret: jwtConstants.secret,
        })
        .then((d) => d.id)
        .catch((err) => {
          console.error('Error verifying token:', err);
        });

      const library_owner = await this.libraryModel.findOne({
        where: {
          id: libraryId,
          user_id: userId,
        },
      });

      if (!library_owner) {
        const access = await this.libraryAccessModel.findOne({
          where: {
            library_id: libraryId,
            user_id: userId,
            status: 'approved',
          },
        });

        if (access) {
          return this.bookModel.findAll({
            where: { library_id: libraryId },
          });
        }

        if (!access && !!library_owner) {
          throw new BadRequestException(
            'You do not have access to this library',
          );
        }
      }

      const books = await this.bookModel.findAll({
        where: { library_id: libraryId, owner_id: userId },
      });

      return books;
    } catch (error) {
      console.error('Error in libraryCollection:', error);
      throw new InternalServerErrorException(
        'Could not fetch library collection',
      );
    }
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

  async updateBook(id: number, updateData: Partial<Book>): Promise<Book> {
    try {
      const book = await this.findOne(id);
      book.set(updateData);
      const updatedBook = await book.save();
      return updatedBook;
    } catch (error) {
      // ADD THIS LOG TO SEE THE EXACT PROBLEM IN YOUR TERMINAL
      console.error('Sequelize Update Error:', error);

      throw new InternalServerErrorException(
        `Failed to update book with id ${id}. Reason: ${error.message}`,
      );
    }
  }

  async requestBorrow(bookId: number, borrowerId: number, returnByDate: Date) {
    const bookRecord = await this.bookModel.findByPk(bookId);
    if (!bookRecord) {
      throw new NotFoundException('Book not found');
    }
    const book = bookRecord.toJSON();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.is_private) {
      throw new BadRequestException('Book is not available for borrowing');
    }

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
      library_id: book.library_id,
      return_by_date: returnByDate,
      status: 'pending',
    } as BookRequest);
  }

  async respondToBorrow(requestId: number, response: string) {
    try {
      const request = await this.bookRequestModel.findByPk(requestId);
      if (!request) {
        throw new NotFoundException('Borrow request not found');
      }

      const book = await this.bookModel.findByPk(request.book_id);
      if (!book) {
        throw new NotFoundException('Book not found');
      }

      if (response === 'approved') {
        await this.bookModel.update(
          {
            borrower_id: request.borrower_id,
            status: 'active',
            return_by_date: request.return_by_date,
          },
          { where: { id: request.book_id } },
        );

        await this.bookRequestModel.update(
          {
            status: 'approved',
            approved_at: new Date(),
          },
          { where: { id: requestId } },
        );
      } else if (response === 'rejected') {
        await this.bookRequestModel.update(
          {
            status: 'rejected',
            approved_at: new Date(),
          },
          { where: { id: requestId } },
        );
      }

      const updatedRequest = await this.bookRequestModel.findByPk(requestId);
      return updatedRequest;
    } catch (error) {
      console.error('Error in respondToBorrow:', error);
      throw new InternalServerErrorException(
        'An error occurred while responding to the borrow request',
      );
    }
  }

  async getBorrowRequests(ownerId: number) {
    try {
      const requests = await this.bookRequestModel.findAll({
        where: { owner_id: ownerId },
        include: [Book],
      });
      if (!requests || requests.length === 0) {
        throw new NotFoundException(
          'No pending borrow requests found or the owner id is incorrect',
        );
      }
      return requests;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while retrieving borrow requests',
      );
    }
  }

  async getLibraryBorrowRequests(bookId: number) {
    try {
      // Fetch all borrow requests for the given book ID
      const bookRequests = await this.bookRequestModel.findAll({
        where: { book_id: bookId },
      });

      if (!bookRequests || bookRequests.length === 0) {
        throw new NotFoundException(
          'No borrow requests found for this library',
        );
      }

      // Fetch user details for each borrow request
      const enrichedRequests = await Promise.all(
        bookRequests.map(async (request) => {
          const user = await this.userModel.findOne({
            where: { id: request.borrower_id },
          });

          return {
            ...request.toJSON(),
            name: user?.toJSON().name || null,
            email: user?.toJSON().email || null,
          };
        }),
      );

      return enrichedRequests;
    } catch (error) {
      console.error('Error in getLibraryBorrowRequests:', error);
      throw new InternalServerErrorException(
        'An error occurred while retrieving borrow requests for the library',
      );
    }
  }

  async getById(bookId: number): Promise<Book> {
    try {
      const book = await this.bookModel.findByPk(bookId);
      if (!book) {
        throw new NotFoundException(`Book with id ${bookId} not found`);
      }
      return book;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching book details',
      );
    }
  }

  async updateThumbnail(
    bookId: number,
    thumbnail: string,
  ): Promise<Book | any> {
    const book = await this.bookModel.findByPk(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }
    /*
     * todo:
     * add logic to update thumbnail from the cloudify shandic
     */
    await this.bookModel.update({ thumbnail }, { where: { id: bookId } });

    const updatedBook = await this.bookModel.findByPk(bookId);
    if (!updatedBook) {
      throw new InternalServerErrorException(
        'Unable to retrieve the updated book',
      );
    }

    return updatedBook;
  }

  async borrowedBooks(borrower_id: number): Promise<Book[]> {
    const booksModel = this.bookModel.findAll({
      where: {
        borrower_id: borrower_id,
      },
    });
    return booksModel;
  }

  /*
   * TODO:
   * create a typefor this DTO:
   */
  async createBookHandover(handoverDetails: {
    book_id: number;
    meeting_date: Date;
    borrower_id: number;
    meeting_time: string;
    lastEditorId: number;
    handover_status: HandoverStatus;
    meeting_location: string;
    borrower_phone_number: string;
    lender_phone_number: string;
    handover_confirmed: boolean;
    book_handover_type: 'return' | 'borrow';
    handover_pin: number | undefined;
  }) {
    try {
      const book = await this.bookModel.findByPk(handoverDetails.book_id);
      if (!book?.toJSON()) {
        throw new NotFoundException('Book not found.');
      }

      const existingHandover = await this.bookHandoverModel.findOne({
        where: {
          book_id: handoverDetails.book_id,
          borrower_id: handoverDetails.borrower_id,
          lender_id: book?.toJSON().owner_id,
          book_handover_type: handoverDetails?.book_handover_type || 'borrow',
        },
      });

      if (existingHandover) {
        const updatedHandover = await existingHandover.update({
          meeting_time: handoverDetails.meeting_time,
          meeting_date: handoverDetails.meeting_date,
          handover_confirmed: handoverDetails.handover_confirmed,
          meeting_location: handoverDetails.meeting_location,
          borrower_phone_number: handoverDetails.borrower_phone_number,
          lender_phone_number: handoverDetails.lender_phone_number,
          last_editor_id: handoverDetails.lastEditorId,
          handover_status: handoverDetails.handover_status,
          handover_pin: handoverDetails.handover_pin,
          book_handover_type: handoverDetails?.book_handover_type || 'borrow', // verify that this is correct
        });
        return updatedHandover;
      }

      const newHandover = await this.bookHandoverModel.create({
        handover_confirmed: false,
        handover_status: 'pending',
        book_id: handoverDetails.book_id,
        lender_id: book?.toJSON().owner_id,
        borrower_id: handoverDetails.borrower_id,
        meeting_time: handoverDetails.meeting_time,
        meeting_date: handoverDetails.meeting_date,
        meeting_location: handoverDetails.meeting_location,
        borrower_phone_number: handoverDetails.borrower_phone_number,
        lender_phone_number: handoverDetails.lender_phone_number,
        last_editor_id: handoverDetails.lastEditorId,
        handover_pin: handoverDetails.handover_pin,
        book_handover_type: handoverDetails.book_handover_type,
      } as BookHandover);

      return newHandover;
    } catch (error) {
      console.error('Error in createBookHandover:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the book handover',
      );
    }
  }

  /*
   * TODO:
   * ensure that user has one request for book eath time
   */
  async getBookHandoverByBookId(bookId: number) {
    try {
      const handover = await this.bookHandoverModel.findOne({
        where: { book_id: bookId },
        order: [['createdat', 'DESC']],
      });

      if (!handover) {
        throw new NotFoundException(
          `Handover record for bookId ${bookId} not found`,
        );
      }

      return handover;
    } catch (error) {
      console.error('Error in getBookHandoverByBookId:', error);
      return [];
    }
  }
}
