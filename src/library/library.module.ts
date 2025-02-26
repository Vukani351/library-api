import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Library } from '../models/library.model';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwtConstants';
import { LibraryAccess } from 'src/models/library-access.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Library, LibraryAccess]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
