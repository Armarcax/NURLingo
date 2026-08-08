// src/lib/audio/AudioManager.ts
// NUR Lingo Audio Engine — Central Audio Manager (Single Public API)

import {
  AudioProviderType,
  AudioPlayOptions,
  AudioPlayResult,
  AudioSettings,
  AudioCacheStats,
  LanguageCode,
  AudioGenerateRequest,
  AudioGenerateResult,
  AudioEngineEvents,
  AudioProgressEvent,
  DEFAULT_AUDIO_SETTINGS,
} from "./AudioTypes";
import { audioCache } from "./AudioCache";
import { audioManifest } from "./AudioManifest";
import { audioQueue } from "./AudioQueue";
import { audioSettings } from "./AudioSettings";
import {
  MP3AudioProvider,
  BrowserTTSProvider,
  mp3Provider,
  browserTTSProvider,
} from "./AudioProviders";
import type { IAudioProvider } from "./AudioTypes";

type EventHandler<K extends keyof AudioEngineEvents> = (data: AudioEngineEvents[K]) => void;

/**
 * AudioManager — The single public API for all audio operations
 *
 * This class provides:
 * - Unified play/stop/pause interface
 * - Automatic provider fallback (MP3 → TTS)
 * - Intelligent caching and preloading
 * - Queue management
 * - Settings management
 * - Event system for UI updates
 *
 * Usage:
 *   import { audioManager } from "@/lib/audio";
 *   await audioManager.play("բարև", "hy", { id: "000001" });
 */
class AudioManager {
  private providers: Map<AudioProviderType, IAudioProvider> = new Map();
  private currentPlayId: string | null = null;
  private lastPlayKey: string | null = null;
  private eventHandlers: Map<string, Set<EventHandler<any>>> = new Map();
  private pendingOperations: Map<string, Promise<void>> = new Map();

