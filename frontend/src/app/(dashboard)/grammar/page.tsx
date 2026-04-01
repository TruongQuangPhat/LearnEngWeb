"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, Send, Bot, User, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function GrammarPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your AI Grammar Tutor. What would you like to learn today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Create empty assistant message placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("/api/chat/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("No body in response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: newMessages[lastIndex].content + data.content,
                  };
                  return newMessages;
                });
              } catch (e) {
                console.error("Error parsing SSE JSON:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error connecting to the AI service." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex flex-col pt-2 pb-6">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <Languages className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Grammar</h1>
          <p className="text-sm text-slate-400">AI Grammar Tutor</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-sm flex flex-col relative shadow-xl">
         {/* Messages Area */}
         <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
           {messages.map((msg, i) => (
             <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
               {msg.role === "assistant" && (
                 <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                   <Bot className="w-4 h-4 text-amber-500" />
                 </div>
               )}
               
               <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                 msg.role === "user" 
                   ? "bg-amber-600 text-white rounded-tr-sm" 
                   : "bg-slate-800 border border-white/5 text-slate-200 rounded-tl-sm"
               }`}>
                 <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/10 max-w-none text-sm">
                   {/* In a real app we'd use react-markdown here */}
                   <p className="whitespace-pre-wrap">{msg.content}</p>
                 </div>
               </div>
               
               {msg.role === "user" && (
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                   <User className="w-4 h-4 text-slate-300" />
                 </div>
               )}
             </div>
           ))}
           {isLoading && messages[messages.length - 1].role === "user" && (
             <div className="flex gap-4 p-2">
               <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                 <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
               </div>
               <div className="bg-slate-800 rounded-2xl px-4 py-3 flex gap-1.5 items-center border border-white/5">
                 <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                 <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                 <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-md">
           <form onSubmit={handleSubmit} className="flex gap-3 relative max-w-4xl mx-auto w-full">
             <input 
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Ask a grammar question..."
               disabled={isLoading}
               className="flex-1 bg-slate-950/50 border border-white/10 hover:border-white/20 transition-colors rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 disabled:opacity-50"
             />
             <button 
               type="submit"
               disabled={!input.trim() || isLoading}
               className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 text-white rounded-xl px-5 flex items-center justify-center transition-colors shadow-lg shadow-amber-500/20"
             >
               <Send className="w-4 h-4" />
             </button>
           </form>
         </div>
      </div>
    </div>
  );
}
