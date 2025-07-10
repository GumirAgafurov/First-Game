import { OwlNPC } from './NPC.js';
import { LevelManager } from './levelManager.js';
import { Player } from './entities/Player.js';
import { Platform } from './entities/Platform.js';
import { Apple } from './entities/Apple.js';
import { Enemy } from './entities/Enemy.js';
import { AudioManager } from './audio.js';

const GRAVITY = 0.5;
const PLAYER_SPEED = 5;
const JUMP_FORCE = -20;
const LEVEL_LENGTH_MULTIPLIER = 1;
const UI_WIDTH = 250;
const UI_HEIGHT = 110;
const MINIMAP_WIDTH = 250;
const MINIMAP_HEIGHT = 150;

export class Game {
    constructor(canvas) {
        console.log('Initializing game...');
        if (!canvas) throw new Error('Canvas element is required');

        // Initialize canvas
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) throw new Error('Could not get 2D context');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Game state
        this.keys = new Set();
        this.wasFKeyPressed = false;
        this.cameraX = 0;
        this.score = 0;
        this.currentLevel = 1;
        this.isLevelLoaded = false;
        this.playerVisible = false;
        this.soundEnabled = true;
        this.collectSound = null;
        this.requiredApples = 3;

        // Initialize audio
        this.audio = new AudioManager();

        // Initialize objects
        this.levelManager = new LevelManager(this);
        this.updateLevelBounds();
        this.player = new Player({ x: 100, y: 100 }, this.levelBounds, this.ctx);
        
        // Game objects
        this.platforms = [];
        this.apples = [];
        this.enemies = [];
        
        // Initialize NPC
        const groundY = this.canvas.height - 100;
        this.owl = new OwlNPC(this);
        this.owl.setPosition(300, groundY - 282);

        // Load assets
        this.initBackgrounds();
        this.setupEventListeners();
        this.loadInitialLevel();

