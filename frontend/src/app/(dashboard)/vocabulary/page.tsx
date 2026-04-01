import { BookOpen, BrainCircuit } from "lucide-react";
import { DeckOverview, FlashcardStudy } from "@/components/vocabulary";

export default function VocabularyPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vocabulary</h1>
          <p className="text-slate-400 font-medium mt-0.5">SRS Flashcards & Review</p>
        </div>
      </div>

      {/* Topics / Decks */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Decks</h2>
        <DeckOverview />
      </div>

      {/* Active Study Session */}
      <div className="mt-12 relative overflow-hidden rounded-3xl bg-slate-900/40 border border-white/5 p-6 md:p-10 flex flex-col items-center">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-2xl text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
             <BrainCircuit className="w-4 h-4 text-emerald-400" />
             <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Session</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Essential IELTS Words</h2>
          <p className="text-slate-400 mt-2">12 new words · 24 to review</p>
        </div>
        
        <div className="relative z-10 w-full flex justify-center">
          <FlashcardStudy />
        </div>
      </div>
    </div>
  );
}
