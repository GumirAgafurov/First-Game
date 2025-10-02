class MobileController {
    constructor(game) {
        console.log('MobileController constructor called');
        this.game = game;
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };

        console.log('Initializing mobile controller...');
        this.initControls();
        this.initMenu();
        console.log('Mobile controller initialization complete');
    }

    initControls() {
        console.log('Initializing mobile controls');
        
        // Проверяем, что мы находимся в мобильном режиме
        const mobileControls = document.getElementById('mobileControls');
        if (!mobileControls) {
            console.warn('Mobile controls container not found');
            return;
        }
        
        console.log('Mobile controls container found');
        
        // Левая кнопка
        const leftBtn = document.getElementById('leftBtn');
        if (leftBtn) {
            console.log('Left button found');
            this.addControlHandler(leftBtn, 'left');
        } else {
            console.warn('Left button not found');
        }

        // Правая кнопка
        const rightBtn = document.getElementById('rightBtn');
        if (rightBtn) {
            console.log('Right button found');
            this.addControlHandler(rightBtn, 'right');
        } else {
            console.warn('Right button not found');
        }

        // Кнопка прыжка
        const jumpBtn = document.getElementById('jumpBtn');
        if (jumpBtn) {
            console.log('Jump button found');
            this.addControlHandler(jumpBtn, 'jump');
        } else {
            console.warn('Jump button not found');
        }

        // Предотвращаем скролл страницы при касании кнопок
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('touchmove', (e) => e.preventDefault());
        });
        
        console.log('Mobile controls initialization complete');
    }

    addControlHandler(button, controlType) {
        console.log('Adding control handler for:', controlType);
        
        // Touch события
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('Touch start:', controlType);
            this.touchControls[controlType] = true;
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            console.log('Touch end:', controlType);
            this.touchControls[controlType] = false;
        });
        
        // Click события для десктопа (если кто-то тестирует на десктопе)
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            console.log('Mouse down:', controlType);
            this.touchControls[controlType] = true;
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            console.log('Mouse up:', controlType);
            this.touchControls[controlType] = false;
        });
        
        // Предотвращаем контекстное меню
        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    initMenu() {
        const menuBtn = document.getElementById('menuBtn');
        const mainMenu = document.getElementById('main-menu');

        console.log('Initializing mobile menu, menuBtn:', menuBtn, 'mainMenu:', mainMenu);

        if (menuBtn) {
            // Добавляем поддержку touch-событий для кнопки меню
            menuBtn.addEventListener('click', () => {
                console.log('Menu button clicked');
                this.toggleMainMenu();
            });
            menuBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                console.log('Menu button touched');
                this.toggleMainMenu();
            });
            menuBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
        } else {
            console.warn('Menu button not found');
        }
    }

    toggleMainMenu() {
        const mainMenu = document.getElementById('main-menu');
        const isMenuOpen = mainMenu.style.display === 'flex';
        
        console.log('Toggling main menu, current state:', isMenuOpen);
        
        mainMenu.style.display = isMenuOpen ? 'none' : 'flex';
        
        console.log('Main menu display set to:', mainMenu.style.display);
        
        if (this.game) {
            if (!isMenuOpen) {
                this.game.pause();
            } else {
                this.game.resume();
            }
        }
    }

    restartGame() {
        if (this.game) {
            this.game.startNewGame();
        }
        this.toggleMainMenu();
    }

    showSettings() {
        // Здесь можно добавить мобильные настройки
        alert('Настройки будут добавлены в следующем обновлении');
    }

    exitGame() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            window.location.reload();
        }
    }

    update() {
        if (!this.game || !this.game.player) return;
        
        // Обновляем состояние клавиш игрока на основе touch-контролов
        if (this.touchControls.left) {
            this.game.player.keys.a.pressed = true;
            this.game.player.keys.d.pressed = false;
        } else if (this.touchControls.right) {
            this.game.player.keys.d.pressed = true;
            this.game.player.keys.a.pressed = false;
        } else {
            this.game.player.keys.a.pressed = false;
            this.game.player.keys.d.pressed = false;
        }

        if (this.touchControls.jump) {
            this.game.player.keys.w.pressed = true;
            this.game.player.keys[" "].pressed = true;
        } else {
            this.game.player.keys.w.pressed = false;
            this.game.player.keys[" "].pressed = false;
        }
    }
}

export { MobileController }; 