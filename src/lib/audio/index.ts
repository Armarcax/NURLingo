// src/lib/audio/index.ts
// NUR Lingo Audio Engine — Public Exports

// Core manager - the single public API
export { audioManager } from "./AudioManager";

// Subsystems (for advanced usage)
export { audioCache } from "./AudioCache";
export { audioManifest } from "./AudioManifest";
export { audioQueue } from "./AudioQueue";
export { audioSettings } from "./AudioSettings";

// Providers
export {
  MP3AudioProvider,
  BrowserTTSProvider,
  mp3Provider,
  browserTTSProvider,
} from "./AudioProviders";

// Future providers (require API keys)
export { NarakeetTTSProvider, narakeetProvider } from "./NarakeetProvider";

// All types
export * from "./AudioTypes";

// Legacy exports for backwards compatibility
export { AudioCache } from "./AudioCache";
export type { IAudioProvider } from "./AudioTypes";
