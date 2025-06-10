import { Game } from './game';
import { NPC as NPCType, Position } from './types';

export class OwlNPC implements NPCType {
    private game: Game;
    private sprite: {
        image: HTMLImageElement;
        frameWidth: number;
        frameHeight: number;
        scale: number;
        currentFrame: number;
        totalFrames: number;
        animationSpeed: number;
        animationCounter: number;
    };
    public visible: boolean;
    public currentDialogue: string | null;
    public dialogueQueue: string[];
    public position: Position;
    public width: number;
    public height: number;
    private showHint: boolean;

    constructor(game: Game) {
        this.game = game;
        this.visible = true;
        this.currentDialogue = null;
        this.dialogueQueue = [];
        this.position = { x: 300, y: 391 };
        this.width = 282;
        this.height = 282;
        this.showHint = false;

        // Инициализация спрайта
        this.sprite = {
            image: new Image(),
            frameWidth: 282,
            frameHeight: 282,
            scale: 0.5,
            currentFrame: 0,
            totalFrames: 4,
            animationSpeed: 0.1,
            animationCounter: 0
        };

        // Загрузка изображения совы
        this.sprite.image.src = 'image/owl/owl.png';
        this.sprite.image.onload = () => {
            console.log('Спрайт совы загружен');
            this.visible = true;
        };
        this.sprite.image.onerror = () => {
            console.error('Ошибка загрузки спрайта совы');
            this.visible = false;
        };
    }

    public update(deltaTime: number): void {
        if (!this.visible) return;

        // Обновление анимации
        this.sprite.animationCounter += deltaTime;
        if (this.sprite.animationCounter >= this.sprite.animationSpeed) {
            this.sprite.animationCounter = 0;
            this.sprite.currentFrame = (this.sprite.currentFrame + 1) % this.sprite.totalFrames;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
        if (!this.visible || !this.sprite || !this.sprite.image || !ctx) return;

        try {
            // Вычисляем позицию с учетом камеры
            const screenX = this.position.x - cameraX;
            
            // Проверяем, находится ли сова в пределах экрана
            const drawWidth = this.sprite.frameWidth * this.sprite.scale;
            const drawHeight = this.sprite.frameHeight * this.sprite.scale;
            
            if (screenX + drawWidth < 0 || screenX > ctx.canvas.width) return;

            // Draw owl sprite
            ctx.drawImage(
                this.sprite.image,
                this.sprite.currentFrame * this.sprite.frameWidth,
                0,
                this.sprite.frameWidth,
                this.sprite.frameHeight,
                screenX,
                this.position.y,
                drawWidth,
                drawHeight
            );

        } catch (error) {
            console.error('Error drawing owl sprite:', error);
        }
    }

    public checkInteraction(player: { position: Position; width: number; height: number }, cameraX: number): boolean {
        if (!player || !this.sprite) return false;

        // Get sprite dimensions
        const spriteWidth = this.sprite.frameWidth * this.sprite.scale;
        const spriteHeight = this.sprite.frameHeight * this.sprite.scale;
        
        // Проверяем, находится ли игрок рядом с совой
        const playerCenterX = player.position.x + player.width/2;
        const playerCenterY = player.position.y + player.height/2;
        const owlCenterX = this.position.x + spriteWidth/2;
        const owlCenterY = this.position.y + spriteHeight/2;
        
        const distanceX = Math.abs(playerCenterX - owlCenterX);
        const distanceY = Math.abs(playerCenterY - owlCenterY);
        
        // Увеличиваем радиус взаимодействия
        const interactionRadius = 150;
        this.showHint = distanceX < interactionRadius && distanceY < interactionRadius;
        
        return this.showHint;
    }

    public showTutorial(type: string): void {
        const tutorials = {
            movement: "Используйте стрелки или WASD для движения",
            jump: "Нажмите пробел для прыжка",
            collect: "Собирайте яблоки для получения очков",
            avoid: "Избегайте монстров"
        };

        if (tutorials[type as keyof typeof tutorials]) {
            this.dialogueQueue.push(tutorials[type as keyof typeof tutorials]);
            this.showNextDialogue();
        }
    }

    public showNextDialogue(): void {
        if (this.dialogueQueue.length > 0) {
            this.currentDialogue = this.dialogueQueue.shift() || null;
        } else {
            this.currentDialogue = null;
        }
    }

    public clearDialogue(): void {
        this.currentDialogue = null;
        this.dialogueQueue = [];
    }
} 