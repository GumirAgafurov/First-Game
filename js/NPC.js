// NPC (Owl) Module
export class OwlNPC {
    constructor(game) {
        this.game = game;
        this.visible = true; // Сделаем сову видимой по умолчанию
        this.currentDialogue = null;
        this.dialogueQueue = [];
        this.position = { x: 0, y: 0 };
        this.dialogueBox = null;
        
        // Инициализация спрайта
        this.sprite = {
            image: new Image(),
            frameWidth: 282, // Ширина одного кадра
            frameHeight: 282, // Высота кадра
            scale: 0.5, // Масштаб отрисовки
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

        this.tutorialDialogues = {
            movement: [
                "Привет, юный рыцарь! Я помогу тебе освоиться в игре.",
                "Используй стрелки ← → для движения влево и вправо.",
                "Нажми ↑ для прыжка.",
                "Попробуй собрать несколько яблок!"
            ],
            apples: [
                "Отлично! Яблоки дают тебе очки.",
                "Некоторые яблоки находятся в труднодоступных местах.",
                "Будь осторожен - на пути встречаются монстры!"
            ],
            completion: [
                "Поздравляю! Ты собрал все яблоки на этом уровне!",
                "Готов перейти к следующему уровню?"
            ]
        };

        this.initialize();
    }

    initialize() {
        // Create dialogue box
        this.dialogueBox = document.createElement('div');
        this.dialogueBox.className = 'dialogue-box';
        this.dialogueBox.style.display = 'none';
        document.body.appendChild(this.dialogueBox);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .dialogue-box {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid gold;
                border-radius: 10px;
                padding: 15px;
                color: white;
                font-size: 1.1em;
                max-width: 80%;
                text-align: center;
                z-index: 1000;
            }

            .dialogue-box:after {
                content: '▼';
                position: absolute;
                bottom: 5px;
                right: 10px;
                color: gold;
                animation: bounce 0.5s infinite alternate;
            }

            @keyframes bounce {
                from { transform: translateY(0); }
                to { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);

        // Add click listener to advance dialogue
        document.addEventListener('click', () => this.advanceDialogue());
    }

    update(deltaTime) {
        if (!this.visible || !this.sprite) return;

        // Update sprite animation
        this.sprite.animationCounter += deltaTime || 1/60;
        if (this.sprite.animationCounter >= this.sprite.animationSpeed) {
            this.sprite.currentFrame = (this.sprite.currentFrame + 1) % this.sprite.totalFrames;
            this.sprite.animationCounter = 0;
        }
    }

    draw(ctx, cameraX) {
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
                this.sprite.currentFrame * this.sprite.frameWidth, // sourceX
                0, // sourceY
                this.sprite.frameWidth, // sourceWidth
                this.sprite.frameHeight, // sourceHeight
                screenX, // destinationX
                this.position.y, // destinationY
                drawWidth, // destinationWidth
                drawHeight // destinationHeight
            );
        } catch (error) {
            console.error('Error drawing owl sprite:', error);
        }
    }

    showTutorial(type) {
        if (this.tutorialDialogues[type]) {
            this.dialogueQueue = [...this.tutorialDialogues[type]];
            this.visible = true;
            this.showNextDialogue();
        }
    }

    showLevelCompletion(applesCollected, totalApples) {
        const messages = [
            `Отлично! Ты собрал ${applesCollected} из ${totalApples} яблок на этом уровне!`,
            applesCollected === totalApples 
                ? "Превосходно! Ты собрал все яблоки!"
                : "Попробуй собрать больше яблок в следующий раз!",
            "Нажми ПРОБЕЛ, чтобы продолжить."
        ];
        
        this.dialogueQueue = messages;
        this.visible = true;
        this.showNextDialogue();
    }

    showNextDialogue() {
        if (this.dialogueQueue.length > 0) {
            this.currentDialogue = this.dialogueQueue.shift();
            this.dialogueBox.textContent = this.currentDialogue;
            this.dialogueBox.style.display = 'block';
        } else {
            this.hideDialogue();
        }
    }

    advanceDialogue() {
        if (this.currentDialogue) {
            this.showNextDialogue();
        }
    }

    hideDialogue() {
        this.currentDialogue = null;
        this.dialogueBox.style.display = 'none';
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        console.log('Owl position set to:', x, y);
    }

    checkInteraction(player, cameraX) {
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

    showDialog() {
        this.dialogVisible = true;
        // Скрываем диалог через 3 секунды
        setTimeout(() => {
            this.dialogVisible = false;
        }, 3000);
    }
} 