import { Level } from './types';

export class LevelManager {
    constructor();
    getCurrentLevel(): Level | null;
    nextLevel(): Level | null;
    previousLevel(): Level | null;
    setLevel(index: number): Level | null;
    getLevelCount(): number;
    getLevelIndex(): number;
    resetLevel(): Level | null;
} 