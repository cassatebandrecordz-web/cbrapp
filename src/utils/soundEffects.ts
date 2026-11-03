import { Platform } from 'react-native';
import { SLOT_AUDIO_BASE64 } from '../constants/slotAudioBase64';

/**
 * Universal Sound Effects System for CASSATE BAND RECORDZ
 * Supports Native Android & iOS (via expo-audio) + Web (via Web Audio API)
 * All native audio components are instantiated 100% lazily on user tap
 * to avoid any native thread blocking or startup crashes.
 */

class SoundEffectManager {
  private ctx: any = null;
  private slotAudioBuffer: any = null;
  private slotAudioElement: any = null;
  private nativePlayer: any = null;

  constructor() {
    // Zero initialization in constructor to ensure 100% safe app launch
  }

  private playNativeAudio(volume = 0.9): boolean {
    if (Platform.OS === 'web') return false;
    try {
      if (!this.nativePlayer) {
        // Dynamically require expo-audio only on user action
        const expoAudio = require('expo-audio');
        if (expoAudio && typeof expoAudio.createAudioPlayer === 'function') {
          this.nativePlayer = expoAudio.createAudioPlayer(
            require('../../assets/sounds/slot_timing_click.mp3')
          );
        }
      }
      if (this.nativePlayer) {
        this.nativePlayer.volume = volume;
        if (typeof this.nativePlayer.seekTo === 'function') {
          this.nativePlayer.seekTo(0).catch(() => {});
        }
        if (typeof this.nativePlayer.play === 'function') {
          this.nativePlayer.play();
        }
        return true;
      }
    } catch {
      // Graceful audio fallback - never throw or crash the UI
      return false;
    }
    return false;
  }

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
    if (Platform.OS !== 'web') {
      this.playNativeAudio(0.7);
      return;
    }

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
   * "Get Started" Click Sound
   */
  public playGetStarted() {
    if (Platform.OS !== 'web') {
      this.playNativeAudio(1.0);
      return;
    }

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
   * "Sign In" & "Register" Button Click Sound
   */
  public playAuthSubmit() {
    if (Platform.OS !== 'web') {
      this.playNativeAudio(0.9);
      return;
    }

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const tones = [587.33, 880.0];
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
   * Service Card & Banner Click Sound
   */
  public playServiceClick() {
    if (Platform.OS !== 'web') {
      this.playNativeAudio(0.85);
      return;
    }

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

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
    } catch {
      this.playClick(900, 0.04);
    }
  }

  /**
   * Tab Switch Sound
   */
  public playTabSwitch() {
    this.playClick(720, 0.03, 'sine');
  }

  /**
   * Preload Slot Sound
   */
  public preloadSlotSound() {
    // No-op during boot for maximum startup speed
  }

  /**
   * Custom Slot Timing Selection SFX
   */
  public playSlotTimingClick() {
    if (Platform.OS !== 'web') {
      this.playNativeAudio(1.0);
      return;
    }

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

      if (typeof window !== 'undefined' && (window as any).Audio) {
        const audio = new (window as any).Audio(SLOT_AUDIO_BASE64);
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
    } catch {
      this.playClick(900, 0.04);
    }
  }
}

export const soundEffects = new SoundEffectManager();
