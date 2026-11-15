// Common Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin" | "guest";
  subscription: "free" | "pro" | "enterprise";
  createdAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  favorite?: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt";
  size: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  pageCount?: number;
}

export interface DataFile {
  id: string;
  name: string;
  type: "csv" | "xlsx";
  size: number;
  rows: number;
  columns: string[];
  uploadedAt: Date;
}

export interface AIMemory {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  enabled: boolean;
}

export interface Report {
  id: string;
  title: string;
  type: "summary" | "analysis" | "custom";
  content: string;
  createdAt: Date;
  format: "pdf" | "docx" | "xlsx";
}

export interface UsageStats {
  messages: {
    used: number;
    limit: number;
  };
  storage: {
    used: number;
    limit: number;
  };
  documents: {
    used: number;
    limit: number;
  };
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string;
  children?: NavItem[];
}

export interface SidebarSection {
  title: string;
  items: NavItem[];
}
