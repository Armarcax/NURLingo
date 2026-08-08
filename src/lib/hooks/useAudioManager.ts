// src/lib/hooks/useAudioManager.ts
// NUR Lingo — React Hook for Audio (uses AudioEngine internally)

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  audioManager,
  AudioPlayResult,
  AudioProviderType,
  LanguageCode,
} from "@/lib/audio";

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  source: AudioProviderType | null;
  isTTSFallback: boolean;
}

export function useAudioManager() {
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    source: null,
    isTTSFallback: false,
  });

  const currentKey = useRef<string | null>(null);

  // Subscribe to audio events for reactive state
  useEffect(() => {
    const unsubPlay = audioManager.on("play", (data) => {
      setState((s) => ({
        ...s,
        isPlaying: true,
        isLoading: false,
        source: data.provider,
      }));
    });

    const unsubLoad = audioManager.on("loading", () => {
      setState({ isPlaying: false, isLoading: true, source: null, isTTSFallback: false });
    });

    const unsubStop = audioManager.on("stop", () => {
      setState({ isPlaying: false, isLoading: false, source: null, isTTSFallback: false });
    });

    const unsubEnd = audioManager.on("end", () => {
      currentKey.current = null;
      setState({ isPlaying: false, isLoading: false, source: null, isTTSFallback: false });
    });

    const unsubError = audioManager.on("error", () => {
      currentKey.current = null;
      setState({ isPlaying: false, isLoading: false, source: null, isTTSFallback: false });
    });

    return () => {
      unsubPlay();
      unsubLoad();
      unsubStop();
      unsubEnd();
      unsubError();
    };
  }, []);

  const play = useCallback(async (
    text: string,
    lang: LanguageCode,
    audioId: string | undefined,
    key?: string
  ): Promise<AudioPlayResult | void> => {
    const playKey = key ?? `${audioId}-${lang}`;

    // Toggle off if same key is playing
    if (currentKey.current === playKey && state.isPlaying) {
      audioManager.stop();
      currentKey.current = null;
      setState({ isPlaying: false, isLoading: false, source: null, isTTSFallback: false });
      return;
    }

    currentKey.current = playKey;
    setState({ isPlaying: false, isLoading: true, source: null, isTTSFallback: false });

    try {
      const result = await audioManager.play(text, lang, {
        id: audioId,
        volume: audioManager.getSettings().volume,
        rate: audioManager.getSettings().rate,
        onSource: (src) => {
          setState((s) => ({
            ...s,
            source: src,
            isTTSFallback: src === AudioProviderType.BROWSER_TTS
          }));
        },
      });

      setState({
        isPlaying: true,
        isLoading: false,
        source: result.provider,
        isTTSFallback: result.isTTSFallback,
      });

      return result;
    } catch {
      currentKey.current = null;
      setState({ isPlaying: false, isLoading: false, source: null, isTTSFallback: false });
    }
  }, [state.isPlaying]);

  const stop = useCallback(() => {
    audioManager.stop();
    currentKey.current = null;
    setState({ isPlaying: false, isLoading: false, source: null, isTTSFallback: false });
  }, []);

  const preload = useCallback((items: Array<{ id: string; lang: LanguageCode }>) => {
    audioManager.preload(items);
  }, []);

  return { ...state, play, stop, preload, activeKey: currentKey.current };
}
