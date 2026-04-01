"use client";

import {
  WelcomeHero,
  StatsGrid,
  QuickActions,
  ProgressChart,
  LearningPath,
  SmartRecommendations,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome header with streak + level + EXP */}
      <WelcomeHero />

      {/* AI Contextual Recommender */}
      <SmartRecommendations />

      {/* Stats overview cards */}
      <StatsGrid />

      {/* Quick Action cards (Learn Words, Review SRS, Mock Test, etc.) */}
      <QuickActions />

      {/* Bottom row: Chart + Learning Path side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ProgressChart />
        <LearningPath />
      </div>
    </div>
  );
}
