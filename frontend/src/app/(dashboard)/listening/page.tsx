"use client";

import { Headphones, Play, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Mock Data
const DICTATION_EXERCISES = [
  {
    id: 1,
    audioUrl: "https://actions.google.com/sounds/v1/water/rain_on_roof_and_windows.ogg", // Mock audio
    text: "The quick brown fox jumps over the lazy dog.",
    difficulty: "Beginner"
  },
  {
    id: 2,
    audioUrl: "https://actions.google.com/sounds/v1/water/rain_on_roof_and_windows.ogg",
    text: "Despite the heavy rain, they decided to proceed with the outdoor concert.",
    difficulty: "Intermediate"
  }
];

// Helper: Word-level diffing algorithm
function calculateDiff(expected: string, actual: string) {
  const normalize = (str: string) => str.toLowerCase().replace(/[.,!?;:]/g, "");
  const expectedWords = normalize(expected).split(" ").filter(Boolean);
  const actualWords = normalize(actual).split(" ").filter(Boolean);

  let correctCount = 0;
  const resultData = expectedWords.map((expectedWord, index) => {
    const actualWord = actualWords[index] || "";
    const isCorrect = expectedWord === actualWord;
    if (isCorrect) correctCount++;
    return {
      expected: expectedWord,
      actual: actualWord,
      isCorrect,
      isMissing: !actualWord
    };
  });
  
  // Calculate raw accuracy
  const accuracy = expectedWords.length > 0 
    ? Math.round((correctCount / expectedWords.length) * 100) 
    : 0;

  return { resultData, accuracy };
}

export default function ListeningPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const exercise = DICTATION_EXERCISES[currentIdx];

  const handlePlayAudio = () => {
    // We use a dummy audio URL to represent TTS for the demo
    const audio = new Audio(exercise.audioUrl);
    setIsPlaying(true);
    audio.play()
      .catch(() => alert("Mock playback started. (Simulated audio)"))
      .finally(() => setTimeout(() => setIsPlaying(false), 2000));
  };

  const { resultData, accuracy } = useMemo(() => {
    if (!isSubmitted) return { resultData: [], accuracy: 0 };
    return calculateDiff(exercise.text, userInput);
  }, [isSubmitted, userInput, exercise.text]);

  const nextExercise = () => {
    setUserInput("");
    setIsSubmitted(false);
    setCurrentIdx((prev) => (prev + 1) % DICTATION_EXERCISES.length);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
          <Headphones className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dictation Practice</h1>
          <p className="text-slate-400 font-medium mt-0.5">Listen and type exactly what you hear</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-white/5 p-8 md:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8">
          
          {/* Audio Player Side */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-800/50 border border-white/5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
               <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">{exercise.difficulty}</span>
            </div>
            
            <button 
              onClick={handlePlayAudio}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl shadow-sky-500/25 ${isPlaying ? 'bg-sky-600 scale-95' : 'bg-sky-500 hover:bg-sky-400 hover:scale-105'}`}
            >
              <Play className="w-10 h-10 text-white ml-2" />
            </button>
            <p className="text-slate-400 text-sm font-medium text-center">
              {isPlaying ? "Playing..." : "Click to Play Audio"}
            </p>
          </div>

          {/* Typing / Feedback Side */}
          <div className="w-full md:w-2/3 flex flex-col space-y-4">
            {!isSubmitted ? (
               <>
                 <label className="text-sm font-medium text-slate-300">Your Transcription:</label>
                 <textarea 
                   value={userInput}
                   onChange={(e) => setUserInput(e.target.value)}
                   placeholder="Type what you hear..."
                   className="w-full h-48 bg-slate-950/50 border border-white/10 rounded-xl p-5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none font-medium text-lg leading-relaxed"
                 />
                 <button 
                   onClick={() => setIsSubmitted(true)}
                   disabled={!userInput.trim()}
                   className="px-8 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-sky-500/20"
                 >
                   Submit & Verify
                 </button>
               </>
            ) : (
               <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                 
                 <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-white/5">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accuracy Score</p>
                      <p className="text-3xl font-bold text-white mt-1">{accuracy}%</p>
                    </div>
                    {accuracy === 100 ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    ) : (
                      <XCircle className="w-10 h-10 text-rose-500" />
                    )}
                 </div>

                 <div className="space-y-3">
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Analysis (Word by Word)</p>
                   <div className="flex flex-wrap gap-2 p-5 bg-slate-950/50 rounded-xl border border-white/5 text-lg leading-relaxed">
                     {resultData.map((wordData, i) => (
                       <span 
                         key={i} 
                         className={`px-1.5 py-0.5 rounded-md font-medium ${
                           wordData.isCorrect 
                             ? "text-emerald-400 bg-emerald-500/10" 
                             : "text-rose-400 bg-rose-500/10 underline decoration-rose-500/50 decoration-2 underline-offset-4"
                         }`}
                         title={!wordData.isCorrect ? `Expected: "${wordData.expected}"` : ""}
                       >
                         {wordData.actual || "___"}
                       </span>
                     ))}
                   </div>
                   {accuracy < 100 && (
                     <p className="text-xs text-slate-500 italic mt-2">
                       Hover over red words to see the expected correct word.
                     </p>
                   )}
                 </div>

                 <div className="flex gap-4 pt-4">
                   <button 
                     onClick={() => setIsSubmitted(false)}
                     className="flex-1 px-6 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                   >
                     <RotateCcw className="w-4 h-4" /> Try Again
                   </button>
                   <button 
                     onClick={nextExercise}
                     className="flex-1 px-6 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20"
                   >
                     Next Exercise
                   </button>
                 </div>
               </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
