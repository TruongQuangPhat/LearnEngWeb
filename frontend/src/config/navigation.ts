import {
  LayoutDashboard,
  BookOpen,
  Languages,
  Headphones,
  Mic,
  FileEdit,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "from-violet-500 to-purple-600",
    description: "Overview & Stats",
  },
  {
    label: "Vocabulary",
    href: "/vocabulary",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    description: "SRS Flashcards",
  },
  {
    label: "Grammar",
    href: "/grammar",
    icon: Languages,
    color: "from-amber-500 to-orange-600",
    description: "AI Tutor",
  },
  {
    label: "Listening",
    href: "/listening",
    icon: Headphones,
    color: "from-sky-500 to-blue-600",
    description: "Audio Practice",
  },
  {
    label: "Speaking",
    href: "/speaking",
    icon: Mic,
    color: "from-rose-500 to-pink-600",
    description: "AI Partner",
  },
  {
    label: "Mock Exams",
    href: "/mock-exams",
    icon: FileEdit,
    color: "from-indigo-500 to-blue-700",
    description: "IELTS / TOEIC / VSTEP",
  },
];
