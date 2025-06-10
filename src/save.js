class SaveManager {
    constructor() {
        this.storageKey = 'gameProgress';
    }

    saveProgress(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    }

    loadProgress() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading progress:', error);
            return null;
        }
    }

    clearProgress() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing progress:', error);
            return false;
        }
    }

    getHighScore() {
        const progress = this.loadProgress();
        return progress ? progress.highScore : 0;
    }

    updateHighScore(score) {
        const progress = this.loadProgress() || {};
        if (!progress.highScore || score > progress.highScore) {
            progress.highScore = score;
            this.saveProgress(progress);
        }
    }
}

// Экспортируем класс для использования в TypeScript файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SaveManager };
} 