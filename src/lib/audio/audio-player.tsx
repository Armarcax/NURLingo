// src/lib/audio/audio-player.tsx
// NUR Lingo Audio Engine — Audio Player React Component
"use client";

import { useState, useEffect, useCallback } from "react";
import { audioManager, LanguageCode } from "./index";

interface AudioPlayerProps {
  text: string;
  lang: LanguageCode;
  audioId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AudioPlayer({ text, lang, audioId, className = "", size = "md" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Subscribe to audio events
  useEffect(() => {
    const unsubPlay = audioManager.on("play", () => setIsPlaying(true));
    const unsubEnd = audioManager.on("end", () => setIsPlaying(false));
    const unsubStop = audioManager.on("stop", () => setIsPlaying(false));
    const unsubError = audioManager.on("error", () => setIsPlaying(false));

    return () => {
      unsubPlay();
      unsubEnd();
      unsubStop();
      unsubError();
    };
  }, []);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      audioManager.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      await audioManager.play(text, lang, { id: audioId });
    } catch {
      // Error already handled by event system
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying, text, lang, audioId]);

  const sizeClasses = {
    sm: "p-1 text-sm",
    md: "p-2 text-base",
    lg: "p-3 text-lg",
  };

  return (
    <button
      onClick={handlePlay}
      className={`${sizeClasses[size]} ${className} rounded-full transition hover:bg-white/10 disabled:opacity-50`}
      disabled={isPlaying}
      aria-label={isPlaying ? "Նվագարկվում է..." : "Լսել"}
    >
      {isPlaying ? "⏹" : "🔊"}
    </button>
  );
}
