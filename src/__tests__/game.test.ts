import { Game } from '../game';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    // Создаем мок canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    game = new Game(canvas);
  });

  test('should initialize with correct properties', () => {
    expect(game).toBeDefined();
    expect(game.canvas).toBeDefined();
    expect(game.ctx).toBeDefined();
  });

  test('should start game correctly', () => {
    game.start();
    expect(game.isRunning).toBe(true);
  });

  test('should stop game correctly', () => {
    game.start();
    game.stop();
    expect(game.isRunning).toBe(false);
  });
}); 