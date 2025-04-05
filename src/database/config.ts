// src/database/config.ts
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

module.exports = {
  development: {
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    dialect: 'mysql',
    migrationStorageTableName: 'sequelize_meta',
  },
  production: {
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    dialect: 'mysql',
    migrationStorageTableName: 'sequelize_meta',
  }
};