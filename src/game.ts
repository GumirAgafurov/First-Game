import { GameState, Player, Position, Level, Platform, Apple, Enemy, GameSettings, Size } from './types';
import { OwlNPC } from './NPC';
import { AudioManager } from './audio';
import { LevelManager } from './levelManager';
import { SaveManager } from './save';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: GameState;
    private owl: OwlNPC;
    private audioManager: AudioManager;
    private levelManager: LevelManager;
    private saveManager: SaveManager;
    private lastTime: number;
    private cameraX: number;
    private playerVisible: boolean;
    private gravity: number;
    private jumpForce: number;
    private moveSpeed: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.lastTime = 0;
        this.cameraX = 0;
        this.playerVisible = true;
        this.gravity = 0.5;
        this.jumpForce = -15;
        this.moveSpeed = 5;

        // Инициализация состояния игры
        this.state = {
            isRunning: false,
            currentLevel: 1,
            score: 0,
            player: {
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                health: 100,
                score: 0,
                velocity: { x: 0, y: 0 },
                isJumping: false,
                isMoving: false
            },
            settings: {
                volume: 50,
                musicEnabled: true,
                currentLevel: 1
            }
        };

        // Инициализация менеджеров
        this.audioManager = new AudioManager();
        this.levelManager = new LevelManager();
        this.saveManager = new SaveManager();
        this.owl = new OwlNPC(this);

        // Загрузка сохраненного прогресса
        this.loadSavedProgress();

        // Настройка canvas
        this.setupCanvas();

        // Загрузка первого уровня
        this.loadLevel(this.state.currentLevel);
    }

    private setupCanvas(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    private loadLevel(levelNumber: number): void {
        const level = this.levelManager.setLevel(levelNumber - 1);
        if (level) {
            this.state.currentLevel = levelNumber;
            this.state.player.x = level.startPosition.x;
            this.state.player.y = level.startPosition.y;
            this.state.player.velocity = { x: 0, y: 0 };
            this.audioManager.playMusic();
        }
    }

    private loadSavedProgress(): void {
        const savedProgress = this.saveManager.loadProgress();
        if (savedProgress) {
            this.state = {
                ...this.getInitialState(),
                ...savedProgress
            };
        } else {
            this.state = this.getInitialState();
        }
    }

    private getInitialState(): GameState {
        return {
            isRunning: false,
            currentLevel: 1,
            score: 0,
            player: {
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                health: 100,
                score: 0,
                velocity: { x: 0, y: 0 },
                isJumping: false,
                isMoving: false
            },
            settings: {
                volume: 50,
                musicEnabled: true,
                currentLevel: 1
            }
        };
    }

    private saveProgress(): void {
        this.saveManager.saveProgress({
            currentLevel: this.state.currentLevel,
            score: this.state.score,
            settings: this.state.settings
        });
        this.saveManager.updateHighScore(this.state.score);
    }

    public start(): void {
        if (!this.state.isRunning) {
            this.state.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    public stop(): void {
        this.state.isRunning = false;
        this.audioManager.stopMusic();
    }

    private gameLoop(currentTime: number): void {
        if (!this.state.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private update(deltaTime: number): void {
        this.updatePlayer(deltaTime);
        this.updateCamera();
        this.checkCollisions();
        this.owl.update(deltaTime);
    }

    private updatePlayer(deltaTime: number): void {
        const player = this.state.player;
        
        // Обновление позиции
        player.x += player.velocity.x * deltaTime;
        player.y += player.velocity.y * deltaTime;

        // Применение гравитации
        player.velocity.y += this.gravity;

        // Проверка границ уровня
        const currentLevel = this.levelManager.getCurrentLevel();
        if (currentLevel) {
            // Проверка падения
            if (player.y > this.canvas.height) {
                this.handlePlayerDeath();
            }

            // Проверка выхода за границы уровня
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > currentLevel.platforms[currentLevel.platforms.length - 1].x + 1000) {
                player.x = currentLevel.platforms[currentLevel.platforms.length - 1].x + 1000 - player.width;
            }
        }
    }

    private updateCamera(): void {
        const player = this.state.player;
        this.cameraX = player.x - this.canvas.width / 3;
        
        // Ограничение камеры
        if (this.cameraX < 0) this.cameraX = 0;
    }

    private checkCollisions(): void {
        const player = this.state.player;
        const currentLevel = this.levelManager.getCurrentLevel();
        
        if (!currentLevel) return;

        // Проверка коллизий с платформами
        for (const platform of currentLevel.platforms) {
            if (this.checkCollision(player, platform)) {
                if (player.velocity.y > 0) {
                    player.y = platform.y - player.height;
                    player.velocity.y = 0;
                    player.isJumping = false;
                }
            }
        }

        // Проверка коллизий с яблоками
        for (const apple of currentLevel.apples) {
            // Создаем временный объект с размерами для проверки коллизии
            const appleWithSize = {
                ...apple,
                width: 20, // Размер яблока
                height: 20
            };
            if (!apple.collected && this.checkCollision(player, appleWithSize)) {
                apple.collected = true;
                this.state.score += apple.type === 'bonus' ? 50 : 10;
                this.audioManager.playSound('collect');
            }
        }

        // Проверка коллизий с врагами
        for (const enemy of currentLevel.enemies) {
            if (this.checkCollision(player, enemy)) {
                this.handlePlayerHit();
            }
        }

        // Проверка завершения уровня
        this.checkLevelCompletion();
    }

    private handlePlayerDeath(): void {
        this.state.player.health = 0;
        this.audioManager.playSound('gameOver');
        this.saveProgress(); // Сохраняем прогресс при смерти
        this.stop();
        // TODO: Показать экран Game Over
    }

    private handlePlayerHit(): void {
        this.state.player.health -= 10;
        this.audioManager.playSound('hit');
        if (this.state.player.health <= 0) {
            this.handlePlayerDeath();
        }
    }

    private checkLevelCompletion(): void {
        const currentLevel = this.levelManager.getCurrentLevel();
        if (!currentLevel) return;

        const allApplesCollected = currentLevel.apples.every((apple: Apple) => apple.collected);
        if (allApplesCollected) {
            this.audioManager.playSound('levelComplete');
            this.saveProgress(); // Сохраняем прогресс при завершении уровня
            const nextLevel = this.levelManager.nextLevel();
            if (nextLevel) {
                this.loadLevel(this.state.currentLevel + 1);
            } else {
                // TODO: Показать экран победы
                this.stop();
            }
        }
    }

    private checkCollision(obj1: Position & Size, obj2: Position & Size): boolean {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    public draw(): void {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Отрисовка фона
        this.drawBackgroundLayers();
        
        // Отрисовка земли
        const groundHeight = 100;
        const groundY = this.canvas.height - groundHeight;
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, groundY, this.canvas.width, groundHeight);
        
        // Отрисовка игровых объектов
        const currentLevel = this.levelManager.getCurrentLevel();
        if (currentLevel) {
            currentLevel.platforms.forEach((p: Platform) => this.drawPlatform(p));
            currentLevel.apples.forEach((a: Apple) => this.drawApple(a));
            currentLevel.enemies.forEach((e: Enemy) => this.drawEnemy(e));
        }
        
        // Отрисовка игрока
        if (this.playerVisible) {
            this.drawPlayer();
        }
        
        // Отрисовка NPC и UI
        this.owl.draw(this.ctx, this.cameraX);
        this.drawUI();
        this.drawMinimap();
    }

    private drawBackgroundLayers(): void {
        // TODO: Добавить отрисовку фоновых слоев
    }

    private drawPlatform(platform: Platform): void {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(
            platform.x - this.cameraX,
            platform.y,
            platform.width,
            platform.height
        );
    }

    private drawApple(apple: Apple): void {
        if (!apple.collected) {
            this.ctx.fillStyle = apple.type === 'bonus' ? 'gold' : 'red';
            this.ctx.beginPath();
            this.ctx.arc(
                apple.x - this.cameraX,
                apple.y,
                10,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    private drawEnemy(enemy: Enemy): void {
        this.ctx.fillStyle = enemy.type === 'flying' ? 'purple' : 'red';
        this.ctx.fillRect(
            enemy.x - this.cameraX,
            enemy.y,
            enemy.width,
            enemy.height
        );
    }

    private drawPlayer(): void {
        const player = this.state.player;
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(
            player.x - this.cameraX,
            player.y,
            player.width,
            player.height
        );
    }

    private drawUI(): void {
        // Отрисовка UI
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.state.score}`, 20, 30);
        this.ctx.fillText(`Level: ${this.state.currentLevel}`, 20, 60);
        this.ctx.fillText(`Health: ${this.state.player.health}`, 20, 90);
    }

    private drawMinimap(): void {
        // TODO: Добавить отрисовку миникарты
    }

    public getState(): GameState {
        return this.state;
    }

    public setPlayerVisible(visible: boolean): void {
        this.playerVisible = visible;
    }

    public getAudioManager(): AudioManager {
        return this.audioManager;
    }

    public getSaveManager(): SaveManager {
        return this.saveManager;
    }
} 