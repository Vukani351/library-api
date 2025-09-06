
import { Injectable, Logger } from '@nestjs/common';
import { UserAchievement, EventType, Achievement, UserPoints } from './gamification.types';

@Injectable()
export class GamificationService {
    private readonly logger = new Logger(GamificationService.name);

    private userPointsStore: Map<string, number> = new Map();
    private userAchievementsStore: Map<string, UserAchievement[]> = new Map();

    private readonly POINT_VALUES: Record<EventType, number> = {
        'ADD_BOOK': 100,
        'COMPLETE_BOOK': 500,
        'LEND_BOOK': 50,
        'LEND_BOOK_FIRST_TIME': 1000,
        'LEND_BOOK_AGAIN': 200,
    };

    private readonly ACHIEVEMENTS: Achievement[] = [
        {
            name: 'The Scribe',
            description: 'Add 20 books to your library.',
            pointsAward: 500,
            requiredCount: 20,
            eventType: 'ADD_BOOK',
        },
        {
            name: 'The Librarian',
            description: 'Lend out 5 books.',
            pointsAward: 750,
            requiredCount: 5,
            eventType: 'LEND_BOOK',
        },
        {
            name: 'Bookworm',
            description: 'Complete 10 books.',
            pointsAward: 1000,
            requiredCount: 10,
            eventType: 'COMPLETE_BOOK',
        },
    ];

    /**
     * Main method to award points and check for new achievements.
     * This is the function your other services will call.
     */
    public async handleEvent(userId: string, event: EventType): Promise<string[]> {
        this.logger.log(`Handling event '${event}' for user '${userId}'`);

        // Award points for the event
        const pointsToAdd = this.POINT_VALUES[event];
        if (pointsToAdd) {
            await this.awardPoints(userId, pointsToAdd);
        } else {
            this.logger.warn(`No point value defined for event: ${event}`);
        }

        // Check for any new achievements
        const newAchievements = await this.checkForNewAchievements(userId, event);

        return newAchievements;
    }

    // --- Internal Helper Methods (private) ---

    private async awardPoints(userId: string, points: number): Promise<void> {
        this.logger.log(`Awarding ${points} points to user '${userId}'`);
        const currentPoints = this.userPointsStore.get(userId) || 0;
        this.userPointsStore.set(userId, currentPoints + points);
        this.logger.log(`User '${userId}' new point total: ${this.userPointsStore.get(userId)}`);
    }

    private async checkForNewAchievements(userId: string, event: EventType): Promise<string[]> {
        const newlyUnlocked: string[] = [];
        const userAchievements = this.userAchievementsStore.get(userId) || [];

        for (const achievement of this.ACHIEVEMENTS) {
            // Check if the user has already unlocked this achievement
            const isUnlocked = userAchievements.some(ua => ua.name === achievement.name);

            // Only check achievements relevant to the current event type
            if (!isUnlocked && achievement.eventType === event) {
                // --- IMPORTANT: This is where you would query your main database ---
                // Instead of this mock function, you would inject a service for your
                // main application's data (e.g., a BooksService) to get the real count.
                const currentCount = await this.getEventCountFromDatabase(userId, achievement.eventType);

                if (currentCount >= achievement.requiredCount) {
                    await this.unlockAchievement(userId, achievement);
                    newlyUnlocked.push(achievement.name);
                }
            }
        }
        return newlyUnlocked;
    }

    private async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
        this.logger.log(`ACHIEVEMENT UNLOCKED: '${achievement.name}' for user '${userId}'!`);

        const userAchievements = this.userAchievementsStore.get(userId) || [];
        userAchievements.push({
            name: achievement.name,
            unlockedAt: new Date().toISOString(),
        });
        this.userAchievementsStore.set(userId, userAchievements);

        // Award the bonus points for the achievement
        await this.awardPoints(userId, achievement.pointsAward);
    }

    /**
     * This is a mock database query. In a real app, you would inject
     * a service (e.g., BooksService) to perform a real database query.
     */
    private async getEventCountFromDatabase(userId: string, eventType: EventType): Promise<number> {
        this.logger.log(`MOCK DB: Counting '${eventType}' events for user '${userId}'...`);
        // Mock data to simulate the counts needed to unlock achievements
        const mockCounts = {
            'ADD_BOOK': 20,
            'COMPLETE_BOOK': 9,
            'LEND_BOOK': 4,
        };
        return mockCounts[eventType] || 0;
    }

    // --- Public Getters (for the controller) ---

    public async getUserPoints(userId: string): Promise<UserPoints> {
        const points = this.userPointsStore.get(userId) || 0;
        return { userId, points };
    }

    public async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const achievements = this.userAchievementsStore.get(userId) || [];
        return achievements;
    }
}