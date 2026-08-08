"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface NuriProps {
  mood?: NuriMood;
  size?: number;
  animate?: boolean;
  className?: string;
  glow?: boolean;
  tear?: boolean;
}

export type NuriMood = "happy" | "thinking" | "celebrating" | "sad" | "idle" | "encouraging" | "excited" | "surprised";

export default function Nuri({
  mood = "idle",
  size = 120,
  animate = true,
  className = "",
  glow = false,
  tear = false,
}: NuriProps) {
  const getPngPath = (m: NuriMood) => {
    switch (m) {
      case "happy":
      case "celebrating":
      case "excited":
        return "/images/nuri/nuri-happy.png";
      case "encouraging":
      case "thinking":
      case "idle":
        return "/images/nuri/nuri-encouraging.png";
      case "surprised":
      case "sad":
        return "/images/nuri/nuri-sad.png";
      default:
        return "/images/nuri/nuri-happy.png";
    }
  };

  const getAnimation = () => {
    if (!animate) return {};
    switch (mood) {
      case "happy":
        return { y: [0, -15, 0], rotate: [0, 5, -5, 0] };
      case "excited":
        return { scale: [1, 1.2, 1], y: [0, -20, 0, -20, 0], rotate: [0, 10, -10, 10, -10, 0] };
      case "sad":
        return { x: [0, -2, 2, -2, 2, 0], y: [0, 2, 0], opacity: [1, 0.8, 1] };
      case "encouraging":
        return { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] };
      case "thinking":
        return { rotate: [0, -5, 5, 0], x: [0, 2, -2, 0] };
      case "celebrating":
        return { scale: [1, 1.2, 1], rotate: [0, 360] };
      default:
        return { y: [0, -5, 0] };
    }
  };

  const getTransition = () => {
    switch (mood) {
      case "excited":
        return { duration: 0.5, repeat: Infinity, ease: "easeInOut" };
      case "happy":
        return { duration: 0.6, repeat: Infinity, ease: "easeInOut" };
      case "celebrating":
        return { duration: 1, repeat: Infinity, ease: "linear" };
      case "sad":
        return { duration: 2, repeat: Infinity };
      default:
        return { duration: 3, repeat: Infinity, ease: "easeInOut" };
    }
  };

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      animate={getAnimation()}
      transition={getTransition()}
      style={{ width: size, height: size }}
    >
      {glow && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-yellow-400/40 blur-2xl rounded-full -z-10"
        />
      )}

      {(mood === "celebrating" || mood === "excited") && (
        <>
          <motion.div
            className="absolute text-base"
            style={{ top: -12, right: -4 }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute text-sm"
            style={{ top: 4, left: -10 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute text-xs"
            style={{ bottom: 8, right: -8 }}
            animate={{ x: [-2, 2, -2], y: [-2, 2, -2] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            💫
          </motion.div>
        </>
      )}

      {mood === "excited" && (
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl"
          animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🔥
        </motion.div>
      )}

      {mood === "thinking" && (
        <motion.div
          className="absolute text-base"
          style={{ top: -10, right: -2 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💭
        </motion.div>
      )}

      <Image
        src={getPngPath(mood)}
        alt={`Nuri mascot - ${mood}`}
        width={size}
        height={size}
        priority={mood === "happy" || mood === "idle"}
      />

      {tear && mood === "sad" && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 20, opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-1/2 left-[60%] text-xl pointer-events-none"
        >
          💧
        </motion.div>
      )}
    </motion.div>
  );
}

export function getMoodFromScore(score: number, accepted: boolean, streak: number = 0): NuriMood {
  if (!accepted) return "sad";
  if (streak >= 5) return "excited";
  if (streak >= 3) return "happy";
  return "encouraging";
}

// Speech bubble (fixed positioning)
export function NuriSpeech({ text, mood = "idle" }: { text: string; mood?: NuriMood }) {
  const colors: Record<NuriMood, string> = {
    celebrating: "border-yellow-400/50 bg-yellow-950/40",
    happy: "border-emerald-400/50 bg-emerald-950/40",
    sad: "border-red-400/50 bg-red-950/40",
    encouraging: "border-orange-400/50 bg-orange-950/40",
    thinking: "border-blue-400/50 bg-blue-950/40",
    idle: "border-white/20 bg-white/5",
    excited: "border-pink-400/50 bg-pink-950/40",
    surprised: "border-purple-400/50 bg-purple-950/40",
  };

  return (
    <div className={`rounded-2xl border px-5 py-3 text-sm text-white/90 relative max-w-[200px] ${colors[mood]}`}>
      <div className="absolute -top-2 left-5 w-3 h-3 rotate-45 border-l border-t bg-inherit border-inherit" />
      {text}
    </div>
  );
}