import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from '../models/book.model';

@Injectable()
export class BookService {
  constructor(@InjectModel(Book) private bookModel: typeof Book) {}

  async findAll(): Promise<Book[]> {
    return this.bookModel.findAll();
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

  async update(id: number, updateData: Partial<Book>): Promise<Book> {
    const book = await this.findOne(id);
    return book.update(updateData);
  }
}
