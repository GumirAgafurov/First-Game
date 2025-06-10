import { Game } from './game';

export class OwlNPC {
    constructor(game: Game);
    update(deltaTime: number): void;
    draw(ctx: CanvasRenderingContext2D, cameraX: number): void;
    checkInteraction(player: { position: { x: number; y: number }; width: number; height: number }, cameraX: number): boolean;
    showTutorial(type: string): void;
    showNextDialogue(): void;
    clearDialogue(): void;
} 