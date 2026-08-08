"use client";

import { useState, useRef, useEffect } from "react";
import type { DialogueTurn } from "@/lib/content/database";

interface InteractiveDialogueProps {
  turns: DialogueTurn[];
  onComplete?: (score: number, total: number) => void;
}

export default function InteractiveDialogue({ turns, onComplete }: InteractiveDialogueProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [audioSupported, setAudioSupported] = useState(true);

  // Ստուգել աուդիո աջակցությունը
  useEffect(() => {
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setAudioSupported(false);
    }
  }, []);

  const speak = (text: string, lang: string, id: string) => {
    if (!audioSupported) {
      alert("Ձեր բրաուզերը չի աջակցում ձայնային արտասանությանը");
      return;
    }
    // Դադարեցնել ընթացիկ արտասանությունը
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(id);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const getBlankWord = (turn: DialogueTurn, idx: number): string | null => {
    if (submitted[idx]) return null;
    // միայն user-ի խոսքերում ենք բաց թողում անում
    if (turn.speaker !== "user") return null;
    const words = turn.hy.split(" ");
    if (words.length === 0) return null;
    return words[0];
  };

  const checkAnswer = (turnIdx: number, userAnswer: string, blankWord: string) => {
    const isCorrect = userAnswer.trim().toLowerCase() === blankWord.toLowerCase();
    setFeedback(prev => ({ ...prev, [turnIdx]: isCorrect }));
    setSubmitted(prev => ({ ...prev, [turnIdx]: true }));
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      if (onComplete) onComplete(newScore, turns.length);
    }
  };

  const renderTurn = (turn: DialogueTurn, idx: number) => {
    const blankWord = getBlankWord(turn, idx);
    const isSubmitted = submitted[idx];
    const audioId = `${turn.speaker}-${idx}`;
    const isSpeaking = speakingId === audioId;

    if (!blankWord || isSubmitted) {
      return (
        <div className="mb-3 p-2 border-l-4 border-blue-400 relative">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold">{turn.speaker === "nurik" ? "🐿️ Նուրիկ" : "🧑 Դուք"}</span>
            <span className="text-gray-800 dark:text-gray-200">{turn.hy}</span>
            <button
              onClick={() => speak(turn.hy, "hy", audioId)}
              disabled={isSpeaking}
              className={`text-sm underline ml-auto px-2 py-1 rounded ${
                isSpeaking ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:text-blue-600"
              }`}
            >
              {isSpeaking ? "🔊 ..." : "🔊"}
            </button>
          </div>
          {isSubmitted && feedback[idx] !== undefined && (
            <div className="text-xs mt-1 text-green-600">✅ Ճիշտ է</div>
          )}
          <div className="text-xs text-gray-500 mt-1">{turn.en}</div>
        </div>
      );
    }

    const parts = turn.hy.split(blankWord);
    const before = parts[0];
    const after = parts[1] || "";

    return (
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold">{turn.speaker === "nurik" ? "🐿️" : "🧑"}</span>
          <span>{before}</span>
          <input
            type="text"
            value={answers[idx] || ""}
            onChange={(e) => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
            className="w-28 border-b-2 border-blue-400 bg-transparent text-center focus:outline-none"
            placeholder="___"
          />
          <span>{after}</span>
          <button
            onClick={() => speak(turn.hy, "hy", audioId)}
            disabled={isSpeaking}
            className={`text-sm underline ml-auto px-2 py-1 rounded ${
              isSpeaking ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:text-blue-600"
            }`}
          >
            {isSpeaking ? "🔊 ..." : "🔊"}
          </button>
        </div>
        <button
          onClick={() => checkAnswer(idx, answers[idx] || "", blankWord)}
          className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
        >
          Ստուգել
        </button>
        <div className="text-xs text-gray-500 mt-1">{turn.en}</div>
      </div>
    );
  };

  if (!audioSupported) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300">
        ⚠️ Ձեր բրաուզերը չի աջակցում ձայնային արտասանությանը։ Խնդրում ենք օգտագործել Chrome, Edge կամ Safari։
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {turns.map((turn, idx) => (
        <div key={idx}>{renderTurn(turn, idx)}</div>
      ))}
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        ✅ Ճիշտ պատասխաններ: {score} / {turns.length}
      </div>
    </div>
  );
}