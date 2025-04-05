// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      // Convert the file buffer to base64
      const base64String = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${base64String}`;

      const result = await cloudinary.v2.uploader.upload(dataURI, {
        resource_type: "auto",
        public_id: `user_${Date.now()}`, // Generate unique ID
        folder: 'user_thumbnails',
      });
      
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }
}
