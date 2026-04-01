"use client";

import { motion } from "framer-motion";
import { Layers, CheckCircle2, PlayCircle } from "lucide-react";

const mockDecks = [
  {
    id: "1",
    title: "Essential IELTS Words",
    description: "Core vocabulary for Band 7.0+",
    progress: 75,
    due: 24,
    total: 500,
    color: "from-emerald-500 to-teal-600",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
  },
  {
    id: "2",
    title: "Daily Communication",
    description: "Phrasal verbs & idioms",
    progress: 30,
    due: 15,
    total: 200,
    color: "from-sky-500 to-blue-600",
    border: "border-sky-500/20",
    bg: "bg-sky-500/10",
  },
  {
    id: "3",
    title: "Academic Reading",
    description: "Complex nouns & transition words",
    progress: 10,
    due: 5,
    total: 350,
    color: "from-violet-500 to-purple-600",
    border: "border-violet-500/20",
    bg: "bg-violet-500/10",
  },
];

export function DeckOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockDecks.map((deck, idx) => (
        <motion.div
          key={deck.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * idx }}
          whileHover={{ y: -4 }}
          className={`relative p-5 rounded-2xl bg-slate-900/60 backdrop-blur border ${deck.border} group`}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />
          
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deck.color} flex items-center justify-center shadow-lg shadow-black/20`}>
              <Layers className="w-5 h-5 text-white" />
            </div>
            
            <div className={`px-2.5 py-1 rounded-full ${deck.bg} border ${deck.border} flex items-center gap-1.5`}>
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{deck.due} Due</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">{deck.title}</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">{deck.description}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Mastered</span>
              <span className="text-white">{deck.progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${deck.progress}%` }}
                 transition={{ duration: 1, delay: 0.4 }}
                 className={`h-full rounded-full bg-gradient-to-r ${deck.color}`}
               />
            </div>
            <p className="text-[10px] text-slate-500 text-right mt-1">{deck.total} total words</p>
          </div>

          <button className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl ${deck.bg} ${deck.border} border text-white hover:bg-white/5 transition-colors text-sm font-semibold group-hover:shadow-md`}>
            <PlayCircle className="w-4 h-4" />
            Study Now
          </button>
        </motion.div>
      ))}
    </div>
  );
}
