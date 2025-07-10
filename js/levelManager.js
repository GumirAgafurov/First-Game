import { Platform } from './entities/Platform.js';
import { Apple } from './entities/Apple.js';
import { Enemy } from './entities/Enemy.js';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.levels = [];
        this.currentLevelIndex = 0;
        this.loadProgress();
    }

    async loadLevels() {
        try {
            const response = await fetch('levels.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.levels || !Array.isArray(data.levels)) {
                throw new Error('Invalid levels data format');
            }
            this.levels = data.levels;
            console.log('Уровни загружены:', this.levels.length);
        } catch (error) {
            console.error('Ошибка загрузки уровней:', error);
            // Initialize with a default level if loading fails
            this.levels = [{
                name: "Level 1",
                platforms: [
                    { position: { x: 0, y: 500 }, width: 800, height: 100 }
                ],
                apples: [
                    { position: { x: 300, y: 400 } }
                ],
                enemies: [],
                playerStart: { x: 100, y: 300 }
            }];
        }
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('gameProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.currentLevelIndex = Math.max(0, progress.currentLevel - 1);
        } else {
            this.currentLevelIndex = 0;
        }
    }

    saveProgress() {
        const progress = {
            currentLevel: this.currentLevelIndex + 1
        };
        localStorage.setItem('gameProgress', JSON.stringify(progress));
    }

    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    getLevel(levelNumber) {
        if (!this.levels || this.levels.length === 0) {
            console.error('No levels available');
            return null;
        }
        const index = Math.max(0, Math.min(levelNumber - 1, this.levels.length - 1));
        return this.levels[index] || null;
    }

    async loadLevel(levelNumber) {
        // Показываем экран загрузки
        this.showLoadingScreen();
        
        // Ставим игру на паузу
        this.game.pause();
        
        const level = this.getLevel(levelNumber);
        if (!level) {
            console.error(`Level ${levelNumber} not found`);
            this.hideLoadingScreen();
            this.game.resume();
            return false;
        }

        this.currentLevelIndex = levelNumber - 1;
        console.log('Loading level number:', levelNumber, 'Current index:', this.currentLevelIndex);

        // Имитируем загрузку ресурсов с прогресс-баром
        await this.simulateLoading();

        // Reset game objects
        this.game.platforms = [];
        this.game.apples = [];
        this.game.enemies = [];

        // Load platforms
        level.platforms.forEach(platform => {
            this.game.platforms.push(new Platform(platform, this.game.ctx));
        });

        // Load apples
        level.apples.forEach(apple => {
            this.game.apples.push(new Apple(apple, this.game.ctx));
        });

        // Load enemies
        level.enemies.forEach(enemy => {
            this.game.enemies.push(new Enemy(enemy, this.game.ctx));
        });

        // Set required apples for the level
        this.game.requiredApples = level.requiredApples || Math.ceil(this.game.apples.length * 0.7);

        // Set player position
        if (level.playerStart) {
            this.game.player.position = { ...level.playerStart };
        }

        // Show tutorial on first level
        if (levelNumber === 1) {
            this.game.owl.showTutorial('movement');
        }

        // Скрываем экран загрузки
        this.hideLoadingScreen();
        
        // Возобновляем игру
        this.game.resume();
        return true;
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('level-loading-screen');
        const progressBar = document.getElementById('level-progress-bar');
        const loadingDetails = document.getElementById('level-loading-details');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            // Добавляем класс для анимации появления
            setTimeout(() => {
                loadingScreen.classList.add('visible');
            }, 10);
            progressBar.style.width = '0%';
            loadingDetails.textContent = 'Подготовка ресурсов...';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('level-loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('visible');
            // Ждем окончания анимации исчезновения
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    updateLoadingProgress(percent, details) {
        const progressBar = document.getElementById('level-progress-bar');
        const loadingDetails = document.getElementById('level-loading-details');
        
        if (progressBar) {
            // Плавно анимируем прогресс-бар
            progressBar.style.width = `${percent}%`;
        }
        if (loadingDetails) {
            // Анимируем смену текста
            loadingDetails.style.opacity = '0';
            loadingDetails.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                loadingDetails.textContent = details;
                loadingDetails.style.opacity = '1';
                loadingDetails.style.transform = 'translateY(0)';
            }, 300);
        }
    }

    async simulateLoading() {
        const steps = [
            { progress: 20, text: 'Загрузка текстур...' },
            { progress: 40, text: 'Инициализация платформ...' },
            { progress: 60, text: 'Размещение яблок...' },
            { progress: 80, text: 'Настройка врагов...' },
            { progress: 100, text: 'Завершение загрузки...' }
        ];

        for (const step of steps) {
            this.updateLoadingProgress(step.progress, step.text);
            // Ждем 1 секунду между шагами
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    getCollectedApples() {
        return this.game.apples.filter(apple => apple.collected).length;
    }

    getTotalApples() {
        return this.game.apples.length;
    }

    isLevelComplete() {
        return this.getCollectedApples() === this.getTotalApples();
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            this.saveProgress();
            return this.getCurrentLevel();
        }
        return null;
    }

    previousLevel() {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
            this.saveProgress();
            return this.getCurrentLevel();
        }
        return null;
    }

    resetProgress() {
        this.currentLevelIndex = 0;
        this.saveProgress();
    }

    getLevelCount() {
        return this.levels.length;
    }

    getLevelName() {
        const level = this.getCurrentLevel();
        return level ? level.name : 'Неизвестный уровень';
    }
} 