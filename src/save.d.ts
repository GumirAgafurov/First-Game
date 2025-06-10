export class SaveManager {
    constructor();
    saveProgress(data: any): boolean;
    loadProgress(): any;
    clearProgress(): boolean;
    getHighScore(): number;
    updateHighScore(score: number): void;
} 