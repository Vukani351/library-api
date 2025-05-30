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
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { Library } from '../models/library.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFactory } from 'src/cloudinary/image.factory';

@Controller('library')
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly imageFactory: ImageFactory
  ) { }

  @Post('create')
  create(@Body() library: Partial<Library>) {
    return this.libraryService.create(library);
  }

  // @UseGuards(AuthGuard)
  @Get("all")
  findAllLibraries() {
    return this.libraryService.findAll();
  } 

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('name') name: string) {
    if (!name) {
      throw new Error('Query parameter "name" is required.');
    }
    return this.libraryService.getLibraryByName(name);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') userId: string) {
    return this.libraryService.getLibrary(+userId);
  }

  @UseGuards(AuthGuard)
  @Get('user-requests/:userId')
  getUserLibrariesRequests(@Param('userId') userId: number) {
    return this.libraryService.getUserLibraryRequests(userId);
  }

  @UseGuards(AuthGuard)
  @Get('library-requests/:libraryId')
  getLibraryRequests(@Param('libraryId') libraryId: string): any {
    return this.libraryService.getLibrariesRequests(+libraryId);
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
  @Post(':libraryId/:userId/request')
  requestAccess(
    @Param('userId') userId: number,
    @Param('libraryId') libraryId: number,
  ) {
    return this.libraryService.requestAccess(userId, libraryId);
  }

  @UseGuards(AuthGuard)
  @Post(':requestId/response')
  async approveAccess(
    @Param('requestId') requestId: number,
    @Body('response') response: string) {
    return this.libraryService.approveAccess(requestId, response);
  }
  
  @Post(':libraryId/thumbnail')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async updateThumbnail(
    @Param('libraryId') libraryId: number,
    @UploadedFile() thumbnail: Express.Multer.File,
  ): Promise<Library> {
    if (!thumbnail) {
      throw new BadRequestException('Thumbnail URL is required');
    }
    if(libraryId === null || libraryId === undefined) {
      throw new BadRequestException('User ID is required');
    }

    // Save image to Cloudinary
    const publicUrl = await this.imageFactory.saveImage(
      'library_thumbnail',
      thumbnail,
    );

    // Update the library's thumbnail URL in the database
    const updatedLibrary = await this.libraryService.updateLibraryThumbnail(libraryId, publicUrl);
    if (!updatedLibrary) {
      throw new BadRequestException('Failed to update library thumbnail.');
    }
    return updatedLibrary;
  }
  
  // :id/borrow-history
}
