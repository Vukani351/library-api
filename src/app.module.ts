import { Module } from '@nestjs/common';
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
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const rawDialect = configService.get<string>('DB_DIALECT') || 'postgres';
        const dialect = (rawDialect === 'postgresql' ? 'postgres' : rawDialect) as any;
        const host = configService.get<string>('DB_HOST');
        const port = Number(configService.get<string | number>('DB_PORT')) || 5432;
        const username =
          configService.get<string>('DB_USERNAME') ||
          configService.get<string>('DB_USER');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_DATABASE');
        const useSsl =
          configService.get<string>('DB_SSL') === 'true' ||
          process.env.NODE_ENV === 'production';

        const dbConfig = {
          dialect,
          host,
          port,
          username,
          password,
          database,
        };

        console.warn(
          'Attempting to connect to the database with config:',
          JSON.stringify({
            dialect: dbConfig.dialect ?? null,
            host: dbConfig.host ?? null,
            port: dbConfig.port ?? null,
            username: dbConfig.username ?? null,
            database: dbConfig.database ?? null,
            ssl: useSsl,
            password: dbConfig.password ? '***' : null,
          }),
        );

        try {
          const sequelizeOptions: Record<string, any> = {
            ...dbConfig,
            autoLoadModels: true,
            synchronize: true,
          };

          if (useSsl) {
            sequelizeOptions.dialectOptions = {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            };
          }

          console.warn('Database configuration prepared successfully.');
          return sequelizeOptions;
        } catch (error) {
          console.error('Failed to prepare database configuration.', error);
          throw error;
        }
      },
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    BookModule,
    LibraryModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}