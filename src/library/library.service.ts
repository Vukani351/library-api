import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Library } from '../models/library.model';
import { LibraryAccess } from 'src/models/library-access.model';
import { User } from 'src/models/user.model';
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

  async getLibrary(userId: number): Promise<Library> {
    try {
      /* TODO:
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
        this.create({ user_id: userId, name: 'Home Library', description: 'My Home Library' });
        throw new NotFoundException(`Library by the user ${userId} not found`);
      }
      return library;
    } catch (error) {
      throw new Error('Sorry, there is an issue. Please try again.');
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

  async approveAccess(requestId: number) {
    const accessRequest = await this.libraryAccessModel.findByPk(requestId);
    if (!accessRequest) {
      throw new NotFoundException('Library Request Access does not exist.');
    }

    await this.libraryAccessModel.update(
      { status: 'approved', approved_at: new Date() },
      { where: { id: requestId } },
    );
    return this.libraryAccessModel.findByPk(requestId);
  }

  /*
    * TODO:
    * USE THIS GUY TO GET THE USER ID FROM THE TOKEN
    const payload = await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    });
  */

  async getUserLibrariesRequests(userId: number, libraryId: number) {
    try {
      const requestedLibraries = await this.libraryAccessModel.findAll({
        where: { user_id: userId, library_id: libraryId },
      });

      const library_requests = await Promise.all(
        requestedLibraries.map(async (library) => {
          const libJson = library.toJSON();
          const userData = (await this.getUserById(libJson.user_id)).toJSON();
          const { name, email } = userData;
          return { ...libJson, user_data: { name, email } };
        }),
      );

      return library_requests;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Sorry, there is an issue. Please try again.');
    }
  }

  async getUserById(id: number): Promise<User> {
    const user = (await this.UserModel.findByPk(id)) as User;
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
