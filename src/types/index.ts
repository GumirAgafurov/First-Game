// Общие типы
export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface GameSettings {
    volume: number;
    musicEnabled: boolean;
    currentLevel: number;
}

// Типы для игрока
export interface Player extends Position, Size {
    health: number;
    score: number;
    velocity: Position;
    isJumping: boolean;
    isMoving: boolean;
}

// Типы для NPC
export interface NPC extends Position, Size {
    visible: boolean;
    currentDialogue: string | null;
    dialogueQueue: string[];
}

// Типы для игры
export interface GameState {
    isRunning: boolean;
    currentLevel: number;
    score: number;
    player: Player;
    settings: GameSettings;
}

// Типы для Firebase
export interface UserData {
    uid: string;
    email: string;
    username: string;
    gameProgress: {
        currentLevel: number;
        score: number;
        collectedApples: number;
    };
}

// Типы для уровней
export interface Level {
    id: number;
    name: string;
    platforms: Platform[];
    apples: Apple[];
    enemies: Enemy[];
    startPosition: Position;
}

export interface Platform extends Position, Size {
    type: 'normal' | 'moving' | 'disappearing';
}

export interface Apple extends Position, Size {
    type: 'normal' | 'bonus';
    collected: boolean;
}

export interface Enemy extends Position, Size {
    type: 'basic' | 'flying';
    health: number;
    speed: number;
} 