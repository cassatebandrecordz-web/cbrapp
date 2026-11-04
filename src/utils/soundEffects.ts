/**
 * Universal Sound Effects System for CASSATE BAND RECORDZ
 * Muted / Silenced: All sounds disabled as requested.
 * Zero audio thread activity, zero background audio, and zero clicks.
 */

class SoundEffectManager {
  public playClick(
    _frequency?: number,
    _durationSec?: number,
    _type?: 'sine' | 'triangle' | 'square'
  ): void {
    // Intentionally silent
  }

  public playGetStarted(): void {
    // Intentionally silent
  }

  public playAuthSubmit(): void {
    // Intentionally silent
  }

  public playServiceClick(): void {
    // Intentionally silent
  }

  public playTabSwitch(): void {
    // Intentionally silent
  }

  public preloadSlotSound(): void {
    // Intentionally silent
  }

  public playSlotTimingClick(): void {
    // Intentionally silent
  }
}

export const soundEffects = new SoundEffectManager();
