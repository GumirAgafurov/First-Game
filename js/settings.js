// Game Settings Module
export class Settings {
    constructor() {
        this.settings = {
            volume: 50,
            musicEnabled: true
        };
        this.loadSettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    getVolume() {
        return this.settings.volume;
    }

    setVolume(value) {
        this.settings.volume = value;
        this.saveSettings();
    }

    isMusicEnabled() {
        return this.settings.musicEnabled;
    }

    setMusicEnabled(value) {
        this.settings.musicEnabled = value;
        this.saveSettings();
    }
}

// Create and export instance
const settingsManager = new Settings();
export default settingsManager; 