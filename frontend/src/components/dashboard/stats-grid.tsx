"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/store/use-user-store";
import { BookOpen, Flame, Zap, Clock, TrendingUp } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

interface StatMeta {
  label: string;
  getValue: (store: ReturnType<typeof useUserStore.getState>) => string;
  icon: React.ElementType;
  change: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}

const statsMeta: StatMeta[] = [
  {
    label: "📚 Total Words Learned",
    getValue: (s) => s.wordsLearned.toLocaleString(),
    icon: BookOpen,
    change: "+0 today",
    color: "text-emerald-400",
    bgColor: "from-emerald-500/8 to-teal-500/8",
    borderColor: "border-emerald-500/15 hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
  },
  {
    label: "🔥 Daily Streak",
    getValue: (s) =>
      `${s.streak} ${s.streak === 1 ? "day" : "days"}`,
    icon: Flame,
    change: "Keep it up!",
    color: "text-orange-400",
    bgColor: "from-orange-500/8 to-red-500/8",
    borderColor: "border-orange-500/15 hover:border-orange-500/30",
    iconBg: "bg-orange-500/10",
  },
  {
    label: "⭐ Total EXP",
    getValue: (s) => s.exp.toLocaleString(),
    icon: Zap,
    change: "Level up!",
    color: "text-violet-400",
    bgColor: "from-violet-500/8 to-indigo-500/8",
    borderColor: "border-violet-500/15 hover:border-violet-500/30",
    iconBg: "bg-violet-500/10",
  },
  {
    label: "Study Time",
    getValue: () => "0h 0m",
    icon: Clock,
    change: "This week",
    color: "text-sky-400",
    bgColor: "from-sky-500/8 to-blue-500/8",
    borderColor: "border-sky-500/15 hover:border-sky-500/30",
    iconBg: "bg-sky-500/10",
  },
];

export function StatsGrid() {
  const store = useUserStore();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
    >
      {statsMeta.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`relative p-4 md:p-5 rounded-xl bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} transition-colors duration-300 group cursor-default`}
        >
          {/* Hover glow */}
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10`}
          />

          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
              <stat.icon className={`w-[18px] h-[18px] ${stat.color}`} />
            </div>
            <TrendingUp className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>

          <motion.p
            className="text-xl md:text-2xl font-bold text-white tracking-tight"
            key={stat.getValue(store)}
          >
            {stat.getValue(store)}
          </motion.p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
          <p className={`text-[10px] ${stat.color} mt-0.5 font-medium`}>
            {stat.change}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
