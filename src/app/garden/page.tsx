"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { loadRewards, buyStreakFreeze, buyHeartRefill, syncHearts, type UserRewards } from "@/lib/rewards/seeds";
import Nuri, { NuriSpeech } from "@/components/Nuri";
import { getNotificationTime, saveNotificationTime, requestNotificationPermission, getNotificationPermissionState } from "@/lib/notifications";

export default function GardenPage() {
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [message, setMessage] = useState("");
  const [notifTime, setNotifTime] = useState("09:00");
  const [notifState, setNotifState] = useState<NotificationPermission>("default");

  useEffect(() => {
    setRewards(syncHearts());
    setNotifTime(getNotificationTime());
    setNotifState(getNotificationPermissionState());
  }, []);

  const handleBuyFreeze = () => {
    const res = buyStreakFreeze();
    if (res.success) {
      setRewards(res.rewards);
      setMessage("Streak Freeze purchased! 🛡️");
    } else {
      setMessage(res.error || "Failed to purchase");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleBuyHearts = () => {
    const res = buyHeartRefill();
    if (res.success) {
      setRewards(res.rewards);
      setMessage("Hearts refilled! ❤️");
    } else {
      setMessage(res.error || "Failed to purchase");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifTime(e.target.value);
    saveNotificationTime(e.target.value);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifState(granted ? "granted" : "denied");
  };

  if (!rewards) return null;

  return (
    <div className="min-h-screen bg-[#0a1a0a] text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🌿</span>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-green-400">
              Garden Shop
            </h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Nuri's Greenhouse</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl flex items-center gap-2 text-sm font-bold">
            <span className="text-yellow-400">🪙</span> {rewards.totalHAYQ}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 pt-12 text-center space-y-12">
        <div className="flex flex-col items-center gap-4">
          <Nuri mood="happy" size={150} />
          <NuriSpeech text="Welcome to my Garden! Spend your HAYQ on helpful items." mood="happy" />
        </div>

        {/* Shop Items */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <span className="text-7xl">🛡️</span>
            </div>
            
            <div className="relative z-10 text-left space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🛡️</span>
                <div>
                  <h3 className="text-2xl font-black">Streak Freeze</h3>
                  <p className="text-white/40 text-sm">Save your streak if you miss a day!</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end pt-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Owned</p>
                  <p className="text-xl font-black">{rewards.streakFreeze} / 2</p>
                </div>
                <button
                  onClick={handleBuyFreeze}
                  disabled={rewards.streakFreeze >= 2 || rewards.totalHAYQ < 50}
                  className="px-8 py-3 rounded-2xl bg-white text-black font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-20 disabled:grayscale">
                  50 🪙
                </button>
              </div>
            </div>
          </div>

          {/* Heart Refill */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <span className="text-7xl">❤️</span>
            </div>
            <div className="relative z-10 text-left space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">❤️</span>
                <div>
                  <h3 className="text-2xl font-black">Heart Refill</h3>
                  <p className="text-white/40 text-sm">Instantly restore all 5 hearts!</p>
                </div>
              </div>
              <div className="flex justify-between items-end pt-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Hearts</p>
                  <div className="flex gap-1 text-xl">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < (rewards.hearts ?? 0) ? "❤️" : "🖤"}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleBuyHearts}
                  disabled={rewards.hearts >= 5 || rewards.totalHAYQ < 100}
                  className="px-8 py-3 rounded-2xl bg-white text-black font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-20 disabled:grayscale">
                  100 🪙
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Setting */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-left space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔔</span>
              <div>
                <h3 className="text-2xl font-black">Daily Reminders</h3>
                <p className="text-white/40 text-sm">Stay consistent with your learning!</p>
              </div>
            </div>

            <div className="space-y-4">
              {notifState !== "granted" ? (
                <button 
                  onClick={handleEnableNotifications}
                  className="w-full py-4 rounded-2xl border-2 border-[#FFA500] text-[#FFA500] font-black uppercase tracking-widest active:scale-95 transition-all">
                  Enable Notifications
                </button>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-white/30">Notification Time</p>
                  <input 
                    type="time" 
                    value={notifTime} 
                    onChange={handleTimeChange}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 font-bold outline-none focus:border-[#FFA500] transition-colors text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {message && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-[#FFA500] font-bold italic">
            {message}
          </motion.p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
