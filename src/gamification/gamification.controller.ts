
import { Controller, Get, Param } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { UserAchievement, UserPoints } from './gamification.types';

@Controller('gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Get('points/:userId')
    async getUserPoints(@Param('userId') userId: string): Promise<UserPoints> {
        return this.gamificationService.getUserPoints(userId);
    }

    @Get('achievements/:userId')
    async getUserAchievements(@Param('userId') userId: string): Promise<UserAchievement[]> {
        return this.gamificationService.getUserAchievements(userId);
    }
}