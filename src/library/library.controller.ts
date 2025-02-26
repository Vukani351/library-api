import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { Library } from '../models/library.model';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post('create')
  create(@Body() library: Partial<Library>) {
    return this.libraryService.create(library);
  }

  @Get()
  findAll() {
    return this.libraryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.libraryService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateLibrary: Partial<Library>) {
    return this.libraryService.update(+id, updateLibrary);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libraryService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/request')
  async requestAccess(
    @Param('id') libraryId: number,
    @Body('userId') userId: number,
  ) {
    return this.libraryService.requestAccess(userId, libraryId);
  }

  @UseGuards(AuthGuard)
  @Post('access/:requestId/approve')
  async approveAccess(@Param('requestId') requestId: number) {
    return this.libraryService.approveAccess(requestId);
  }

  // @UseGuards(AuthGuard)
  // @Get('user/:userId')
  // async getUserLibraries(@Param('userId') userId: number) {
  //   return this.libraryService.getUserLibraries(userId);
  // }
}
