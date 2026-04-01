"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Play, AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function SpeakingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const submitAudio = async () => {
    if (!audioBlob) return;
    setIsEvaluating(true);
    setFeedback(null);

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      try {
        const response = await fetch("/api/evaluate-speaking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
             audio_data: base64Audio,
             expected_text: "I am learning English on the LearEng platform."
          })
        });
        
        const data = await response.json();
        setFeedback(data);
      } catch (err) {
        console.error("Evaluation failed", err);
      } finally {
        setIsEvaluating(false);
      }
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Speaking Practice</h1>
          <p className="text-slate-400 font-medium mt-0.5">Let the AI evaluate your pronunciation</p>
        </div>
      </div>

      {/* Main Recording Area */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-white/5 p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg mx-auto text-center space-y-12">
           
           <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 mb-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Read Aloud</span>
             </div>
             <h2 className="text-2xl font-semibold text-white">"I am learning English on the LearEng platform."</h2>
           </div>

           {/* Visualization / Timer */}
           <div className="h-20 flex flex-col items-center justify-center">
             {isRecording ? (
               <div className="space-y-4">
                 <div className="flex items-center gap-1.5 justify-center h-8">
                   {[...Array(12)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: ["20%", "100%", "20%"] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                        className="w-1.5 bg-rose-500 rounded-full"
                      />
                   ))}
                 </div>
                 <p className="text-rose-400 font-mono text-xl">{formatTime(recordingTime)}</p>
               </div>
             ) : audioUrl ? (
                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-full border border-white/10 pr-6">
                  <button onClick={() => new Audio(audioUrl).play()} className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                    <Play className="w-5 h-5 ml-1" />
                  </button>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full w-32 relative">
                     <div className="absolute left-0 top-0 h-full w-1/3 bg-slate-600 rounded-full" />
                  </div>
                  <span className="text-slate-400 font-mono text-sm">{formatTime(recordingTime)}</span>
                </div>
             ) : (
               <p className="text-slate-500 italic">Press the microphone to begin</p>
             )}
           </div>

           {/* Controls */}
           <div className="flex items-center justify-center gap-4 pt-4">
             {!isRecording && !audioUrl && (
               <button onClick={startRecording} className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600 transition-all hover:scale-105 shadow-xl shadow-rose-500/25">
                 <Mic className="w-8 h-8 text-white relative z-10" />
               </button>
             )}

             {isRecording && (
               <button onClick={stopRecording} className="w-20 h-20 bg-slate-800 border-2 border-rose-500 rounded-full flex items-center justify-center hover:bg-slate-700 transition-all shadow-xl shadow-rose-500/10">
                 <Square className="w-6 h-6 text-rose-500 fill-rose-500" />
               </button>
             )}

             {audioUrl && !isRecording && (
                <>
                  <button onClick={() => { setAudioUrl(null); setAudioBlob(null); setFeedback(null); }} disabled={isEvaluating} className="px-6 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Retry
                  </button>
                  <button onClick={submitAudio} disabled={isEvaluating} className="px-8 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-rose-500/20">
                    {isEvaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Evaluation"}
                  </button>
                </>
             )}
           </div>
        </div>
      </div>

      {/* AI Feedback Results */}
      {feedback && feedback.status === "success" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
           <div className="flex flex-col md:flex-row gap-8 items-start">
              
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Feedback</h3>
                  <p className="text-slate-400 mt-1">{feedback.data.feedback}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transcription</p>
                  <p className="text-white italic">"{feedback.data.transcript}"</p>
                </div>
              </div>

              <div className="w-full md:w-64 space-y-4 shrink-0">
                 <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 text-center">
                    <p className="text-sm font-medium text-rose-400 uppercase tracking-widest mb-1">Overall Score</p>
                    <p className="text-5xl font-bold text-white">{feedback.data.score}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2">
                   {Object.entries(feedback.data.metrics).map(([key, value]) => (
                     <div key={key} className="bg-slate-800/50 rounded-xl p-3 text-center border border-white/5">
                        <p className="text-[10px] uppercase text-slate-400 tracking-wider mb-1">{key}</p>
                        <p className="text-lg font-bold text-slate-200">{value as number}</p>
                     </div>
                   ))}
                 </div>
              </div>

           </div>
        </motion.div>
      )}
    </div>
  );
}
