// src/lib/audio/NarakeetProvider.ts
// NUR Lingo Audio Engine — Narakeet TTS Provider
// Official REST API: https://www.narakeet.com/docs/automating/text-to-speech-api

import {
  IAudioProvider,
  AudioProviderType,
  ProviderCapabilities,
  LanguageCode,
  AudioPlayOptions,
  AudioPlayResult,
  AudioGenerateRequest,
  AudioGenerateResult,
  LANGUAGE_CONFIGS,
} from "./AudioTypes";

/**
 * Narakeet voice IDs for supported languages
 * Full voice list: https://www.narakeet.com/languages/
 */
const NARAKEET_VOICES: Record<LanguageCode, string[]> = {
  hy: [], // Armenian - not directly supported by Narakeet
  en: ["bella", "damay", "duane", "jordan", "kyle", "maria", "mickey", "sara"],
  ru: ["boris", "katya", "kate", "nastya", "pasha", "viktor"],
};

/**
 * Narakeet API Configuration
 */
interface NarakeetConfig {
  apiKey: string;
  baseUrl: string;
  format: "mp3" | "m4a" | "wav";
}

/**
 * Narakeet TTS Provider
 *
 * Uses Narakeet's official REST API for text-to-speech.
 * Supports streaming for short content (<1KB) and polling for long content.
 *
 * IMPORTANT: Narakeet does NOT support Armenian (hy) language.
 * For Armenian, this provider will return unavailable and fallback will be used.
 *
 * API Documentation: https://www.narakeet.com/docs/automating/text-to-speech-api
 */
export class NarakeetTTSProvider implements IAudioProvider {
  readonly type = AudioProviderType.NARAKEET;
  readonly name = "Narakeet";
  readonly capabilities: ProviderCapabilities = {
    canPlayFiles: false,
    canSynthesize: true,
    canStream: true,
    hasVoiceSelection: true,
    requiresNetwork: true,
    supportsOffline: false,
    canPersist: true,
  };

  private config: NarakeetConfig | null = null;
  private audioCache = new Map<string, { url: string; blob: Blob }>();
  private activeAudio: HTMLAudioElement | null = null;

  /**
   * Configure the provider with API key
   */
  configure(config: Partial<NarakeetConfig>): void {
    if (config.apiKey) {
      this.config = {
        apiKey: config.apiKey,
        baseUrl: config.baseUrl ?? "https://api.narakeet.com/text-to-speech",
        format: config.format ?? "mp3",
      };
    }
  }

  /**
   * Check if provider is configured and available
   */
  async isAvailable(): Promise<boolean> {
    return this.config !== null && typeof this.config.apiKey === "string" && this.config.apiKey.length > 0;
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(lang: LanguageCode): boolean {
    // Note: Narakeet does NOT support Armenian
    // It supports 100+ languages including English and Russian
    return lang === "en" || lang === "ru";
  }

  /**
   * Get available voices for a language
   */
  getAvailableVoices(lang: LanguageCode): string[] {
    return NARAKEET_VOICES[lang] ?? [];
  }

  /**
   * Play audio using Narakeet TTS
   */
  async play(text: string, lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult> {
    // Check availability
    if (!this.config) {
      throw new Error("Narakeet provider not configured. Call configure() with API key.");
    }

    // Check language support
    if (!this.isLanguageSupported(lang)) {
      throw new Error(`Narakeet does not support language: ${lang}. Use fallback TTS.`);
    }

    options.onLoading?.();

    // Check cache first
    const cacheKey = this.getCacheKey(text, lang, options);
    if (this.audioCache.has(cacheKey)) {
      const cached = this.audioCache.get(cacheKey)!;
      return this.playFromUrl(cached.url, options);
    }

    // Generate audio
    try {
      const result = await this.generateAudio(text, lang, options);

      if (result.url) {
        // Cache the result
        this.audioCache.set(cacheKey, { url: result.url, blob: result.blob! });
        return this.playFromUrl(result.url, options);
      }

      throw new Error(result.error ?? "Narakeet generation failed");
    } catch (error) {
      throw error instanceof Error ? error : new Error("Narakeet error");
    }
  }

  /**
   * Generate audio using streaming API (for short content <1KB)
   */
  private async generateAudio(
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions
  ): Promise<AudioGenerateResult> {
    if (!this.config) {
      return { id: "", provider: this.type, error: "Not configured" };
    }

    const endpoint = `${this.config.baseUrl}/${this.config.format}`;

    // Build URL with parameters
    const params = new URLSearchParams();
    const voices = this.getAvailableVoices(lang);
    if (voices.length > 0) {
      params.set("voice", voices[0]);
    }
    if (options.rate) {
      // Narakeet uses voice-speed parameter
      params.set("voice-speed", String(options.rate));
    }

    const url = `${endpoint}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "x-api-key": this.config.apiKey,
          "Accept": "application/octet-stream",
        },
        body: text,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          id: "",
          provider: this.type,
          error: errorData.message ?? `HTTP ${response.status}`,
        };
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Get duration from header
      const durationHeader = response.headers.get("x-duration-seconds");
      const duration = durationHeader ? parseInt(durationHeader, 10) : undefined;

      return {
        id: options.id ?? "",
        provider: this.type,
        url: objectUrl,
        blob,
        duration,
      };
    } catch (error) {
      return {
        id: "",
        provider: this.type,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  /**
   * Play audio from object URL
   */
  private async playFromUrl(url: string, options: AudioPlayOptions): Promise<AudioPlayResult> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this.activeAudio = audio;

      audio.volume = options.volume ?? 1.0;
      audio.playbackRate = options.rate ?? 1.0;

      audio.onplay = () => {
        options.onSource?.(this.type);
        options.onStart?.();
      };

      audio.onended = () => {
        this.activeAudio = null;
        options.onEnd?.();
        resolve({
          provider: this.type,
          isTTSFallback: false,
          completed: true,
        });
      };

      audio.onerror = () => {
        this.activeAudio = null;
        const error = new Error("Audio playback error");
        options.onError?.(error);
        reject(error);
      };

      audio.play().catch((err) => {
        this.activeAudio = null;
        options.onError?.(err);
        reject(err);
      });
    });
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.activeAudio !== null && !this.activeAudio.paused;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(text: string, lang: LanguageCode, options: AudioPlayOptions): string {
    return `narakeet:${lang}:${text}:${options.rate ?? 1}`;
  }

  /**
   * Generate audio for persistence (implements generate interface)
   */
  async generate(request: AudioGenerateRequest): Promise<AudioGenerateResult> {
    if (!this.config) {
      return { id: request.id, provider: this.type, error: "Not configured" };
    }

    if (!this.isLanguageSupported(request.lang)) {
      return {
        id: request.id,
        provider: this.type,
        error: `Language ${request.lang} not supported by Narakeet`,
      };
    }

    return this.generateAudio(request.text, request.lang, { id: request.id });
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    for (const entry of this.audioCache.values()) {
      if (entry.url.startsWith("blob:")) {
        URL.revokeObjectURL(entry.url);
      }
    }
    this.audioCache.clear();
  }
}

// Singleton instance
export const narakeetProvider = new NarakeetTTSProvider();
