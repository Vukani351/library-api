import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';

@Module({
    imports: [], // Add any other modules this module depends on, e.g., for database access
    controllers: [GamificationController],
    providers: [GamificationService],
    exports: [GamificationService], // Export the service so other modules can use it
})
export class GamificationModule { }