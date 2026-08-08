// src/app/dictionary/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import UserRecordingButton from "@/components/UserRecordingButton";
import { CONTENT_LESSONS, type VocabItem, getAudioId } from "@/lib/content/database";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import type { LangCode } from "@/lib/i18n/multilingual";
import type { LanguageCode } from "@/lib/audio";

const LANGS: { code: LangCode; label: string; flag: string; color: string }[] = [
  { code: "hy", label: "ՀԱՅԵՐԵՆ", flag: "🇦🇲", color: "text-red-400 bg-red-600" },
  { code: "en", label: "ENGLISH",  flag: "🇬🇧", color: "text-blue-400 bg-blue-600" },
  { code: "ru", label: "РУССКИЙ",  flag: "🇷🇺", color: "text-green-400 bg-green-600" },
];

interface ActivePlay { wordId: string; lang: LangCode }

export default function DictionaryPage() {
  const { play, stop, isPlaying, isLoading, isTTSFallback, preload } = useAudioManager();
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [activePlay, setActivePlay] = useState<ActivePlay | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLang, setFilterLang] = useState<LangCode>("hy");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [nuriMood, setNuriMood] = useState<NuriMood>("idle");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const all: VocabItem[] = [];
    for (const lesson of CONTENT_LESSONS) {
      if (lesson.vocabulary) all.push(...lesson.vocabulary);
    }
    setVocab(Array.from(new Map(all.map((v) => [v.id, v])).values()));
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset active play indicator when audio finishes
  useEffect(() => {
    if (!isPlaying && !isLoading) {
      setActivePlay(null);
      setTimeout(() => setNuriMood("idle"), 1200);
    }
  }, [isPlaying, isLoading]);

  const filteredVocab = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return vocab.filter((item) =>
      item.hy.toLowerCase().includes(q) ||
      item.en.toLowerCase().includes(q) ||
      item.ru.toLowerCase().includes(q)
    );
  }, [vocab, searchQuery]);

  const handleSpeak = (item: VocabItem, lang: LangCode) => {
    const audioId = getAudioId(item);
    setActivePlay({ wordId: item.id, lang });
    setNuriMood("happy");

    play(item[lang], lang as LanguageCode, audioId, `${item.id}-${lang}`);

    // Preload next 3 items in the list
    const idx = filteredVocab.findIndex((v) => v.id === item.id);
    const nextItems = filteredVocab.slice(idx + 1, idx + 4).map((v) => ({
      id: getAudioId(v),
      lang: lang as LanguageCode,
    }));
    if (nextItems.length) preload(nextItems);
  };

  const isWordPlaying = (id: string, lang: LangCode) =>
    activePlay?.wordId === id && activePlay?.lang === lang && (isPlaying || isLoading);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0a] to-[#0d1a2d] text-white pb-24">
      <div ref={topRef} className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Nuri mood={nuriMood} size={80} />
            <NuriSpeech
              text={nuriMood === "happy" ? "Հիանալի է! Շարունակի՛ր" : "Բարի գալուստ բառարան"}
              mood={nuriMood}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">📖 Trilingual Dictionary</h1>
              <p className="text-sm text-gray-400">{vocab.length} words · Armenian / English / Russian</p>
            </div>
            <Link
              href="/admin/dictionary"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition flex items-center gap-2"
            >
              ✏️ Edit
            </Link>
          </div>
        </header>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in all languages..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
          />
          <div className="flex gap-1 bg-white/10 rounded-xl p-1">
            {LANGS.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => setFilterLang(code)}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  filterLang === code ? "bg-blue-600 text-white" : "hover:bg-white/10"
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-between text-sm">
          <span>📚 {vocab.length} words total</span>
          <span>🎯 Showing: {filteredVocab.length}</span>
          <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#D90012] to-[#F2A800] h-full rounded-full transition-all"
              style={{ width: `${vocab.length ? (filteredVocab.length / vocab.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Vocabulary list */}
        <div className="space-y-3">
          {filteredVocab.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No matching vocabulary found</div>
          ) : (
            filteredVocab.map((item) => {
              const audioId = getAudioId(item);

              return (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition"
                >
                  {/* Three languages — always equally prominent */}
                  <div className="space-y-3">
                    {LANGS.map(({ code, label, flag, color }) => {
                      const playing = isWordPlaying(item.id, code);
                      const loading = activePlay?.wordId === item.id &&
                        activePlay.lang === code && isLoading;

                      return (
                        <div key={code} className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-bold mb-0.5 ${color.split(" ")[0]}`}>
                              {label}
                            </div>
                            <div className="text-xl font-bold truncate">{item[code]}</div>
                          </div>

                          {/* Play button with MP3/TTS indicator */}
                          <button
                            onClick={() => handleSpeak(item, code)}
                            className={`relative flex-shrink-0 w-12 h-12 rounded-xl transition flex items-center justify-center text-lg ${
                              playing
                                ? "bg-green-600 text-white scale-105 shadow-lg shadow-green-900/40"
                                : loading
                                ? "bg-yellow-600/40 text-yellow-300 animate-pulse"
                                : `${color.split(" ")[1]}/20 hover:${color.split(" ")[1]}/40 text-white`
                            }`}
                            title={isTTSFallback && playing ? "Browser TTS (no MP3)" : `Play ${label}`}
                          >
                            {loading ? "⏳" : playing ? "🔊" : flag}
                            {isTTSFallback && playing && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-yellow-500 text-black rounded-full px-1 font-bold">
                                TTS
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer: ID + Recording */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500 font-mono mb-2">ID: #{audioId}</div>
                    <UserRecordingButton wordId={item.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {searchQuery && filteredVocab.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-4">
            Showing {filteredVocab.length} of {vocab.length} entries
          </div>
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      <BottomNav />
    </div>
  );
}
