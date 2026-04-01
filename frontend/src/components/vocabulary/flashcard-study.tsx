"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Sparkles, RefreshCcw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export function FlashcardStudy() {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vocabulary/due')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCards(data);
        setLoading(false);
      })
      .catch((e) => {
         console.error(e);
         setLoading(false);
      });
  }, []);

  const handleRate = async (quality: number) => {
    const currentCard = cards[currentIndex];
    setIsFlipped(false);
    
    // Optimistically move to next card
    setCurrentIndex(prev => prev + 1);

    // Send rating to API
    try {
      await fetch('/api/vocabulary/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: currentCard.id,
          quality
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
     return <div className="flex justify-center py-20 w-full"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4 w-full">
        <Sparkles className="w-12 h-12 text-emerald-400" />
        <h3 className="text-xl font-bold text-white">All caught up!</h3>
        <p className="text-slate-400">You&apos;ve finished all your reviews for now.</p>
        <button 
          className="px-6 py-2 mt-4 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  const currentFlashcard = cards[currentIndex]?.vocabularyItem || {};

  // SRS Rating Options
  const ratingButtons = [
    { label: "Again", quality: 1, sublabel: "(Hardest)", color: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20" },
    { label: "Hard", quality: 2, sublabel: "", color: "text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20" },
    { label: "Good", quality: 4, sublabel: "", color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
    { label: "Easy", quality: 5, sublabel: "(Perfect)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full">
      {/* 3D Flippable Flashcard Container */}
      <div 
        className="relative w-full max-w-md aspect-[3/4] [perspective:1000px] cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full relative [transform-style:preserve-3d]"
        >
          {/* FRONT */}
          <div 
            className="absolute inset-0 w-full h-full shadow-2xl rounded-3xl [backface-visibility:hidden] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex flex-col items-center justify-center p-8 text-center"
          >
            {/* Top right flip indicator */}
            <div className="absolute top-4 right-4 text-slate-500">
               <RefreshCcw className="w-4 h-4" />
            </div>

            <p className="text-4xl font-bold text-white mb-4 tracking-tight">
              {currentFlashcard.word || "Loading..."}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentFlashcard.audioUsUrl || currentFlashcard.audioUkUrl) {
                  const audio = new Audio(currentFlashcard.audioUsUrl || currentFlashcard.audioUkUrl);
                  audio.play().catch(e => console.error(e));
                }
              }}
              className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors group"
            >
               <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <p className="absolute bottom-6 text-sm text-slate-500 font-medium">
              Tap card to flip
            </p>
          </div>

          {/* BACK */}
          <div 
            className="absolute inset-0 w-full h-full shadow-2xl rounded-3xl [backface-visibility:hidden] bg-gradient-to-tr from-emerald-950/40 to-slate-900 border border-emerald-500/20 flex flex-col p-6 [transform:rotateY(180deg)]"
          >
            {/* AI Image Placeholder */}
            <div className="w-full h-32 mb-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-white/5 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <div className="text-center flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-400/50" />
                <span className="text-[10px] uppercase font-bold text-emerald-400/50 tracking-widest">AI Generated</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin text-center space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {currentFlashcard.word}
                </h3>
                <p className="text-sm font-mono text-emerald-400 mt-1">{currentFlashcard.phoneticUs || currentFlashcard.phoneticUk}</p>
              </div>

              <div>
                <p className="text-slate-300 font-medium">{currentFlashcard.definition}</p>
                {currentFlashcard.exampleSentence && (
                  <p className="text-slate-500 italic mt-2 text-sm">&quot;{currentFlashcard.exampleSentence}&quot;</p>
                )}
              </div>

              {currentFlashcard.synonyms && currentFlashcard.synonyms.length > 0 && (
                <div className="pt-2 border-t border-white/5 flex gap-2 justify-center flex-wrap">
                   {currentFlashcard.synonyms.map((t: string) => (
                     <span key={t} className="px-3 py-1 bg-white/5 rounded-md text-xs font-medium text-slate-300">
                       {t}
                     </span>
                   ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* SRS Buttons Container */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 10 }}
         animate={{ opacity: isFlipped ? 1 : 0.5, scale: isFlipped ? 1 : 0.95, y: isFlipped ? 0 : 10 }}
         transition={{ duration: 0.3 }}
         className={`grid grid-cols-4 gap-2 md:gap-3 w-full max-w-md ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {ratingButtons.map((btn) => (
          <button 
             key={btn.label}
             className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${btn.color}`}
             onClick={(e) => {
               e.stopPropagation();
               if (isFlipped) {
                 handleRate(btn.quality);
               }
             }}
          >
             <span className="text-xs font-bold uppercase tracking-wider">{btn.label}</span>
             <span className="text-[10px] font-medium opacity-80 leading-tight">
               {btn.sublabel}
             </span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
