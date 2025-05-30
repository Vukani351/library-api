import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Library } from '../models/library.model';
import { LibraryAccess } from 'src/models/library-access.model';
import { User } from 'src/models/user.model';
import { Op } from 'sequelize';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library) private libraryModel: typeof Library,
    @InjectModel(LibraryAccess)
    private libraryAccessModel: typeof LibraryAccess,
    @InjectModel(User) private UserModel: typeof User,
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
      throw new InternalServerErrorException('Sorry, there is an issue with library by name. ' + error.message);
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

  async update(id: number, updateData: Partial<Library>): Promise<Library> {
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
    console.dir({ userId, libraryDetails }, { depth: null });
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
        status: response == 'approved'? 'approved': 'rejected',
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
      throw new Error('Sorry, there is an issue. Please try requesting library requests again.\n', error);
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
}