const GRAVITY = 0.5;
const PLAYER_SPEED = 5;
const JUMP_FORCE = -20;

export class Player {
    constructor(position, levelBounds, ctx) {
        this.position = position;
        this.velocity = { x: 0, y: 0 };
        this.originalWidth = 50;
        this.originalHeight = 37;
        this.scale = 2;
        this.width = this.originalWidth * this.scale;
        this.height = this.originalHeight * this.scale;
        this.isOnGround = false;
        this.jumpCooldown = false;
        this.levelBounds = levelBounds;
        this.ctx = ctx;
        this.keys = {
            w: { pressed: false },
            a: { pressed: false },
            s: { pressed: false },
            d: { pressed: false },
            " ": { pressed: false }
        };
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.animationTimer = 0;
        this.isMoving = false;
        this.isJumping = false;
        this.direction = 1;
        
        // Sprites
        this.sprites = {
            idle: this.loadSprites('idle', 4),
            walk: this.loadSprites('walk', 6),
            jump: this.loadSprites('jump', 4)
        };
    }

    loadSprites(type, count) {
        const sprites = [];
        for (let i = 1; i <= count; i++) {
            const sprite = new Image();
            sprite.src = `image/player/${type}${i}.png`;
            sprite.onerror = () => console.error(`Failed to load ${type} sprite ${i}`);
            sprites.push(sprite);
        }
        return sprites;
    }

    draw(cameraX) {
        this.ctx.save();
        
        let currentSprite;
        if (!this.isOnGround) {
            this.animationFrame = Math.min(2, Math.floor(Math.abs(this.velocity.y) / 10));
            currentSprite = this.sprites.jump[this.animationFrame];
        } else if (this.isMoving) {
            this.animationTimer += this.animationSpeed;
            this.animationFrame = Math.floor(this.animationTimer) % this.sprites.walk.length;
            currentSprite = this.sprites.walk[this.animationFrame];
        } else {
            this.animationTimer += this.animationSpeed * 0.5;
            this.animationFrame = Math.floor(this.animationTimer) % this.sprites.idle.length;
            currentSprite = this.sprites.idle[this.animationFrame];
        }
        
        if (this.direction === -1) {
            this.ctx.translate(this.position.x - cameraX + this.width, this.position.y);
            this.ctx.scale(-this.scale, this.scale);
            this.ctx.drawImage(currentSprite, 0, 0, this.originalWidth, this.originalHeight);
        } else {
            this.ctx.scale(this.scale, this.scale);
            this.ctx.drawImage(
                currentSprite, 
                (this.position.x - cameraX) / this.scale, 
                this.position.y / this.scale, 
                this.originalWidth, 
                this.originalHeight
            );
        }
        
        this.ctx.restore();
    }

    update(platforms) {
        // Horizontal movement
        this.velocity.x = 0;
        this.isMoving = false;
        
        if (this.keys.d.pressed) {
            this.velocity.x = PLAYER_SPEED;
            this.isMoving = true;
            this.direction = 1;
        }
        if (this.keys.a.pressed) {
            this.velocity.x = -PLAYER_SPEED;
            this.isMoving = true;
            this.direction = -1;
        }

        // Jumping
        if ((this.keys.w.pressed || this.keys[" "].pressed) && this.isOnGround && !this.jumpCooldown) {
            this.velocity.y = JUMP_FORCE;
            this.isOnGround = false;
            this.jumpCooldown = true;
            this.isJumping = true;
            setTimeout(() => this.jumpCooldown = false, 100);
        }

        // Apply gravity
        this.velocity.y += GRAVITY;

        // Horizontal collisions
        this.position.x += this.velocity.x;
        this.checkPlatformCollisions(platforms, 'horizontal');

        // Vertical collisions
        this.position.y += this.velocity.y;
        this.isOnGround = false;
        this.checkPlatformCollisions(platforms, 'vertical');

        // Level boundaries
        this.enforceLevelBounds();
    }

    checkPlatformCollisions(platforms, direction) {
        platforms.forEach(platform => {
            if (this.position.x < platform.position.x + platform.width &&
                this.position.x + this.width > platform.position.x &&
                this.position.y < platform.position.y + platform.height &&
                this.position.y + this.height > platform.position.y) {
                
                if (direction === 'horizontal') {
                    if (this.velocity.x > 0) {
                        this.position.x = platform.position.x - this.width;
                    } else if (this.velocity.x < 0) {
                        this.position.x = platform.position.x + platform.width;
                    }
                } else {
                    if (this.velocity.y > 0) {
                        this.position.y = platform.position.y - this.height;
                        this.velocity.y = 0;
                        this.isOnGround = true;
                        this.isJumping = false;
                    } else if (this.velocity.y < 0) {
                        this.position.y = platform.position.y + platform.height;
                        this.velocity.y = 0;
                    }
                }
            }
        });
    }

    enforceLevelBounds() {
        if (this.position.x < this.levelBounds.left) {
            this.position.x = this.levelBounds.left;
            this.velocity.x = 0;
        }
        if (this.position.x + this.width > this.levelBounds.right) {
            this.position.x = this.levelBounds.right - this.width;
            this.velocity.x = 0;
        }
        if (this.position.y + this.height > this.levelBounds.bottom) {
            this.position.y = this.levelBounds.bottom - this.height;
            this.velocity.y = 0;
            this.isOnGround = true;
            this.isJumping = false;
        }
    }
} 