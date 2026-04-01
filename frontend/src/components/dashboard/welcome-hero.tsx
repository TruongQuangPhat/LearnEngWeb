"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/store/use-user-store";
import { Flame, Trophy, Target, Sparkles } from "lucide-react";

export function WelcomeHero() {
  const { name, streak, exp, level } = useUserStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-slate-900 border border-violet-500/20 p-6 md:p-8"
    >
      {/* Animated background orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-0 left-1/3 w-56 h-56 bg-indigo-500 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.06, 0.1, 0.06],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-[80px]"
      />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-3 mb-3"
        >
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{
              duration: 2,
              delay: 0.6,
              ease: "easeInOut",
            }}
          >
            👋
          </motion.span>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
              {name}
            </span>
            !
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-slate-400 max-w-lg text-sm md:text-base"
        >
          Ready to level up your English today? Pick up where you left off or
          start something new.
        </motion.p>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="flex flex-wrap items-center gap-3 mt-5"
        >
          <StatPill
            icon={<Flame className="w-4 h-4 text-orange-400" />}
            label={`${streak} day streak`}
            gradient="from-orange-500/15 to-red-500/15"
            border="border-orange-500/25"
            textColor="text-orange-300"
            glowPulse={streak > 0}
          />
          <StatPill
            icon={<Trophy className="w-4 h-4 text-violet-400" />}
            label={`Level ${level}`}
            gradient="from-violet-500/15 to-indigo-500/15"
            border="border-violet-500/25"
            textColor="text-violet-300"
          />
          <StatPill
            icon={<Target className="w-4 h-4 text-emerald-400" />}
            label={`${exp} EXP`}
            gradient="from-emerald-500/15 to-teal-500/15"
            border="border-emerald-500/25"
            textColor="text-emerald-300"
          />
        </motion.div>
      </div>

      {/* Decorative floating sparkles */}
      <motion.div
        animate={{ y: [-4, 4, -4], rotate: [0, 180, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute top-6 right-8 hidden md:block"
      >
        <Sparkles className="w-5 h-5 text-violet-400/30" />
      </motion.div>
      <motion.div
        animate={{ y: [3, -3, 3], rotate: [360, 180, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-8 right-24 hidden md:block"
      >
        <Sparkles className="w-4 h-4 text-indigo-400/20" />
      </motion.div>
    </motion.div>
  );
}

function StatPill({
  icon,
  label,
  gradient,
  border,
  textColor,
  glowPulse = false,
}: {
  icon: React.ReactNode;
  label: string;
  gradient: string;
  border: string;
  textColor: string;
  glowPulse?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradient} border ${border} cursor-default`}
    >
      {glowPulse && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-lg bg-orange-500/5"
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className={`relative z-10 text-sm font-semibold ${textColor}`}>
        {label}
      </span>
    </motion.div>
  );
}
