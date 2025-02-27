import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Library } from '../models/library.model';
import { LibraryAccess } from 'src/models/library-access.model';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library) private libraryModel: typeof Library,
    @InjectModel(LibraryAccess)
    private libraryAccessModel: typeof LibraryAccess,
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

  /**/
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

  async getUserLibraries(userId: number, libraryId: number) {
    /*
     * TOOD:
     * 1. Get all libraries that have requests.
     * 2. Get all the user names and emails. for display.
     */
    try {
      const approvedLibraries = await this.libraryAccessModel.findAll({
        where: { user_id: userId, library_id: libraryId },
      });
      return approvedLibraries;
    } catch (error) {
      return new Error('Sorry there is an issue, try again.', error);
    }
  }
  /**/
}
