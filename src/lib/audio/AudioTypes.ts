// src/lib/audio/AudioTypes.ts
// NUR Lingo Audio Engine — Type Definitions

/**
 * Supported languages in NUR Lingo
 */
export type LanguageCode = "hy" | "en" | "ru";

/**
 * Language display configuration
 */
export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechSynthesisLang: string; // BCP 47 language tag for TTS
}

export const LANGUAGE_CONFIGS: Record<LanguageCode, LanguageConfig> = {
  hy: {
    code: "hy",
    name: "Armenian",
    nativeName: "Հայերեն",
    flag: "🇦🇲",
    speechSynthesisLang: "hy-AM",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    speechSynthesisLang: "en-US",
  },
  ru: {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    speechSynthesisLang: "ru-RU",
  },
};

/**
 * Provider capability flags
 */
export interface ProviderCapabilities {
  /** Can play pre-recorded audio files */
  canPlayFiles: boolean;
  /** Can synthesize speech from text */
  canSynthesize: boolean;
  /** Supports streaming playback */
  canStream: boolean;
  /** Supports voice selection */
  hasVoiceSelection: boolean;
  /** Requires network access */
  requiresNetwork: boolean;
  /** Supports offline usage */
  supportsOffline: boolean;
  /** Can persist generated audio */
  canPersist: boolean;
}

/**
 * Audio provider types supported by the engine
 */
export enum AudioProviderType {
  /** Local MP3 files from public/audio/{lang}/{id}.mp3 */
  MP3 = "mp3",
  /** Browser's native SpeechSynthesis API */
  BROWSER_TTS = "browser-tts",
  /** Narakeet API (future) */
  NARAKEET = "narakeet",
  /** Azure Cognitive Services (future) */
  AZURE = "azure",
  /** Google Cloud TTS (future) */
  GOOGLE_TTS = "google-tts",
  /** ElevenLabs (future) */
  ELEVENLABS = "elevenlabs",
  /** OpenAI TTS (future) */
  OPENAI = "openai",
  /** Coqui XTTS (future) */
  COQUI = "coqui",
  /** Piper TTS (future) */
  PIPER = "piper",
  /** Edge TTS (future) */
  EDGE_TTS = "edge-tts",
}

/**
 * Status of an audio resource
 */
export enum AudioStatus {
  /** Audio exists and is ready to play */
  READY = "ready",
  /** Audio file needs to be generated */
  MISSING = "missing",
  /** Audio is being generated */
  GENERATING = "generating",
  /** Generation failed */
  ERROR = "error",
  /** Status unknown (not yet checked) */
  UNKNOWN = "unknown",
}

/**
 * Playback state
 */
export enum PlaybackState {
  IDLE = "idle",
  LOADING = "loading",
  PLAYING = "playing",
  PAUSED = "paused",
  ERROR = "error",
}

/**
 * Audio metadata stored in manifest
 */
export interface AudioManifestEntry {
  /** Unique audio identifier (e.g., "000001") */
  id: string;
  /** The word or phrase being spoken */
  text: string;
  /** Language of the audio */
  lang: LanguageCode;
  /** Filename relative to public/audio/{lang}/ */
  filename: string;
  /** Duration in seconds (optional, may be unknown) */
  duration?: number;
  /** Provider that created this audio */
  provider: AudioProviderType;
  /** Version number for cache invalidation */
  version: number;
  /** MD5 or SHA256 checksum for integrity (optional) */
  checksum?: string;
  /** ISO timestamp when audio was generated */
  generatedAt?: string;
  /** File size in bytes */
  size?: number;
  /** Sample rate (e.g., 22050, 44100) */
  sampleRate?: number;
  /** Audio status */
  status: AudioStatus;
}

/**
 * Full audio manifest structure
 */
export interface AudioManifest {
  /** Manifest schema version */
  schemaVersion: number;
  /** When manifest was last updated */
  lastUpdated: string;
  /** Total count of audio entries */
  totalEntries: number;
  /** Entries by ID */
  entries: Record<string, AudioManifestEntry>;
  /** Statistics per language */
  stats: Record<LanguageCode, { total: number; ready: number; missing: number }>;
}

/**
 * Options for audio playback
 */
export interface AudioPlayOptions {
  /** Audio ID for MP3 lookup */
  id?: string;
  /** Playback rate (0.5 - 2.0, default 1.0) */
  rate?: number;
  /** Pitch adjustment (0.5 - 2.0, default 1.0) */
  pitch?: number;
  /** Volume (0 - 1, default 1.0) */
  volume?: number;
  /** Preferred provider (optional override) */
  preferredProvider?: AudioProviderType;
  /** Force use of specific provider */
  forceProvider?: AudioProviderType;
  /** Skip cache and always fetch fresh */
  bypassCache?: boolean;
  /** Callback when playback starts */
  onStart?: () => void;
  /** Callback when playback ends normally */
  onEnd?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback when loading starts */
  onLoading?: () => void;
  /** Callback when source is determined */
  onSource?: (source: AudioProviderType) => void;
}

