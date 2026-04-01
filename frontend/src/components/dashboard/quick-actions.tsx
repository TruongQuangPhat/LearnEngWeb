"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, RotateCcw, FileEdit, Headphones, Mic, Languages } from "lucide-react";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.5 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 20 },
  },
};

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  shadowColor: string;
  stat: string;
  accentColor: string;
}

const actions: QuickAction[] = [
  {
    id: "learn-words",
    label: "Learn New Words",
    description: "Expand your vocabulary",
    icon: BookOpen,
    href: "/vocabulary",
    gradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/25",
    stat: "New deck available",
    accentColor: "group-hover:border-emerald-500/30",
  },
  {
    id: "review-srs",
    label: "Review Flashcards (SRS)",
    description: "Spaced repetition flashcards",
    icon: RotateCcw,
    href: "/vocabulary",
    gradient: "from-amber-500 to-orange-600",
    shadowColor: "shadow-amber-500/25",
    stat: "24 cards due",
    accentColor: "group-hover:border-amber-500/30",
  },
  {
    id: "mock-test",
    label: "Take Mock Test",
    description: "IELTS, TOEIC & VSTEP",
    icon: FileEdit,
    href: "/mock-exams",
    gradient: "from-indigo-500 to-blue-600",
    shadowColor: "shadow-indigo-500/25",
    stat: "3 tests ready",
    accentColor: "group-hover:border-indigo-500/30",
  },
  {
    id: "grammar",
    label: "Grammar Tutor",
    description: "AI-powered lessons",
    icon: Languages,
    href: "/grammar",
    gradient: "from-rose-500 to-pink-600",
    shadowColor: "shadow-rose-500/25",
    stat: "Continue lesson",
    accentColor: "group-hover:border-rose-500/30",
  },
  {
    id: "listening",
    label: "Listening",
    description: "Audio practice",
    icon: Headphones,
    href: "/listening",
    gradient: "from-sky-500 to-cyan-600",
    shadowColor: "shadow-sky-500/25",
    stat: "12 min session",
    accentColor: "group-hover:border-sky-500/30",
  },
  {
    id: "speaking",
    label: "Speaking",
    description: "AI conversation partner",
    icon: Mic,
    href: "/speaking",
    gradient: "from-fuchsia-500 to-purple-600",
    shadowColor: "shadow-fuchsia-500/25",
    stat: "New!",
    accentColor: "group-hover:border-fuchsia-500/30",
  },
];

export function QuickActions() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jump into a skill module
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
      >
        {actions.map((action) => (
          <motion.div key={action.id} variants={item}>
            <Link href={action.href} className="block">
              <motion.div
                whileHover={{ y: -6, transition: { type: "spring" as const, stiffness: 400, damping: 17 } }}
                whileTap={{ scale: 0.98 }}
                className={`group relative p-5 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] ${action.accentColor} transition-colors duration-300 overflow-hidden h-full`}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg ${action.shadowColor} group-hover:shadow-xl transition-shadow duration-300`}
                    >
                      <action.icon className="w-5.5 h-5.5 text-white" />
                    </motion.div>
                    <span className="text-[10px] text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06] font-medium">
                      {action.stat}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-white/95 tracking-tight">
                    {action.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {action.description}
                  </p>

                  <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500 group-hover:text-slate-300 transition-colors duration-300">
                    <span className="font-medium">Start</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
