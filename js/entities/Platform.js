export class Platform {
    constructor({position, width = 200, height = 20}, ctx) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = "green";
        this.ctx = ctx;
    }

    draw(cameraX) {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
            this.position.x - cameraX,
            this.position.y,
            this.width,
            this.height
        );
    }
} 