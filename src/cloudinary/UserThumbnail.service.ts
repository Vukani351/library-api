// user-thumbnail.service.ts

import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class UserThumbnailService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadThumbnail(file: Express.Multer.File): Promise<string> {
    // Here we are using the cloudinary service to upload user thumbnail
    const publicUrl = await this.cloudinaryService.uploadImage(file);
    return publicUrl; // This will return the Cloudinary URL to be saved in DB
  }
}
