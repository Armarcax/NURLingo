// src/lib/hooks/useAudio.ts
// NUR Lingo — Legacy Audio Hook (now uses AudioEngine internally)
// DEPRECATED: Use useAudioManager or useAudioEngine instead

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  audioManager,
  AudioPlayOptions,
  LanguageCode,
  AudioProviderType,
} from "@/lib/audio";

/**
 * @deprecated Use useAudioManager instead for better control
 */
export function useAudio() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Subscribe to events
  useEffect(() => {
    const unsubPlay = audioManager.on("play", () => setIsSpeaking(true));
    const unsubEnd = audioManager.on("end", () => setIsSpeaking(false));
    const unsubStop = audioManager.on("stop", () => setIsSpeaking(false));
    const unsubError = audioManager.on("error", () => setIsSpeaking(false));

    return () => {
      unsubPlay();
      unsubEnd();
      unsubStop();
      unsubError();
    };
  }, []);

  const speak = useCallback(async (
    text: string,
    lang: LanguageCode,
    options?: AudioPlayOptions
  ) => {
    setIsSpeaking(true);
    try {
      await audioManager.play(text, lang, options);
    } catch (error) {
      options?.onError?.(error as Error);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    audioManager.stop();
    setIsSpeaking(false);
  }, []);

  const getVoices = useCallback(async () => {
    return audioManager.getVoices();
  }, []);

  return { speak, stop, isSpeaking, getVoices };
}
