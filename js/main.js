import { Game } from './game.js';
import { MobileController } from './mobile.js';

class GameManager {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.game = new Game(this.canvas);
        this.mobileController = null;
        this.isMobile = window.innerWidth <= 768;

        this.init();
    }

    init() {
        // Инициализируем мобильное управление, если это мобильное устройство
        if (this.isMobile) {
            this.mobileController = new MobileController(this.game);
        }

        // Обработчики для кнопок меню
        document.getElementById('new-game-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('continue-btn').addEventListener('click', () => this.continueGame());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('exit-btn').addEventListener('click', () => this.exitGame());

        // Обработчик изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // Если изменился тип устройства
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                // Переключаемся на мобильное управление
                this.mobileController = new MobileController(this.game);
            } else {
                // Отключаем мобильное управление
                this.mobileController = null;
            }
        }
    }

    startNewGame() {
        document.getElementById('startScreen').style.display = 'none';
        this.game.startNewGame();
    }

    continueGame() {
        document.getElementById('startScreen').style.display = 'none';
        this.game.continue();
    }

    showSettings() {
        // Здесь можно добавить настройки
        alert('Настройки будут добавлены в следующем обновлении');
    }

    exitGame() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            window.close();
        }
    }
}

// Запускаем игру при загрузке страницы
window.addEventListener('load', () => {
    new GameManager();
}); 