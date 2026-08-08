"use client";

import { useState, useEffect, useRef } from "react";
import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder";

interface UserRecordingButtonProps {
  wordId: string;
}

export default function UserRecordingButton({ wordId }: UserRecordingButtonProps) {
  const {
    isRecording,
    error,
    isSaving,
    startRecording,
    stopRecording,
    saveRecording,
    getRecording,
    playRecording,
    deleteRecording,
  } = useAudioRecorder();

  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for existing recording on mount
  useEffect(() => {
    setHasRecording(!!getRecording(wordId));
  }, [wordId, getRecording]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleRecord = async () => {
    if (isRecording) {
      stopRecording();
      // Give MediaRecorder time to fire onstop
      await new Promise((r) => setTimeout(r, 100));
      await saveRecording(wordId);
      setHasRecording(true);
    } else {
      await startRecording();
    }
  };

  const handlePlay = () => {
    const base64 = getRecording(wordId);
    if (!base64) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(base64);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };

  const handleDelete = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    deleteRecording(wordId);
    setHasRecording(false);
  };

  return (
    <div className="flex items-center gap-1 pt-2 border-t border-white/10">
      <span className="text-xs text-white/30 mr-1">🎤</span>

      {/* Record / Stop button */}
      <button
        onClick={handleRecord}
        disabled={isSaving}
        title={isRecording ? "Stop recording" : "Record your pronunciation"}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
          isRecording
            ? "bg-red-600 text-white animate-pulse"
            : "bg-white/10 hover:bg-white/20 text-white/70"
        }`}
      >
        {isRecording ? (
          <>⏹ {recordingTime}s</>
        ) : isSaving ? (
          "..."
        ) : (
          "🎤 Record"
        )}
      </button>

      {/* Play user recording */}
      {hasRecording && (
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          title="Play your recording"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            isPlaying
              ? "bg-green-700 text-white"
              : "bg-green-600/20 hover:bg-green-600/40 text-white/70"
          }`}
        >
          {isPlaying ? "▶ ..." : "▶ Play"}
        </button>
      )}

      {/* Delete */}
      {hasRecording && !isRecording && (
        <button
          onClick={handleDelete}
          title="Delete your recording"
          className="px-2 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-900/20 transition"
        >
          ✕
        </button>
      )}

      {/* Error */}
      {error && (
        <span className="text-xs text-red-400 ml-1 truncate max-w-[120px]" title={error}>
          ⚠️
        </span>
      )}
    </div>
  );
}
