// components/MultilingualLearningModule.tsx
"use client";

import { useState, useMemo } from "react";
import {
  getLessonsForPair,
  type LangPair,
  type MultiUnit,
  type MultiLesson,
  type MultiExercise,
} from "@/lib/i18n/multilingual";

// ----------------------------------------------------------------------
// Օժանդակ ֆունկցիաներ
// ----------------------------------------------------------------------

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getPromptText(prompt: Record<string, string>, pair: LangPair): string {
  const [fromLang] = pair.split("-");
  return prompt[fromLang] || prompt.en || "";
}

// ----------------------------------------------------------------------
// Գլխավոր կոմպոնենտ
// ----------------------------------------------------------------------

interface Props {
  pair: LangPair;
  onComplete?: (results: any[]) => void;
}

export default function MultilingualLearningModule({ pair, onComplete }: Props) {
  const [view, setView] = useState<"units" | "lessons" | "exercise">("units");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  const { units, lessons } = useMemo(() => getLessonsForPair(pair), [pair]);
  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const lessonsForUnit = lessons.filter(l => l.unitId === selectedUnitId);
  const currentLesson = lessons.find(l => l.id === selectedLessonId);
  const currentExercise = currentLesson?.exercises[currentExerciseIndex];

  const handleSelectUnit = (unit: MultiUnit) => {
    setSelectedUnitId(unit.id);
    setView("lessons");
  };

  const handleSelectLesson = (lesson: MultiLesson) => {
    setSelectedLessonId(lesson.id);
    setCurrentExerciseIndex(0);
    setView("exercise");
  };

  const handleBackToUnits = () => {
    setView("units");
    setSelectedUnitId(null);
    setSelectedLessonId(null);
  };

  const handleBackToLessons = () => {
    setView("lessons");
    setSelectedLessonId(null);
  };

  const handleExerciseComplete = (passed: boolean, earned: number) => {
    setResults(prev => [...prev, { exerciseId: currentExercise!.id, passed, earned }]);
    setTotalEarned(prev => prev + earned);
    if (currentExerciseIndex + 1 < (currentLesson?.exercises.length || 0)) {
      setCurrentExerciseIndex(i => i + 1);
    } else {
      alert(`Դասն ավարտված է։ Դուք վաստակեցիք ${totalEarned + earned} Hayq։`);
      if (onComplete) onComplete(results);
      handleBackToLessons();
    }
  };

  if (view === "units") {
    return <UnitsGrid units={units} pair={pair} onSelectUnit={handleSelectUnit} />;
  }
  if (view === "lessons" && selectedUnit) {
    return (
      <LessonsList
        unit={selectedUnit}
        lessons={lessonsForUnit}
        onBack={handleBackToUnits}
        onSelectLesson={handleSelectLesson}
      />
    );
  }
  if (view === "exercise" && currentLesson && currentExercise) {
    return (
      <ExercisePlayer
        pair={pair}
        lesson={currentLesson}
        exercise={currentExercise}
        currentIndex={currentExerciseIndex}
        totalExercises={currentLesson.exercises.length}
        onBack={handleBackToLessons}
        onComplete={handleExerciseComplete}
      />
    );
  }
  return <div className="text-center p-10">Բեռնում...</div>;
}

// ----------------------------------------------------------------------
// Միավորների ցանց
// ----------------------------------------------------------------------

