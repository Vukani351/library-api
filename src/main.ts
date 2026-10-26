import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const environment = process.env.NODE_ENV || 'development';
  dotenv.config({ path: `.env.${environment}` });

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Activating the global validation pipe.
  // 'whitelist: true' ensures any properties NOT defined in the DTO are stripped out automatically.
  // 'transform: true' converts incoming plain objects to class instances.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // ---------------------
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
