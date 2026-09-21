// PahadiCart Web Audio API Synthesizer & Looping Chime Engine
// 100% Zero external audio files required - works offline and cross-device
class PahadiAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.repeatTimer = null;
    this.currentRepeatType = null;
    this.isUnlocked = false;

    // Auto-unlock audio context on first user touch/click
    this.setupGestureUnlock();
  }

  setupGestureUnlock() {
    const unlock = () => {
      this.init();
      if (this.ctx && this.ctx.state === 'running') {
        this.isUnlocked = true;
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopRepeatChime();
    }
    return this.muted;
  }

  // 1. "Ghar Ki Ghanti" - Mountain Temple / Merchant Order Chime (Resonant harmonics)
  playGharKiGhanti() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.3 / (idx + 1), now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.07 + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 1.9);
    });
  }

  // 2. Rider Dispatch Alert Ping (Sharp mountain radar double beep)
  playRiderPing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.16].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(i === 0 ? 880 : 1174.66, now + delay); // A5 -> D6
      osc.frequency.exponentialRampToValueAtTime(i === 0 ? 1046.50 : 1396.91, now + delay + 0.09);

      gain.gain.setValueAtTime(0.35, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.008, now + delay + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.16);
    });
  }

  // 3. Customer Order Status Update Chime (Warm, pleasant melodic 3-note chime)
  playCustomerUpdateChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);

      gain.gain.setValueAtTime(0, now + idx * 0.11);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.75);
    });
  }

  // 4. Success Tune (Order placed / delivered)
  playSuccessTune() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.22, now + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.55);
    });
  }

  // 5. Emergency SOS Siren
  playSOSAlert() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.25);
    osc.frequency.linearRampToValueAtTime(600, now + 0.5);
    osc.frequency.linearRampToValueAtTime(950, now + 0.75);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.95);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.0);
  }

  // 6. Looping Chime (e.g. for merchant/rider until order acknowledged)
  startRepeatChime(type = 'merchant', intervalMs = 6500) {
    if (this.muted) return;
    this.stopRepeatChime();
    this.currentRepeatType = type;

    const playFn = () => {
      if (this.currentRepeatType === 'merchant') {
        this.playGharKiGhanti();
      } else if (this.currentRepeatType === 'rider') {
        this.playRiderPing();
      } else {
        this.playCustomerUpdateChime();
      }
    };

    playFn();
    this.repeatTimer = setInterval(playFn, intervalMs);
  }

  stopRepeatChime() {
    if (this.repeatTimer) {
      clearInterval(this.repeatTimer);
      this.repeatTimer = null;
    }
    this.currentRepeatType = null;
  }
}

window.pahadiAudio = new PahadiAudioEngine();
