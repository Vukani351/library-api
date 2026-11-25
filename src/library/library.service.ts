import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Library } from '../models/library.model';
import { LibraryAccess } from 'src/models/library-access.model';
import { User } from 'src/models/user.model';
import { Op, Sequelize } from 'sequelize';
import { CreateBookInputDto } from 'src/dto/CreateBookInputDto';
import { Book } from 'src/models/book.model';
import { LibraryBook } from 'src/models/library-book.model';
import { BookService } from 'src/book/book.service';

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(
    @InjectModel(Library) private libraryModel: typeof Library,
    @InjectModel(Book) private readonly bookModel: typeof Book,
    @InjectModel(LibraryBook) private readonly libraryBookModel: typeof LibraryBook,
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(LibraryAccess) private libraryAccessModel: typeof LibraryAccess,
    @InjectModel(User) private UserModel: typeof User,
    private readonly bookService: BookService,
  ) {}

  async findAll(): Promise<Library[]> {
    return this.libraryModel.findAll();
  }

  async getLibraryByName(name: string): Promise<Library[]> {
    try {
      /* todo:
      * Find a library by its name
      * add logic to also search by name
      */
      const libraries = await this.libraryModel.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`,
          },
        },
      });

      if (libraries.length === 0) {
        throw new NotFoundException(`Library with a name like "${name}" not found`);
      }

      return libraries;
    } catch (error) {
      console.error('Error in getLibraryByName:', error);
      console.error('Sorry, there is an issue with library by name. ');
      throw error;
    }
  }

  async getLibrary(userId: number): Promise<Library | any> {
    try {
      /* 
       * TODO:
       * Find a library using user id.
       * Check if the library exists.
       * If it does not exist, create one.
       * Return the library list when there is more than one.
       * User will have to pick which one from a drop down.
      */
      const library = await this.libraryModel.findOne({
        where: { user_id: userId },
      });

      if (!library) {
        throw new NotFoundException(`Library by the user ${userId} not found`);
      }

      // get the library requests:
      const lib_requests = this.getUserLibraryRequests(userId);
      const libraryClone = library ? { ...library.toJSON(), requests: lib_requests } : null;
      return libraryClone;
    } catch (error) {
      const library = this.create({
        user_id: userId,
        name: 'Home Library',
        description: 'My Home Library',
      });

      const lib_requests = this.getUserLibraryRequests(userId);
      const libraryClone = library ? { ...(await library).toJSON(), requests: lib_requests } : null;
      return libraryClone;
      //throw new Error('Sorry, there is an issue with library by user id. Please try again.', error);
    }
  }

  async create(library: Partial<Library>): Promise<Library> {
    return this.libraryModel.create(library as Library);
  }

  async update(id: string, updateData: Partial<Library>): Promise<Library> {
    const library = await this.libraryModel.findByPk(id);
    if (!library) {
      throw new NotFoundException(`Library with id ${id} not found`);
    }
    return library.update(updateData);
  }

  async remove(id: number): Promise<void> {
    const library = await this.libraryModel.findByPk(id);
    if (!library) {
      throw new NotFoundException(`Library with id ${id} not found`);
    }
    await library.destroy();
  }

  async requestAccess(userId: number, libraryId: number) {
    const libraryDetails = await this.fetchLibraryData(libraryId);

    const existingRequest = await this.libraryAccessModel.findOne({
      where: { user_id: userId, library_id: libraryId },
    });

    if (existingRequest) {
      return existingRequest;
    }
    return this.libraryAccessModel.create({
      user_id: userId,
      library_id: libraryId,
      owner_id: libraryDetails.user_id,
      status: 'pending',
      requested_at: new Date(),
    });
  }

  async approveAccess(requestId: number, response: string) {
    if (response === "" || !response) {
      throw new Error('Response is required.');
    }
    if (!requestId) {
      throw new Error('Request ID is required.');
    }
    const accessRequest = await this.libraryAccessModel.findByPk(requestId);
    if (!accessRequest) {
      throw new NotFoundException('Library Request Access does not exist.');
    }

    await this.libraryAccessModel.update(
      {
        status: response == 'approved' ? 'approved' : 'rejected',
        approved_at: new Date()
      },
      { where: { id: requestId } },
    );
    return this.libraryAccessModel.findByPk(requestId);
  }

  /*
    * TODO:
    * USE THIS GUY TO GET THE USER ID FROM THE TOKEN
    * const payload = await this.jwtService.verifyAsync(token, {
    *   secret: jwtConstants.secret,
    * });
  */

  async getLibrariesRequests(libraryId: number) {
    try {
      const requestedLibraries = await this.libraryAccessModel.findAll({
        where: { library_id: libraryId },
      });

      const libraryRequests = await Promise.all(
        requestedLibraries.map(async (library) => {
          const libJson = library.toJSON();

          const libraryDetails = await this.fetchLibraryData(libJson.library_id);

          const { name, email } = await this.getUserById(libJson.user_id).then((data) => {
            return data.toJSON();
          });

          return { ...libJson, ...{ name, email } };
        })
      );

      return libraryRequests;
    } catch (error) {
      throw error;
    }
  }

  /*
  * todo: 
  * function to get all the requests a user has made to see libraries.
  * should return list of library requests, approved and denied.
  */
  async getUserLibraryRequests(userId: number): Promise<any[]> {
    try {
      const access = await this.libraryAccessModel.findAll({
        where: { user_id: userId },
      });

      if (!access || access.length === 0) {
        console.warn(`No library requests found for user with ID ${userId}`);
      }

      const libraryRequests = await Promise.all(
        access.map(async (library) => {
          const libraryJson = library.toJSON();

          // Validate that library_id exists
          if (!libraryJson.library_id) {
            console.error(`Invalid library_id for access record:`, libraryJson);
            throw new Error(`Invalid library_id for access record with ID ${libraryJson.id}`);
          }

          const libraryDetails = await this.fetchLibraryData(libraryJson.library_id);

          const userData = await this.getUserById(libraryDetails.user_id);
          const userJson = userData.toJSON();

          const extendedLibrary = {
            ...libraryJson,
            library_name: libraryDetails.name,
            thumbnail: libraryDetails.thumbnail,
            owner_thumbnail: userJson?.thumbnail,
            owner_name: userJson.name,
            owner_email: userJson.email,
          };

          return extendedLibrary;
        })
      );

      return libraryRequests;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  private async fetchLibraryData(libraryId: number): Promise<any> {
    const libraryData = await this.libraryModel.findOne({
      where: { id: libraryId },
    });

    if (!libraryData) {
      console.error(`Library not found for ID: ${libraryId}`);
      throw new NotFoundException(`Library with ID ${libraryId} not found`);
    }

    return libraryData.toJSON();
  }
  async getUserById(id: number): Promise<User> {
    const user = (await this.UserModel.findByPk(id)) as User;
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async updateLibraryThumbnail(libraryId: number, imageUrl: string): Promise<Library | null> {
    try {
      const library = await this.libraryModel.findByPk(libraryId);
      if (!library) {
        throw new NotFoundException(`Library with id ${libraryId} not found`);
      }

      await this.libraryModel.update(
        { thumbnail: imageUrl },
        { where: { id: libraryId } }
      );

      return await this.libraryModel.findByPk(libraryId);
    } catch (error) {
      console.error('Failed to update library thumbnail:\n', error);
      return null
    }
  }
  /**
   * Process batch book import with find-or-create logic
   * - Finds or creates catalog books based on ISBN or normalized title+author
   * - Creates library_book copies for each book in the library
   * - Derives library_id and owner_id from request context (not from payload)
   * - Uses savepoints to allow partial success if one insert fails
   */
  async processBookBatchWithReport(
    userId: number,
    libraryId: number,
    bookInputList: CreateBookInputDto[],
  ) {
    const libraryData = await this.fetchLibraryData(libraryId);
    if (libraryData.user_id !== userId) {
      throw new NotFoundException('You do not own this library.');
    }

    const failureList: { bookTitle?: string; error: string; data: CreateBookInputDto }[] = [];
    const successfulInsertions: LibraryBook[] = [];

    return this.sequelize.transaction(async (t) => {
      this.logger.log(`Starting transaction for batch of ${bookInputList.length} books.`);

      for (const bookInput of bookInputList) {
        const savepointId = `sp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        try {
          // Create savepoint for partial success
          await this.sequelize.query(`SAVEPOINT ${savepointId}`, { transaction: t });
          // Use BookService's find-or-create logic
          const libraryBook = await this.bookService.create({
            title: bookInput.title,
            author: bookInput.author,
            isbn: bookInput.isbn || null,
            thumbnail: bookInput.thumbnail || null,
            description: bookInput.description || null,
            // Override payload values with context values for security
            library_id: libraryId,
            owner_id: userId,
            status: bookInput.status || 'active',
            is_private: bookInput.is_private ?? false,
            borrower_id: null,
            return_by_date: bookInput.return_by_date || null,
            borrowed_at: new Date(),
          });
          successfulInsertions.push(libraryBook);
        } catch (error) {
          this.logger.error(`Failed to insert book: ${bookInput.title}`, error);

          failureList.push({
            bookTitle: bookInput.title,
            error: error instanceof Error ? error.message : 'Unknown database error',
            data: bookInput,
          });

          // Rollback to savepoint on error, but continue processing
          try {
            await this.sequelize.query(`ROLLBACK TO SAVEPOINT ${savepointId}`, { transaction: t });
          } catch (e) {
            this.logger.warn('Savepoint rollback failed, continuing', e);
          }
        }
      }

      this.logger.log(`Processed ${bookInputList.length} total. ${successfulInsertions.length} success, ${failureList.length} failure.`);

      return {
        message: `Batch process completed. ${failureList.length} failure(s) occurred.`,
        summary: {
          totalProcessed: bookInputList.length,
          successCount: successfulInsertions.length,
          failureCount: failureList.length,
        },
        failures: failureList,
        inserted: successfulInsertions,
      };
    });
  }
}