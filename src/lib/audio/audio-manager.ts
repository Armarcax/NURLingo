/**
 * NUR Lingo — AudioManager
 *
 * Enhanced audio layer on top of the existing AudioService.
 * Features:
 *   - HEAD-based MP3 existence check (deduplicated, cached per session)
 *   - MP3 → Browser TTS graceful fallback
 *   - In-memory LRU cache for loaded audio elements
 *   - Playback queue with cancel support
 *   - Missing-file tracking (for future generation jobs)
 *   - Zero console errors exposed to users
 *   - Preload-next support
 */

import type { LanguageCode } from "./audio-types";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AudioSource = "mp3" | "tts" | "none";

export interface PlaybackResult {
  source: AudioSource;
  isTTSFallback: boolean;
}

export interface AudioStatus {
  id: string;
  lang: LanguageCode;
  mp3Exists: boolean | null; // null = not yet checked
  source: AudioSource;
}

// ─── LRU Cache ───────────────────────────────────────────────────────────────

class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private maxSize: number) {}

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  set(key: K, val: V): void {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.maxSize) {
      this.map.delete(this.map.keys().next().value!);
    }
    this.map.set(key, val);
  }

  has(key: K): boolean { return this.map.has(key); }
  size(): number { return this.map.size; }
}

// ─── AudioManager ─────────────────────────────────────────────────────────────

class AudioManager {
  // HEAD check results: url → exists
  private existsCache = new LRUCache<string, boolean>(500);
  // In-flight HEAD requests (deduplication)
  private existsInFlight = new Map<string, Promise<boolean>>();
  // Loaded audio elements
  private audioCache = new LRUCache<string, HTMLAudioElement>(100);
  // In-flight audio loads
  private loadInFlight = new Map<string, Promise<HTMLAudioElement>>();
  // Missing audio IDs for logging
  private missingAudio = new Set<string>();
  // Active playback
  private activeAudio: HTMLAudioElement | null = null;
  private activeSynth: SpeechSynthesisUtterance | null = null;

  // ── Check if an MP3 file exists ──────────────────────────────────────────

  async checkMP3Exists(audioId: string, lang: LanguageCode): Promise<boolean> {
    const padded = audioId.padStart(6, "0");
    const url = `/audio/${lang}/${padded}.mp3`;

    if (this.existsCache.has(url)) return this.existsCache.get(url)!;
    if (this.existsInFlight.has(url)) return this.existsInFlight.get(url)!;

    const promise = (async (): Promise<boolean> => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        const exists = res.ok;
        this.existsCache.set(url, exists);
        if (!exists) this.missingAudio.add(`${lang}/${padded}`);
        return exists;
      } catch {
        this.existsCache.set(url, false);
        this.missingAudio.add(`${lang}/${padded}`);
        return false;
      } finally {
        this.existsInFlight.delete(url);
      }
    })();

    this.existsInFlight.set(url, promise);
    return promise;
  }

  // ── Load (or get cached) audio element ──────────────────────────────────

  private async loadAudio(url: string): Promise<HTMLAudioElement> {
    if (this.audioCache.has(url)) return this.audioCache.get(url)!;
    if (this.loadInFlight.has(url)) return this.loadInFlight.get(url)!;

    const promise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.oncanplaythrough = () => {
        this.audioCache.set(url, audio);
        this.loadInFlight.delete(url);
        resolve(audio);
      };
      audio.onerror = () => {
        this.loadInFlight.delete(url);
        reject(new Error(`Cannot load: ${url}`));
      };
      audio.load();
    });

    this.loadInFlight.set(url, promise);
    return promise;
  }

  // ── Stop all active playback ─────────────────────────────────────────────

  stop(): void {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.activeSynth = null;
  }

  isSpeaking(): boolean {
    if (this.activeAudio && !this.activeAudio.paused) return true;
    if (typeof window !== "undefined" && window.speechSynthesis?.speaking) return true;
    return false;
  }

  // ── Play via MP3, fallback to TTS ────────────────────────────────────────

  async play(
    text: string,
    lang: LanguageCode,
    audioId: string | undefined,
    callbacks: { onStart?: () => void; onEnd?: () => void; onSource?: (src: AudioSource) => void }
  ): Promise<PlaybackResult> {
    this.stop();

    // Try MP3 first
    if (audioId) {
      const exists = await this.checkMP3Exists(audioId, lang);
      if (exists) {
        const padded = audioId.padStart(6, "0");
        const url = `/audio/${lang}/${padded}.mp3`;
        try {
          const audio = await this.loadAudio(url);
          const clone = audio.cloneNode(true) as HTMLAudioElement;
          this.activeAudio = clone;
          callbacks.onSource?.("mp3");
          callbacks.onStart?.();

          return new Promise<PlaybackResult>((resolve) => {
            clone.onended = () => {
              this.activeAudio = null;
              callbacks.onEnd?.();
              resolve({ source: "mp3", isTTSFallback: false });
            };
            clone.onerror = () => {
              this.activeAudio = null;
              // MP3 load succeeded but play failed — fall through to TTS
              this.playTTS(text, lang, callbacks).then((r) => resolve(r));
            };
            clone.play().catch(() => {
              this.activeAudio = null;
              this.playTTS(text, lang, callbacks).then((r) => resolve(r));
            });
          });
        } catch {
          // Fall through to TTS
        }
      }
    }

    return this.playTTS(text, lang, callbacks);
  }

  private playTTS(
    text: string,
    lang: LanguageCode,
    callbacks: { onStart?: () => void; onEnd?: () => void; onSource?: (src: AudioSource) => void }
  ): Promise<PlaybackResult> {
    return new Promise<PlaybackResult>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        callbacks.onEnd?.();
        resolve({ source: "none", isTTSFallback: true });
        return;
      }

      const langMap: Record<LanguageCode, string> = { hy: "hy-AM", en: "en-US", ru: "ru-RU" };
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMap[lang];
      utterance.rate = 0.88;
      utterance.pitch = 1;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(lang === "hy" ? "hy" : lang === "ru" ? "ru" : "en"));
      if (voice) utterance.voice = voice;

      this.activeSynth = utterance;
      callbacks.onSource?.("tts");
      callbacks.onStart?.();

      utterance.onend = () => {
        this.activeSynth = null;
        callbacks.onEnd?.();
        resolve({ source: "tts", isTTSFallback: true });
      };
      utterance.onerror = () => {
        this.activeSynth = null;
        callbacks.onEnd?.();
        resolve({ source: "none", isTTSFallback: true });
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  // ── Preload next N audio files ────────────────────────────────────────────

  async preload(audioIds: Array<{ id: string; lang: LanguageCode }>): Promise<void> {
    for (const { id, lang } of audioIds.slice(0, 3)) {
      const exists = await this.checkMP3Exists(id, lang);
      if (exists) {
        const padded = id.padStart(6, "0");
        const url = `/audio/${lang}/${padded}.mp3`;
        this.loadAudio(url).catch(() => {}); // fire-and-forget
      }
    }
  }

  // ── Report missing audio IDs (for generation jobs) ────────────────────────

  getMissingAudioReport(): string[] {
    return Array.from(this.missingAudio).sort();
  }

  getCacheStats(): { audioCache: number; existsCache: number; missing: number } {
    return {
      audioCache: this.audioCache.size(),
      existsCache: this.existsCache.size(),
      missing: this.missingAudio.size,
    };
  }
}

export const audioManager = new AudioManager();
