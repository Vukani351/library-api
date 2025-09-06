export type EventType = 'ADD_BOOK' | 'LEND_BOOK' | 'COMPLETE_BOOK' | 'LEND_BOOK_FIRST_TIME' | 'LEND_BOOK_AGAIN';

export interface UserPoints {
    userId: string;
    points: number;
}

export interface Achievement {
    name: string;
    description: string;
    pointsAward: number;
    requiredCount: number;
    eventType: EventType;
}

export interface UserAchievement {
    name: string;
    unlockedAt: string;
}
