class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.initSounds();
    }

    async initSounds() {
        const shootOsc = this.audioContext.createOscillator();
        const shootGain = this.audioContext.createGain();
        shootOsc.connect(shootGain);
        shootGain.connect(this.audioContext.destination);
        
        this.sounds.shoot = {
            play: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
                gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                osc.start();
                osc.stop(this.audioContext.currentTime + 0.2);
            }
        };

        this.sounds.hit = {
            play: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
                gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                osc.start();
                osc.stop(this.audioContext.currentTime + 0.1);
            }
        };
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
}