  constructor() {
    // Register default providers
    this.registerProvider(mp3Provider);
    this.registerProvider(browserTTSProvider);

    // Subscribe to settings changes
    audioSettings.subscribe((settings) => {
      this.emit("settingsChange", settings);
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Core Playback
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Play audio for a word or phrase
   *
   * @param text - The text to speak (used for TTS fallback)
   * @param lang - Language code (hy, en, ru)
   * @param options - Playback options including audio ID for MP3 lookup
   * @returns Play result with provider info
   */
  async play(
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions = {}
  ): Promise<AudioPlayResult> {
    const playKey = options.id ? `${options.id}-${lang}` : `tts-${text}-${lang}`;

    // Toggle off if same item is playing
    if (this.lastPlayKey === playKey && this.isPlaying()) {
      this.stop();
      return { provider: AudioProviderType.MP3, isTTSFallback: false, completed: false };
    }

    this.lastPlayKey = playKey;
    this.emit("loading", { id: options.id ?? text });
    options.onLoading?.();

    // Deduplicate concurrent plays of the same item
    const pendingKey = `play:${playKey}`;
    if (this.pendingOperations.has(pendingKey)) {
      await this.pendingOperations.get(pendingKey);
    }

    const playPromise = this.executePlay(text, lang, options);
    this.pendingOperations.set(pendingKey, playPromise.then(() => {}));

    try {
      return await playPromise;
    } finally {
      this.pendingOperations.delete(pendingKey);
    }
  }

  /**
   * Execute play with fallback chain
   */
  private async executePlay(
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions
  ): Promise<AudioPlayResult> {
    // Stop any current playback
    this.stop();

    const settings = audioSettings.get();
    const fallbackChain = options.preferredProvider
      ? [options.preferredProvider, ...settings.fallbackChain.filter((p) => p !== options.preferredProvider)]
      : settings.fallbackChain;

    // Force specific provider if requested
    if (options.forceProvider) {
      const provider = this.providers.get(options.forceProvider);
      if (provider) {
        const available = await provider.isAvailable();
        if (available) {
          return provider.play(text, lang, options);
        }
      }
      throw new Error(`Forced provider ${options.forceProvider} not available`);
    }

    // Try providers in fallback chain order
    const errors: Error[] = [];

    for (const providerType of fallbackChain) {
      const provider = this.providers.get(providerType);
      if (!provider) continue;

      // Check if provider needs ID and we don't have one
      if (providerType === AudioProviderType.MP3 && !options.id) {
        continue;
      }

      try {
        const available = await provider.isAvailable();
        if (!available) continue;

        const result = await provider.play(text, lang, {
          ...options,
          volume: options.volume ?? settings.volume,
          rate: options.rate ?? settings.rate,
          onSource: (source) => {
            this.currentPlayId = options.id ?? text;
            this.emit("play", { id: this.currentPlayId, provider: source });
            options.onSource?.(source);
          },
        });

        return result;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error("Unknown error"));
      }
    }

    // All providers failed
    const finalError = new Error(`All audio providers failed: ${errors.map((e) => e.message).join("; ")}`);
    options.onError?.(finalError);
    this.emit("error", { id: options.id ?? text, error: finalError });
    throw finalError;
  }

  /**
   * Stop all audio playback immediately
   */
  stop(): void {
    for (const provider of this.providers.values()) {
      provider.stop();
    }
    this.currentPlayId = null;
    if (this.lastPlayKey) {
      this.emit("stop", { id: this.lastPlayKey });
    }
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    for (const provider of this.providers.values()) {
      if (provider.isPlaying()) return true;
    }
    return false;
  }

  /**
   * Pause playback (respects TTS limitations - stops instead)
   */
  pause(): void {
    this.stop(); // TTS doesn't support pause, so we stop
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Queue Operations
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Queue audio for playback
   */
  queuePlay(text: string, lang: LanguageCode, options: AudioPlayOptions = {}): string {
    return audioQueue.enqueue(text, lang, options);
  }

  /**
   * Clear the playback queue
   */
  clearQueue(): void {
    audioQueue.clear();
    this.emit("queueChange", { queueLength: 0 });
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return audioQueue.length;
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Preloading
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Preload audio files for faster playback
   *
   * @param items - Array of {id, lang} to preload
   */
  async preload(items: Array<{ id: string; lang: LanguageCode }>): Promise<void> {
    const settings = audioSettings.get();
    const toLoad = items.slice(0, settings.preloadCount);
    const urls: string[] = [];

    for (const { id, lang } of toLoad) {
      const paddedId = id.padStart(6, "0");
      const url = `/audio/${lang}/${paddedId}.mp3`;

      // Check if exists before loading
      const exists = await audioManifest.checkAudioExists(id, lang);
      if (exists) {
        urls.push(url);
      }
    }

    if (urls.length > 0) {
      await audioCache.prefetch(urls);
    }
  }

  /**
   * Preload a single audio file
   */
  async preloadOne(id: string, lang: LanguageCode): Promise<boolean> {
    const exists = await audioManifest.checkAudioExists(id, lang);
    if (!exists) return false;

    const paddedId = id.padStart(6, "0");
    const url = `/audio/${lang}/${paddedId}.mp3`;

    try {
      await audioCache.getOrLoad(url);
      return true;
    } catch {
      return false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Status & Information
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Check if audio exists for a given ID
   */
  async hasAudio(id: string, lang: LanguageCode): Promise<boolean> {
    return audioManifest.checkAudioExists(id, lang);
  }

  /**
   * Get available voices for TTS
   */
  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    const browserProvider = this.providers.get(AudioProviderType.BROWSER_TTS);
    if (browserProvider && browserProvider.getVoices) {
      return browserProvider.getVoices();
    }
    return [];
  }

  /**
   * Get current playback ID
   */
  getCurrentPlayId(): string | null {
    return this.currentPlayId;
  }

  /**
   * Check if a specific item is currently playing
   */
  isPlayingItem(id: string, lang: LanguageCode): boolean {
    return this.currentPlayId === id || this.lastPlayKey === `${id}-${lang}`;
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Settings
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return audioSettings.get();
  }

  /**
   * Update audio settings
   */
  updateSettings(updates: Partial<AudioSettings>): AudioSettings {
    return audioSettings.update(updates);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Statistics
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Get cache statistics
   */
  getCacheStats(): AudioCacheStats {
    return audioCache.getStats();
  }

  /**
   * Get manifest statistics
   */
  async getManifestStats(lang: LanguageCode): Promise<{ total: number; ready: number; missing: number }> {
    return audioManifest.getStats(lang);
  }

  /**
   * Get missing audio IDs for a language
   */
  async getMissingAudio(lang?: LanguageCode): Promise<string[]> {
    return audioManifest.getMissingAudio(lang);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Cache Management
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Clear all cached audio
   */
  clearCache(): void {
    audioCache.clear();
    audioManifest.clearCache();
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Provider Management
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Register a custom audio provider
   */
  registerProvider(provider: IAudioProvider): void {
    this.providers.set(provider.type, provider);
  }

  /**
   * Check if a provider is available
   */
  async isProviderAvailable(type: AudioProviderType): Promise<boolean> {
    const provider = this.providers.get(type);
    if (!provider) return false;
    return provider.isAvailable();
  }

  /**
   * Get all registered provider types
   */
  getRegisteredProviders(): AudioProviderType[] {
    return Array.from(this.providers.keys());
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API - Events
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Subscribe to audio engine events
   */
  on<K extends keyof AudioEngineEvents>(
    event: K,
    handler: EventHandler<K>
  ): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Emit an event
   */
  private emit<K extends keyof AudioEngineEvents>(
    event: K,
    data: AudioEngineEvents[K]
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch {
          // Handler error - ignore
        }
      }
    }
  }
}

// Singleton instance - THE single public API
export const audioManager = new AudioManager();

// Export convenience methods
export { audioCache } from "./AudioCache";
export { audioManifest } from "./AudioManifest";
export { audioQueue } from "./AudioQueue";
export { audioSettings } from "./AudioSettings";

// Re-export types
export * from "./AudioTypes";
