"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";

export function SmartRecommendations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 p-6 md:p-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-start gap-5">
           <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
             <Sparkles className="w-7 h-7 text-white" />
           </div>
           <div>
             <div className="flex items-center gap-2 mb-1">
               <h2 className="text-xl font-bold text-white tracking-tight">AI Recommended</h2>
               <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase tracking-widest border border-indigo-500/30">
                 Optimal Path
               </span>
             </div>
             <p className="text-slate-400 text-sm max-w-md leading-relaxed">
               Based on your recent activity, you have <strong>24 pending Spaced Repetition flashcards</strong>. Reviewing them now will strengthen your long-term retention.
             </p>
           </div>
        </div>

        <Link href="/vocabulary">
           <button className="whitespace-nowrap px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500/50 text-white font-semibold rounded-xl transition-all shadow-xl shadow-indigo-500/25 flex items-center gap-2 w-full md:w-auto justify-center">
             <RotateCcw className="w-5 h-5" />
             Start SRS Review <ArrowRight className="w-4 h-4 ml-1" />
           </button>
        </Link>
      </div>
    </motion.div>
  );
}
