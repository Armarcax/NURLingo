// src/lib/hooks/useAudioEngine.ts
// NUR Lingo — React Hook for Audio Engine

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  audioManager,
  AudioPlayOptions,
  AudioPlayResult,
  AudioProviderType,
  LanguageCode,
  AudioSettings,
  PlaybackState,
} from "@/lib/audio";

export interface UseAudioEngineState {
  /** Current playback state */
  state: PlaybackState;
  /** Currently playing audio ID */
  currentId: string | null;
  /** Provider used for current playback */
  provider: AudioProviderType | null;
  /** Whether TTS fallback was used */
  isTTSFallback: boolean;
  /** Error message if any */
  error: string | null;
}

export interface UseAudioEngineActions {
  /** Play audio for text/word */
  play: (text: string, lang: LanguageCode, options?: AudioPlayOptions) => Promise<AudioPlayResult>;
  /** Stop current playback */
  stop: () => void;
  /** Check if audio exists for ID */
  hasAudio: (id: string, lang: LanguageCode) => Promise<boolean>;
  /** Preload audio files */
  preload: (items: Array<{ id: string; lang: LanguageCode }>) => Promise<void>;
  /** Get current settings */
  getSettings: () => AudioSettings;
  /** Update settings */
  updateSettings: (updates: Partial<AudioSettings>) => AudioSettings;
  /** Check if specific item is playing */
  isPlayingItem: (id: string, lang: LanguageCode) => boolean;
}

export type UseAudioEngineReturn = UseAudioEngineState & UseAudioEngineActions;

/**
 * React hook for the Audio Engine
 *
 * Provides reactive state and actions for audio playback.
 *
 * @example
 * const audio = useAudioEngine();
 *
 * // Play audio
 * await audio.play("բարև", "hy", { id: "000001" });
 *
 * // Check state
 * if (audio.state === PlaybackState.PLAYING) {
 *   audio.stop();
 * }
 */
export function useAudioEngine(): UseAudioEngineReturn {
  const [state, setState] = useState<UseAudioEngineState>({
    state: PlaybackState.IDLE,
    currentId: null,
    provider: null,
    isTTSFallback: false,
    error: null,
  });

  const playKeyRef = useRef<string | null>(null);

  // Subscribe to audio events
  useEffect(() => {
    const unsubPlay = audioManager.on("play", (data) => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.PLAYING,
        currentId: data.id,
        provider: data.provider,
        error: null,
      }));
    });

    const unsubEnd = audioManager.on("end", () => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.IDLE,
        currentId: null,
        provider: null,
        isTTSFallback: false,
      }));
    });

    const unsubStop = audioManager.on("stop", () => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.IDLE,
      }));
    });

    const unsubError = audioManager.on("error", (data) => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.ERROR,
        error: data.error.message,
      }));
    });

    const unsubLoad = audioManager.on("loading", () => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.LOADING,
        error: null,
      }));
    });

    return () => {
      unsubPlay();
      unsubEnd();
      unsubStop();
      unsubError();
      unsubLoad();
    };
  }, []);

  // Play function
  const play = useCallback(async (
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions = {}
  ): Promise<AudioPlayResult> => {
    const key = options.id ? `${options.id}-${lang}` : `tts-${text}-${lang}`;
    playKeyRef.current = key;

    setState((prev) => ({
      ...prev,
      state: PlaybackState.LOADING,
      error: null,
    }));

    try {
      const result = await audioManager.play(text, lang, options);
      setState((prev) => ({
        ...prev,
        isTTSFallback: result.isTTSFallback,
      }));
      return result;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.ERROR,
        error: error instanceof Error ? error.message : "Audio error",
      }));
      throw error;
    }
  }, []);

  // Stop function
  const stop = useCallback(() => {
    audioManager.stop();
    playKeyRef.current = null;
    setState((prev) => ({
      ...prev,
      state: PlaybackState.IDLE,
      currentId: null,
    }));
  }, []);

  // Check audio exists
  const hasAudio = useCallback(async (id: string, lang: LanguageCode): Promise<boolean> => {
    return audioManager.hasAudio(id, lang);
  }, []);

  // Preload
  const preload = useCallback(async (items: Array<{ id: string; lang: LanguageCode }>): Promise<void> => {
    return audioManager.preload(items);
  }, []);

  // Get settings
  const getSettings = useCallback((): AudioSettings => {
    return audioManager.getSettings();
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<AudioSettings>): AudioSettings => {
    return audioManager.updateSettings(updates);
  }, []);

  // Check if item is playing
  const isPlayingItem = useCallback((id: string, lang: LanguageCode): boolean => {
    return audioManager.isPlayingItem(id, lang);
  }, []);

  return {
    ...state,
    play,
    stop,
    hasAudio,
    preload,
    getSettings,
    updateSettings,
    isPlayingItem,
  };
}
