import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectConnection } from '@nestjs/sequelize';
import { Book } from '../models/book.model';
import { LibraryBook } from '../models/library-book.model';
import { jwtConstants } from 'src/constants/jwtConstants';
import { BookRequest } from 'src/models/book-access.model';
import { JwtService } from '@nestjs/jwt';
import { LibraryAccess } from 'src/models/library-access.model';
import { Library } from 'src/models/library.model';
import { User } from 'src/models/user.model';
import { BookHandover } from 'src/models/book-handover.model';
import { Error, Op, Sequelize } from 'sequelize';
import {
  CreateWishlistBookDto,
  CreateWishlistDto,
} from 'src/dto/CreateWishlistDto';
import { UpdateWishlistDto } from 'src/dto/UpdateWishlistDto';
import { Wishlist } from 'src/models/wishlist.model';
import { WishlistBook } from 'src/models/wishlist-book.model';

type HandoverStatus = 'pending' | 'approved' | 'rejected';

type WishlistBookWithBook = {
  id: number;
  wishlist_id: number;
  book_id: number;
  category: string | null;
  book: Book;
};

type WishlistWithBooks = Pick<
  Wishlist,
  'id' | 'user_id' | 'name' | 'description' | 'accessibility' | 'status'
> & { wishlist_books: WishlistBookWithBook[] };

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book) private bookModel: typeof Book,
    @InjectModel(LibraryBook) private libraryBookModel: typeof LibraryBook,
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
    @InjectModel(Wishlist)
    private wishlistModel: typeof Wishlist,
    @InjectModel(WishlistBook)
    private wishlistBookModel: typeof WishlistBook,
    @InjectConnection()
    private readonly sequelize: Sequelize,
    private readonly jwtService: JwtService,
  ) {}

  async createWishlist(
    userId: number,
    wishlistData: CreateWishlistDto,
  ): Promise<{ wishlist: Wishlist; wishlist_book: WishlistBook[] }> {
    const wishlistBooks = wishlistData.wishlist_book ?? [];
    const bookIds = wishlistBooks.map(({ book_id }) => book_id);

    if (new Set(bookIds).size !== bookIds.length) {
      throw new BadRequestException(
        'A book can only be added once to a wishlist',
      );
    }

    return this.sequelize.transaction(async (transaction) => {
      if (bookIds.length > 0) {
        const books = await this.bookModel.findAll({
          where: { id: { [Op.in]: bookIds } },
          attributes: ['id'],
          transaction,
        });

        if (books.length !== bookIds.length) {
          throw new NotFoundException('One or more books were not found');
        }
      }

      const wishlist = await this.wishlistModel.create(
        {
          user_id: userId,
          name: wishlistData.name,
          description: wishlistData.description,
          accessibility: wishlistData.accessibility ?? false,
        } as Wishlist,
        { transaction },
      );

      const createdWishlistBooks = wishlistBooks.length
        ? await this.wishlistBookModel.bulkCreate(
            wishlistBooks.map(({ book_id, category }) => ({
              wishlist_id: wishlist.id,
              book_id,
              category,
            })) as WishlistBook[],
            { transaction },
          )
        : [];

      return {
        wishlist,
        wishlist_book: createdWishlistBooks,
      };
    });
  }

  async createWishlistBook(
    wishlistId: number,
    userId: number,
    wishlistBookData: CreateWishlistBookDto,
  ): Promise<WishlistBook> {
    const wishlist = await this.wishlistModel.findOne({
      where: { id: wishlistId, user_id: userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const book = await this.bookModel.findByPk(wishlistBookData.book_id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const existingWishlistBook = await this.wishlistBookModel.findOne({
      where: { wishlist_id: wishlistId, book_id: wishlistBookData.book_id },
    });

    if (existingWishlistBook) {
      throw new ConflictException('Book is already in this wishlist');
    }

    return this.wishlistBookModel.create({
      wishlist_id: wishlistId,
      book_id: wishlistBookData.book_id,
      category: wishlistBookData.category,
    } as WishlistBook);
  }

  async getWishlist(wishlistId: number, userId: number): Promise<
    WishlistWithBooks
  > {
    const wishlist = await this.wishlistModel.findOne({
      where: { id: wishlistId, user_id: userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const wishlistBooks = await this.wishlistBookModel.findAll({
      where: { wishlist_id: wishlistId },
    });

    const bookIds = wishlistBooks.map((wishlistBook) => wishlistBook.book_id);
    const books = bookIds.length
    ? await this.bookModel.findAll({ where: { id: { [Op.in]: bookIds } } })
    : [];
    const booksById = new Map(books.map((book) => [book.id, book]));
    
    const wishlistBookDetails = wishlistBooks.map((wishlistBook) => {
      const book = booksById.get(wishlistBook.book_id);
      if (!book) {
        throw new NotFoundException('A book associated with this wishlist was not found');
      }

      return {
        id: wishlistBook.id,
        wishlist_id: wishlistBook.wishlist_id,
        book_id: wishlistBook.book_id,
        category: wishlistBook.category,
        book,
      };
    });

    return {
      ...wishlist.toJSON(),
      wishlist_books: wishlistBookDetails,
    };
  }

  async updateWishlist(
    wishlistId: number,
    userId: number,
    updateData: UpdateWishlistDto,
  ): Promise<Wishlist> {
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('At least one wishlist field is required');
    }

    const wishlist = await this.wishlistModel.findOne({
      where: { id: wishlistId, user_id: userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    await wishlist.update(updateData);
    return wishlist;
  }

  async deactivateWishlist(
    wishlistId: number,
    userId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistModel.findOne({
      where: { id: wishlistId, user_id: userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    await wishlist.update({ status: 'inactive' });
    return wishlist;
  }

  async getWishlists(userId: number): Promise<WishlistWithBooks[]> {
    const wishlists = await this.wishlistModel.findAll({
      where: { user_id: userId },
    });
    const wishlistIds = wishlists.map((wishlist) => wishlist.id);
    const wishlistBooks = wishlistIds.length
      ? await this.wishlistBookModel.findAll({
          where: { wishlist_id: { [Op.in]: wishlistIds } },
        })
      : [];
    const bookIds = [...new Set(wishlistBooks.map(({ book_id }) => book_id))];
    const books = bookIds.length
      ? await this.bookModel.findAll({ where: { id: { [Op.in]: bookIds } } })
      : [];
    const booksById = new Map(books.map((book) => [book.id, book]));
    const wishlistBooksByWishlistId = new Map<number, WishlistBookWithBook[]>();

    for (const wishlistBook of wishlistBooks) {
      const book = booksById.get(wishlistBook.book_id);
      if (!book) {
        throw new NotFoundException(
          'A book associated with this wishlist was not found',
        );
      }

      const wishlistBookDetails =
        wishlistBooksByWishlistId.get(wishlistBook.wishlist_id) ?? [];
      wishlistBookDetails.push({
        id: wishlistBook.id,
        wishlist_id: wishlistBook.wishlist_id,
        book_id: wishlistBook.book_id,
        category: wishlistBook.category,
        book,
      });
      wishlistBooksByWishlistId.set(
        wishlistBook.wishlist_id,
        wishlistBookDetails,
      );
    }

    return wishlists.map((wishlist) => ({
      ...wishlist.toJSON(),
      wishlist_books: wishlistBooksByWishlistId.get(wishlist.id) ?? [],
    }));
  }

  async deleteWishlistItem(
    wishlistId: number,
    wishlistItemId: number,
    userId: number,
  ): Promise<WishlistBook> {
    const wishlist = await this.wishlistModel.findOne({
      where: { id: wishlistId, user_id: userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const wishlistItem = await this.wishlistBookModel.findOne({
      where: { id: wishlistItemId, wishlist_id: wishlistId },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }

    await wishlistItem.destroy();
    return wishlistItem;
  }

  async updateWishlistItem(
    wishlistId: number,
    wishlistItemId: number,
    destinationWishlistId: number,
    userId: number,
  ): Promise<WishlistBook> {
    const [sourceWishlist, destinationWishlist] = await Promise.all([
      this.wishlistModel.findOne({
        where: { id: wishlistId, user_id: userId },
      }),
      this.wishlistModel.findOne({
        where: { id: destinationWishlistId, user_id: userId },
      }),
    ]);

    if (!sourceWishlist || !destinationWishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const wishlistItem = await this.wishlistBookModel.findOne({
      where: { id: wishlistItemId, wishlist_id: wishlistId },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }

    if (wishlistId === destinationWishlistId) {
      return wishlistItem;
    }

    const existingItem = await this.wishlistBookModel.findOne({
      where: {
        wishlist_id: destinationWishlistId,
        book_id: wishlistItem.book_id,
      },
    });

    if (existingItem) {
      throw new ConflictException('Book is already in the destination wishlist');
    }

    await wishlistItem.update({ wishlist_id: destinationWishlistId });
    return wishlistItem;
  }

  /**
   * Generate a normalized dedupe key from title and author
   */
  private normalizeKey(title: string, author: string): string {
    return `${title.toLowerCase().trim()}|${author.toLowerCase().trim()}`;
  }

  /**
   * Find or create a catalog book
   */
  private async findOrCreateBook(bookData: {
    title: string;
    author: string;
    isbn?: string;
    thumbnail?: string;
    description?: string;
  }): Promise<Book> {
    // If ISBN is provided and not empty, use it as the unique key
    if (bookData.isbn && bookData.isbn.trim()) {
      let book = await this.bookModel.findOne({
        where: { isbn: bookData.isbn.trim() },
      });
      if (book) {
        return book;
      }
      // Create with ISBN
      return this.bookModel.create({
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn.trim(),
        isbn_unique: bookData.isbn.trim(),
        thumbnail: bookData.thumbnail,
        description: bookData.description,
      } as any);
    }

    // Otherwise use normalized title|author as the key
    const normalizedKey = this.normalizeKey(bookData.title, bookData.author);
    let book = await this.bookModel.findOne({
      where: { isbn_unique: normalizedKey },
    });
    if (book) {
      return book;
    }

    // Create without ISBN
    return this.bookModel.create({
      title: bookData.title,
      author: bookData.author,
      isbn: null,
      isbn_unique: normalizedKey,
      thumbnail: bookData.thumbnail,
      description: bookData.description,
    } as any);
  }

  async libraryCollection(libraryId: number, req: any): Promise<any[]> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        console.error('Token not found');
        return [];
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

      const libraryData = library_owner?.toJSON();

      if (libraryData) {
        // User owns the library
        const copies = await this.libraryBookModel.findAll({
          where: { library_id: libraryId, owner_id: userId },
          include: [{ model: Book, as: 'book' }],
        });
        return copies;
      }

      // User doesn't own the library, check for approved access
      const access = await this.libraryAccessModel.findOne({
        where: {
          library_id: libraryId,
          user_id: userId,
          status: 'approved',
        },
      });

      if (access) {
        const library = await this.libraryModel.findOne({
          where: { id: libraryId },
        });

        if (!library) {
          throw new NotFoundException('Library not found');
        }

        return this.libraryBookModel.findAll({
          where: {
            library_id: libraryId,
            owner_id: library.user_id,
          },
          include: [{ model: Book, as: 'book' }],
        });
      }

      throw new BadRequestException(
        'You do not have access to this library',
      );
    } catch (error) {
      console.error('Error in libraryCollection:', error);
      throw new InternalServerErrorException(
        'Could not fetch library collection',
      );
    }
  }

  /**
   * Find a single library copy by ID
   */
  async findOne(id: number): Promise<LibraryBook> {
    const copy = await this.libraryBookModel.findOne({
        where: {
          book_id: id,
          owner_id: 1
        },
        include: [{ model: Book, as: 'book' }]
      })

    if (!copy) {
      throw new NotFoundException(`Book copy with id ${id} not found`);
    }
    return copy;
  }

  /**
   * Create a new book copy in a library
   * Finds or creates the catalog book, then creates a library_book copy
   */
  async create(bookData: any): Promise<LibraryBook> {
    // Find or create catalog book
    const catalogBook = await this.findOrCreateBook({
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      thumbnail: bookData.thumbnail,
      description: bookData.description,
    });

    // Create library_book (the physical copy)
    return this.libraryBookModel.create({
      book_id: catalogBook.id,
      library_id: bookData.library_id,
      owner_id: bookData.owner_id,
      status: bookData.status || 'active',
      is_private: bookData.is_private ?? false,
      borrower_id: bookData.borrower_id || null,
      borrowed_at: bookData.borrowed_at || new Date(),
      return_by_date: bookData.return_by_date || null,
    } as LibraryBook);
  }

  /**
   * Update a library book copy
   * Catalog fields (title, author, isbn, thumbnail, description) update the shared book
   * Copy fields (status, borrower_id, is_private, return_by_date) update the library_book
   */
  async updateBook(id: number, updateData: any): Promise<LibraryBook> {
    try {
      const copy = await this.findOne(id);

      // Separate catalog vs copy fields
      const catalogFields = ['title', 'author', 'isbn', 'thumbnail', 'description'];
      const catalogUpdates = {};
      const copyUpdates = {};

      for (const [key, value] of Object.entries(updateData)) {
        if (catalogFields.includes(key)) {
          catalogUpdates[key] = value;
        } else {
          copyUpdates[key] = value;
        }
      }

      // Update catalog book if there are catalog changes
      if (Object.keys(catalogUpdates).length > 0) {
        await this.bookModel.update(catalogUpdates, {
          where: { id: copy.book_id },
        });
      }

      // Update library_book copy if there are copy changes
      if (Object.keys(copyUpdates).length > 0) {
        await copy.update(copyUpdates);
      }

      // Return updated copy with book
      return this.findOne(id);
    } catch (error) {
      console.error('Sequelize Update Error:', error);
      throw error;
    }
  }

  /**
   * Request to borrow a library_book copy
   */
  async requestBorrow(libraryBookId: number, borrowerId: number, returnByDate: Date) {
    const copyRecord = await this.libraryBookModel.findByPk(libraryBookId);
    if (!copyRecord) {
      throw new NotFoundException('Book copy not found');
    }
    const copy = copyRecord.toJSON();
    if (!copy) {
      throw new NotFoundException('Book copy not found');
    }
    if (copy.is_private) {
      throw new BadRequestException('Book is not available for borrowing');
    }

    const existingRequest = await this.bookRequestModel.findOne({
      where: { library_book_id: libraryBookId, borrower_id: borrowerId, status: 'pending' },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'You have already requested to borrow this book',
      );
    }

    return this.bookRequestModel.create({
      library_book_id: libraryBookId,
      borrower_id: borrowerId,
      owner_id: copy.owner_id,
      library_id: copy.library_id,
      return_by_date: returnByDate,
      status: 'pending',
    } as BookRequest);
  }

  /**
   * Respond to a borrow request
   */
  async respondToBorrow(requestId: number, response: string) {
    try {
      const request = await this.bookRequestModel.findByPk(requestId);
      if (!request) {
        throw new NotFoundException('Borrow request not found');
      }

      const copy = await this.libraryBookModel.findByPk(request.library_book_id);
      if (!copy) {
        throw new NotFoundException('Book copy not found');
      }

      if (response === 'approved') {
        await this.libraryBookModel.update(
          {
            borrower_id: request.borrower_id,
            status: 'borrowed',
            return_by_date: request.return_by_date,
          },
          { where: { id: request.library_book_id } },
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

  /**
   * Get all borrow requests for an owner
   */
  async getBorrowRequests(ownerId: number) {
    try {
      const requests = await this.bookRequestModel.findAll({
        where: { owner_id: ownerId },
        include: [
          { model: LibraryBook, as: 'library_book', include: [Book] },
        ],
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

  /**
   * Fetch all borrow requests for a given library_book copy
   */
  async getLibraryBorrowRequests(libraryBookId: number) {
    try {
      // Fetch all borrow requests for the given library_book ID
      const bookRequests = await this.bookRequestModel.findAll({
        where: { library_book_id: libraryBookId },
      });
      console.log("getLibraryBorrowRequests: ", bookRequests)

      if (!bookRequests || bookRequests.length === 0) {
        console.error(
          'No borrow requests found for this book',
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
        'An error occurred while retrieving borrow requests for the book',
      );
    }
  }

  /**
   * Get library_book copy by ID
   */
  async getById(libraryBookId: number): Promise<LibraryBook> {
    try {
      const copy = await this.libraryBookModel.findByPk(libraryBookId, {
        include: [{ model: Book, as: 'book' }],
      });
      if (!copy) {
        throw new NotFoundException(`Book copy with libraryBookId ${libraryBookId} not found`);
      }
      return copy;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching book details',
      );
    }
  }

  /**
   * Update thumbnail for a catalog book (shared across all copies)
   */
  async updateThumbnail(
    catalogBookId: number,
    thumbnail: string,
  ): Promise<Book> {
    const book = await this.bookModel.findByPk(catalogBookId);
    if (!book) {
      throw new NotFoundException(`Book with id ${catalogBookId} not found`);
    }

    await this.bookModel.update({ thumbnail }, { where: { id: catalogBookId } });

    const updatedBook = await this.bookModel.findByPk(catalogBookId);
    if (!updatedBook) {
      throw new InternalServerErrorException(
        'Unable to retrieve the updated book',
      );
    }

    return updatedBook;
  }

  /**
   * Get all books borrowed by a user
   */
  async borrowedBooks(borrower_id: number): Promise<LibraryBook[]> {
    const copies = await this.libraryBookModel.findAll({
      where: {
        borrower_id: borrower_id,
      },
      include: [{ model: Book, as: 'book' }],
    });
    return copies;
  }

  /**
   * Create or update a book handover for a library_book copy
   */
  async createBookHandover(handoverDetails: {
    library_book_id: number;
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
      const copy = await this.libraryBookModel.findByPk(handoverDetails.library_book_id);
      if (!copy?.toJSON()) {
        throw new NotFoundException('Book copy not found.');
      }

      const existingHandover = await this.bookHandoverModel.findOne({
        where: {
          library_book_id: handoverDetails.library_book_id,
          borrower_id: handoverDetails.borrower_id,
          lender_id: copy?.toJSON().owner_id,
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
          book_handover_type: handoverDetails?.book_handover_type || 'borrow',
        });
        return updatedHandover;
      }

      const newHandover = await this.bookHandoverModel.create({
        handover_confirmed: false,
        handover_status: 'pending',
        library_book_id: handoverDetails.library_book_id,
        lender_id: copy?.toJSON().owner_id,
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

  /**
   * Get the latest handover for a library_book copy
   */
  async getBookHandoverByBookId(libraryBookId: number) {
    try {
      const handover = await this.bookHandoverModel.findOne({
        where: { library_book_id: libraryBookId },
        order: [['createdat', 'DESC']],
      });

      if (!handover) {
        throw new NotFoundException(
          `Handover record for library_book_id ${libraryBookId} not found`,
        );
      }

      return handover;
    } catch (error) {
      console.error('Error in getBookHandoverByBookId:', error);
      return [];
    }
  }
}
