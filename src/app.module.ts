import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';
import { LibraryModule } from './library/library.module';
import { UserModule } from './user/user.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Make the ConfigModule available globally
      isGlobal: true,
      // Conditionally load .env.development if NODE_ENV=development, else .env:
      envFilePath: process.env.NODE_ENV === 'development' 
        ? '.env.development'
        : '.env',
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        try {
          return {
            dialect: configService.get<string>('DB_DIALECT') as any,
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            autoLoadModels: true,
            synchronize: true, // Auto-sync models (turn off in production)
          };
        } catch (error) {
          Logger.error('Failed to connect to the database');
          throw new Error('Failed to connect to the database');
        }
      },
      inject: [ConfigService],
    }),
    MulterModule.register({
      dest: './uploads', // Set the destination folder for temp file storage
    }),
    BookModule,
    LibraryModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
