"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Սկիզբ", icon: "🏠" },
    { href: "/world", label: "Աշխարհ", icon: "🌍" },
    { href: "/dictionary", label: "Բառարան", icon: "📖" },
    { href: "/curriculum", label: "Դասացուցակ", icon: "📚" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 py-3">
      <div className="max-w-md mx-auto flex justify-around items-center px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative group">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`text-2xl transition-transform ${
                    isActive ? "scale-125" : "group-hover:scale-110 opacity-50"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    isActive ? "text-white" : "text-white/40"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#D90012]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}