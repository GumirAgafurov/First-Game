export class Enemy {
    constructor({position, width = 40, height = 60, speed = 2, moveDistance = 100}, ctx) {
        this.position = {
            x: position.x,
            y: position.y - height + 10
        };
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.ctx = ctx;
        this.pointA = { x: this.position.x - moveDistance, y: this.position.y };
        this.pointB = { x: this.position.x + moveDistance, y: this.position.y };
        this.currentTarget = this.pointB;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.animationTimer = 0;
        this.directionChangeTimer = 0;
        this.directionChangeCooldown = 30;
        this.sprites = this.loadSprites(3);
    }

    loadSprites(count) {
        const sprites = [];
        for (let i = 1; i <= count; i++) {
            const sprite = new Image();
            sprite.src = `image/enemy/enemy${i}.png`;
            sprite.onerror = () => console.error(`Failed to load enemy sprite ${i}`);
            sprites.push(sprite);
        }
        return sprites;
    }

    draw(cameraX) {
        this.animationTimer += this.animationSpeed;
        this.animationFrame = Math.floor(this.animationTimer) % this.sprites.length;
        
        const currentSprite = this.sprites[this.animationFrame];
        if (!currentSprite.complete) return;

        this.ctx.save();
        
        if (this.currentTarget === this.pointA) {
            this.ctx.translate(this.position.x - cameraX + this.width, this.position.y);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(currentSprite, 0, 0, this.width, this.height);
        } else {
            this.ctx.drawImage(
                currentSprite,
                this.position.x - cameraX,
                this.position.y,
                this.width,
                this.height
            );
        }
        
        this.ctx.restore();
    }

    update(platforms) {
        this.directionChangeTimer++;

        const dx = this.currentTarget.x - this.position.x;
        const dy = this.currentTarget.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.speed && this.directionChangeTimer >= this.directionChangeCooldown) {
            this.currentTarget = this.currentTarget === this.pointA ? this.pointB : this.pointA;
            this.directionChangeTimer = 0;
        } else {
            const vx = (dx / distance) * this.speed;
            const vy = (dy / distance) * this.speed;
            
            const prevX = this.position.x;
            const prevY = this.position.y;
            
            this.position.x += vx;
            this.position.y += vy;
            
            let collided = false;
            platforms.forEach(platform => {
                if (this.position.x < platform.position.x + platform.width &&
                    this.position.x + this.width > platform.position.x &&
                    this.position.y < platform.position.y + platform.height &&
                    this.position.y + this.height > platform.position.y) {
                    
                    this.position.x = prevX;
                    this.position.y = prevY;
                    collided = true;
                }
            });
            
            if (collided && this.directionChangeTimer >= this.directionChangeCooldown) {
                this.currentTarget = this.currentTarget === this.pointA ? this.pointB : this.pointA;
                this.directionChangeTimer = 0;
            }
        }
    }
} 