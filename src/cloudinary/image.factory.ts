import { CloudinaryService } from './cloudinary.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageFactory {
  constructor(
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async saveImage(imageType: string, file: Express.Multer.File): Promise<string> {
    return this.uploadThumbnail(imageType, file);
    /*switch (imageType) {
      case 'user_thumbnail':
        return this.uploadThumbnail(imageType, file);
      case 'library_thumbnail':
        return this.uploadThumbnail(imageType, file);
      case 'book_thumbnail':
        return this.uploadThumbnail(imageType, file);
      // Add other image types like 'book_thumbnail', 'note_image', etc.
      default:
        throw new Error('Unsupported image type');
    } */
  }

  async uploadThumbnail(imageType: string, file: Express.Multer.File): Promise<string> {
    /*
    * Docs:
    * Here we are using the cloudinary service to upload user thumbnails.
    * This will return the Cloudinary URL to be saved in DB
    */
    return await this.cloudinaryService.uploadImage(file, imageType);
  }
}
