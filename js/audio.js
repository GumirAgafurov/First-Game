export class AudioManager {
    constructor() {
        this.sounds = {
            background: new Audio('sound/background.mp3'),
            collect: new Audio('sound/collect.mp3')
        };

        // Настройка фоновой музыки
        this.sounds.background.loop = true;
        this.sounds.background.volume = 0.3;

        // Флаг состояния звука
        this.enabled = true;
        
        // Обработка ошибок загрузки
        Object.entries(this.sounds).forEach(([key, sound]) => {
            sound.onerror = () => {
                console.error(`Ошибка загрузки звука: ${key}`);
                this.sounds[key] = null;
            };
        });

        // Инициализация после первого взаимодействия пользователя
        document.addEventListener('click', () => {
            if (this.enabled && this.sounds.background) {
                this.sounds.background.play().catch(console.error);
            }
        }, { once: true });
    }

    toggleSound(enabled) {
        this.enabled = enabled;
        if (this.sounds.background) {
            if (enabled) {
                this.sounds.background.play().catch(console.error);
            } else {
                this.sounds.background.pause();
            }
        }
    }

    setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = volume;
            }
        });
    }

    playSound(soundName) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(console.error);
        }
    }

    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }
} 