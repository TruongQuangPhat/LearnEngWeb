"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/navigation";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useUserStore } from "@/store/use-user-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Sparkles, Flame, Zap } from "lucide-react";

export function MobileSidebar() {
  const pathname = usePathname();
  const { isMobileOpen, setMobileOpen } = useSidebarStore();
  const { level, exp } = useUserStore();
  const expProgress = exp % 100;

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-white/[0.06] p-0"
      >
        <SheetHeader className="px-5 py-5 border-b border-white/[0.06]">
          <SheetTitle className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                LearEng
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Learn Smarter
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Level Card */}
        <div className="mx-3 mt-4 p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-white">
                Level {level}
              </span>
            </div>
            <Badge
              variant="secondary"
              className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] px-1.5 py-0"
            >
              {exp} EXP
            </Badge>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${expProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            {100 - expProgress} EXP to Level {level + 1}
          </p>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">
            Skills
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                  isActive
                    ? "bg-white/[0.08] text-white shadow-lg shadow-black/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-violet-400 to-indigo-500" />
                )}

                <div
                  className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive
                      ? `bg-gradient-to-br ${item.color} shadow-md`
                      : "bg-slate-800/50 group-hover:bg-slate-800"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] transition-colors",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                </div>

                <div>
                  <span className="text-sm font-medium block leading-tight">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {item.description}
                  </span>
                </div>

                {isActive && (
                  <div
                    className={cn(
                      "absolute inset-0 rounded-xl bg-gradient-to-r opacity-[0.06]",
                      item.color
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Streak Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-5 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-orange-500/25">
              <Flame className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-300">
                Daily Streak
              </p>
              <p className="text-[10px] text-slate-400">Keep it going!</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
