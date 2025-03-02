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

  async findOne(id: number): Promise<Library> {
    const library = await this.libraryModel.findByPk(id);
    if (!library) {
      throw new NotFoundException(`Library with id ${id} not found`);
    }
    return library;
  }

  async create(library: Partial<Library>): Promise<Library> {
    return this.libraryModel.create(library as Library);
  }

  async update(id: number, updateData: Partial<Library>): Promise<Library> {
    const library = await this.findOne(id);
    return library.update(updateData);
  }

  async remove(id: number): Promise<void> {
    const library = await this.findOne(id);
    await library.destroy();
  }

  async requestAccess(userId: number, libraryId: number) {
    // Check if the library exists
    const library = await this.libraryModel.findByPk(libraryId);
    // return { DATA: { Libr: library?.toJSON(), MSSSG: 'TESTING' } };
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

    return this.libraryAccessModel.update(
      { status: 'approved' },
      { where: { id: requestId, approved_at: Date.now() } },
    );
  }

  /*
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

  /**/
}
