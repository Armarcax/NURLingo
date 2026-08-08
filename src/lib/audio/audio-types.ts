// src/lib/audio/audio-types.ts
export type LanguageCode = "hy" | "en" | "ru";

export interface AudioOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  id?: string;          // աուդիո ID (MP3-ի համար)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioProvider {
  readonly type: string;
  speak(text: string, lang: LanguageCode, options?: AudioOptions): Promise<void>;
  stop(): void;
  isSpeaking(): boolean;
  getVoices?(): Promise<SpeechSynthesisVoice[]>;
}

export enum AudioProviderType {
  MP3 = "mp3",
  BROWSER = "browser",
  EDGE_TTS = "edge-tts",
  GOOGLE = "google",
  AZURE = "azure",
  ELEVENLABS = "elevenlabs",
  OPENAI = "openai",
}