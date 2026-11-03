import { SLOT_AUDIO_BASE64 } from '../constants/slotAudioBase64';

/**
 * Audio Sound Effects System for CASSATE BAND RECORDZ
 * Generates instant, zero-latency tactile click & chime sound effects
 * using the Web Audio API with graceful fallback.
 */

class SoundEffectManager {
  private ctx: any = null;
  private slotAudioBuffer: any = null;
  private slotAudioElement: any = null;

  private getAudioContext(): any {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Generic tactile UI click sound
   */
  public playClick(
    frequency: number = 880,
    durationSec: number = 0.045,
    type: 'sine' | 'triangle' | 'square' = 'sine'
  ) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, frequency * 0.4),
        ctx.currentTime + durationSec
      );

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationSec);
    } catch {
      // Audio autoplay or platform silence
    }
  }

  /**
   * "Get Started" Click Sound:
   * Energetic uplifting studio chord chime
   */
  public playGetStarted() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.045;
        const duration = 0.16;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.28, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      this.playClick(950, 0.08);
    }
  }

  /**
   * "Sign In" & "Register" Button Click Sound:
   * Solid, affirmative positive confirmation double-tone
   */
  public playAuthSubmit() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const tones = [587.33, 880.0]; // D5 -> A5
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.055;
        const duration = 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      this.playClick(800, 0.06);
    }
  }

  /**
   * Service Card & Banner Click Sound:
   * Crisp, acoustic studio mixer console tap
   */
  public playServiceClick() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Primary crisp transient pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);

      // Warm subtle body resonant tone
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(440, ctx.currentTime);

      subGain.gain.setValueAtTime(0.2, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      subOsc.start(ctx.currentTime);
      subOsc.stop(ctx.currentTime + 0.06);
    } catch {
      this.playClick(900, 0.04);
    }
  }

  /**
   * Segmented Tab Switch Sound (Sign In <-> Register toggle)
   */
  public playTabSwitch() {
    this.playClick(720, 0.03, 'sine');
  }

  /**
   * Preload the custom slot timing SFX uploaded by user
   */
  public preloadSlotSound() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.slotAudioElement && typeof Audio !== 'undefined') {
        this.slotAudioElement = new Audio(SLOT_AUDIO_BASE64);
        this.slotAudioElement.preload = 'auto';
      }
      const ctx = this.getAudioContext();
      if (ctx && !this.slotAudioBuffer && typeof fetch !== 'undefined') {
        fetch(SLOT_AUDIO_BASE64)
          .then((res) => res.arrayBuffer())
          .then((buf) => ctx.decodeAudioData(buf))
          .then((decoded) => {
            this.slotAudioBuffer = decoded;
          })
          .catch(() => {});
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Custom Slot Timing Selection SFX:
   * Plays the user's authentic studio audio sample when clicking a slot timing button
   */
  public playSlotTimingClick() {
    if (typeof window === 'undefined') return;
    try {
      const ctx = this.getAudioContext();
      if (ctx && this.slotAudioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = this.slotAudioBuffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.85, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      }

      // Instant HTML5 Audio playback fallback
      if (typeof Audio !== 'undefined') {
        const audio = new Audio(SLOT_AUDIO_BASE64);
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
    } catch {
      // Fallback click
      this.playClick(900, 0.04);
    }
  }
}

export const soundEffects = new SoundEffectManager();
