"use client";

import { useUserStore } from "@/store/use-user-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Bell, Flame, Search, Sparkles } from "lucide-react";

export function Header() {
  const { name, streak, level, exp } = useUserStore();
  const { isCollapsed } = useSidebarStore();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 md:px-6",
        "bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06]",
        "transition-all duration-300",
        isCollapsed ? "md:pl-[92px]" : "md:pl-[276px]"
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        <MobileSidebar />
        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:border-white/[0.12] transition-colors cursor-pointer min-w-[240px]">
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Search anything...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08] text-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Streak Badge */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 cursor-default group hover:border-orange-500/30 transition-all">
              <Flame className="w-4 h-4 text-orange-400 group-hover:animate-bounce" />
              <span className="text-sm font-bold text-orange-300">
                {streak}
              </span>
              <span className="hidden sm:inline text-xs text-slate-400">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">
              🔥 {streak} day streak!{" "}
              {streak === 0 ? "Start learning today!" : "Keep going!"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* EXP Badge (mobile) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300">
            Lv.{level}
          </span>
        </div>

        {/* Notifications */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-slate-950" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-white/[0.08]" />

        {/* User Profile */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-white/[0.04] transition-all group">
              <Avatar className="w-8 h-8 border-2 border-violet-500/40 group-hover:border-violet-500/60 transition-colors">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-tight">
                  {name}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {exp} EXP
                </p>
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>Profile & Settings</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
