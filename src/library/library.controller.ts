import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
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

  @UseGuards(AuthGuard) // turn this on when its working & ensure that ui is conforming
  @Get()
  findAll(@Query('name') name: string) {
    console.log('NAME: ', name);
    if (!name) {
      throw new Error('Query parameter "name" is required');
    }
    return this.libraryService.getLibraryByName(name);
  }

  @UseGuards(AuthGuard)// - turn this on when its working & ensure that ui is conforming
  @Get(':id')
  findOne(@Param('id') userId: string) {
    console.log('USER ID', userId);
    return this.libraryService.getLibrary(+userId);
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
  requestAccess(
    @Body() { userId, libraryId }: { userId: number; libraryId: number },
  ) {
    return this.libraryService.requestAccess(userId, libraryId);
  }

  @UseGuards(AuthGuard)
  @Get('/:userId/:libraryId/requests')
  getLibraryRequests(
    @Param('userId') userId: number,
    @Param('libraryId') libraryId: number,
  ): any {
    return this.libraryService.getUserLibrariesRequests(userId, libraryId); // might not need to use this to get the id but token.
  }

  @UseGuards(AuthGuard)
  @Put(':requestId/approve')
  async approveAccess(@Param('requestId') requestId: number) {
    return this.libraryService.approveAccess(requestId);
  }
  
  // @Post(':id/thumbnail')
  // async updateThumbnail(
  //   @Param('id') userId: number,
  //   @Body('thumbnail') thumbnailUrl: string,
  // ): Promise<User> {
  //   if (!thumbnailUrl) {
  //     throw new BadRequestException('Thumbnail URL is required');
  //   }
  //   return this.userService.updateUserThumbnail(userId, thumbnailUrl);
  // }
  
}
