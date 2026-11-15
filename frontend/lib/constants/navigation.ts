import { SidebarSection } from "@/types";

export const WORKSPACE_NAVIGATION: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { title: "AI Chat", href: "/chat", icon: "MessageSquare" },
      { title: "Chat History", href: "/chat/history", icon: "History" },
      { title: "Favorites", href: "/favorites", icon: "Star" },
      { title: "Saved Items", href: "/saved", icon: "Bookmark" },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { title: "Document Library", href: "/documents", icon: "FolderOpen" },
      { title: "PDF / DOCX Chat", href: "/documents/chat", icon: "FileText" },
      { title: "Data Lab", href: "/data-lab", icon: "BarChart3" },
      { title: "Code Studio", href: "/code-studio", icon: "Code2" },
      { title: "Voice Room", href: "/voice-room", icon: "Mic" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { title: "AI Memory", href: "/memory", icon: "Brain" },
      { title: "Memory Management", href: "/memory/manage", icon: "Database" },
      { title: "Knowledge Base", href: "/knowledge", icon: "BookOpen" },
      { title: "Report Center", href: "/reports", icon: "FileBarChart" },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Profile", href: "/profile", icon: "User" },
      { title: "Settings", href: "/settings", icon: "Settings" },
      { title: "Usage & Limits", href: "/usage", icon: "Activity" },
      { title: "Billing", href: "/billing", icon: "CreditCard" },
    ],
  },
  {
    title: "Support",
    items: [
      { title: "Help Center", href: "/help", icon: "HelpCircle" },
      { title: "Tutorials", href: "/tutorials", icon: "GraduationCap" },
      { title: "Contact Support", href: "/support", icon: "MessageCircle" },
    ],
  },
];

export const ADMIN_NAVIGATION: SidebarSection[] = [
  {
    title: "Admin",
    items: [
      { title: "Overview", href: "/admin", icon: "LayoutDashboard" },
      { title: "User Management", href: "/admin/users", icon: "Users" },
      { title: "Analytics", href: "/admin/analytics", icon: "TrendingUp" },
      { title: "AI Usage & Costs", href: "/admin/ai-usage", icon: "DollarSign" },
      { title: "Model Config", href: "/admin/models", icon: "Cpu" },
      { title: "Storage", href: "/admin/storage", icon: "HardDrive" },
      { title: "Feedback", href: "/admin/feedback", icon: "MessageSquare" },
      { title: "Audit Logs", href: "/admin/logs", icon: "FileText" },
      { title: "System Health", href: "/admin/health", icon: "Activity" },
    ],
  },
];

export const MARKETING_NAV = [
  { title: "Features", href: "/features" },
  { title: "Solutions", href: "/solutions" },
  { title: "Pricing", href: "/pricing" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];
