// src/lib/audio/AudioSettings.ts
// NUR Lingo Audio Engine — User Settings Management

import {
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  AudioProviderType,
  LanguageCode,
} from "./AudioTypes";

const STORAGE_KEY = "nurlingo_audio_settings";

type SettingsChangeHandler = (settings: AudioSettings) => void;

/**
 * Manages user audio preferences with localStorage persistence
 */
class AudioSettingsManager {
  private settings: AudioSettings;
  private handlers: Set<SettingsChangeHandler> = new Set();

  constructor() {
    this.settings = this.load();
  }

  /**
   * Load settings from localStorage
   */
  private load(): AudioSettings {
    if (typeof window === "undefined") {
      return { ...DEFAULT_AUDIO_SETTINGS };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_AUDIO_SETTINGS, ...parsed };
      }
    } catch {
      // Invalid stored settings
    }

    return { ...DEFAULT_AUDIO_SETTINGS };
  }

  /**
   * Save settings to localStorage
   */
  private save(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }

  /**
   * Get all settings
   */
  get(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  update(updates: Partial<AudioSettings>): AudioSettings {
    this.settings = { ...this.settings, ...updates };
    this.save();
    this.notifyHandlers();
    return this.get();
  }

  /**
   * Reset to defaults
   */
  reset(): AudioSettings {
    this.settings = { ...DEFAULT_AUDIO_SETTINGS };
    this.save();
    this.notifyHandlers();
    return this.get();
  }

  /**
   * Get a specific setting
   */
  getVolume(): number {
    return this.settings.volume;
  }

  getRate(): number {
    return this.settings.rate;
  }

  getAutoPlay(): boolean {
    return this.settings.autoPlay;
  }

  getPreferredTTS(): AudioProviderType {
    return this.settings.preferredTTS;
  }

  getFallbackChain(): AudioProviderType[] {
    return [...this.settings.fallbackChain];
  }

  getVoicePreference(lang: LanguageCode): string | undefined {
    return this.settings.voicePreferences[lang];
  }

  /**
   * Set specific settings
   */
  setVolume(volume: number): void {
    this.update({ volume: Math.max(0, Math.min(1, volume)) });
  }

  setRate(rate: number): void {
    this.update({ rate: Math.max(0.5, Math.min(2, rate)) });
  }

  setAutoPlay(autoPlay: boolean): void {
    this.update({ autoPlay });
  }

  setPreferredTTS(provider: AudioProviderType): void {
    this.update({ preferredTTS: provider });
  }

  setFallbackChain(chain: AudioProviderType[]): void {
    this.update({ fallbackChain: chain });
  }

  setVoicePreference(lang: LanguageCode, voice: string): void {
    this.update({
      voicePreferences: {
        ...this.settings.voicePreferences,
        [lang]: voice,
      },
    });
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(handler: SettingsChangeHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Notify all handlers of changes
   */
  private notifyHandlers(): void {
    const settings = this.get();
    for (const handler of this.handlers) {
      try {
        handler(settings);
      } catch {
        // Handler error
      }
    }
  }

  /**
   * Check if TTS indicator should be shown
   */
  shouldShowTTSIndicator(): boolean {
    return this.settings.showTTSIndicator;
  }

  /**
   * Get preload count
   */
  getPreloadCount(): number {
    return this.settings.preloadCount;
  }

  /**
   * Check if caching is enabled
   */
  isCacheEnabled(): boolean {
    return this.settings.cacheEnabled;
  }
}

export const audioSettings = new AudioSettingsManager();
