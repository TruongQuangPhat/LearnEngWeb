"use client";

import { motion } from "framer-motion";
import { MapPin, CheckCircle2, Lock, ChevronRight } from "lucide-react";

type NodeStatus = "completed" | "current" | "locked";

interface RoadmapNode {
  id: string;
  title: string;
  subtitle: string;
  status: NodeStatus;
  exp: number;
}

// Placeholder roadmap data — will be powered by learning_roadmaps + roadmap_nodes
const roadmapNodes: RoadmapNode[] = [
  { id: "1", title: "Basic Grammar", subtitle: "Tenses & Pronouns", status: "completed", exp: 50 },
  { id: "2", title: "Core Vocabulary", subtitle: "500 Essential Words", status: "completed", exp: 100 },
  { id: "3", title: "Listening Basics", subtitle: "Short Dialogues", status: "current", exp: 75 },
  { id: "4", title: "Reading Skills", subtitle: "Passage Analysis", status: "locked", exp: 120 },
  { id: "5", title: "Writing Practice", subtitle: "Essay Structure", status: "locked", exp: 150 },
  { id: "6", title: "Mock Test 1", subtitle: "Full IELTS Simulation", status: "locked", exp: 200 },
];

const statusStyles: Record<NodeStatus, { dot: string; line: string; bg: string; border: string; text: string }> = {
  completed: {
    dot: "bg-emerald-500 shadow-emerald-500/40",
    line: "bg-emerald-500/40",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
  current: {
    dot: "bg-violet-500 shadow-violet-500/50",
    line: "bg-slate-700",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-400",
  },
  locked: {
    dot: "bg-slate-700",
    line: "bg-slate-800",
    bg: "bg-white/[0.02]",
    border: "border-white/[0.04]",
    text: "text-slate-600",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.8 },
  },
};

const nodeItem = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function LearningPath() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="relative rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5 md:p-6 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-400" />
              Learning Path
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              IELTS 7.0 Preparation — 2 of 6 completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Progress</p>
            <p className="text-sm font-bold text-violet-400">33%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "33%" }}
            transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
          />
        </div>

        {/* Roadmap nodes */}
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-0">
          {roadmapNodes.map((node, i) => {
            const styles = statusStyles[node.status];
            const isLast = i === roadmapNodes.length - 1;

            return (
              <motion.div key={node.id} variants={nodeItem} className="relative flex items-stretch gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center pt-1">
                  {/* Dot */}
                  <motion.div
                    className={`w-3.5 h-3.5 rounded-full ${styles.dot} shadow-lg flex-shrink-0 z-10 flex items-center justify-center`}
                    animate={
                      node.status === "current"
                        ? { scale: [1, 1.3, 1], boxShadow: ["0 0 0 0 rgba(139,92,246,0.4)", "0 0 0 8px rgba(139,92,246,0)", "0 0 0 0 rgba(139,92,246,0.4)"] }
                        : {}
                    }
                    transition={
                      node.status === "current"
                        ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        : {}
                    }
                  >
                    {node.status === "completed" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900" />
                    )}
                  </motion.div>
                  {/* Connecting line */}
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-[24px] ${styles.line}`} />
                  )}
                </div>

                {/* Node card */}
                <motion.div
                  whileHover={
                    node.status !== "locked"
                      ? { x: 4, transition: { duration: 0.15 } }
                      : {}
                  }
                  className={`flex-1 flex items-center justify-between px-4 py-3 mb-2 rounded-lg ${styles.bg} border ${styles.border} transition-colors duration-200 ${
                    node.status !== "locked" ? "cursor-pointer group" : "opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {node.status === "locked" && (
                      <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${node.status === "locked" ? "text-slate-500" : "text-white"} truncate`}>
                        {node.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{node.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`text-[10px] font-semibold ${styles.text}`}>
                      +{node.exp} EXP
                    </span>
                    {node.status !== "locked" && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
