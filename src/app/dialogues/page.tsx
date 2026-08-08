// src/app/dialogues/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import InteractiveDialogue from "@/components/InteractiveDialogue";
import { CONTENT_LESSONS, type DialogueTurn } from "@/lib/content/database";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";
import { useAudio } from "@/lib/hooks/useAudio";

interface DialogueWithMeta {
  id: string;
  lessonTitle: string;
  worldTitle: string;
  dialogueTitle: Record<LangCode, string>;
  turns: DialogueTurn[];
  worldId: string;
  lessonId: string;
}

export default function DialoguesPage() {
  const router = useRouter();
  const { speak, stop, isSpeaking } = useAudio();
  const [dialogues, setDialogues] = useState<DialogueWithMeta[]>([]);
  const [nativeLang, setNativeLang] = useState<LangCode>("hy");
  const [expandedDialogue, setExpandedDialogue] = useState<string | null>(null);
  const [revealedLines, setRevealedLines] = useState<Record<string, boolean>>({});
  const [interactiveMode, setInteractiveMode] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const cfg = loadLangConfig();
    setNativeLang(cfg?.native || "hy");

    const allDialogues: DialogueWithMeta[] = [];
    for (const lesson of CONTENT_LESSONS) {
      if (lesson.dialogues && lesson.dialogues.length > 0) {
        for (const dlg of lesson.dialogues) {
          allDialogues.push({
            id: dlg.id,
            lessonTitle: lesson.title.en,
            worldTitle: `World ${lesson.worldId.slice(1)}`,
            dialogueTitle: dlg.title,
            turns: dlg.turns,
            worldId: lesson.worldId,
            lessonId: lesson.id,
          });
        }
      }
    }
    setDialogues(allDialogues);
  }, []);

  // 🔊 Աուդիո նվագարկում AudioService-ով
  const handleSpeak = (text: string, id: string) => {
    if (isSpeaking) {
      stop();
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }
    }
    setSpeakingId(id);
    speak(text, "hy", {
      id: `dialogue_${id}`, // Փորձում է նվագարկել /audio/hy/dialogue_{id}.mp3
      onEnd: () => setSpeakingId(null),
      onError: () => {
        // Fallback-ն արդեն աշխատում է AudioService-ում
        setSpeakingId(null);
      },
    });
  };

  const toggleDialogue = (id: string) => {
    setExpandedDialogue(expandedDialogue === id ? null : id);
    setRevealedLines({});
  };

  const toggleLine = (dialogueId: string, turnIdx: number) => {
    const key = `${dialogueId}-${turnIdx}`;
    setRevealedLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInteractiveMode = (id: string) => {
    setInteractiveMode((prev) => ({ ...prev, [id]: !prev[id] }));
    setRevealedLines({});
  };

  const getSpeakerName = (speaker: "nurik" | "user", lang: LangCode) => {
    if (speaker === "nurik") return "🐿️ Նուրիկ";
    return lang === "hy"
      ? "🧑‍🎓 Դուք"
      : lang === "en"
      ? "🧑‍🎓 You"
      : "🧑‍🎓 Вы";
  };

  const filteredDialogues = dialogues.filter(
    (dlg) =>
      dlg.dialogueTitle[nativeLang]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      dlg.dialogueTitle.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dlg.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStandardMode = (dlg: DialogueWithMeta) => (
    <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
      {dlg.turns.map((turn, idx) => {
        const key = `${dlg.id}-${idx}`;
        const isRevealed = revealedLines[key];
        const audioId = `${dlg.id}_${idx}`;
        const isSpeakingNow = isSpeaking && speakingId === audioId;
        return (
          <div
            key={key}
            className={`flex ${
              turn.speaker === "nurik" ? "justify-start" : "justify-end"
            } relative group`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 cursor-pointer transition-colors ${
                turn.speaker === "nurik"
                  ? "bg-blue-900/50 text-blue-100 hover:bg-blue-800/60"
                  : "bg-green-900/50 text-green-100 hover:bg-green-800/60"
              }`}
              onClick={() => toggleLine(dlg.id, idx)}
            >
              <div className="text-sm font-medium opacity-80">
                {getSpeakerName(turn.speaker, nativeLang)}
              </div>
              <div className="text-lg mt-1">{turn.hy}</div>
              {isRevealed && (
                <div className="mt-2 pt-2 border-t border-current/20 text-sm">
                  <div className="italic">{turn.en}</div>
                  <div className="italic text-xs opacity-70 mt-1">{turn.ru}</div>
                </div>
              )}
              {!isRevealed && (
                <div className="text-xs opacity-50 mt-2">
                  👆 հպեք՝ թարգմանությունը տեսնելու համար
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(turn.hy, audioId);
              }}
              disabled={isSpeakingNow}
              className={`absolute -right-8 top-1/2 transform -translate-y-1/2 text-sm opacity-0 group-hover:opacity-100 transition ${
                isSpeakingNow ? "text-gray-500" : "text-blue-400 hover:text-blue-300"
              }`}
            >
              {isSpeakingNow ? "🔊 ..." : "🔊"}
            </button>
          </div>
        );
      })}
      <div className="text-center pt-2 flex flex-wrap justify-center gap-3">
        <button
          onClick={() =>
            router.push(`/learn?lesson=${dlg.lessonId}&pair=hy-en`)
          }
          className="text-sm text-orange-400 hover:underline"
        >
          → Գնալ այս դասին
        </button>
        <button
          onClick={() => toggleInteractiveMode(dlg.id)}
          className="text-sm text-blue-400 hover:underline"
        >
          {interactiveMode[dlg.id]
            ? "🔁 Տեսնել սովորական"
            : "📝 Փորձել ինտերակտիվ"}
        </button>
      </div>
    </div>
  );

  const renderInteractiveMode = (dlg: DialogueWithMeta) => (
    <div className="px-5 pb-5 border-t border-white/10 pt-4">
      <InteractiveDialogue
        turns={dlg.turns}
        onComplete={(score, total) => {
          void score; void total; // reserved for future analytics
        }}
      />
      <div className="text-center pt-3">
        <button
          onClick={() => toggleInteractiveMode(dlg.id)}
          className="text-sm text-blue-400 hover:underline"
        >
          🔁 Վերադառնալ սովորական ռեժիմի
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-2">💬 Զրույցներ</h1>
        <p className="text-center text-gray-400 mb-6">
          Կիրառիր իրական երկխոսություններ (բաց թողումներով և աուդիո)
        </p>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Փնտրել զրույցներ..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
          />
        </div>

        {filteredDialogues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Զրույցներ չեն գտնվել</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDialogues.map((dlg) => (
              <div
                key={dlg.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleDialogue(dlg.id)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-white/5 transition"
                >
                  <div>
                    <div className="text-xs text-orange-400 font-semibold uppercase">
                      {dlg.worldTitle} • {dlg.lessonTitle}
                    </div>
                    <div className="text-xl font-semibold mt-1">
                      {dlg.dialogueTitle[nativeLang] || dlg.dialogueTitle.en}
                    </div>
                  </div>
                  <div className="text-2xl text-gray-500">
                    {expandedDialogue === dlg.id ? "▲" : "▼"}
                  </div>
                </button>

                {expandedDialogue === dlg.id &&
                  (interactiveMode[dlg.id]
                    ? renderInteractiveMode(dlg)
                    : renderStandardMode(dlg))}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}