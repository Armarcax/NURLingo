"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { 
  loadRewards, syncHearts, checkAndApplyFreeze, 
  checkStreakMilestones, checkDailyGoalBonus, addRewards,
  type UserRewards 
} from "@/lib/rewards/seeds";
import { loadQuests, claimReward, type Quest } from "@/lib/rewards/quests";
import { getLessonsForPair, LangPair, MultiLesson, MULTI_UNITS } from "@/lib/i18n/multilingual";
import { hayqToLevel } from "@/lib/lessons/engine";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import { loadLangConfig, LangCode } from "@/lib/i18n/index";

function Confetti({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 1, 
            x: 0, 
            y: 0, 
            scale: Math.random() * 0.5 + 0.5,
            rotate: 0 
          }}
          animate={{ 
            opacity: 0,
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            rotate: Math.random() * 360,
            scale: 0
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
            ease: "easeOut" 
          }}
          className="absolute w-2 h-2 rounded-sm"
          style={{ 
            backgroundColor: color,
            left: "50%",
            top: "50%"
          }}
        />
      ))}
    </div>
  );
}

export default function WorldPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<MultiLesson[]>([]);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [native, setNative] = useState<LangCode>("en");
  const [pair, setPair] = useState<LangPair>("en-hy");
  const [quests, setQuests] = useState<Quest[]>([]);

  // Load quests on mount
  useEffect(() => {
    setQuests(loadQuests());
  }, []);

  useEffect(() => {
    const config = loadLangConfig();
    const p = config?.pair || "en-hy";
    const nat = config?.native || "en";
    setNative(nat);
    setPair(p);

    const r = syncHearts();
    const withFreeze = checkAndApplyFreeze();
    const res = checkStreakMilestones();
    const goalRes = checkDailyGoalBonus();
    setRewards({ ...r, ...withFreeze, ...res.rewards, ...goalRes.rewards });
    if (res.milestone) setMilestone(res.milestone);
    
    const today = new Date().toISOString().split("T")[0];
    if ((goalRes.rewards.dailyActivity[today] || 0) >= goalRes.rewards.dailyGoal) {
      setGoalAchieved(true);
    }

    const data = getLessonsForPair(p);
    setUnits(data.units);
    setAllLessons(data.lessons);
  }, []);

  // Update quest UI when rewards change (for earned HAYQ)
  useEffect(() => {
    if (rewards) {
      setQuests(loadQuests());
    }
  }, [rewards?.totalHAYQ, rewards?.totalSeeds]);

  // Dynamically compute the snake path based on actual lesson positions
  const pathD = useMemo(() => {
    if (!units.length || !allLessons.length) return "M 400 200";

    // Layout constants (must match actual CSS classes)
    const BUTTON_SIZE = 96;        // w-24 h-24 = 96px
    const GAP_BETWEEN_LESSONS = 48; // gap-12 = 48px
    const LESSON_SPACING = BUTTON_SIZE + GAP_BETWEEN_LESSONS; // 144px center-to-center
    const UNIT_HEADER_HEIGHT = 120; // approximate height of unit title + progress bar
    const SPACE_BETWEEN_UNITS = 64;  // space-y-16 = 64px
    const START_Y = 280;             // Y after hero section (Nuri + title)

    let currentY = START_Y;
    const points: { x: number; y: number }[] = [];

    for (const unit of units) {
      const lessonsInUnit = allLessons.filter(l => l.unitId === unit.id);
      if (lessonsInUnit.length === 0) continue;

      // Add unit header offset
      currentY += UNIT_HEADER_HEIGHT;

      for (let i = 0; i < lessonsInUnit.length; i++) {
        const globalIndex = points.length;
        // Alternate X offset: left/right from center 400
        const xOffset = (globalIndex % 2 === 0) ? 60 : -60;
        const x = 400 + xOffset;
        points.push({ x, y: currentY });
        currentY += LESSON_SPACING;
      }
      // Add gap after unit
      currentY += SPACE_BETWEEN_UNITS;
    }

    if (points.length === 0) return "M 400 200";

    // Build smooth cubic bezier path
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      // Control points for gentle curve
      const cp1x = prev.x + (curr.x - prev.x) * 0.3;
      const cp1y = prev.y + LESSON_SPACING * 0.3;
      const cp2x = curr.x - (curr.x - prev.x) * 0.3;
      const cp2y = curr.y - LESSON_SPACING * 0.3;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [units, allLessons]);

  // Dynamic viewBox height to make the whole path visible
  const viewBoxHeight = useMemo(() => {
    if (!units.length || !allLessons.length) return 600;
    // Estimate last Y position
    let lastY = 280;
    for (const unit of units) {
      const lessonsInUnit = allLessons.filter(l => l.unitId === unit.id);
      if (lessonsInUnit.length === 0) continue;
      lastY += 120; // unit header
      lastY += lessonsInUnit.length * 144; // lessons + gaps
      lastY += 64; // inter‑unit space
    }
    return Math.max(600, lastY + 200);
  }, [units, allLessons]);

  if (!rewards) return null;

  const level = hayqToLevel(rewards.totalHAYQ);
  const bgSeeds = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    duration: Math.random() * 20 + 20,
  }));

  const startLesson = (l: MultiLesson) => {
    router.push(`/learn?lesson=${l.id}&pair=${pair}`);
  };

  const handleClaimQuest = (questId: string) => {
    const reward = claimReward(questId);
    if (reward) {
      addRewards(reward.hayq, reward.seeds || 0);
      setQuests(loadQuests());
      // Also refresh rewards to update UI
      setRewards(prev => prev ? {
        ...prev,
        totalHAYQ: prev.totalHAYQ + reward.hayq,
        totalSeeds: prev.totalSeeds + (reward.seeds || 0),
      } : null);
    }
  };

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-[#1a0a0a]">
      {/* Pomegranate Texture Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D90012 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      
      {/* Floating Seeds */}
      {bgSeeds.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full opacity-20 blur-sm"
          style={{ 
            left: `${s.x}%`, top: `${s.y}%`, 
            width: s.size, height: s.size, 
            background: "radial-gradient(circle, #ff4d4d, #800000)" 
          }}
          animate={{ 
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: s.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D90012] to-[#FFA500] flex items-center justify-center font-black text-xl shadow-lg border border-white/20">Ն</div>
            <span className="font-black tracking-tighter text-xl uppercase italic bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">NUR Lingo</span>
          </div>
          <div className="flex items-center gap-3">
              {/* Level Info */}
              <div className="hidden md:flex flex-col items-end mr-2">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Rank</p>
                <p className="text-sm font-black" style={{ color: level.color }}>{level.title[native] ?? level.titleArmenian}</p>
                <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-current transition-all" style={{ width: `${(rewards.totalHAYQ/level.nextLevelHAYQ)*100}%`, backgroundColor: level.color }} />
                </div>
              </div>

              <div className="flex items-center gap-2 font-bold text-[#FFA500] bg-white/5 px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                <span className="text-xl">🪙</span> {rewards.totalHAYQ}
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-xl">🍎</span> {rewards.totalSeeds}
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1">
                <span className="text-xl">🔥</span> {rewards.streak} {rewards.streakFreeze > 0 && "🛡️"}
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1">
                <span className="text-xl">❤️</span> {rewards.hearts}
              </div>
              
              {/* Daily Goal Indicator */}
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-lg flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="text-xl">🎯</span>
                  <span className="font-bold text-white">{rewards.dailyActivity[new Date().toISOString().split("T")[0]] || 0} / {rewards.dailyGoal}</span>
                </div>
              </div>
          </div>
        </nav>

        {/* Daily Quests Panel */}
        <div className="max-w-4xl mx-auto px-8 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#FFA500] mb-3">Daily Quests</h3>
            <div className="space-y-3">
              {quests.map((q) => (
                <div key={q.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span>{q.description[native]}</span>
                      <span>{q.progress}/{q.target}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#FFA500] rounded-full transition-all duration-300" style={{ width: `${(q.progress / q.target) * 100}%` }} />
                    </div>
                  </div>
                  {q.completed && !q.claimed ? (
                    <button
                      onClick={() => handleClaimQuest(q.id)}
                      className="px-3 py-1 text-xs font-bold bg-white text-black rounded-full hover:scale-105 transition-transform"
                    >
                      Claim
                    </button>
                  ) : q.claimed ? (
                    <span className="px-3 py-1 text-xs font-bold text-white/40">✓</span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold text-white/40">⚡</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 pt-16 pb-8 max-w-4xl mx-auto text-center relative flex flex-col items-center">
          <div className="mb-8 flex flex-col items-center gap-4">
            <Nuri 
              mood={goalAchieved ? "excited" : rewards.streak >= 7 ? "excited" : rewards.streak >= 3 ? "happy" : rewards.streak === 0 ? "sad" : "idle"} 
              glow={goalAchieved || rewards.streak >= 7}
              tear={rewards.streak === 0}
              size={120}
            />
            {goalAchieved && (
              <NuriSpeech 
                text="Նպատակին հասանք! Հիանալի է! 🏆" 
                mood="excited" 
              />
            )}
            {!goalAchieved && rewards.streak >= 3 && (
              <NuriSpeech 
                text={`Շնորհավոր! ${rewards.streak} օր անընդմեջ! 🔥`} 
                mood={rewards.streak >= 7 ? "excited" : "happy"} 
              />
            )}
            {rewards.streak === 0 && (
              <NuriSpeech 
                text="Ես տխուր եմ... Արի սովորենք միասին: 🍎" 
                mood="sad" 
              />
            )}
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none mb-4 tracking-tighter italic">
            Seed <span className="text-[#D90012] drop-shadow-[0_0_15px_rgba(217,0,18,0.5)]">World</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-sm mb-8">Organic learning path — Armenian Soul</p>
        </div>

        <div className="max-w-4xl mx-auto px-8 pb-32 relative flex-1">
          <div className="flex flex-col items-center gap-20 mt-20 relative">
            
            {/* Dynamic snake path */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible"
              viewBox={`0 0 800 ${viewBoxHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D90012" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#FFA500" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <motion.path
                d={pathD}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </svg>

            {units.map((unit, uIdx) => {
              const lessons = allLessons.filter(l => l.unitId === unit.id);
              const completedCount = lessons.filter(l => (rewards.crowns[l.id] || 0) > 0).length;
              const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;
              
              return (
                <div key={unit.id} className="w-full space-y-16">
                  <div className="flex flex-col items-center relative gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 backdrop-blur-md shadow-2xl relative z-10">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-[#FFA500] tracking-tight">{unit.title[native]}</h2>
                        {progressPercent === 100 && (
                          <motion.span 
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
                          >
                            🌟
                          </motion.span>
                        )}
                      </div>
                      <p className="text-[10px] text-center text-white/40 font-bold uppercase mt-1">{unit.description[native]}</p>
                    </motion.div>

                    {progressPercent === 100 && <Confetti color={unit.colorFrom} />}

                    {/* Unit Progress Bar */}
                    <div className="w-48 space-y-2 relative z-10">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span>Առաջընթաց</span>
                        <span>{completedCount} / {lessons.length}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/10">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ background: unit.colorFrom }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, delay: uIdx * 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative flex flex-col items-center gap-12">
                    {lessons.map((l, i) => {
                      const xOffset = (i % 2 === 0 ? 60 : -60) * (Math.sin(i + uIdx + 1));
                      const crownLevel = rewards.crowns[l.id] || 0;
                      return (
                        <motion.button
                          key={l.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startLesson(l)}
                          className="relative group z-20"
                          style={{ x: xOffset }}
                        >
                          <div className="absolute -top-4 -right-4 flex flex-col gap-1 z-30">
                            {[1, 2, 3].map(crownLvl => (
                              <motion.div
                                key={crownLvl}
                                initial={{ scale: 0 }}
                                animate={{ scale: crownLevel >= crownLvl ? 1 : 0 }}
                                className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] shadow-lg border border-yellow-600"
                              >
                                ⭐
                              </motion.div>
                            ))}
                          </div>

                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 blur-2xl rounded-full -z-10"
                            style={{ background: `linear-gradient(135deg, ${unit.colorFrom}, ${unit.colorTo})` }}
                          />

                          <div className={`w-24 h-24 rounded-[35%_65%_70%_30%/30%_30%_70%_70%] flex items-center justify-center text-4xl shadow-2xl transition-all border-4 relative overflow-hidden
                            ${crownLevel > 0 ? 'border-yellow-400' : 'border-white/20'}`}
                            style={{ background: `linear-gradient(135deg, ${unit.colorFrom}, ${unit.colorTo})` }}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                            <span className="relative z-10 drop-shadow-lg">{unit.iconEmoji}</span>
                          </div>
                          
                          <div className="absolute top-1/2 left-full ml-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-30">
                            <div className="bg-black/90 border border-white/20 backdrop-blur-xl p-5 rounded-3xl whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-8 rounded-full" style={{ background: unit.colorFrom }} />
                                <div>
                                  <p className="font-black text-lg leading-none">{l.title[native]}</p>
                                  <p className="text-[10px] text-white/40 font-bold uppercase mt-1">{l.description[native]}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />

      <AnimatePresence>
        {milestone && (
          <StreakMilestoneModal 
            milestone={milestone} 
            onClose={() => setMilestone(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StreakMilestoneModal({ milestone, onClose }: { milestone: number; onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg">
      <motion.div 
        initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, y: 100 }}
        className="bg-white/10 border border-white/20 rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
        
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-yellow-500/10 to-transparent animate-pulse" />
        
        <Nuri mood="excited" glow size={180} className="mx-auto mb-6" />
        
        <h2 className="text-4xl font-black text-white mb-2 leading-tight">{milestone} Օր!</h2>
        <p className="text-white/50 font-bold uppercase tracking-widest text-xs mb-8">Streak Milestone</p>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl">🍎</span>
            <div>
              <p className="text-xs font-black text-red-400 uppercase tracking-widest">Reward</p>
              <p className="font-bold text-white">Նոր Սերմ</p>
            </div>
          </div>
          <div className="text-2xl font-black text-red-400">+1</div>
        </div>

        <button onClick={onClose}
          className="w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all active:scale-95 bg-white text-black shadow-lg">
          Հիանալի է!
        </button>
      </motion.div>
    </motion.div>
  );
}