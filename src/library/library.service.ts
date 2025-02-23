import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Library } from './library.model';

@Injectable()
export class LibraryService {
  constructor(@InjectModel(Library) private libraryModel: typeof Library) {}

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
}
