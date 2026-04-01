"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

// Placeholder weekly data — will be fed from user_daily_stats in production
const weeklyData = [
  { day: "Mon", exp: 45, words: 8 },
  { day: "Tue", exp: 80, words: 12 },
  { day: "Wed", exp: 35, words: 5 },
  { day: "Thu", exp: 120, words: 18 },
  { day: "Fri", exp: 95, words: 14 },
  { day: "Sat", exp: 65, words: 10 },
  { day: "Sun", exp: 0, words: 0 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2.5 shadow-xl">
      <p className="text-xs font-semibold text-white mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400 capitalize">{entry.dataKey}:</span>
          <span className="text-white font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ProgressChart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="relative rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] p-5 md:p-6 overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-violet-500/5 rounded-full blur-[80px]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Weekly Progress
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              EXP earned &amp; words learned this week
            </p>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span className="text-xs text-slate-400">EXP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">Words</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[220px] md:h-[260px] min-w-0">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart
                data={weeklyData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="wordsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 11 }}
                  dx={-4}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <Area
                  type="monotone"
                  dataKey="exp"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#expGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#8b5cf6",
                    stroke: "#1e1b4b",
                    strokeWidth: 2,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="words"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#wordsGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#10b981",
                    stroke: "#064e3b",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-800/20 animate-pulse rounded-lg border border-white/5" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
