// src/app/vocab-audio/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import { CONTENT_LESSONS, type VocabItem, getAudioId } from "@/lib/content/database";
import { useAudio } from "@/lib/hooks/useAudio";
import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder";

export default function VocabAudioPage() {
  const { speak, isSpeaking, stop } = useAudio();
  const {
    isRecording,
    startRecording,
    stopRecording,
    saveRecording,
    getRecording,
    playRecording,
    deleteRecording,
  } = useAudioRecorder();
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recordingId, setRecordingId] = useState<string | null>(null);

  useEffect(() => {
    const all: VocabItem[] = [];
    for (const lesson of CONTENT_LESSONS) {
      if (lesson.vocabulary) all.push(...lesson.vocabulary);
    }
    // Եզակիացնել ըստ id-ի
    const unique = Array.from(new Map(all.map((v) => [v.id, v])).values());
    setVocab(unique);
  }, []);

  const filteredVocab = useMemo(() => {
    return vocab.filter((item) => {
      const matchesSearch =
        item.hy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ru.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [vocab, searchQuery]);

  // 🔊 Աուդիո նվագարկում AudioService-ով (օգտագործում է getAudioId)
  const handleSpeak = (text: string, item: VocabItem) => {
    if (isSpeaking) {
      stop();
    }
    const audioId = getAudioId(item); // 6-նիշանի ID
    setPlaying(audioId);
    speak(text, "hy", {
      id: audioId, // MP3-ի համար `/audio/hy/{audioId}.mp3`
      onEnd: () => setPlaying(null),
      onError: () => {
        setPlaying(null);
      },
    });
  };

  const handleRecord = async (id: string) => {
    if (isRecording && recordingId === id) {
      stopRecording();
      setTimeout(() => {
        saveRecording(id);
        setRecordingId(null);
      }, 500);
      return;
    }
    setRecordingId(id);
    await startRecording();
  };

  const hasUserRecording = (id: string): boolean => {
    return !!getRecording(id);
  };

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">🔊 Բառապաշար (աուդիո + ձայնագրություն)</h1>
        <p className="text-sm text-gray-400 mb-4">
          {vocab.length} բառ. Լսիր բազային արտասանությունը կամ ձայնագրիր քո սեփականը:
        </p>

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Փնտրել բառեր..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredVocab.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Բառեր չեն գտնվել</div>
          ) : (
            filteredVocab.map((item) => {
              const audioId = getAudioId(item);
              const hasRecording = hasUserRecording(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex-1 min-w-[100px]">
                      <div className="text-lg font-bold">{item.hy}</div>
                      <div className="text-sm text-gray-400">
                        {item.en} / {item.ru}
                      </div>
                      <div className="text-xs text-gray-500">ID: {audioId}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Base audio (MP3 + fallback) */}
                      <button
                        onClick={() => handleSpeak(item.hy, item)}
                        disabled={playing === audioId}
                        className={`px-3 py-1 rounded-full text-sm font-bold transition ${
                          playing === audioId
                            ? "bg-green-600 text-white cursor-wait"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {playing === audioId ? "🔊 ..." : "🔊"}
                      </button>

                      {/* Record / Stop */}
                      <button
                        onClick={() => handleRecord(item.id)}
                        className={`px-3 py-1 rounded-full text-sm font-bold transition ${
                          isRecording && recordingId === item.id
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : "bg-purple-600 hover:bg-purple-700"
                        } text-white`}
                      >
                        {isRecording && recordingId === item.id ? "⏹" : "🎤"}
                      </button>

                      {/* Play user recording */}
                      {hasRecording && (
                        <button
                          onClick={() => playRecording(item.id)}
                          className="px-3 py-1 rounded-full text-sm font-bold bg-green-700 hover:bg-green-800 text-white"
                        >
                          ▶️
                        </button>
                      )}

                      {/* Delete user recording */}
                      {hasRecording && (
                        <button
                          onClick={() => {
                            if (confirm("Ջնջե՞լ ձեր ձայնագրությունը:")) {
                              deleteRecording(item.id);
                              setVocab([...vocab]);
                            }
                          }}
                          className="px-3 py-1 rounded-full text-sm font-bold bg-red-800 hover:bg-red-900 text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}