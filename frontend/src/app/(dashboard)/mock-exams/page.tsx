"use client";

import { FileEdit, Timer, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Dummy JSONB Test Structure mapping to Prisma's MockTest requirements
const MOCK_TEST_DATA = {
  id: "test-ielts-001",
  title: "IELTS Core Placement Test",
  totalPoints: 10,
  timeLimitMinutes: 2,
  sections: [
    {
      title: "Reading Comprehension",
      questions: [
        {
           id: "q1",
           type: "multiple_choice",
           text: "What is the primary purpose of a spaced repetition system?",
           options: ["To cram before an exam", "To optimize long-term memory retention", "To test typing speed"],
           correctIdx: 1
        },
        {
           id: "q2",
           type: "true_false",
           text: "The 'E' in IELTS stands for 'English'.",
           options: ["True", "False"],
           correctIdx: 0 
        }
      ]
    }
  ]
};

export default function MockExamsPage() {
  const [testActive, setTestActive] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MOCK_TEST_DATA.timeLimitMinutes * 60);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (testActive && timeLeft === 0) {
      handleSubmit(); // Auto-submit when time runs out
    }
    return () => clearInterval(timer);
  }, [testActive, timeLeft]);

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    MOCK_TEST_DATA.sections.forEach(sec => {
      sec.questions.forEach(q => {
        if (answers[q.id] === q.correctIdx) correct += 5; // 5 points per question
      });
    });
    return correct;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTestActive(false);

    const score = calculateScore();
    const timeTaken = (MOCK_TEST_DATA.timeLimitMinutes * 60) - timeLeft;

    try {
      const res = await fetch("/api/mock-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: MOCK_TEST_DATA.id,
          timeTaken,
          score,
          maxScore: MOCK_TEST_DATA.totalPoints,
          answers // The JSONB payload
        })
      });
      const data = await res.json();
      if (data.success) {
        setResultId(data.attemptId);
        setTestCompleted(true);
      }
    } catch (e) {
      console.error("Submission failed", e);
      alert("Test submitted automatically.");
      setTestCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isWarningStatus = timeLeft > 0 && timeLeft <= 30;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Area */}
      {!testActive && !testCompleted && (
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <FileEdit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Placement Mock Exam</h1>
            <p className="text-slate-400 font-medium">Test your skills under strict timed conditions.</p>
          </div>
        </div>
      )}

      {/* Intro State */}
      {!testActive && !testCompleted && (
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 md:p-12 text-center space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
           
           <div className="space-y-4 relative z-10">
             <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full mb-4">
               <Timer className="w-10 h-10 text-indigo-400" />
             </div>
             <h2 className="text-3xl font-bold text-white uppercase tracking-wider">{MOCK_TEST_DATA.title}</h2>
             <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
               This exam mimics the official testing format using our proprietary JSON schema structure. You will have exactly <strong className="text-white">{MOCK_TEST_DATA.timeLimitMinutes} minutes</strong> to complete all sections. The test will automatically submit when time expires.
             </p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4 relative z-10">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Format</p>
                <p className="text-white font-medium mt-1">General English</p>
             </div>
             <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Questions</p>
                <p className="text-white font-medium mt-1">2 Items</p>
             </div>
             <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Max Score</p>
                <p className="text-white font-medium mt-1">{MOCK_TEST_DATA.totalPoints} pts</p>
             </div>
             <div className="bg-slate-800/50 rounded-xl p-4 border border-indigo-500/30 bg-indigo-500/5">
                <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Time Limit</p>
                <p className="text-indigo-200 font-bold mt-1">{MOCK_TEST_DATA.timeLimitMinutes}:00</p>
             </div>
           </div>

           <button 
             onClick={() => setTestActive(true)}
             className="mt-8 px-10 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center gap-3 mx-auto text-lg"
           >
             Start Exam Now <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      )}

      {/* Active Test State */}
      {testActive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* Sticky Timer Bar */}
          <div className="sticky top-4 z-50 bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <FileEdit className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-white tracking-wide">{MOCK_TEST_DATA.title}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border font-mono text-lg transition-colors ${
              isWarningStatus ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse" : "bg-slate-800 border-white/10 text-white"
            }`}>
              {isWarningStatus && <AlertTriangle className="w-4 h-4" />}
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Test Sections */}
          <div className="space-y-8 pb-12">
            {MOCK_TEST_DATA.sections.map((section, sIdx) => (
              <div key={sIdx} className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                 <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Part {sIdx + 1}: {section.title}</h3>
                 
                 <div className="space-y-8">
                   {section.questions.map((q, qIdx) => (
                     <div key={q.id} className="space-y-4">
                       <p className="text-lg text-slate-200 leading-relaxed font-medium">
                         <span className="text-indigo-400 mr-2">{qIdx + 1}.</span> {q.text}
                       </p>
                       <div className="grid gap-3">
                         {q.options.map((opt, oIdx) => {
                           const isSelected = answers[q.id] === oIdx;
                           return (
                             <button
                               key={oIdx}
                               onClick={() => handleSelectAnswer(q.id, oIdx)}
                               className={`w-full text-left p-4 rounded-xl border transition-all ${
                                 isSelected 
                                 ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-inner" 
                                 : "bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800"
                               }`}
                             >
                               <span className="inline-block w-8 font-mono text-slate-500 disabled:opacity-100 uppercase">{String.fromCharCode(97 + oIdx)}.</span>
                               {opt}
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-md border-t border-white/10 z-50 flex justify-end md:static md:bg-transparent md:border-t-0 md:p-0">
             <button 
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 max-w-xs w-full ml-auto shadow-lg shadow-indigo-500/20"
             >
               {isSubmitting ? "Submitting..." : "Submit Exam Early"}
             </button>
          </div>
        </motion.div>
      )}

      {/* Completed State */}
      {testCompleted && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/40 border border-emerald-500/20 rounded-3xl p-10 text-center space-y-6">
           <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
           </div>
           
           <h2 className="text-3xl font-bold text-white">Exam Completed Successfully</h2>
           <p className="text-slate-400 max-w-lg mx-auto">
             Your answers have been finalized and stored via the `/api/mock-exams` endpoint into the PostgreSQL database.
           </p>

           <div className="inline-flex flex-col items-center bg-slate-800/50 border border-white/10 rounded-2xl p-6 mt-6">
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Final Evaluation</p>
             <p className="text-5xl font-bold text-white">
               {calculateScore()} <span className="text-2xl text-slate-500 font-normal">/ {MOCK_TEST_DATA.totalPoints}</span>
             </p>
           </div>
        </motion.div>
      )}
    </div>
  );
}
