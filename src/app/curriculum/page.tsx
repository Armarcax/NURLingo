// src/app/curriculum/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { CONTENT_LESSONS, WORLDS, type ContentLesson } from "@/lib/content/database";
import type { LangCode } from "@/lib/i18n/multilingual";

export default function CurriculumPage() {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [nativeLang, setNativeLang] = useState<LangCode>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("nur_source_lang");
    if (savedLang) setNativeLang(savedLang as LangCode);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getWorldLessons = (worldId: string): ContentLesson[] => {
    return CONTENT_LESSONS.filter((l) => l.worldId === worldId);
  };

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white pb-24 print:bg-white print:text-black">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { font-size: 12pt; }
          .print-lesson { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">📚 NUR Lingo Curriculum</h1>
          <p className="text-sm text-gray-400 print:text-gray-600">
            Complete lesson overview with vocabulary, phrases, and dialogues
          </p>
        </header>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6 no-print">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition flex items-center gap-2"
          >
            🖨️ Print / PDF
          </button>
          <Link
            href="/world"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
          >
            🌍 Start Learning
          </Link>
        </div>

        {/* World Selection */}
        <div className="flex flex-wrap gap-2 mb-6 no-print">
          <button
            onClick={() => setSelectedWorld(null)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedWorld === null
                ? "bg-blue-600"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            All Worlds
          </button>
          {WORLDS.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWorld(w.id)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedWorld === w.id
                  ? "bg-blue-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {w.iconEmoji} {w.title.en}
            </button>
          ))}
        </div>

        {/* Curriculum Content */}
        <div className="space-y-8">
          {WORLDS.filter((w) => !selectedWorld || w.id === selectedWorld).map((world) => (
            <div key={world.id} className="print-break">
              {/* World Header */}
              <div className="bg-gradient-to-r from-[#D90012]/20 to-[#0033A0]/20 rounded-xl p-4 mb-4 print:bg-gray-100">
                <h2 className="text-xl font-bold">
                  {world.iconEmoji} {world.title.en}
                </h2>
                <p className="text-sm text-gray-400 print:text-gray-600">
                  {world.description.en}
                </p>
              </div>

              {/* Lessons */}
              {getWorldLessons(world.id).map((lesson) => (
                <div key={lesson.id} className="print-lesson bg-white/5 rounded-xl p-4 mb-4 print:bg-white print:border">
                  {/* Lesson Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer no-print"
                    onClick={() =>
                      setExpandedLesson(
                        expandedLesson === lesson.id ? null : lesson.id
                      )
                    }
                  >
                    <div>
                      <h3 className="font-bold text-lg">{lesson.title.en}</h3>
                      <p className="text-sm text-gray-400">{lesson.concept.en}</p>
                      <p className="text-xs text-gray-500">
                        {lesson.vocabulary.length} words • {lesson.phrases.length} phrases • {lesson.dialogues.length} dialogues
                      </p>
                    </div>
                    <span className="text-2xl">
                      {expandedLesson === lesson.id ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* Always show in print */}
                  <div className="hidden print:block">
                    <div className="border-t pt-3 mt-3 space-y-4">
                      {/* Vocabulary */}
                      <div>
                        <h4 className="font-bold text-sm mb-2 underline">Vocabulary</h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="font-semibold">Հայերեն</div>
                          <div className="font-semibold">English</div>
                          <div className="font-semibold">Русский</div>
                          {lesson.vocabulary.map((v) => (
                            <>
                              <div>{v.hy}</div>
                              <div>{v.en}</div>
                              <div>{v.ru}</div>
                            </>
                          ))}
                        </div>
                      </div>

                      {/* Phrases */}
                      <div>
                        <h4 className="font-bold text-sm mb-2 underline">Phrases</h4>
                        <div className="space-y-2 text-sm">
                          {lesson.phrases.map((p, i) => (
                            <div key={i} className="grid grid-cols-3 gap-2">
                              <div>{p.hy}</div>
                              <div>{p.en}</div>
                              <div>{p.ru}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dialogues */}
                      {lesson.dialogues.map((d, i) => (
                        <div key={i}>
                          <h4 className="font-bold text-sm mb-2 underline">Dialogue: {d.title.en}</h4>
                          <div className="space-y-1 text-sm">
                            {d.turns.map((t, j) => (
                              <div key={j} className="flex gap-2">
                                <span className="font-bold w-20">
                                  {t.speaker === "nurik" ? "Nurik:" : "You:"}
                                </span>
                                <span>{t.hy}</span>
                                <span className="text-gray-500">({t.en})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expandable content (not in print) */}
                  {expandedLesson === lesson.id && (
                    <div className="mt-4 pt-4 border-t border-white/10 no-print">
                      {/* Vocabulary */}
                      <div className="mb-4">
                        <h4 className="font-bold mb-2">📖 Vocabulary ({lesson.vocabulary.length})</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {lesson.vocabulary.map((v) => (
                            <div key={v.id} className="flex gap-4 text-sm py-1">
                              <span className="text-red-400 w-1/3">{v.hy}</span>
                              <span className="text-blue-400 w-1/3">{v.en}</span>
                              <span className="text-green-400 w-1/3">{v.ru}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Phrases */}
                      <div className="mb-4">
                        <h4 className="font-bold mb-2">💬 Phrases ({lesson.phrases.length})</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {lesson.phrases.map((p, i) => (
                            <div key={i} className="flex gap-4 text-sm py-1">
                              <span className="text-red-400 w-1/3">{p.hy}</span>
                              <span className="text-blue-400 w-1/3">{p.en}</span>
                              <span className="text-green-400 w-1/3">{p.ru}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dialogues */}
                      {lesson.dialogues.map((d, i) => (
                        <div key={i} className="mb-4">
                          <h4 className="font-bold mb-2">
                            🗣️ {d.title.en} / {d.title.hy}
                          </h4>
                          <div className="space-y-2 bg-white/5 rounded-lg p-3">
                            {d.turns.map((t, j) => (
                              <div
                                key={j}
                                className={`p-2 rounded ${
                                  t.speaker === "nurik"
                                    ? "bg-blue-900/30"
                                    : "bg-green-900/30"
                                }`}
                              >
                                <div className="font-bold text-xs mb-1">
                                  {t.speaker === "nurik" ? "🐿️ Նուրիկ" : "🧑 Դուք"}
                                </div>
                                <div className="text-red-400">{t.hy}</div>
                                <div className="text-blue-400 text-sm">{t.en}</div>
                                <div className="text-green-400 text-sm">{t.ru}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Start Button */}
                      <Link
                        href={`/learn?lesson=${lesson.id}`}
                        className="block w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-center mt-4"
                      >
                        🎯 Start Lesson
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 p-4 bg-white/5 rounded-xl no-print">
          <h3 className="font-bold mb-2">📊 Curriculum Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{WORLDS.length}</div>
              <div className="text-xs text-gray-400">Worlds</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{CONTENT_LESSONS.length}</div>
              <div className="text-xs text-gray-400">Lessons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {CONTENT_LESSONS.reduce((s, l) => s + l.vocabulary.length, 0)}
              </div>
              <div className="text-xs text-gray-400">Vocabulary</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {CONTENT_LESSONS.reduce((s, l) => s + l.phrases.length, 0)}
              </div>
              <div className="text-xs text-gray-400">Phrases</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
