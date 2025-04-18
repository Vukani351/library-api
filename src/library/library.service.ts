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
    // Check if the library exists
    const library = await this.libraryModel.findByPk(libraryId);
    if (!library) {
      throw new NotFoundException('Library not found');
    }

    // Check if access request already exists
    const existingRequest = await this.libraryAccessModel.findOne({
      where: { user_id: userId, library_id: libraryId },
    });

    if (existingRequest) {
      return existingRequest; // If request exists, return it
    }

    // Create new access request
    return this.libraryAccessModel.create({
      user_id: userId,
      library_id: libraryId,
      status: 'pending',
    } as LibraryAccess);
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
        status: response === 'approved'? 'approved': 'denied',
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

      const library_requests = await Promise.all(
        requestedLibraries.map(async (library) => {
          const libJson = library.toJSON();
          const { name, email } = await this.getUserById(libJson.user_id).then(data => {
            return data.toJSON();
          });
          return { ...libJson, user_data: { name, email } };
        }),
      );

      return library_requests;
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
      // Fetch all library access requests for the user
      const access = await this.libraryAccessModel.findAll({
        where: { user_id: userId },
      });

      if (!access || access.length === 0) {
        throw new NotFoundException(`No library requests found for user with ID ${userId}`);
      }

      // Use Promise.all to resolve all async operations in the map
      const libraryRequests = await Promise.all(
        access.map(async (library) => {
          const libraryJson = library.toJSON();

          // Validate that library_id exists
          if (!libraryJson.library_id) {
            console.error(`Invalid library_id for access record:`, libraryJson);
            throw new Error(`Invalid library_id for access record with ID ${libraryJson.id}`);
          }

          // Fetch library data
          const libraryData = await this.libraryModel.findOne({
            where: { id: libraryJson.library_id },
          });

          if (!libraryData) {
            console.error(`Library not found for ID: ${libraryJson.library_id}`);
            throw new NotFoundException(`Library with ID ${libraryJson.library_id} not found`);
          }

          const libraryDetails = libraryData.toJSON();

          // Fetch user data for the library
          const userData = await this.getUserById(libraryDetails.user_id);
          const userJson = userData.toJSON();

          // Combine library, user, and library name data
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
      throw new InternalServerErrorException(
        'Failed to fetch library requests. Please try again later.'
      );
    }
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
     // Check if the user exists
     const library = await this.libraryModel.findByPk(libraryId);
     if (!library) {
       throw new NotFoundException(`Library with id ${libraryId} not found`);
     }
     
     // Update the thumbnail field using the update method
     await this.libraryModel.update(
       { thumbnail: imageUrl },
       { where: { id: libraryId } }
     );
     
     return await this.libraryModel.findByPk(libraryId);
   } catch (error) {
      throw new InternalServerErrorException('Failed to update library thumbnail:\n', error);
   }
  }
}