/**
 * Mock data for the Dashboard.
 * Swap these out for real API responses once the backend is connected.
 */

export interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  accent: "primary" | "secondary" | "accent" | "success";
}

export const DASHBOARD_STATS: StatCard[] = [
  { label: "Total Chats", value: "248", change: "+12%", trend: "up", icon: "MessageSquare", accent: "primary" },
  { label: "Files Processed", value: "156", change: "+8%", trend: "up", icon: "FileText", accent: "secondary" },
  { label: "Reports Created", value: "48", change: "+23%", trend: "up", icon: "FileBarChart", accent: "accent" },
  { label: "Storage Used", value: "42%", change: "+5%", trend: "up", icon: "HardDrive", accent: "success" },
];

export interface QuickTool {
  label: string;
  description: string;
  href: string;
  icon: string;
  accent: "primary" | "secondary" | "accent" | "success";
}

export const QUICK_TOOLS: QuickTool[] = [
  { label: "AI Chat", description: "Start a conversation", href: "/chat", icon: "MessageSquare", accent: "primary" },
  { label: "Upload File", description: "Chat with documents", href: "/documents", icon: "Upload", accent: "secondary" },
  { label: "Data Analysis", description: "Explore your data", href: "/data-lab", icon: "BarChart3", accent: "accent" },
  { label: "Generate Report", description: "Create a report", href: "/reports", icon: "FileBarChart", accent: "success" },
  { label: "Code Studio", description: "Write & debug code", href: "/code-studio", icon: "Code2", accent: "primary" },
];

export const USAGE_ANALYTICS = [
  { day: "Mon", messages: 32, files: 8 },
  { day: "Tue", messages: 45, files: 12 },
  { day: "Wed", messages: 38, files: 7 },
  { day: "Thu", messages: 62, files: 15 },
  { day: "Fri", messages: 55, files: 11 },
  { day: "Sat", messages: 28, files: 5 },
  { day: "Sun", messages: 40, files: 9 },
];

export interface ActivityItem {
  id: string;
  title: string;
  type: string;
  time: string;
  icon: string;
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "1", title: "Analyzed Q3 Sales Report.xlsx", type: "Data Lab", time: "2 min ago", icon: "BarChart3" },
  { id: "2", title: "Chat: Marketing strategy ideas", type: "AI Chat", time: "25 min ago", icon: "MessageSquare" },
  { id: "3", title: "Summarized Nexora_Proposal.pdf", type: "Document", time: "1 hour ago", icon: "FileText" },
  { id: "4", title: "Generated Weekly Report", type: "Reports", time: "3 hours ago", icon: "FileBarChart" },
  { id: "5", title: "Debugged auth.py snippet", type: "Code Studio", time: "Yesterday", icon: "Code2" },
];

export interface FeaturedFeature {
  title: string;
  description: string;
  href: string;
  icon: string;
  accent: "primary" | "secondary" | "accent";
}

export const FEATURED_FEATURES: FeaturedFeature[] = [
  { title: "Voice Room", description: "Talk to NEXORA with natural voice conversations.", href: "/voice-room", icon: "Mic", accent: "primary" },
  { title: "AI Memory", description: "NEXORA remembers your preferences and context.", href: "/memory", icon: "Brain", accent: "secondary" },
  { title: "Knowledge Base", description: "Build a searchable library of your knowledge.", href: "/knowledge", icon: "BookOpen", accent: "accent" },
];

export const SYSTEM_STATUS = [
  { name: "AI Engine", status: "operational", latency: "42ms" },
  { name: "Document Processing", status: "operational", latency: "120ms" },
  { name: "Voice Service", status: "operational", latency: "88ms" },
  { name: "Storage", status: "degraded", latency: "310ms" },
];

export const USAGE_LIMITS = {
  messages: { used: 66, limit: 100 },
  storage: { used: 3.2, limit: 5 },
  documents: { used: 18, limit: 30 },
};
