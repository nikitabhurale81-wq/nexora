export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Analyst" | "Member" | "Viewer";
  plan: "Enterprise" | "Pro" | "Free";
  status: "Active" | "Invited" | "Suspended";
  joined: string;
  lastSeen: string;
  spend: number;
};

export const overviewSeries = [
  { month: "Jan", revenue: 142, users: 82, requests: 188 },
  { month: "Feb", revenue: 151, users: 88, requests: 202 },
  { month: "Mar", revenue: 167, users: 91, requests: 218 },
  { month: "Apr", revenue: 159, users: 96, requests: 226 },
  { month: "May", revenue: 181, users: 103, requests: 251 },
  { month: "Jun", revenue: 194, users: 108, requests: 279 },
  { month: "Jul", revenue: 205, users: 112, requests: 297 },
  { month: "Aug", revenue: 199, users: 116, requests: 315 },
  { month: "Sep", revenue: 218, users: 120, requests: 342 },
  { month: "Oct", revenue: 226, users: 123, requests: 358 },
  { month: "Nov", revenue: 237, users: 126, requests: 381 },
  { month: "Dec", revenue: 248, users: 129, requests: 412 },
];

export const adminUsers: AdminUser[] = [
  { id: 1, name: "Alex Johnson", email: "alex@nexora.ai", role: "Admin", plan: "Enterprise", status: "Active", joined: "Jan 12, 2025", lastSeen: "2 min ago", spend: 842 },
  { id: 2, name: "Sarah Wilson", email: "sarah@nexora.ai", role: "Analyst", plan: "Pro", status: "Active", joined: "Feb 3, 2025", lastSeen: "18 min ago", spend: 496 },
  { id: 3, name: "Mike Chen", email: "mike@nexora.ai", role: "Member", plan: "Pro", status: "Active", joined: "Feb 18, 2025", lastSeen: "1 hr ago", spend: 374 },
  { id: 4, name: "Priya Shah", email: "priya@kinetix.io", role: "Analyst", plan: "Enterprise", status: "Active", joined: "Mar 7, 2025", lastSeen: "3 hrs ago", spend: 734 },
  { id: 5, name: "Noah Williams", email: "noah@northstar.dev", role: "Viewer", plan: "Free", status: "Invited", joined: "Mar 21, 2025", lastSeen: "Never", spend: 0 },
  { id: 6, name: "Emma Davis", email: "emma@lumen.studio", role: "Member", plan: "Pro", status: "Active", joined: "Apr 2, 2025", lastSeen: "Yesterday", spend: 288 },
  { id: 7, name: "Liam Garcia", email: "liam@arcwise.co", role: "Member", plan: "Free", status: "Suspended", joined: "Apr 19, 2025", lastSeen: "12 days ago", spend: 64 },
  { id: 8, name: "Olivia Martin", email: "olivia@orbital.ai", role: "Analyst", plan: "Enterprise", status: "Active", joined: "May 6, 2025", lastSeen: "5 hrs ago", spend: 918 },
  { id: 9, name: "Ethan Brown", email: "ethan@vectorlabs.io", role: "Viewer", plan: "Free", status: "Active", joined: "May 22, 2025", lastSeen: "2 days ago", spend: 26 },
  { id: 10, name: "Ava Thompson", email: "ava@brightpath.com", role: "Member", plan: "Pro", status: "Active", joined: "Jun 1, 2025", lastSeen: "9 min ago", spend: 312 },
];

export const analyticsSeries = [
  { day: "Mon", sessions: 12800, conversations: 7200, documents: 1800 },
  { day: "Tue", sessions: 14600, conversations: 8100, documents: 2200 },
  { day: "Wed", sessions: 13900, conversations: 7900, documents: 2050 },
  { day: "Thu", sessions: 17200, conversations: 9600, documents: 2700 },
  { day: "Fri", sessions: 18400, conversations: 10400, documents: 3100 },
  { day: "Sat", sessions: 12100, conversations: 6800, documents: 1950 },
  { day: "Sun", sessions: 11400, conversations: 6400, documents: 1720 },
];

