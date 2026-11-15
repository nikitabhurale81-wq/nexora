import {
  LayoutDashboard, MessageSquare, History, Star, Bookmark,
  FolderOpen, FileText, BarChart3, Code2, Mic,
  Brain, Database, BookOpen, FileBarChart,
  User, Settings, Activity, CreditCard,
  HelpCircle, GraduationCap, MessageCircle,
  Upload, HardDrive, TrendingUp, TrendingDown,
  Users, DollarSign, Cpu, Sparkles, Send, Plus,
  type LucideIcon, HelpCircle as Fallback,
} from "lucide-react";

const registry: Record<string, LucideIcon> = {
  LayoutDashboard, MessageSquare, History, Star, Bookmark,
  FolderOpen, FileText, BarChart3, Code2, Mic,
  Brain, Database, BookOpen, FileBarChart,
  User, Settings, Activity, CreditCard,
  HelpCircle, GraduationCap, MessageCircle,
  Upload, HardDrive, TrendingUp, TrendingDown,
  Users, DollarSign, Cpu, Sparkles, Send, Plus,
};

interface IconProps {
  name: string;
  className?: string;
}

/** Renders a Lucide icon by name; falls back to a help icon if unknown. */
export function Icon({ name, className }: IconProps) {
  const Cmp = registry[name] ?? Fallback;
  return <Cmp className={className} />;
}
