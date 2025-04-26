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

      const userId = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      }).then(d => d.id).catch((err) => {
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

        if (!access && !!!library_owner) {
          throw new BadRequestException('You do not have access to this library');
        }
      }

      const books = await this.bookModel.findAll({
        where: { library_id: libraryId, owner_id: userId },
      });
      return books || [];
    } catch (error) {
      console.error('Error in libraryCollection:', error);
      throw new InternalServerErrorException(
        'Could not fetch library collection',
        error,
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
      const book = await this.findOne(id); // This will throw NotFoundException if no book found
      const updatedBook = await book.update(updateData);
      return updatedBook;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update book with id ${id}`,
      );
    }
  }

  async requestBorrow(bookId: number, borrowerId: number, returnByDate: Date) {
    // Check if book exists
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
    
    // Check if request already exists
    const existingRequest = await this.bookRequestModel.findOne({
      where: { book_id: bookId, borrower_id: borrowerId, status: 'pending' },
    });

    if (existingRequest) {
      // this could be a message, not an error.
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
      // Fetch the borrow request
      const request = await this.bookRequestModel.findByPk(requestId);
      if (!request) {
        throw new NotFoundException('Borrow request not found');
      }

      // Fetch the book associated with the request
      const book = await this.bookModel.findByPk(request.book_id);
      if (!book) {
        throw new NotFoundException('Book not found');
      }

      if (response === 'approved') {
        // Update the book's borrower and status
        await this.bookModel.update(
          {
            borrower_id: request.borrower_id,
            status: 'active',
            return_by_date: request.return_by_date,
          },
          { where: { id: request.book_id } }
        );

        // Update the request's status and approval date
        await this.bookRequestModel.update(
          {
            status: 'approved',
            approved_at: new Date(),
          },
          { where: { id: requestId } }
        );
      } else if (response === 'rejected') {
        // Update the request's status to rejected
        await this.bookRequestModel.update(
          {
            status: 'rejected',
            approved_at: new Date(),
          },
          { where: { id: requestId } }
        );
      }

      // Fetch and return the updated request
      const updatedRequest = await this.bookRequestModel.findByPk(requestId);
      return updatedRequest;
    } catch (error) {
      console.error('Error in respondToBorrow:', error);
      throw new InternalServerErrorException(
        'An error occurred while responding to the borrow request'
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
        throw new NotFoundException('No borrow requests found for this library');
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
      // Log the error for debugging
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

  async updateThumbnail(bookId: number, thumbnail: string): Promise<Book | any> {
    // Check if the book exists
    const book = await this.bookModel.findByPk(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }
    /*
      * todo:
      * add l;logic to update thumbnail from the cloudify shandic
    */
    await this.bookModel.update({ thumbnail }, { where: { id: bookId } });
      
    // Fetch and return the updated book record
    const updatedBook = await this.bookModel.findByPk(bookId);
    if (!updatedBook) {
      throw new InternalServerErrorException('Unable to retrieve the updated book');
    }
    
    return updatedBook;
  }

  /*
  * TODO:
  * create a typefor this DTO:
  */
  async createBookHandover(handoverDetails: {
    book_id: number;
    lender_id: number;
    borrower_id: number;
    meeting_location: string;
    meeting_date: Date;
    meeting_time: string;
    borrower_phone_number: string,
  }) {
    try {
      // Check if the book exists
      const book = await this.bookModel.findByPk(handoverDetails.book_id);
      if (!book) {
        throw new NotFoundException('Book not found');
      }

      // Check if the lender is the owner of the book
      if (book.toJSON().owner_id !== handoverDetails.lender_id) {
        throw new BadRequestException('Lender is not the owner of the book');
      }

      // Create the book handover record
      const handover = await this.bookHandoverModel.create({
        handover_confirmed: false,
        book_id: handoverDetails.book_id,
        lender_id: handoverDetails.lender_id,
        borrower_id: handoverDetails.borrower_id,
        meeting_time: handoverDetails.meeting_time,
        meeting_date: handoverDetails.meeting_date,
        meeting_location: handoverDetails.meeting_location,
        borrower_phone_number: handoverDetails.borrower_phone_number,
      } as BookHandover);

      return handover;
    } catch (error) {
      console.error('Error in createBookHandover:', error);
      throw new InternalServerErrorException(
        'An error occurred while creating the book handover',
      );
    }
  }
/*
* TODO:
* ensure that user has one request for book eath time */
  async getBookHandoverByBookId(bookId: number) {
    try {
      // Fetch the handover record for the given book ID
      const handover = await this.bookHandoverModel.findOne({
        where: { book_id: bookId },
      });

      if (!handover) {
        throw new NotFoundException(`Handover record for bookId ${bookId} not found`);
      }

      return handover;
    } catch (error) {
      console.error('Error in getBookHandoverByBookId:', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching the handover record',
      );
    }
  }
}