export const featureUsage = [
  { name: "AI Chat", value: 42, color: "#22d3ee" },
  { name: "Documents", value: 24, color: "#3b82f6" },
  { name: "Data Lab", value: 17, color: "#8b5cf6" },
  { name: "Code Studio", value: 11, color: "#ec4899" },
  { name: "Voice", value: 6, color: "#34d399" },
];

export const regionData = [
  { region: "North America", users: 48500, share: 38 },
  { region: "Europe", users: 34700, share: 27 },
  { region: "Asia Pacific", users: 29600, share: 23 },
  { region: "Latin America", users: 9700, share: 8 },
  { region: "Other", users: 5100, share: 4 },
];

export const costSeries = [
  { day: "Jun 1", input: 312, output: 198, cached: 38 },
  { day: "Jun 5", input: 348, output: 214, cached: 42 },
  { day: "Jun 9", input: 329, output: 231, cached: 46 },
  { day: "Jun 13", input: 401, output: 268, cached: 52 },
  { day: "Jun 17", input: 445, output: 292, cached: 61 },
  { day: "Jun 21", input: 426, output: 281, cached: 58 },
  { day: "Jun 25", input: 492, output: 327, cached: 68 },
  { day: "Jun 30", input: 518, output: 346, cached: 73 },
];

export const modelUsage = [
  { model: "GPT-4.1", provider: "OpenAI", requests: "1.82M", tokens: "684M", cost: 9876, share: 42, color: "#22d3ee" },
  { model: "Claude 3.7 Sonnet", provider: "Anthropic", requests: "1.34M", tokens: "512M", cost: 7240, share: 31, color: "#8b5cf6" },
  { model: "Gemini 2.5 Pro", provider: "Google", requests: "922K", tokens: "376M", cost: 4388, share: 19, color: "#3b82f6" },
  { model: "Llama 3.3 70B", provider: "Together", requests: "486K", tokens: "204M", cost: 1906, share: 8, color: "#ec4899" },
];

export type ModelConfig = {
  id: number;
  name: string;
  provider: string;
  type: string;
  context: string;
  latency: string;
  cost: string;
  enabled: boolean;
  primary: boolean;
  color: string;
  temperature: number;
  maxTokens: number;
};

export const modelConfigs: ModelConfig[] = [
  { id: 1, name: "GPT-4.1", provider: "OpenAI", type: "Reasoning", context: "1M tokens", latency: "1.2s", cost: "$2.00 / 1M", enabled: true, primary: true, color: "cyan", temperature: 0.7, maxTokens: 8192 },
  { id: 2, name: "Claude 3.7 Sonnet", provider: "Anthropic", type: "General", context: "200K tokens", latency: "1.4s", cost: "$3.00 / 1M", enabled: true, primary: false, color: "violet", temperature: 0.6, maxTokens: 8192 },
  { id: 3, name: "Gemini 2.5 Pro", provider: "Google", type: "Multimodal", context: "1M tokens", latency: "1.1s", cost: "$1.25 / 1M", enabled: true, primary: false, color: "blue", temperature: 0.7, maxTokens: 16384 },
  { id: 4, name: "Llama 3.3 70B", provider: "Together AI", type: "Open source", context: "128K tokens", latency: "860ms", cost: "$0.88 / 1M", enabled: false, primary: false, color: "pink", temperature: 0.8, maxTokens: 4096 },
  { id: 5, name: "NEXORA Embed v2", provider: "Internal", type: "Embedding", context: "8K tokens", latency: "92ms", cost: "$0.04 / 1M", enabled: true, primary: false, color: "emerald", temperature: 0, maxTokens: 8192 },
];

