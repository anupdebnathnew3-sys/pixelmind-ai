export type UserRole = 'user' | 'admin';
export type Theme = 'light' | 'dark';
export type PlanType = 'free' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type APIStatus = 'connected' | 'active' | 'failed' | 'rate_limited' | 'inactive';
export type Currency = 'BDT' | 'USD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  plan: PlanType;
  credits: number;
  createdAt: string;
  emailVerified: boolean;
  notificationsCount: number;
}

export interface APIKey {
  id: string;
  name: string;
  provider: string;
  key: string;
  baseUrl?: string;
  modelName?: string;
  providerType?: string;
  status: APIStatus;
  isDefault: boolean;
  isEnabled: boolean;
  lastTested?: string;
  visionCapable?: boolean;
  toolCompatible?: boolean;
}

export interface Plan {
  id: string;
  name: PlanType;
  displayName: string;
  monthlyPriceBDT: number;
  monthlyPriceUSD: number;
  yearlyPriceBDT: number;
  yearlyPriceUSD: number;
  credits: number;
  features: string[];
  highlighted?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface GeneratedMetadata {
  id: string;
  imageUrl: string;
  fileName: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  commercialIntent: string;
  metadataScore: number;
  marketplace?: string;
  createdAt: string;
}

export interface ContentHistory {
  id: string;
  type: string;
  title: string;
  content: string;
  wordCount: number;
  createdAt: string;
}

export interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  mediaUrl?: string;
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: Currency;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  date: string;
  downloadUrl?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  apiCalls: number;
  usersGrowth: number;
  revenueGrowth: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  marketplace?: string;
  isDefault: boolean;
  updatedAt: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  handle?: string;
}

export interface Holiday {
  date: string;
  name: string;
  country: string;
  type: 'holiday' | 'observance' | 'event';
}
