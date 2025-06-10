class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.volume = 0.5;
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.loadSounds();
    }

    loadSounds() {
        // Загрузка звуковых эффектов
        const soundFiles = {
            jump: 'sounds/jump.mp3',
            collect: 'sounds/collect.mp3',
            hit: 'sounds/hit.mp3',
            levelComplete: 'sounds/level_complete.mp3',
            gameOver: 'sounds/game_over.mp3'
        };

        for (const [name, path] of Object.entries(soundFiles)) {
            this.sounds[name] = new Audio(path);
        }

        // Загрузка фоновой музыки
        this.music = new Audio('sounds/background_music.mp3');
        this.music.loop = true;
    }

    playSound(name) {
        if (!this.soundEnabled || !this.sounds[name]) return;
        
        const sound = this.sounds[name].cloneNode();
        sound.volume = this.volume;
        sound.play().catch(error => console.error('Error playing sound:', error));
    }

    playMusic() {
        if (!this.musicEnabled || !this.music) return;
        
        this.music.volume = this.volume;
        this.music.play().catch(error => console.error('Error playing music:', error));
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.music) {
            this.music.volume = this.volume;
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.playMusic();
        } else {
            this.stopMusic();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
    }
}

// Экспортируем класс для использования в TypeScript файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager };
} 