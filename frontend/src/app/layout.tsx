import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearEng — Smart English Learning Platform",
  description:
    "Master English with AI-powered tools: vocabulary SRS, grammar tutor, listening practice, speaking partner, and mock exams for IELTS, TOEIC, and VSTEP.",
  keywords: [
    "English learning",
    "IELTS",
    "TOEIC",
    "VSTEP",
    "vocabulary",
    "grammar",
    "AI tutor",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full font-sans bg-slate-950 text-white">
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