export const storageBreakdown = [
  { name: "Documents", value: 4.2, color: "#22d3ee" },
  { name: "Vector indexes", value: 2.8, color: "#8b5cf6" },
  { name: "Media", value: 1.9, color: "#3b82f6" },
  { name: "Exports", value: 0.9, color: "#ec4899" },
  { name: "Available", value: 2.2, color: "#1e293b" },
];

export type StorageFile = {
  id: number;
  name: string;
  type: "Document" | "Dataset" | "Media" | "Export";
  owner: string;
  size: string;
  updated: string;
};

export const storageFiles: StorageFile[] = [
  { id: 1, name: "Q2_Product_Strategy.pdf", type: "Document", owner: "Sarah Wilson", size: "18.4 MB", updated: "12 min ago" },
  { id: 2, name: "customer_signals_2025.csv", type: "Dataset", owner: "Priya Shah", size: "284 MB", updated: "1 hr ago" },
  { id: 3, name: "onboarding_walkthrough.mp4", type: "Media", owner: "Alex Johnson", size: "1.2 GB", updated: "Yesterday" },
  { id: 4, name: "research_corpus_v4.zip", type: "Dataset", owner: "Mike Chen", size: "728 MB", updated: "Jun 10, 2025" },
  { id: 5, name: "usage_report_may.pdf", type: "Export", owner: "System", size: "8.7 MB", updated: "Jun 2, 2025" },
  { id: 6, name: "brand_knowledge_base.docx", type: "Document", owner: "Emma Davis", size: "42.1 MB", updated: "May 28, 2025" },
];

export type FeedbackItem = {
  id: string;
  title: string;
  message: string;
  user: string;
  category: "Bug" | "Feature" | "Quality" | "Praise";
  priority: "High" | "Medium" | "Low";
  status: "New" | "Reviewing" | "Resolved";
  created: string;
  votes: number;
  assignee?: string;
};

export const feedbackItems: FeedbackItem[] = [
  { id: "FB-1048", title: "Citation links jump to the wrong page", message: "PDF citations in long reports occasionally open one page before the referenced paragraph.", user: "Maya at Kinetix", category: "Bug", priority: "High", status: "New", created: "18 min ago", votes: 14 },
  { id: "FB-1047", title: "Add reusable prompt collections", message: "Our research team would like shared, versioned prompt folders for common analysis workflows.", user: "Daniel at Northstar", category: "Feature", priority: "Medium", status: "Reviewing", created: "1 hr ago", votes: 38, assignee: "Nina" },
  { id: "FB-1046", title: "Much faster document answers", message: "The latest indexing update cut response time by more than half for our policy library.", user: "Olivia at Orbital", category: "Praise", priority: "Low", status: "Resolved", created: "3 hrs ago", votes: 8, assignee: "Alex" },
  { id: "FB-1045", title: "Voice transcript misses speaker labels", message: "Labels merge after participants speak over each other in longer meetings.", user: "Ethan at Vector Labs", category: "Quality", priority: "High", status: "Reviewing", created: "Yesterday", votes: 21, assignee: "Mika" },
  { id: "FB-1044", title: "Export charts as SVG", message: "Vector chart downloads would help us place analytics in print reports.", user: "Emma at Lumen", category: "Feature", priority: "Low", status: "New", created: "Yesterday", votes: 17 },
  { id: "FB-1043", title: "Model selector resets on refresh", message: "The chat model falls back to the default after refreshing an open conversation.", user: "Noah at Arcwise", category: "Bug", priority: "Medium", status: "Resolved", created: "Jun 12, 2025", votes: 11, assignee: "Nina" },
];

export type AuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  category: "Authentication" | "User" | "Model" | "Storage" | "Billing";
  result: "Success" | "Warning" | "Failed";
  ip: string;
  details: string;
};

