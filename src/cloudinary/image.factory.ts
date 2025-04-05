// image.factory.ts
// import { CloudinaryService } from './cloudinary.service';
import { Injectable } from '@nestjs/common';
import { UserThumbnailService } from './UserThumbnail.service';

@Injectable()
export class ImageFactory {
  constructor(
    private readonly userThumbnailService: UserThumbnailService,
  ) {}

  async saveImage(imageType: string, file: Express.Multer.File): Promise<string> {
    switch (imageType) {
      case 'user_thumbnail':
        return this.userThumbnailService.uploadThumbnail(file);
      // Add other image types like 'book_thumbnail', 'note_image', etc.
      default:
        throw new Error('Unsupported image type');
    }
  }
}
