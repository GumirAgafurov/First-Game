// Инициализация игры после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Получаем canvas элемент
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Создаем экземпляр игры
    const game = new Game(canvas);

    // Инициализация обработчиков событий
    initializeEventHandlers(game);

    // Запуск игры
    game.start();
});

// Инициализация обработчиков событий
function initializeEventHandlers(game) {
    // Обработка клавиатуры
    document.addEventListener('keydown', (event) => {
        const player = game.getState().player;
        
        switch(event.key) {
            case 'ArrowLeft':
            case 'a':
                player.velocity.x = -5;
                player.isMoving = true;
                break;
            case 'ArrowRight':
            case 'd':
                player.velocity.x = 5;
                player.isMoving = true;
                break;
            case ' ':
            case 'ArrowUp':
            case 'w':
                if (!player.isJumping) {
                    player.velocity.y = -15;
                    player.isJumping = true;
                    game.audioManager.playSound('jump');
                }
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        const player = game.getState().player;
        
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'a':
            case 'd':
                player.velocity.x = 0;
                player.isMoving = false;
                break;
        }
    });

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Экспортируем функцию инициализации для тестирования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeGame };
} 