export const auditLogs: AuditLog[] = [
  { id: "evt_91da28", timestamp: "Jun 18, 14:32:08", actor: "Alex Johnson", action: "Updated model configuration", resource: "GPT-4.1", category: "Model", result: "Success", ip: "172.16.42.18", details: "Temperature changed from 0.6 to 0.7. Maximum output remained 8,192 tokens." },
  { id: "evt_84bf10", timestamp: "Jun 18, 14:18:44", actor: "System", action: "Blocked repeated sign-in attempts", resource: "liam@arcwise.co", category: "Authentication", result: "Warning", ip: "45.12.88.201", details: "Rate limit triggered after five unsuccessful sign-in attempts in ten minutes." },
  { id: "evt_781ca5", timestamp: "Jun 18, 13:56:21", actor: "Sarah Wilson", action: "Exported usage report", resource: "May 2025 usage", category: "Billing", result: "Success", ip: "10.0.14.22", details: "CSV export contained aggregated model usage and token cost records." },
  { id: "evt_6ef023", timestamp: "Jun 18, 12:42:03", actor: "Priya Shah", action: "Invited workspace member", resource: "noah@northstar.dev", category: "User", result: "Success", ip: "10.0.8.94", details: "Invitation created with Viewer role and a seven-day expiry." },
  { id: "evt_5ab119", timestamp: "Jun 18, 11:28:50", actor: "System", action: "Object checksum mismatch", resource: "archive_2024_09.zip", category: "Storage", result: "Failed", ip: "Internal", details: "Scheduled integrity scan quarantined one archive pending administrator review." },
  { id: "evt_49ce87", timestamp: "Jun 18, 10:47:12", actor: "Mike Chen", action: "Changed member role", resource: "emma@lumen.studio", category: "User", result: "Success", ip: "10.0.22.17", details: "Role changed from Viewer to Member." },
  { id: "evt_37da92", timestamp: "Jun 18, 09:14:36", actor: "Alex Johnson", action: "Enabled model", resource: "Gemini 2.5 Pro", category: "Model", result: "Success", ip: "172.16.42.18", details: "Model enabled for all Pro and Enterprise workspaces." },
  { id: "evt_208be4", timestamp: "Jun 17, 22:51:08", actor: "Unknown", action: "Sign-in challenge failed", resource: "admin@nexora.ai", category: "Authentication", result: "Failed", ip: "103.84.17.6", details: "MFA challenge expired. No session was created." },
];

export const serviceHealth = [
  { name: "API Gateway", status: "Operational", uptime: "99.998%", latency: "42 ms", region: "Global", history: [99, 100, 100, 100, 99, 100, 100, 100, 100, 100, 100, 100] },
  { name: "AI Inference", status: "Operational", uptime: "99.982%", latency: "1.24 s", region: "Multi-region", history: [98, 99, 100, 99, 100, 100, 98, 100, 100, 99, 100, 100] },
  { name: "Vector Database", status: "Operational", uptime: "99.995%", latency: "18 ms", region: "US / EU", history: [100, 100, 100, 100, 100, 100, 99, 100, 100, 100, 100, 100] },
  { name: "Document Processing", status: "Degraded", uptime: "99.871%", latency: "3.8 s", region: "US East", history: [100, 98, 99, 100, 100, 95, 97, 100, 100, 94, 96, 97] },
  { name: "Authentication", status: "Operational", uptime: "100.000%", latency: "64 ms", region: "Global", history: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100] },
  { name: "Object Storage", status: "Operational", uptime: "99.991%", latency: "81 ms", region: "Multi-region", history: [99, 100, 100, 100, 100, 99, 100, 100, 100, 100, 100, 100] },
];

export const healthMetrics = [
  { time: "08:00", latency: 48, errors: 0.12, load: 42 },
  { time: "09:00", latency: 52, errors: 0.16, load: 48 },
  { time: "10:00", latency: 61, errors: 0.22, load: 57 },
  { time: "11:00", latency: 58, errors: 0.18, load: 54 },
  { time: "12:00", latency: 67, errors: 0.31, load: 68 },
  { time: "13:00", latency: 63, errors: 0.24, load: 61 },
  { time: "14:00", latency: 56, errors: 0.17, load: 52 },
];
