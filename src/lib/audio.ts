/**
 * Puzzle — Zero-Dependency Web Audio API Synthesizer & Tactile Haptics
 * Generates subtle, harmonic UI and puzzle feedback sounds plus optional Web Vibration haptics.
 */

class SoundEffectsController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private ensureContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public vibrate(pattern: number | number[]): void {
    if (!this.enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
      return;
    }
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration permission errors
    }
  }

  public playTone(freq: number, durationMs: number, type: OscillatorType = 'sine', gainLevel = 0.06): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Ignore audio errors
    }
  }

  public tap(): void {
    this.playTone(440, 55, 'sine', 0.04);
    this.vibrate(8);
  }

  public lock(): void {
    this.playTone(587.33, 90, 'triangle', 0.06);
    setTimeout(() => this.playTone(880, 110, 'triangle', 0.05), 55);
    this.vibrate([12, 24, 16]);
  }

  public error(): void {
    this.playTone(220, 140, 'sawtooth', 0.04);
    this.vibrate([25, 30, 25]);
  }

  public hint(): void {
    this.playTone(523.25, 80, 'sine', 0.05);
    setTimeout(() => this.playTone(659.25, 120, 'sine', 0.05), 70);
    this.vibrate(15);
  }

  public win(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 180, 'triangle', 0.07), idx * 90);
    });
    this.vibrate([18, 40, 22, 40, 35]);
  }
}

export const soundFX = new SoundEffectsController();