function UnitsGrid({ units, pair, onSelectUnit }: any) {
  const [fromLang] = pair.split("-");
  return (
    <div className="container-main py-8">
      <h1 className="text-3xl font-bold text-center mb-2">📚 Նուր Լինգո</h1>
      <p className="text-center text-gray-400 mb-8">
        Սովորիր {fromLang === "hy" ? "անգլերեն" : fromLang === "ru" ? "անգլերեն" : "հայերեն"} – ընտրիր թեմա
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit: MultiUnit) => (
          <button
            key={unit.id}
            onClick={() => onSelectUnit(unit)}
            className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-left"
            style={{ background: `linear-gradient(135deg, ${unit.colorFrom}, ${unit.colorTo})` }}
          >
            <div className="p-6 text-white">
              <div className="text-5xl mb-4">{unit.iconEmoji}</div>
              <h2 className="text-2xl font-bold">{unit.title.hy || unit.title.en}</h2>
              <p className="text-sm opacity-90 mt-2">{unit.description.hy || unit.description.en}</p>
              <p className="text-xs opacity-70 mt-4">{unit.lessons.length} դաս</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Դասերի ցանկ
// ----------------------------------------------------------------------

function LessonsList({ unit, lessons, onBack, onSelectLesson }: any) {
  return (
    <div className="container-main py-8">
      <button onClick={onBack} className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-1">
        ← Վերադառնալ միավորներին
      </button>
      <div className="rounded-2xl p-6 text-white mb-8" style={{ background: `linear-gradient(135deg, ${unit.colorFrom}, ${unit.colorTo})` }}>
        <div className="text-5xl mb-2">{unit.iconEmoji}</div>
        <h1 className="text-3xl font-bold">{unit.title.hy || unit.title.en}</h1>
        <p className="text-white/80 mt-2">{unit.description.hy || unit.description.en}</p>
      </div>
      <div className="grid gap-4">
        {lessons.map((lesson: MultiLesson, idx: number) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 text-left hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-orange-400 uppercase">Դաս {idx+1}</span>
                <h2 className="text-xl font-semibold mt-1">{lesson.title.hy || lesson.title.en}</h2>
                <p className="text-gray-400 text-sm mt-1">{lesson.description.hy || lesson.description.en}</p>
              </div>
              <div className="text-2xl text-gray-500">→</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Վարժությունների խաղացող (աջակցում է բոլոր տիպերին)
// ----------------------------------------------------------------------

function ExercisePlayer({ pair, lesson, exercise, currentIndex, totalExercises, onBack, onComplete }: any) {
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const promptText = getPromptText(exercise.prompt, pair);
  const hayqReward = exercise.hayqReward ?? 10;

  // Նախնական բառերի դասավորություն word_order-ի համար
  if (exercise.type === "word_order" && orderedWords.length === 0 && exercise.words) {
    setOrderedWords(shuffleArray([...exercise.words]));
  }

  const checkAnswer = (answer: string): boolean => {
    const normalized = answer.trim().toLowerCase();
    if (exercise.targetAnswer.toLowerCase() === normalized) return true;
    if (exercise.acceptableAnswers) {
      return exercise.acceptableAnswers.some((a: string) => a.toLowerCase() === normalized);
    }
    return false;
  };

  const handleSubmit = () => {
    let isCorrect = false;
    if (exercise.type === "multiple_choice" && selectedOption) {
      isCorrect = checkAnswer(selectedOption);
    } else if (exercise.type === "translate") {
      isCorrect = checkAnswer(userAnswer);
    } else if (exercise.type === "word_order") {
      isCorrect = checkAnswer(orderedWords.join(" "));
    } else if (exercise.type === "match_pairs" && exercise.pairs) {
      const allMatched = exercise.pairs.every(([left, right]: [string, string]) => matchedPairs[left] === right);
      isCorrect = allMatched;
    } else if (exercise.type === "listening") {
      isCorrect = checkAnswer(userAnswer);
    }

    setSubmitted(true);
    if (isCorrect) {
      setFeedback({ correct: true, message: `✅ Ճիշտ է։ +${hayqReward} Hayq` });
      setTimeout(() => onComplete(true, hayqReward), 1500);
    } else {
      setFeedback({ correct: false, message: `❌ Սխալ է։ Ճիշտ պատասխանն է՝ ${exercise.targetAnswer}` });
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  const moveWord = (from: number, to: number) => {
    const newWords = [...orderedWords];
    const [removed] = newWords.splice(from, 1);
    newWords.splice(to, 0, removed);
    setOrderedWords(newWords);
  };

  const renderInput = () => {
    switch (exercise.type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {exercise.options?.map((opt: string) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`w-full text-left p-3 rounded-lg border ${selectedOption === opt ? "border-orange-500 bg-orange-500/20" : "border-gray-700 hover:bg-gray-800"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case "translate":
      case "listening":
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Մուտքագրեք պատասխանը..."
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500"
            disabled={submitted}
          />
        );
      case "word_order":
        return (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {orderedWords.map((word: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => moveWord(idx, idx > 0 ? idx - 1 : orderedWords.length - 1)}
                  className="word-chip bg-gray-800 hover:bg-gray-700"
                >
                  {word}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400">👆 Հպեք բառերին՝ տեղերը փոխելու համար</p>
          </div>
        );
      case "match_pairs":
        if (!exercise.pairs) return null;
        const leftItems: string[] = exercise.pairs.map(([l]: [string, string]) => l);
        const rightItems: string[] = exercise.pairs.map(([, r]: [string, string]) => r);
        const shuffledRight = useMemo(() => shuffleArray([...rightItems]), [rightItems]);
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {leftItems.map((left: string) => (
                <div key={left} className="match-pair-left">{left}</div>
              ))}
            </div>
            <div className="space-y-2">
              {shuffledRight.map((right: string) => (
                <button
                  key={right}
                  onClick={() => {
                    const unmatchedLeft = leftItems.find((l: string) => !matchedPairs[l]);
                    if (unmatchedLeft) setMatchedPairs(prev => ({ ...prev, [unmatchedLeft]: right }));
                  }}
                  className="match-pair-right"
                >
                  {right}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return <div>Վարժության այս տեսակը դեռ չի աջակցվում</div>;
    }
  };

  return (
    <div className="container-main py-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-blue-400 hover:text-blue-300">← Վերադառնալ դասերին</button>
        <div className="text-sm text-gray-400">Վարժություն {currentIndex+1} / {totalExercises}</div>
      </div>
      <div className="exercise-card">
        <h2 className="text-2xl font-bold mb-2">{lesson.title.hy || lesson.title.en}</h2>
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <p className="text-lg font-medium">{promptText}</p>
          {exercise.type === "listening" && exercise.ttsText && (
            <button
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(exercise.ttsText);
                utterance.lang = exercise.ttsLang || pair.split("-")[1];
                speechSynthesis.speak(utterance);
              }}
              className="mt-2 text-orange-400 underline"
            >
              🔊 Լսել կրկին
            </button>
          )}
        </div>
        {renderInput()}
        {!submitted && (
          <button onClick={handleSubmit} className="btn-primary w-full mt-6">
            Ստուգել պատասխանը
          </button>
        )}
        {feedback && (
          <div className={`mt-4 p-3 rounded-lg ${feedback.correct ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}`}>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
}