// src/lib/audio/audio-service.ts
import { LanguageCode, AudioOptions, AudioProvider, AudioProviderType } from "./audio-types";
import { audioCache } from "./audio-cache";

// ─── MP3 Provider ──────────────────────────────────────────────────

class MP3Provider implements AudioProvider {
  readonly type = AudioProviderType.MP3;
  private playingId: string | null = null;
  private audioElement: HTMLAudioElement | null = null;

  async speak(text: string, lang: LanguageCode, options?: AudioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioId = options?.id;
      if (!audioId) {
        reject(new Error("MP3 provider requires audioId"));
        return;
      }

      const paddedId = audioId.padStart(6, "0");
      const url = `/audio/${lang}/${paddedId}.mp3`;

      audioCache.getOrLoad(url)
        .then((audio) => {
          const clone = audio.cloneNode() as HTMLAudioElement;
          this.audioElement = clone;
          this.playingId = audioId;

          clone.onplay = () => options?.onStart?.();
          clone.onended = () => {
            this.playingId = null;
            this.audioElement = null;
            options?.onEnd?.();
            resolve();
          };
          clone.onerror = () => {
            this.playingId = null;
            this.audioElement = null;
            const error = new Error(`MP3 play error: ${url}`);
            options?.onError?.(error);
            reject(error);
          };
          clone.play().catch((err) => {
            this.playingId = null;
            this.audioElement = null;
            options?.onError?.(err);
            reject(err);
          });
        })
        .catch((err) => {
          options?.onError?.(err);
          reject(err);
        });
    });
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
      this.playingId = null;
    }
  }

  isSpeaking(): boolean {
    return this.playingId !== null || !!(this.audioElement && !this.audioElement.paused);
  }
}

// ─── Browser TTS Provider ──────────────────────────────────────────

class BrowserTTSProvider implements AudioProvider {
  readonly type = AudioProviderType.BROWSER;
  private speaking = false;
  private utterance: SpeechSynthesisUtterance | null = null;

  async speak(text: string, lang: LanguageCode, options?: AudioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("SpeechSynthesis not supported"));
        return;
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<LanguageCode, string> = { hy: "hy-AM", en: "en-US", ru: "ru-RU" };
      utterance.lang = langMap[lang] || "en-US";
      utterance.rate = options?.rate ?? 0.9;
      utterance.pitch = options?.pitch ?? 1;
      utterance.volume = options?.volume ?? 1;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(utterance.lang));
      if (voice) utterance.voice = voice;

      this.speaking = true;
      this.utterance = utterance;

      utterance.onstart = () => options?.onStart?.();
      utterance.onend = () => {
        this.speaking = false;
        this.utterance = null;
        options?.onEnd?.();
        resolve();
      };
      utterance.onerror = (event) => {
        this.speaking = false;
        this.utterance = null;
        const error = new Error(`TTS error: ${event.error}`);
        options?.onError?.(error);
        reject(error);
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.speaking = false;
      this.utterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.speaking || !!(window.speechSynthesis && window.speechSynthesis.speaking);
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!window.speechSynthesis) return [];
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
      setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 1000);
    });
  }
}

// ─── Edge TTS Provider (generates on-the-fly via Supabase Edge Function) ───

class EdgeTTSProvider implements AudioProvider {
  readonly type = AudioProviderType.EDGE_TTS;
  private audioElement: HTMLAudioElement | null = null;
  private browserTTS: BrowserTTSProvider | null = null;

  setBrowserTTS(provider: BrowserTTSProvider) {
    this.browserTTS = provider;
  }

  async speak(text: string, lang: LanguageCode, options?: AudioOptions): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
          throw new Error("Supabase URL not configured");
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, lang, id: options?.id }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: "Unknown error" }));
          // Check if fallback to browser TTS is recommended
          if (error.fallback === "browser" && this.browserTTS) {
            await this.browserTTS.speak(text, lang, options);
            resolve();
            return;
          }
          throw new Error(error.error || `TTS generation failed: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";

        // Handle JSON response (fallback instruction)
        if (contentType.includes("application/json")) {
          const data = await response.json();
          if (data.fallback === "browser" && this.browserTTS) {
            await this.browserTTS.speak(text, lang, options);
            resolve();
            return;
          }
          throw new Error(data.error || "Unknown TTS error");
        }

        // Handle audio response
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        this.audioElement = audio;

        audio.onplay = () => options?.onStart?.();
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.audioElement = null;
          options?.onEnd?.();
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          this.audioElement = null;
          const error = new Error("Audio playback failed");
          options?.onError?.(error);
          reject(error);
        };

        await audio.play();
      } catch (err) {
        options?.onError?.(err as Error);
        reject(err);
      }
    });
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
  }

  isSpeaking(): boolean {
    return !!(this.audioElement && !this.audioElement.paused);
  }
}

// ─── AudioService ──────────────────────────────────────────────────

export class AudioService {
  private providers: Map<AudioProviderType, AudioProvider>;
  private config = {
    fallbackChain: [AudioProviderType.MP3, AudioProviderType.EDGE_TTS, AudioProviderType.BROWSER] as AudioProviderType[],
    logWarnings: process.env.NODE_ENV === "development",
  };

  constructor() {
    const mp3Provider = new MP3Provider();
    const browserProvider = new BrowserTTSProvider();
    const edgeProvider = new EdgeTTSProvider();

    // Wire up browser TTS fallback for Armenian
    edgeProvider.setBrowserTTS(browserProvider);

    this.providers = new Map<AudioProviderType, AudioProvider>([
      [AudioProviderType.MP3, mp3Provider],
      [AudioProviderType.BROWSER, browserProvider],
      [AudioProviderType.EDGE_TTS, edgeProvider],
    ]);
  }

  async speak(text: string, lang: LanguageCode, options?: AudioOptions): Promise<void> {
    for (const type of this.config.fallbackChain) {
      const provider = this.providers.get(type);
      if (!provider) continue;
      if (type === AudioProviderType.MP3 && !options?.id) continue;
      try {
        await provider.speak(text, lang, options);
        return;
      } catch (err) {
        if (this.config.logWarnings) {
          console.warn(`[Audio] ${type} failed, trying next:`, err);
        }
      }
    }
    const error = new Error("All audio providers failed");
    options?.onError?.(error);
    throw error;
  }

  stop(): void {
    for (const provider of this.providers.values()) {
      provider.stop();
    }
  }

  isSpeaking(): boolean {
    for (const provider of this.providers.values()) {
      if (provider.isSpeaking()) return true;
    }
    return false;
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    const provider = this.providers.get(AudioProviderType.BROWSER);
    if (provider && provider.getVoices) {
      return await provider.getVoices();
    }
    return [];
  }
}

export const audioService = new AudioService();