        // Progress system
        this.userId = 'local_user';
        this.gameProgress = {
            currentLevel: 1,
            score: 0,
            collectedApples: []
        };
        this.loadProgress();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.updateLevelBounds();
    }

    updateLevelBounds() {
        this.levelWidth = this.canvas.width * LEVEL_LENGTH_MULTIPLIER;
        this.levelHeight = this.canvas.height;
        this.levelBounds = {
            left: 0,
            right: this.levelWidth,
            top: 0,
            bottom: this.levelHeight
        };
    }

    initBackgrounds() {
        this.backgrounds = {
            main: { img: new Image(), loaded: false },
            layer1: { img: new Image(), loaded: false },
            layer2: { img: new Image(), loaded: false }
        };

        this.loadImage(this.backgrounds.main, 'image/background.png');
        this.loadImage(this.backgrounds.layer1, 'image/BG1.png');
        this.loadImage(this.backgrounds.layer2, 'image/BG2.png');
    }

    loadImage(backgroundObj, src) {
        backgroundObj.img.onload = () => {
            backgroundObj.loaded = true;
            console.log(`Successfully loaded: ${src}`);
        };
        backgroundObj.img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            backgroundObj.loaded = false;
        };
        backgroundObj.img.src = src;
    }

    setSoundVariables(sound, enabled) {
        if (sound && typeof sound.play === 'function') {
            this.collectSound = sound;
        } else {
            console.warn('Invalid sound object provided');
        }
        this.soundEnabled = !!enabled;
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key) this.keys.add(e.key.toLowerCase());
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key) this.keys.delete(e.key.toLowerCase());
        });
    }

    loadInitialLevel() {
        this.levelManager.loadLevels()
            .then(() => {
                const levelData = this.levelManager.getCurrentLevel();
                if (levelData) {
                    this.currentLevel = this.levelManager.currentLevelIndex + 1;
                    this.loadLevel(levelData);
                } else {
                    console.error('No level data');
                }
            })
            .catch(error => console.error('Level loading error:', error));
    }

    loadLevel(levelData) {
        console.log('Loading level:', levelData);
        this.isLevelLoaded = false;
        this.playerVisible = false;
        
        // Reset objects
        this.platforms = [];
        this.apples = [];
        this.enemies = [];
        
        // Add ground platform
        const groundHeight = 100;
        const groundY = this.canvas.height - groundHeight;
        
        // Основная платформа с травой для всех уровней
        const grassPlatform = new Platform({
            position: { x: 0, y: groundY },
            width: this.levelWidth,
            height: groundHeight,
            color: '#4CAF50'
        }, this.ctx);
        this.platforms.push(grassPlatform);
        
        // Добавляем декоративные элементы травы
        for (let x = 0; x < this.levelWidth; x += 50) {
            const grassDecoration = new Platform({
                position: { x: x, y: groundY - 10 },
                width: 30,
                height: 10,
                color: '#45a049'
            }, this.ctx);
            this.platforms.push(grassDecoration);
        }
        
        // Load level objects
        levelData.platforms.forEach(p => this.platforms.push(new Platform(p, this.ctx)));
        levelData.apples.forEach(a => this.apples.push(new Apple(a, this.ctx)));
        levelData.enemies.forEach(e => this.enemies.push(new Enemy(e, this.ctx)));
        
        // Reset player
        this.player.position = { x: 100, y: 100 };
        this.cameraX = 0;
        
        // Обновляем номер текущего уровня
        this.currentLevel = this.levelManager.currentLevelIndex + 1;
        console.log('Current level set to:', this.currentLevel);
        
        this.isLevelLoaded = true;
        this.playerVisible = true;
    }

    update() {
        if (!this.isLevelLoaded) return;

        // Update player
        this.player.update(this.platforms);
        
        // Update camera
        const targetX = this.player.position.x - this.canvas.width / 3;
        this.cameraX = Math.max(0, Math.min(targetX, this.levelWidth - this.canvas.width));
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(this.platforms));
        
        // Handle NPC interaction
        this.owl.checkInteraction(this.player, this.cameraX);
        
        // Handle F key press
        if (this.keys.has('f') && !this.wasFKeyPressed && this.owl.showHint) {
            this.owl.showDialog();
            this.wasFKeyPressed = true;
        } else if (!this.keys.has('f')) {
            this.wasFKeyPressed = false;
        }
        
        // Check collisions
        this.checkCollision();
        this.checkEnemyCollision();
        
        // Check level completion
        const collectedApples = this.apples.filter(apple => apple.collected).length;
        if (collectedApples >= this.requiredApples) {
            if (this.levelManager.nextLevel()) {
                this.currentLevel = this.levelManager.currentLevelIndex + 1; // Обновляем номер текущего уровня
                this.loadLevel(this.levelManager.getCurrentLevel());
            } else {
                console.log('Game completed!');
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackgroundLayers();
        
        // Draw game objects
        this.platforms.forEach(p => p.draw(this.cameraX));
        this.apples.forEach(a => a.draw(this.cameraX));
        this.enemies.forEach(e => e.draw(this.cameraX));
        
        // Draw player if visible
        if (this.playerVisible) {
            this.player.draw(this.cameraX);
        }
        
        // Draw NPC and UI
        this.owl.draw(this.ctx, this.cameraX);
        this.drawUI();
        this.drawMinimap();
    }

    drawBackgroundLayers() {
        // Main background
        if (this.backgrounds.main.loaded) {
            this.ctx.drawImage(
                this.backgrounds.main.img,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
        }

        // Additional layers with transparency
        if (this.backgrounds.layer1.loaded) {
            this.ctx.globalAlpha = 0.7;
            this.ctx.drawImage(
                this.backgrounds.layer1.img,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
            this.ctx.globalAlpha = 1.0;
        }

        if (this.backgrounds.layer2.loaded) {
            this.ctx.globalAlpha = 0.5;
            this.ctx.drawImage(
                this.backgrounds.layer2.img,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
            this.ctx.globalAlpha = 1.0;
        }

        // Fallback if no backgrounds loaded
        if (!this.anyBackgroundLoaded()) {
            this.ctx.fillStyle = '#2a3f54';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    anyBackgroundLoaded() {
        return Object.values(this.backgrounds).some(bg => bg.loaded);
    }

    checkCollision() {
        this.apples.forEach(apple => {
            if (apple.collected) return;

            const playerCenter = {
                x: this.player.position.x + this.player.width/2,
                y: this.player.position.y + this.player.height/2
            };
            const appleCenter = {
                x: apple.position.x + apple.width/2,
                y: apple.position.y + apple.height/2
            };
            
            const distanceX = Math.abs(playerCenter.x - appleCenter.x);
            const distanceY = Math.abs(playerCenter.y - appleCenter.y);
            
            if (distanceX < (this.player.width + apple.width)/3 && 
                distanceY < (this.player.height + apple.height)/3) {
                apple.collected = true;
                this.score += 10;
                this.audio.playSound('collect');
            }
        });
    }

    checkEnemyCollision() {
        for (const enemy of this.enemies) {
            if (this.player.position.x < enemy.position.x + enemy.width &&
                this.player.position.x + this.player.width > enemy.position.x &&
                this.player.position.y < enemy.position.y + enemy.height &&
                this.player.position.y + this.player.height > enemy.position.y) {
                
                this.resetLevel();
                break;
            }
        }
    }

    resetLevel() {
        this.player.position = { x: 50, y: 20 };
        this.player.velocity = { x: 0, y: 0 };
        this.apples.forEach(apple => apple.collected = false);
        
        // Visual feedback
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawUI() {
        this.ctx.save();
        
        // UI background
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.strokeStyle = "gold";
        this.ctx.lineWidth = 2;
        
        const cornerRadius = 15;
        this.drawRoundedRect(20, 20, UI_WIDTH, UI_HEIGHT, cornerRadius);
        
        // UI text
        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 24px Arial";
        this.ctx.textAlign = "left";
        this.setShadowEffect();
        
        this.ctx.fillText(`🍎 Apples: ${this.score}`, 40, 50);
        this.ctx.fillText(`🏆 Level: ${this.currentLevel}`, 40, 85);
        
        // Добавляем отображение прогресса сбора яблок
        const collectedApples = this.apples.filter(apple => apple.collected).length;
        this.ctx.fillText(`🍎 Progress: ${collectedApples}/${this.requiredApples}`, 40, 120);
        
        // Progress bar
        this.drawProgressBar(40, 140, (collectedApples / this.requiredApples) * 230, 12, 6);
        
        this.ctx.restore();
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.arcTo(x + width, y, x + width, y + height, radius);
        this.ctx.arcTo(x + width, y + height, x, y + height, radius);
        this.ctx.arcTo(x, y + height, x, y, radius);
        this.ctx.arcTo(x, y, x + width, y, radius);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    setShadowEffect() {
        this.ctx.shadowColor = "black";
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
    }

    drawProgressBar(x, y, width, height, radius) {
        this.ctx.fillStyle = "rgba(255, 215, 0, 0.7)";
        this.ctx.strokeStyle = "white";
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, radius);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawMinimap() {
        const offsetX = this.canvas.width - MINIMAP_WIDTH - 20;
        const offsetY = 20;
        const scaleX = MINIMAP_WIDTH / this.levelWidth;
        const scaleY = MINIMAP_HEIGHT / this.canvas.height;

        // Minimap background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(offsetX, offsetY, MINIMAP_WIDTH, MINIMAP_HEIGHT);
        this.ctx.strokeStyle = 'gold';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX, offsetY, MINIMAP_WIDTH, MINIMAP_HEIGHT);

        // Draw platforms
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(
                offsetX + platform.position.x * scaleX,
                offsetY + platform.position.y * scaleY,
                Math.max(2, platform.width * scaleX),
                2
            );
        });

        // Draw apples
        this.apples.forEach(apple => {
            if (!apple.collected) {
                this.ctx.fillStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(
                    offsetX + apple.position.x * scaleX,
                    offsetY + apple.position.y * scaleY,
                    3,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });

        // Draw player
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(
            offsetX + this.player.position.x * scaleX - 3,
            offsetY + this.player.position.y * scaleY - 3,
            6,
            6
        );

        // Draw camera view
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            offsetX + this.cameraX * scaleX,
            offsetY,
            this.canvas.width * scaleX,
            MINIMAP_HEIGHT
        );
    }

    async start() {
        console.log('Starting game...');
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS

        // Загружаем уровни
        await this.levelManager.loadLevels();
        
        // Загружаем первый уровень
        await this.levelManager.loadLevel(1);
        
        // Запускаем игровой цикл
        this.gameLoop();
    }

    async continue() {
        console.log('Continuing game...');
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.accumulator = 0;
        
        // Загружаем сохраненный уровень
        const savedProgress = localStorage.getItem('gameProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            await this.levelManager.loadLevel(progress.currentLevel);
        } else {
            await this.levelManager.loadLevel(1);
        }
        
        this.gameLoop();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    }

    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;

        if (this.isPaused) {
            requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.accumulator += deltaTime;

        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }

        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    saveProgress() {
        try {
            const saveData = {
                currentLevel: this.currentLevel,
                score: this.score,
                collectedApples: this.apples
                    .filter(apple => apple.collected)
                    .map(apple => ({ x: apple.position.x, y: apple.position.y }))
            };
            
            localStorage.setItem(`game_progress_${this.userId}`, JSON.stringify(saveData));
            console.log('Progress saved');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    loadProgress() {
        try {
            const savedData = localStorage.getItem(`game_progress_${this.userId}`);
            if (!savedData) return;

            const progress = JSON.parse(savedData);
            this.currentLevel = progress.currentLevel;
            this.score = progress.score;
            
            const levelData = this.levelManager.getLevel(this.currentLevel);
            if (!levelData) return;

            this.loadLevel(levelData);
            
            // Restore collected apples
            progress.collectedApples.forEach(savedApple => {
                const apple = this.apples.find(a => 
                    a.position.x === savedApple.x && 
                    a.position.y === savedApple.y
                );
                if (apple) apple.collected = true;
            });
            
            console.log('Progress loaded');
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    startNewGame() {
        // Сбрасываем прогресс
        localStorage.removeItem('gameProgress');
        localStorage.removeItem(`game_progress_${this.userId}`);
        
        // Сбрасываем состояние игры
        this.currentLevel = 1;
        this.score = 0;
        this.levelManager.resetProgress();
        
        // Reset game state
        this.platforms = [];
        this.apples = [];
        this.enemies = [];
        
        // Reset player position
        if (this.player) {
            this.player.position = { x: 100, y: 100 };
            this.player.velocity = { x: 0, y: 0 };
        }
        
        // Load first level
        this.levelManager.loadLevel(1);
        
        // Reset camera
        this.cameraX = 0;

        // Start background music
        this.audio.playSound('background');
        
        console.log('New game started from level 1');
    }

    toggleSound(enabled) {
        this.audio.toggleSound(enabled);
    }

    setVolume(volume) {
        this.audio.setVolume(volume);
    }

    stop() {
        this.audio.stopAll();
    }
}

