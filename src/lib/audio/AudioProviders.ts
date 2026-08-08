// src/lib/audio/AudioProviders.ts
// NUR Lingo Audio Engine — Audio Provider Implementations

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
import { audioCache } from "./AudioCache";
import { audioManifest } from "./AudioManifest";

/**
 * Local MP3 Provider
 * Plays pre-recorded MP3 files from public/audio/{lang}/{id}.mp3
 */
export class MP3AudioProvider implements IAudioProvider {
  readonly type = AudioProviderType.MP3;
  readonly name = "Local MP3";
  readonly capabilities: ProviderCapabilities = {
    canPlayFiles: true,
    canSynthesize: false,
    canStream: false,
    hasVoiceSelection: false,
    requiresNetwork: false,
    supportsOffline: true,
    canPersist: false,
  };

  private activeAudio: HTMLAudioElement | null = null;
  private activeId: string | null = null;

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async play(text: string, lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult> {
    const audioId = options.id;
    if (!audioId) {
      throw new Error("MP3 provider requires an audio ID");
    }

    const paddedId = audioId.padStart(6, "0");
    const url = `/audio/${lang}/${paddedId}.mp3`;

    // Check if file exists
    const exists = await audioManifest.checkAudioExists(audioId, lang);
    if (!exists) {
      throw new Error(`MP3 not found: ${url}`);
    }

    options.onLoading?.();

    try {
      const audio = await audioCache.getOrLoad(url);
      const clone = audio.cloneNode(true) as HTMLAudioElement;

      this.activeAudio = clone;
      this.activeId = audioId;

      clone.volume = options.volume ?? 1.0;
      clone.playbackRate = options.rate ?? 1.0;

      return new Promise((resolve, reject) => {
        clone.onplay = () => {
          options.onSource?.(this.type);
          options.onStart?.();
        };

        clone.onended = () => {
          this.activeAudio = null;
          this.activeId = null;
          options.onEnd?.();
          resolve({
            provider: this.type,
            isTTSFallback: false,
            completed: true,
          });
        };

        clone.onerror = () => {
          this.activeAudio = null;
          this.activeId = null;
          const error = new Error(`Playback error: ${url}`);
          options.onError?.(error);
          reject(error);
        };

        clone.play().catch((err) => {
          this.activeAudio = null;
          this.activeId = null;
          options.onError?.(err);
          reject(err);
        });
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error("MP3 load failed");
    }
  }

  stop(): void {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
      this.activeId = null;
    }
  }

  isPlaying(): boolean {
    return this.activeAudio !== null && !this.activeAudio.paused;
  }
}

/**
 * Browser SpeechSynthesis Provider
 * Uses the Web Speech API for text-to-speech
 */
export class BrowserTTSProvider implements IAudioProvider {
  readonly type = AudioProviderType.BROWSER_TTS;
  readonly name = "Browser TTS";
  readonly capabilities: ProviderCapabilities = {
    canPlayFiles: false,
    canSynthesize: true,
    canStream: false,
    hasVoiceSelection: true,
    requiresNetwork: false,
    supportsOffline: true,
    canPersist: false,
  };

  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private isCurrentlySpeaking = false;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;

  async isAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    if (this.voicesLoaded && this.voices.length > 0) {
      return this.voices;
    }

    const synth = window.speechSynthesis;
    if (!synth) return [];

    // Voices load asynchronously
    const loadedVoices = synth.getVoices();
    if (loadedVoices.length > 0) {
      this.voices = loadedVoices;
      this.voicesLoaded = true;
      return this.voices;
    }

    // Wait for voiceschanged event
    return new Promise((resolve) => {
      const handler = () => {
        this.voices = synth.getVoices();
        this.voicesLoaded = true;
        synth.removeEventListener("voiceschanged", handler);
        resolve(this.voices);
      };
      synth.addEventListener("voiceschanged", handler);

      // Timeout fallback
      setTimeout(() => {
        this.voices = synth.getVoices();
        this.voicesLoaded = true;
        synth.removeEventListener("voiceschanged", handler);
        resolve(this.voices);
      }, 1000);
    });
  }

  async play(text: string, lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult> {
    const synth = window.speechSynthesis;
    if (!synth) {
      throw new Error("Speech synthesis not available");
    }

    // Cancel any current speech
    if (synth.speaking) {
      synth.cancel();
    }

    options.onLoading?.();

    // Load voices if needed
    await this.loadVoices();

    const langConfig = LANGUAGE_CONFIGS[lang];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langConfig.speechSynthesisLang;
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Try to find a matching voice
    const voices = await this.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(langConfig.speechSynthesisLang.split("-")[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    this.activeUtterance = utterance;
    this.isCurrentlySpeaking = true;

    return new Promise((resolve, reject) => {
      utterance.onstart = () => {
        options.onSource?.(this.type);
        options.onStart?.();
      };

      utterance.onend = () => {
        this.activeUtterance = null;
        this.isCurrentlySpeaking = false;
        options.onEnd?.();
        resolve({
          provider: this.type,
          isTTSFallback: true,
          completed: true,
        });
      };

      utterance.onerror = (event) => {
        this.activeUtterance = null;
        this.isCurrentlySpeaking = false;
        const error = new Error(`Speech synthesis error: ${event.error}`);
        options.onError?.(error);
        reject(error);
      };

      options.onSource?.(this.type);
      synth.speak(utterance);

      // Workaround for Chrome bug where speech synthesis gets stuck
      // Resume if synthesis gets stuck
      const resumeInterval = setInterval(() => {
        if (!synth.speaking) {
          clearInterval(resumeInterval);
        } else {
          synth.pause();
          synth.resume();
        }
      }, 10000);

      // Clean up interval when done
      const cleanup = () => clearInterval(resumeInterval);
      utterance.onend = () => {
        cleanup();
        this.activeUtterance = null;
        this.isCurrentlySpeaking = false;
        options.onEnd?.();
        resolve({
          provider: this.type,
          isTTSFallback: true,
          completed: true,
        });
      };
      utterance.onerror = (event) => {
        cleanup();
        this.activeUtterance = null;
        this.isCurrentlySpeaking = false;
        const error = new Error(`Speech synthesis error: ${event.error}`);
        options.onError?.(error);
        reject(error);
      };
    });
  }

  stop(): void {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
    }
    this.activeUtterance = null;
    this.isCurrentlySpeaking = false;
  }

  isPlaying(): boolean {
    const synth = window.speechSynthesis;
    return this.isCurrentlySpeaking || (synth?.speaking ?? false);
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return this.loadVoices();
  }
}

/**
 * Null Provider
 * Used when no audio is available
 */
export class NullAudioProvider implements IAudioProvider {
  readonly type = AudioProviderType.MP3; // Placeholder
  readonly name = "No Audio";
  readonly capabilities: ProviderCapabilities = {
    canPlayFiles: false,
    canSynthesize: false,
    canStream: false,
    hasVoiceSelection: false,
    requiresNetwork: false,
    supportsOffline: true,
    canPersist: false,
  };

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async play(): Promise<AudioPlayResult> {
    throw new Error("No audio provider available");
  }

  stop(): void {}

  isPlaying(): boolean {
    return false;
  }
}

// Provider instances
export const mp3Provider = new MP3AudioProvider();
export const browserTTSProvider = new BrowserTTSProvider();
export const nullProvider = new NullAudioProvider();
