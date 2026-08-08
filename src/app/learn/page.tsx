"use client";
import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Nuri, { NuriSpeech, getMoodFromScore, type NuriMood } from "@/components/Nuri";
import { loadLangConfig, type LangCode, type LangPair } from "@/lib/i18n/index";
import { getLessonById, type MultiLesson } from "@/lib/i18n/multilingual";
import {
  loadRewards, saveRewards, addRewards, updateStreak, addHAYQ,
  syncHearts, deductHeart, buyHeartRefill, getNextHeartCountdown,
  saveCrownLevel, earnHeartByPractice,
} from "@/lib/rewards/seeds";
import { updateQuestProgress } from "@/lib/rewards/quests";
import { supabase } from "@/lib/supabase/client";

function getOrCreateDeviceId(): string {
  const key = "nur_device_id";
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

async function saveCompletionToSupabase(
  lessonId: string,
  accuracy: number,
  hayqEarned: number,
  crownLevel: number,
  durationMs: number
) {
  try {
    const deviceId = getOrCreateDeviceId();
    await supabase.from("lesson_completions" as any).upsert({
      device_id: deviceId,
      lesson_id: lessonId,
      accuracy,
      hayq_earned: hayqEarned,
      crown_level: crownLevel,
      duration_ms: durationMs,
    }, { onConflict: "device_id,lesson_id" });
  } catch {
    // silently ignore — offline or DB unavailable
  }
}

type AnswerState = "idle" | "submitting" | "correct" | "incorrect";

interface ExState {
  index: number;
  userAnswer: string;
  matchPairsAnswer: Record<string, string>;
  state: AnswerState;
  feedback: string;
  score: number;
  hayqEarned: number;
  corrections?: string[];
  nuriMood: NuriMood;
  nuriSpeech: string;
}

const NURI_LINES: Record<string, string[]> = {
  correct_perfect: ["Կատարյալ! Հիանալի! 🌟", "Վայ, ՀԱՅՔ վաստակեցիր! 🏆", "Չեմ հավատում! 🎉"],
  correct:         ["Շատ լավ! ✅", "Այո! Հայերեն գիտես! 👍", "Ճիշտ է: Շարունակիր:"],
  incorrect:       ["Մի տխրիր! Կարող ես 💪", "Կրկնիր! Կստացվի", "Շատ մոտ էր, բայց կփորձենք նորից!"],
  thinking:        ["Մտածիր... 💭", "Հայերենը հիասքանչ է 🤔", "Ոչ այստեղ, ոչ այնտեղ..."],
  idle:            ["Բարև! Սովորենք միասին! 🍎", "Ինչպե՞ս ես: Պատրա՞ստ ես:", "Հայերեն սովորելը հաճելի է 🪙"],
};

function randomLine(key: string) {
  const arr = NURI_LINES[key] ?? NURI_LINES.idle;
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function LearnInner() {
  const router = useRouter();
  const params = useSearchParams();
  const lessonId = params.get("lesson") ?? "";
  const pairParam = params.get("pair") as LangPair | null;

  const [lesson, setLesson] = useState<MultiLesson | null>(null);
  const [native, setNative] = useState<LangCode>("en");
  const [complete, setComplete] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [countdown, setCountdown] = useState<number>(0);
  const [startTime] = useState(() => Date.now());
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [totalHAYQ, setTotal] = useState(0);
  const [sessionHAYQ, setSessionHAYQ] = useState(0);
  const [sessionSeeds, setSessionSeeds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionLevel, setSLevel] = useState(1);
  
  // word_order state
  const [selectedWords, setSW] = useState<string[]>([]);
  const [availWords, setAW] = useState<string[]>([]);
  
  // match_pairs state
  const [matchPairsMap, setMatchPairsMap] = useState<Record<string, string>>({});
  const [matchRightItems, setMatchRightItems] = useState<string[]>([]);
  const [matchLeftItems, setMatchLeftItems] = useState<string[]>([]);

  const [ex, setEx] = useState<ExState>({
    index: 0, userAnswer: "", matchPairsAnswer: {}, state: "idle",
    feedback: "", score: 0, hayqEarned: 0,
    nuriMood: "idle", nuriSpeech: randomLine("idle"),
  });

  const current = lesson?.exercises[ex.index];

  // Reset states when exercise changes
  useEffect(() => {
    if (!current) return;
    if (current.type === "word_order" && current.words) {
      setAW([...current.words]);
      setSW([]);
    } else if (current.type === "match_pairs" && current.pairs) {
      const left = current.pairs.map(p => p[0]);
      const right = current.pairs.map(p => p[1]);
      setMatchLeftItems(left);
      setMatchRightItems(shuffleArray([...right]));
      setMatchPairsMap({});
      setEx(prev => ({ ...prev, matchPairsAnswer: {} }));
    } else {
      setMatchLeftItems([]);
      setMatchRightItems([]);
      setMatchPairsMap({});
    }
  }, [current]);

  useEffect(() => {
    const cfg = loadLangConfig();
    const pair = pairParam ?? cfg?.pair ?? "en-hy";
    const nat = cfg?.native ?? "en";
    setNative(nat as LangCode);
    
    const l = getLessonById(pair as LangPair, lessonId);
    if (!l) {
      if (lessonId) router.push("/world");
      return;
    }
    setLesson(l);

    const rewards = syncHearts();
    setHearts(rewards.hearts);
    setTotal(rewards.totalHAYQ);
    setStreak(rewards.streak);
    const lvl = Math.min(3, (rewards.crowns[l.id] || 0) + 1);
    setSLevel(lvl);
  }, [lessonId, pairParam, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextH = syncHearts();
      if (nextH.hearts !== hearts) setHearts(nextH.hearts);
      setCountdown(getNextHeartCountdown(nextH));
    }, 1000);
    return () => clearInterval(timer);
  }, [hearts]);

  const submit = useCallback(async () => {
    if (!current || ex.state === "submitting") return;
    
    let answerForApi: string;
    if (current.type === "word_order") {
      if (selectedWords.length === 0) return;
      answerForApi = selectedWords.join(" ");
    } else if (current.type === "match_pairs") {
      if (Object.keys(matchPairsMap).length !== matchLeftItems.length) return;
      answerForApi = JSON.stringify(matchPairsMap);
    } else if (current.type === "multiple_choice") {
      if (!ex.userAnswer) return;
      answerForApi = ex.userAnswer;
    } else {
      // For listening and textarea types
      if (!ex.userAnswer.trim()) return;
      answerForApi = ex.userAnswer.trim();
    }

    setEx(s => ({ ...s, state: "submitting", nuriMood: "thinking", nuriSpeech: randomLine("thinking") }));

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: answerForApi,
          expectedAnswer: current.targetAnswer,
          englishOriginal: current.prompt["en"] ?? current.prompt[native] ?? current.targetAnswer,
          allValidAnswers: current.acceptableAnswers || [],
          sourceLanguage: native,
          targetLanguage: (loadLangConfig()?.learning || "hy"),
          exerciseType: current.type,
          useAI: false,
        }),
      });
      const data = await res.json();
      const correct = data.accepted;
      const score   = data.score ?? 0;
      const hayq = correct ? 10 : 0;
      const seeds = (correct && score >= 0.98) ? 1 : 0;

      setStats(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));

      if (!correct) {
        const updated = deductHeart();
        setHearts(updated.hearts);
      }
      
      if (correct) {
        const rewards = loadRewards();
        const updated = addHAYQ(updateStreak(rewards), hayq);
        if (seeds > 0) updated.totalSeeds += seeds;
        saveRewards(updated);
        
        setTotal(updated.totalHAYQ);
        setStreak(updated.streak);
        setSessionHAYQ(s => s + hayq);
        setSessionSeeds(s => s + seeds);
        
        updateQuestProgress("earn_hayq", hayq);
      }

      setEx(s => ({
        ...s,
        state: correct ? "correct" : "incorrect",
        feedback: data.feedback,
        score: score,
        hayqEarned: hayq,
        corrections: data.corrections,
        nuriMood: getMoodFromScore(score, correct, streak),
        nuriSpeech: randomLine(score >= 0.98 ? "correct_perfect" : correct ? "correct" : "incorrect"),
      }));
    } catch {
      setEx(s => ({ ...s, state: "incorrect", feedback: "Ցանցի սխալ", nuriMood: "sad", nuriSpeech: "Oops! 😅" }));
    }
  }, [current, ex.userAnswer, ex.state, selectedWords, matchPairsMap, matchLeftItems.length, lesson, streak, native]);

  const next = useCallback(() => {
    if (!lesson) return;
    const nextIdx = ex.index + 1;
    if (nextIdx >= lesson.exercises.length) {
      addRewards(40, 0, lesson.estimatedMinutes);
      saveCrownLevel(lesson.id, sessionLevel);
      updateQuestProgress("complete_lessons", 1);
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      saveCompletionToSupabase(lesson.id, accuracy, sessionHAYQ + 40, sessionLevel, Date.now() - startTime);
      setComplete(true);
      return;
    }
    setEx({ index: nextIdx, userAnswer: "", matchPairsAnswer: {}, state: "idle", feedback: "", score: 0, hayqEarned: 0, nuriMood: "happy", nuriSpeech: randomLine("idle") });
    setSW([]); setAW([]);
    setMatchPairsMap({});
  }, [lesson, ex.index, sessionLevel, stats, sessionHAYQ, startTime]);

  const handleRefill = useCallback(() => {
    const result = buyHeartRefill();
    if (result.success) {
      setHearts(result.rewards.hearts);
      setTotal(result.rewards.totalHAYQ);
    } else {
      alert(result.error || "Refill failed");
    }
  }, []);

  const handlePractice = useCallback(() => {
    const result = earnHeartByPractice();
    if (result.success) {
      setHearts(result.rewards.hearts);
    } else {
      alert("You already have full hearts!");
    }
  }, []);

  if (complete && lesson)
    return <CompletionScreen lesson={lesson} totalHAYQ={sessionHAYQ} totalSeeds={sessionSeeds} hearts={hearts} stats={stats} duration={Date.now() - startTime} native={native} onContinue={() => { router.push("/world"); }} />;

  if (hearts <= 0)
    return <NoHeartsScreen 
      countdown={countdown} 
      totalHAYQ={totalHAYQ} 
      onRefill={handleRefill} 
      onPractice={handlePractice}
      onBack={() => { router.push("/world"); }} 
    />;

  if (!lesson || !current) return null;
  const progress = (ex.index / lesson.exercises.length) * 100;

  return (
    <div className="min-h-screen flex flex-col relative text-white">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <button onClick={() => router.push("/world")} className="text-white/40 hover:text-white text-2xl">✕</button>
        <div className="flex-1 h-3 rounded-full bg-white/10 mx-4">
          <motion.div className="h-full rounded-full bg-green-500" animate={{ width: `${progress}%` }} />
        </div>
        <div className="text-xl">❤️ {hearts}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <NuriSpeech text={ex.nuriSpeech} mood={ex.nuriMood} />
        <Nuri mood={ex.nuriMood} size={140} />
        
        <div className="w-full max-w-2xl bg-white/5 p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold mb-6">{current.prompt[native] ?? current.prompt["en"]}</h2>
          
          {current.hint && sessionLevel === 1 && current.hint[native] && (
             <p className="text-blue-300 italic mb-4">💡 {current.hint[native]}</p>
          )}

          <div className="mt-8">
            {current.type === "word_order" && current.words ? (
              <WordOrderInput 
                selected={selectedWords} 
                available={availWords} 
                onSelect={(w) => {setSW([...selectedWords, w]); setAW(availWords.filter(x => x !== w))}} 
                onDeselect={(w) => {setAW([...availWords, w]); setSW(selectedWords.filter(x => x !== w))}} 
                disabled={ex.state !== "idle"} 
              />
            ) : current.type === "multiple_choice" && current.options ? (
              <div className="grid grid-cols-2 gap-4">
                {current.options.map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => setEx({...ex, userAnswer: opt})} 
                    className={`p-4 rounded-xl border-2 transition ${ex.userAnswer === opt ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 hover:border-white/30'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : current.type === "match_pairs" && current.pairs ? (
              <MatchPairsInput
                leftItems={matchLeftItems}
                rightItems={matchRightItems}
                matched={matchPairsMap}
                onMatch={(left, right) => {
                  const newMap = { ...matchPairsMap, [left]: right };
                  setMatchPairsMap(newMap);
                  setEx(prev => ({ ...prev, matchPairsAnswer: newMap }));
                  setMatchRightItems(prev => prev.filter(r => r !== right));
                }}
                disabled={ex.state !== "idle"}
              />
            ) : current.type === "listening" && current.ttsText ? (
              <ListeningInput
                ttsText={current.ttsText}
                ttsLang={current.ttsLang || (loadLangConfig()?.learning || "hy")}
                promptText={current.prompt[native] ?? current.prompt["en"]}
                value={ex.userAnswer}
                onChange={(val) => setEx({...ex, userAnswer: val})}
                disabled={ex.state !== "idle"}
              />
            ) : (
              <textarea 
                value={ex.userAnswer} 
                onChange={e => setEx({...ex, userAnswer: e.target.value})} 
                className="w-full bg-black/20 p-4 rounded-xl h-32" 
                placeholder="Մուտքագրեք ձեր պատասխանը..."
                disabled={ex.state !== "idle"}
              />
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/10">
        {ex.state === "idle" ? (
          <button onClick={submit} className="w-full py-4 bg-blue-600 rounded-xl font-bold">Ստուգել</button>
        ) : (
          <div className={`p-4 rounded-xl mb-4 ${ex.state === 'correct' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <p>{ex.feedback}</p>
            <button onClick={next} className="mt-4 w-full py-4 bg-white text-black rounded-xl font-bold">Շարունակել</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#1a0a0a]"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-[#FFA500]"/></div>}>
      <LearnInner />
    </Suspense>
  );
}

// ----------------------------------------------------------------------
// Word Order Input Component
// ----------------------------------------------------------------------
interface WordOrderInputProps {
  selected: string[];
  available: string[];
  onSelect: (word: string) => void;
  onDeselect: (word: string) => void;
  disabled: boolean;
}

function WordOrderInput({ selected, available, onSelect, onDeselect, disabled }: WordOrderInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl min-h-[60px]">
        {selected.map((w, i) => (
          <button 
            key={`${w}-${i}`} 
            onClick={() => !disabled && onDeselect(w)} 
            className="bg-blue-600 px-3 py-1 rounded text-sm"
          >
            {w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map((w, i) => (
          <button 
            key={`${w}-${i}`} 
            onClick={() => !disabled && onSelect(w)} 
            className="bg-white/10 px-3 py-1 rounded text-sm hover:bg-white/20"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Match Pairs Input Component
// ----------------------------------------------------------------------
interface MatchPairsInputProps {
  leftItems: string[];
  rightItems: string[];
  matched: Record<string, string>;
  onMatch: (left: string, right: string) => void;
  disabled: boolean;
}

function MatchPairsInput({ leftItems, rightItems, matched, onMatch, disabled }: MatchPairsInputProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const handleLeftClick = (left: string) => {
    if (disabled) return;
    if (matched[left]) return;
    setSelectedLeft(selectedLeft === left ? null : left);
  };

  const handleRightClick = (right: string) => {
    if (disabled) return;
    if (selectedLeft && !matched[selectedLeft]) {
      onMatch(selectedLeft, right);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {leftItems.map(left => (
          <button
            key={left}
            onClick={() => handleLeftClick(left)}
            className={`w-full p-3 rounded-xl text-left transition ${
              matched[left] 
                ? 'bg-green-800/50 line-through opacity-60 cursor-not-allowed' 
                : selectedLeft === left 
                  ? 'bg-blue-600' 
                  : 'bg-white/10 hover:bg-white/20'
            }`}
            disabled={!!matched[left] || disabled}
          >
            {left}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {rightItems.map(right => (
          <button
            key={right}
            onClick={() => handleRightClick(right)}
            className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 text-left"
            disabled={disabled}
          >
            {right}
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ✨ IMPROVED Listening Input Component
// ----------------------------------------------------------------------
interface ListeningInputProps {
  ttsText: string;
  ttsLang: string;
  promptText: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}

function ListeningInput({ ttsText, ttsLang, promptText, value, onChange, disabled }: ListeningInputProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const speak = () => {
    if (disabled || isPlaying) return;
    window.speechSynthesis?.cancel();

    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.lang = ttsLang;
    utterance.rate = 0.85;
    utterance.pitch = 1;

    const voices = window.speechSynthesis?.getVoices?.() || [];
    const nativeVoice = voices.find(v => v.lang.startsWith(ttsLang.split("-")[0]));
    if (nativeVoice) utterance.voice = nativeVoice;

    setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      textareaRef.current?.focus();
    };
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis?.speak(utterance);
  };

  useEffect(() => {
    if (disabled) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    }
  }, [disabled]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-blue-300 bg-blue-950/30 p-3 rounded-xl">
        <p>🎧 {promptText}</p>
        <p className="text-xs opacity-70 mt-1">Լսեք ուշադիր և գրեք վերջին արտահայտությունը:</p>
      </div>

      <button
        onClick={speak}
        disabled={disabled || isPlaying}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
          isPlaying
            ? 'bg-orange-700/70 cursor-wait'
            : disabled
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700'
        }`}
      >
        {isPlaying ? (
          <>
            <span className="animate-pulse">⏳</span> Նվագարկվում է...
          </>
        ) : disabled ? (
          '🔇 Սպասեք...'
        ) : (
          '🔊 Լսել արտասանությունը'
        )}
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Գրեք ձեր լսածը այստեղ..."
        className="w-full bg-black/20 p-4 rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        disabled={disabled}
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// NoHeartsScreen and CompletionScreen (unchanged)
// ----------------------------------------------------------------------
interface NoHeartsScreenProps {
  countdown: number;
  totalHAYQ: number;
  onRefill: () => void;
  onPractice: () => void;
  onBack: () => void;
}

function NoHeartsScreen({ countdown, totalHAYQ, onRefill, onPractice, onBack }: NoHeartsScreenProps) {
  const minutesLeft = Math.ceil(countdown / 60000);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">No Hearts Left</h1>
      <p className="mb-2">Next heart in: {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}</p>
      <p className="mb-8">Refill for 100 HAYQ (Current: {totalHAYQ} 🪙)</p>
      <button onClick={onPractice} className="w-full max-w-xs py-4 bg-green-600 text-white rounded-xl font-bold mb-4">Practice to earn 1 Heart (free)</button>
      <button onClick={onRefill} className="w-full max-w-xs py-4 bg-white text-black rounded-xl font-bold mb-4">Refill (100 HAYQ)</button>
      <button onClick={onBack} className="text-white/60">Go Back</button>
    </div>
  );
}

interface CompletionScreenProps {
  lesson: MultiLesson;
  totalHAYQ: number;
  totalSeeds: number;
  hearts: number;
  stats: { correct: number; total: number };
  duration: number;
  native: LangCode;
  onContinue: () => void;
}

function CompletionScreen({ lesson, totalHAYQ, totalSeeds, stats, duration, native, onContinue }: CompletionScreenProps) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const crownCount = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
  const durationSec = Math.round(duration / 1000);
  const lessonTitle = typeof lesson.title === "string"
    ? lesson.title
    : (lesson.title as any)[native] ?? (lesson.title as any)["en"] ?? lesson.id;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#1a0a0a] text-white">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 10 }}
        className="mb-6"
      >
        <Nuri mood={accuracy >= 90 ? "celebrating" : accuracy >= 70 ? "happy" : "encouraging"} size={120} glow={accuracy >= 90} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-black mb-1"
      >
        Lesson Complete! 🎉
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/40 text-sm mb-6"
      >
        {lessonTitle}
      </motion.p>

      {/* Crown stars */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3 mb-8"
      >
        {[1, 2, 3].map((n) => (
          <motion.span
            key={n}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + n * 0.15, type: "spring", damping: 8 }}
            className={`text-5xl ${n <= crownCount ? "opacity-100" : "opacity-20 grayscale"}`}
          >
            ⭐
          </motion.span>
        ))}
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-3 mb-8 w-full max-w-sm"
      >
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <p className="text-3xl font-black text-green-400">{accuracy}%</p>
          <p className="text-xs uppercase text-white/30 mt-1">Accuracy</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <p className="text-3xl font-black text-yellow-400">+{totalHAYQ}</p>
          <p className="text-xs uppercase text-white/30 mt-1">🪙 HAYQ</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <p className="text-3xl font-black text-blue-400">{durationSec}s</p>
          <p className="text-xs uppercase text-white/30 mt-1">Time</p>
        </div>
      </motion.div>

      {/* Accuracy bar */}
      <div className="w-full max-w-sm bg-white/10 rounded-full h-3 mb-8 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#D90012] to-[#F2A800]"
          initial={{ width: 0 }}
          animate={{ width: `${accuracy}%` }}
          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onContinue}
        className="w-full max-w-xs py-5 bg-white text-black rounded-2xl font-black text-lg active:scale-95 transition"
      >
        CONTINUE →
      </motion.button>
    </div>
  );
}