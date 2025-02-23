import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Library } from './library.model';

@Module({
  imports: [SequelizeModule.forFeature([Library])],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