/**
 * Result of a play operation
 */
export interface AudioPlayResult {
  /** Provider used for playback */
  provider: AudioProviderType;
  /** Whether TTS fallback was used */
  isTTSFallback: boolean;
  /** Duration in seconds (if known) */
  duration?: number;
  /** Whether playback completed */
  completed: boolean;
}

/**
 * Request to generate audio
 */
export interface AudioGenerateRequest {
  /** Text to synthesize */
  text: string;
  /** Target language */
  lang: LanguageCode;
  /** Unique ID for the audio */
  id: string;
  /** Preferred provider for generation */
  preferredProvider?: AudioProviderType;
  /** Save generated audio to public/audio/ */
  persist?: boolean;
  /** Overwrite existing audio */
  overwrite?: boolean;
}

/**
 * Result of audio generation
 */
export interface AudioGenerateResult {
  /** Generated audio ID */
  id: string;
  /** Provider used */
  provider: AudioProviderType;
  /** Audio blob (if not persisted) */
  blob?: Blob;
  /** URL to the audio (if persisted) */
  url?: string;
  /** Duration in seconds */
  duration?: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Queue item for playback
 */
export interface AudioQueueItem {
  /** Unique queue item ID */
  queueId: string;
  /** Text to speak */
  text: string;
  /** Language */
  lang: LanguageCode;
  /** Audio ID (optional) */
  audioId?: string;
  /** Play options */
  options: AudioPlayOptions;
  /** Priority (higher = play first) */
  priority: number;
  /** When added to queue */
  addedAt: number;
  /** Callback when this item plays */
  onPlay?: () => void;
}

/**
 * Audio settings for user preferences
 */
export interface AudioSettings {
  /** Master volume (0-1) */
  volume: number;
  /** Playback rate (0.5-2.0) */
  rate: number;
  /** Auto-play audio on word display */
  autoPlay: boolean;
  /** Preferred TTS provider */
  preferredTTS: AudioProviderType;
  /** Fallback chain of providers */
  fallbackChain: AudioProviderType[];
  /** Preload next N audio items */
  preloadCount: number;
  /** Enable audio caching */
  cacheEnabled: boolean;
  /** Maximum cache size (MB) */
  maxCacheSize: number;
  /** Voice preference per language */
  voicePreferences: Partial<Record<LanguageCode, string>>;
  /** Show TTS indicator when using fallback */
  showTTSIndicator: boolean;
}

/**
 * Default audio settings
 */
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: 1.0,
  rate: 0.9,
  autoPlay: false,
  preferredTTS: AudioProviderType.BROWSER_TTS,
  fallbackChain: [
    AudioProviderType.MP3,
    AudioProviderType.BROWSER_TTS,
  ],
  preloadCount: 3,
  cacheEnabled: true,
  maxCacheSize: 50,
  voicePreferences: {},
  showTTSIndicator: true,
};

/**
 * Cache statistics
 */
export interface AudioCacheStats {
  /** Number of cached audio elements */
  entries: number;
  /** Total size in bytes (estimated) */
  totalSize: number;
  /** Number of hits */
  hits: number;
  /** Number of misses */
  misses: number;
  /** Hit rate (0-1) */
  hitRate: number;
}

/**
 * Audio provider interface
 */
export interface IAudioProvider {
  /** Provider type identifier */
  readonly type: AudioProviderType;
  /** Human-readable name */
  readonly name: string;
  /** Provider capabilities */
  readonly capabilities: ProviderCapabilities;

  /** Check if this provider is available */
  isAvailable(): Promise<boolean>;

  /** Play audio from text or ID */
  play(text: string, lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult>;

  /** Stop current playback */
  stop(): void;

  /** Check if currently playing */
  isPlaying(): boolean;

  /** Get available voices (if supported) */
  getVoices?(): Promise<SpeechSynthesisVoice[]>;

  /** Generate and optionally persist audio */
  generate?(request: AudioGenerateRequest): Promise<AudioGenerateResult>;
}

/**
 * Progress event for loading/generation
 */
export interface AudioProgressEvent {
  /** Audio ID being processed */
  id: string;
  /** Current step */
  step: "checking" | "loading" | "generating" | "encoding" | "saving" | "complete" | "error";
  /** Progress percentage (0-100) */
  progress: number;
  /** Error message if step is "error" */
  error?: string;
}

/**
 * Event callback types
 */
export type AudioEventCallback<T = void> = (data: T) => void;

/**
 * Audio engine event map
 */
export interface AudioEngineEvents {
  /** Fired when playback starts */
  play: { id: string; provider: AudioProviderType };
  /** Fired when playback ends */
  end: { id: string; completed: boolean };
  /** Fired when playback stops */
  stop: { id: string };
  /** Fired when playback errors */
  error: { id: string; error: Error };
  /** Fired when load starts */
  loading: { id: string };
  /** Fired on progress updates */
  progress: AudioProgressEvent;
  /** Fired when queue changes */
  queueChange: { queueLength: number };
  /** Fired when settings change */
  settingsChange: AudioSettings;
}
