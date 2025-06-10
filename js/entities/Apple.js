export class Apple {
    constructor({position}, ctx) {
        this.position = position;
        this.width = 30;
        this.height = 30;
        this.collected = false;
        this.blinkTimer = 0;
        this.image = new Image();
        this.image.src = "./image/apple.png";
        this.image.onerror = () => console.error("Failed to load apple image");
        this.ctx = ctx;
    }

    draw(cameraX) {
        if (!this.image || (this.collected && this.blinkTimer % 2 === 0)) return;
        this.ctx.globalAlpha = 1 - this.blinkTimer/10;
        this.ctx.drawImage(
            this.image,
            this.position.x - cameraX,
            this.position.y,
            this.width,
            this.height
        );
        this.ctx.globalAlpha = 1;
    }

    update() {
        if (this.collected) this.blinkTimer++;
        return this.blinkTimer <= 10;
    }
} 