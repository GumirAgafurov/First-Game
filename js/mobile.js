class MobileController {
    constructor(game) {
        this.game = game;
        this.touchControls = {
            left: false,
            right: false,
            jump: false
        };

        this.initControls();
        this.initMenu();
    }

    initControls() {
        // Левая кнопка
        const leftBtn = document.getElementById('leftBtn');
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
        });
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
        });

        // Правая кнопка
        const rightBtn = document.getElementById('rightBtn');
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
        });
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
        });

        // Кнопка прыжка
        const jumpBtn = document.getElementById('jumpBtn');
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.jump = true;
        });
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.jump = false;
        });

        // Предотвращаем скролл страницы при касании кнопок
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('touchmove', (e) => e.preventDefault());
        });
    }

    initMenu() {
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const resumeBtn = document.getElementById('resumeBtn');
        const restartBtn = document.getElementById('restartBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const exitBtn = document.getElementById('exitBtn');

        menuBtn.addEventListener('click', () => this.toggleMenu());
        resumeBtn.addEventListener('click', () => this.toggleMenu());
        restartBtn.addEventListener('click', () => this.restartGame());
        settingsBtn.addEventListener('click', () => this.showSettings());
        exitBtn.addEventListener('click', () => this.exitGame());
    }

    toggleMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const isMenuOpen = mobileMenu.style.display === 'flex';
        
        mobileMenu.style.display = isMenuOpen ? 'none' : 'flex';
        
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
        this.toggleMenu();
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
        if (this.touchControls.left) this.game.player.moveLeft();
        else if (this.touchControls.right) this.game.player.moveRight();
        else this.game.player.stop();

        if (this.touchControls.jump) this.game.player.jump();
    }
}

export { MobileController }; 