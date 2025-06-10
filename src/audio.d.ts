export class AudioManager {
    constructor();
    playSound(name: string): void;
    playMusic(): void;
    stopMusic(): void;
    setVolume(value: number): void;
    toggleMusic(): void;
    toggleSound(): void;
} 