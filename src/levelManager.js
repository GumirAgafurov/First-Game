class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
        this.loadLevels();
    }

    loadLevels() {
        // Загрузка уровней из файла levels.js
        this.levels = window.levels || [];
    }

    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            return this.getCurrentLevel();
        }
        return null;
    }

    previousLevel() {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
            return this.getCurrentLevel();
        }
        return null;
    }

    setLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIndex = index;
            return this.getCurrentLevel();
        }
        return null;
    }

    getLevelCount() {
        return this.levels.length;
    }

    getLevelIndex() {
        return this.currentLevelIndex;
    }

    resetLevel() {
        return this.getCurrentLevel();
    }
}

// Экспортируем класс для использования в TypeScript файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LevelManager };
} 