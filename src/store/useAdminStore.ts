import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToolConfig {
  id: string;
  name: string;
  enabled: boolean;
  fontFamily: string;
  fontSize: string;
}

export interface HomepageContent {
  heroBadge: string;
  heroMicroLabel: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitle: string;
  heroSubtitle: string;
  statsLabel1: string;
  statsLabel2: string;
  statsLabel3: string;
  statsLabel4: string;
  featuresTitle: string;
  featuresSubtitle: string;
  toolsSectionTitle: string;
  toolsSectionSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
}

export interface SiteSettings {
  siteName: string;
  navbarBrand: string;
  sidebarBrand: string;
}

export interface ExpertiseItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AboutSectionData {
  visible: boolean;
  animationsEnabled: boolean;
  profileImageUrl: string;
  founderBadge: string;
  creatorBadge: string;
  name: string;
  title: string;
  biography: string;
  expertiseItems: ExpertiseItem[];
}

export interface UISettings {
  primaryColor: string;
  accentColor: string;
  borderRadius: 'sharp' | 'normal' | 'rounded';
  sidebarStyle: 'light' | 'dark';
  cardShadow: boolean;
  compactMode: boolean;
}

export interface DemoVideo {
  enabled: boolean;
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  status: 'active' | 'suspended';
  role: 'user' | 'admin';
  joined: string;
  lastActive: string;
  totalUsage: number;
}

export interface SystemApiKey {
  id: string;
  provider: string;
  label: string;
  key: string;
  status: 'active' | 'inactive' | 'error';
  usageToday: number;
  limitPerDay: number;
  model: string;
  baseUrl?: string;
  addedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  active: boolean;
  createdAt: string;
}

export interface FeaturedTool {
  id: string;
  name: string;
  description: string;
  badge: string;
  active: boolean;
}

export interface AdminSubscription {
  id: string;
  userName: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  amount: number;
  billingCycle: 'monthly' | 'annual';
  startDate: string;
  nextBilling: string;
  creditsPerMonth: number;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
}

export interface NavSettings {
  bgColor: string;
  textColor: string;
  hoverTextColor: string;
  activeColor: string;
  borderColor: string;
  transparency: number;
  blurEffect: boolean;
  stickyHeader: boolean;
  logoUrl: string;
  items: NavItem[];
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonColor: string;
  navbarBgColor: string;
  footerBgColor: string;
  lightBg: string;
  darkBg: string;
  lightCard: string;
  darkCard: string;
  lightText: string;
  darkText: string;
}

export interface LegalSection {
  id: string;
  title: string;
  body: string;
}

export interface LegalContent {
  termsEnabled: boolean;
  termsTitle: string;
  termsLastUpdated: string;
  termsVersion: string;
  termsSections: LegalSection[];
  privacyEnabled: boolean;
  privacyTitle: string;
  privacyLastUpdated: string;
  privacyVersion: string;
  privacySections: LegalSection[];
}

export interface GuestAlertSettings {
  enabled: boolean;
  showAfterUses: number;
  showOnLowCredits: boolean;
  lowCreditThreshold: number;
  title: string;
  message: string;
  ctaText: string;
  position: 'top' | 'bottom';
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireSpecialChar: boolean;
  apiKeyMasking: boolean;
  activityLoggingEnabled: boolean;
  rateLimitPerMinute: number;
  ipWhitelistEnabled: boolean;
  allowedIPs: string;
  httpsEnforced: boolean;
  csrfProtection: boolean;
  xssProtection: boolean;
}

export interface HeroAnimationSettings {
  activeAnimation: 'particles' | 'aurora' | 'orbit' | 'starfield' | 'neonwave' | 'geometry' | 'fireflies' | 'digitalrain' | 'plasma' | 'none';
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_TOOLS: ToolConfig[] = [
  { id: 'metadata',         name: 'AI Metadata Generator',       enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'image-to-prompt',  name: 'Image to Prompt',             enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'content-writer',   name: 'AI Content Writer',           enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'slogan-generator', name: 'Slogan Generator',            enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'event-calendar',   name: 'Event Calendar',              enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'age-calculator',   name: 'Age Calculator',              enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'word-counter',     name: 'Word Counter',                enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'social-scheduler', name: 'Social Scheduler',            enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  // Color & Branding
  { id: 'color-palette',    name: 'AI Color Palette Generator',  enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'brand-voice',      name: 'Brand Voice & Slogan Matcher',enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  // Typography
  { id: 'font-pairing',            name: 'AI Font Pairing Assistant',    enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'font-design-resources',   name: 'Font & Design Resources',      enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  // Marketing
  { id: 'ad-copywriter',    name: 'Social Media Ad Copywriter',  enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
  { id: 'sales-script',     name: 'Shorts & Reels Script Writer',enabled: true, fontFamily: 'Noto Sans', fontSize: '14px' },
];

const DEFAULT_HOMEPAGE: HomepageContent = {
  heroBadge: 'The AI Creative Suite — No Account Required',
  heroMicroLabel: 'AI Prompts · Stock Metadata · Content Tools',
  heroTitleLine1: 'Your Images Deserve',
  heroTitleLine2: 'Perfect Words.',
  heroTitle: 'Your Images Deserve Perfect Words.',
  heroSubtitle: 'Generate platform-perfect AI prompts for Midjourney, DALL·E & Flux. Create SEO-ready metadata for Adobe Stock, Shutterstock & Freepik. One powerful workspace — built for visual creators.',
  statsLabel1: 'Prompts Generated',
  statsLabel2: 'Metadata Created',
  statsLabel3: 'Active Users',
  statsLabel4: 'AI Platforms',
  featuresTitle: 'Everything a Creator Needs',
  featuresSubtitle: 'From image analysis to content writing — all tools work together seamlessly. No switching between apps.',
  toolsSectionTitle: 'Powerful Tools, Free to Try',
  toolsSectionSubtitle: 'No account required. Start generating with 50 free guest credits — instantly.',
  ctaTitle: 'Create Your First Prompt in 30 Seconds',
  ctaSubtitle: 'No setup. No credit card. Just drop an image and watch PixelMind Pro do the work. Join 50,000+ creators who use it every day.',
};

const DEFAULT_ABOUT: AboutSectionData = {
  visible: true,
  animationsEnabled: true,
  profileImageUrl: '/founder.jpg',
  founderBadge: 'Founder & Creator',
  creatorBadge: 'Website Created By Anup Debnath',
  name: 'Anup Debnath',
  title: 'Professional AI Visual Artist & Stock Media Contributor',
  biography: 'I am a dedicated AI visual artist and stock media contributor with a passion for combining cutting-edge artificial intelligence with creative visual expression. With years of experience in AI prompt engineering and stock photography, I have developed PixelMind AI as a comprehensive platform to help creators like you streamline your workflow, generate professional-grade metadata, and unlock the full potential of AI-powered creativity. My mission is to bridge the gap between technology and art, making advanced AI tools accessible to every creator.',
  expertiseItems: [
    { id: '1', icon: '🎨', title: 'AI Prompt Engineering', description: 'Crafting precise, creative prompts for Midjourney, DALL·E, Flux, and Stable Diffusion to produce stunning visual results.' },
    { id: '2', icon: '📸', title: 'Visual Asset Creation', description: 'Creating and curating high-quality visual content optimized for Adobe Stock, Shutterstock, Freepik, and other stock platforms.' },
    { id: '3', icon: '⚡', title: 'Technical Optimization', description: 'Developing AI-powered tools and workflows that reduce production time by 90% while maintaining professional quality standards.' },
    { id: '4', icon: '🔧', title: 'Professional Workflow', description: 'Building end-to-end creative pipelines from concept to publication, integrating AI at every stage for maximum efficiency.' },
  ],
};

const DEFAULT_SITE: SiteSettings = {
  siteName: 'PixelMind AI',
  navbarBrand: 'PixelMind Pro',
  sidebarBrand: 'PixelMind AI',
};

const DEFAULT_UI: UISettings = {
  primaryColor: '#6366F1',
  accentColor: '#8B5CF6',
  borderRadius: 'normal',
  sidebarStyle: 'light',
  cardShadow: true,
  compactMode: false,
};

const DEFAULT_DEMO_VIDEO: DemoVideo = {
  enabled: true,
  url: '',
  thumbnailUrl: '',
  title: 'See PixelMind AI in Action',
  description: 'Watch how PixelMind AI transforms your creative workflow — generate metadata for 100 images in under 60 seconds.',
};

const DEFAULT_USERS: AdminUser[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', plan: 'pro', credits: 3450, status: 'active', role: 'user', joined: '2024-01-15', lastActive: '2 min ago', totalUsage: 1240 },
  { id: '2', name: 'Bob Kumar', email: 'bob@example.com', plan: 'free', credits: 150, status: 'active', role: 'user', joined: '2024-03-22', lastActive: '1 hour ago', totalUsage: 350 },
  { id: '3', name: 'Carol Smith', email: 'carol@example.com', plan: 'enterprise', credits: 99999, status: 'active', role: 'user', joined: '2023-11-08', lastActive: '5 min ago', totalUsage: 8920 },
  { id: '4', name: 'David Lee', email: 'david@example.com', plan: 'pro', credits: 0, status: 'suspended', role: 'user', joined: '2024-05-14', lastActive: '3 days ago', totalUsage: 560 },
  { id: '5', name: 'Emma Wilson', email: 'emma@example.com', plan: 'free', credits: 1000, status: 'active', role: 'user', joined: '2024-11-01', lastActive: '30 min ago', totalUsage: 45 },
  { id: '6', name: 'Frank Chen', email: 'frank@example.com', plan: 'pro', credits: 2100, status: 'active', role: 'user', joined: '2024-02-28', lastActive: '2 hours ago', totalUsage: 2800 },
  { id: '7', name: 'Admin User', email: 'admin@pixelmind.ai', plan: 'enterprise', credits: 99999, status: 'active', role: 'admin', joined: '2023-01-01', lastActive: 'Just now', totalUsage: 0 },
];

const DEFAULT_API_KEYS: SystemApiKey[] = [];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'New AI Models Available', message: 'GPT-4.1 and Claude Opus 4 are now supported in AI Settings.', type: 'info', active: true, createdAt: '2026-06-01' },
  { id: '2', title: 'Scheduled Maintenance', message: 'Platform maintenance on June 15, 2026 from 2–4 AM UTC.', type: 'warning', active: false, createdAt: '2026-05-28' },
  { id: '3', title: 'Pro Plan Discount', message: 'Get 30% off Pro plan for the next 7 days!', type: 'success', active: true, createdAt: '2026-06-05' },
];

const DEFAULT_FEATURED_TOOLS: FeaturedTool[] = [
  { id: '1', name: 'AI Metadata Generator', description: 'Generate SEO-optimized metadata for stock images', badge: 'Core', active: true },
  { id: '2', name: 'Image to Prompt', description: 'Convert images to platform-specific AI prompts', badge: 'Popular', active: true },
  { id: '3', name: 'AI Content Writer', description: 'Write blogs, scripts, emails and more', badge: 'New', active: true },
  { id: '4', name: 'Social Scheduler', description: 'Schedule posts across all social platforms', badge: '', active: false },
];

const DEFAULT_SUBSCRIPTIONS: AdminSubscription[] = [
  { id: '1', userName: 'Alice Johnson', email: 'alice@example.com', plan: 'pro', status: 'active', amount: 29, billingCycle: 'monthly', startDate: '2024-01-15', nextBilling: '2026-07-15', creditsPerMonth: 5000 },
  { id: '2', userName: 'Bob Kumar', email: 'bob@example.com', plan: 'free', status: 'active', amount: 0, billingCycle: 'monthly', startDate: '2024-03-22', nextBilling: '—', creditsPerMonth: 1000 },
  { id: '3', userName: 'Carol Smith', email: 'carol@example.com', plan: 'enterprise', status: 'active', amount: 99, billingCycle: 'annual', startDate: '2023-11-08', nextBilling: '2026-11-08', creditsPerMonth: 99999 },
  { id: '4', userName: 'David Lee', email: 'david@example.com', plan: 'pro', status: 'past_due', amount: 29, billingCycle: 'monthly', startDate: '2024-05-14', nextBilling: '2026-06-14', creditsPerMonth: 5000 },
  { id: '5', userName: 'Emma Wilson', email: 'emma@example.com', plan: 'pro', status: 'trialing', amount: 29, billingCycle: 'monthly', startDate: '2026-06-01', nextBilling: '2026-06-15', creditsPerMonth: 5000 },
  { id: '6', userName: 'Frank Chen', email: 'frank@example.com', plan: 'pro', status: 'cancelled', amount: 29, billingCycle: 'monthly', startDate: '2024-02-28', nextBilling: '—', creditsPerMonth: 0 },
];

const DEFAULT_NAV_SETTINGS: NavSettings = {
  bgColor: '#FFFFFF',
  textColor: '#374151',
  hoverTextColor: '#6366F1',
  activeColor: '#6366F1',
  borderColor: '#E2E8F0',
  transparency: 97,
  blurEffect: true,
  stickyHeader: true,
  logoUrl: '',
  items: [
    { id: 'home',     label: 'Home',     path: '/',          visible: true, order: 1 },
    { id: 'features', label: 'Features', path: '/features',  visible: true, order: 2 },
    { id: 'tools',    label: 'Tools',    path: '/#tools',    visible: true, order: 3 },
    { id: 'pricing',  label: 'Pricing',  path: '/pricing',   visible: true, order: 4 },
    { id: 'about',    label: 'About',    path: '/about',     visible: true, order: 5 },
    { id: 'contact',  label: 'Contact',  path: '/contact',   visible: true, order: 6 },
  ],
};

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#6366F1',
  secondaryColor: '#8B5CF6',
  accentColor: '#EC4899',
  buttonColor: '#6366F1',
  navbarBgColor: '#FFFFFF',
  footerBgColor: '#0d1030',
  lightBg: '#F8FAFF',
  darkBg: '#0d1030',
  lightCard: '#FFFFFF',
  darkCard: '#131635',
  lightText: '#111827',
  darkText: '#F9FAFB',
};

const DEFAULT_LEGAL: LegalContent = {
  termsEnabled: true,
  termsTitle: 'Terms & Conditions',
  termsLastUpdated: '2026-06-09',
  termsVersion: '1.0',
  termsSections: [
    { id: 'acceptance', title: '1. Acceptance of Terms', body: 'By accessing or using PixelMind AI ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service. We reserve the right to update these Terms at any time, and your continued use constitutes acceptance of any changes.' },
    { id: 'user-responsibilities', title: '2. User Responsibilities', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must promptly notify us of any unauthorized access. You agree to provide accurate, current, and complete information during registration.' },
    { id: 'account-usage', title: '3. Account Usage Rules', body: 'Each account is for single-user use only. Sharing account access is prohibited. You may not create multiple accounts to circumvent limitations. Accounts used for spam, abuse, or prohibited activity will be suspended without notice.' },
    { id: 'guest-policy', title: '4. Guest User Policies', body: 'Guest users receive limited free credits to explore the Service without registering. Guest credits are non-transferable, non-refundable, and are session-scoped. Guest users have limited feature access and cannot save work or settings.' },
    { id: 'subscription-terms', title: '5. Subscription Terms', body: 'Paid subscriptions grant access to premium features as described in pricing plans. Subscriptions auto-renew at the end of each billing period unless cancelled. You must cancel before the renewal date to avoid charges. Benefits are non-transferable.' },
    { id: 'credit-system', title: '6. Credit System Rules', body: 'Credits are consumed when using AI-powered tools. Free plan credits reset monthly. Unused credits expire at the end of the billing cycle. Credits have no monetary value and cannot be exchanged for cash or transferred between accounts.' },
    { id: 'payment-policies', title: '7. Payment Policies', body: 'All payments are processed manually. Send the exact amount to the designated payment method (bKash, Nagad, Bank Transfer, etc.) and submit your Transaction ID for verification. Payments are typically verified within 24 hours on business days. Prices are in BDT.' },
    { id: 'refund-policy', title: '8. Refund Policy', body: 'Refunds are available within 7 days of purchase if you have used less than 10% of plan credits. Submit refund requests to imagify.pro@gmail.com with your transaction ID. Approved refunds are processed within 5–10 business days to the original payment method.' },
    { id: 'intellectual-property', title: '9. Intellectual Property Rights', body: 'PixelMind AI and its content are owned by Anup Debnath and protected by international intellectual property laws. You retain ownership of content you create using the Service. You may not copy, modify, or distribute the Service or its components without express written permission.' },
    { id: 'api-usage', title: '10. API Usage Rules', body: 'API keys must be used in compliance with the respective AI provider\'s terms of service. You are responsible for all usage and costs associated with your personal API keys. Platform-provided API access is limited by your subscription plan. Excessive use may result in rate limiting.' },
    { id: 'prohibited-activities', title: '11. Prohibited Activities', body: 'You may not use the Service to generate illegal, harmful, or abusive content; violate applicable laws; infringe intellectual property rights; attempt to hack or compromise the Service; use automated bots without authorization; resell Service access; or damage or impair the Service.' },
    { id: 'limitation-liability', title: '12. Limitation of Liability', body: 'To the maximum extent permitted by law, PixelMind AI shall not be liable for indirect, incidental, or consequential damages. Our total liability for any claim shall not exceed the amount you paid for the Service in the 12 months preceding the claim.' },
    { id: 'service-availability', title: '13. Service Availability', body: 'We strive to maintain continuous availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance or events beyond our control. We are not liable for losses resulting from service interruptions.' },
    { id: 'termination', title: '14. Termination Rights', body: 'We reserve the right to terminate or suspend accounts at any time for violations of these Terms, fraudulent activity, or other reasons. Upon termination, your access ceases immediately and unused credits are forfeited.' },
    { id: 'changes-terms', title: '15. Changes to Terms', body: 'We may update these Terms at any time. Registered users will be notified of significant changes via email. The updated Terms will be posted here with a new "Last Updated" date. Continued use after changes constitutes acceptance.' },
    { id: 'contact', title: '16. Contact Information', body: 'For questions about these Terms, contact us at:\n\nEmail: imagify.pro@gmail.com\n\nWe aim to respond to all inquiries within 2 business days.' },
  ],
  privacyEnabled: true,
  privacyTitle: 'Privacy Policy',
  privacyLastUpdated: '2026-06-09',
  privacyVersion: '1.0',
  privacySections: [
    { id: 'info-collection', title: '1. Information We Collect', body: 'We collect information you provide during registration (name, email, password). We also collect usage data (tool usage, generation history, session data) and technical data (IP addresses, browser type, device information) to provide and improve the Service.' },
    { id: 'data-processing', title: '2. User Data Processing', body: 'We process your data to provide the Service, process subscriptions and payments, send transactional and promotional communications (with consent), analyze usage patterns to improve user experience, comply with legal obligations, and respond to your inquiries.' },
    { id: 'cookies', title: '3. Cookies Policy', body: 'We use cookies to maintain your session, remember preferences, and analyze Service usage. Essential cookies are required for the Service to function. Analytics cookies help us understand user behavior. You can control cookie preferences via your browser settings.' },
    { id: 'analytics', title: '4. Analytics Usage', body: 'We use analytics tools to understand how users interact with PixelMind AI. This data is used to improve features and user experience. Analytics data is anonymized where possible. We do not sell analytics data to third parties.' },
    { id: 'payment-info', title: '5. Payment Information Handling', body: 'Payment information (mobile wallet numbers, transaction IDs) is collected solely to verify manual transactions. We do not store full payment credentials. Transaction records are retained for accounting and dispute resolution. Payment data is handled with strict security measures.' },
    { id: 'api-key-storage', title: '6. API Key Storage Policy', body: 'Your personal API keys are stored locally in your browser and are not transmitted to our servers unless required for a specific operation. Platform-provided API keys are managed server-side with encryption. You can delete stored API keys anytime from AI Settings.' },
    { id: 'security', title: '7. Security Measures', body: 'We implement industry-standard security measures including HTTPS encryption, secure authentication, access controls, and activity monitoring. While we take reasonable precautions, no system is 100% secure. We recommend using strong, unique passwords.' },
    { id: 'third-party', title: '8. Third-Party Services', body: 'Our Service integrates with third-party AI providers (OpenAI, Google Gemini, Anthropic Claude). When using platform APIs, your prompts are processed by these providers under their own privacy policies. We are not responsible for third-party privacy practices.' },
    { id: 'subscription-data', title: '9. Subscription Data', body: 'Subscription data (plan, billing history, usage statistics) is stored securely and used to manage your account. This data is accessible to authorized administrators for support purposes. Subscription data is retained for 3 years after account termination.' },
    { id: 'user-rights', title: '10. Your Rights', body: 'You have the right to: access your personal data; correct inaccurate data; request data deletion (subject to legal retention requirements); withdraw processing consent; and lodge complaints with supervisory authorities. Contact imagify.pro@gmail.com to exercise these rights.' },
    { id: 'data-retention', title: '11. Data Retention', body: 'We retain personal data while your account is active or as needed to provide services. Account data is deleted 30 days after account termination. Generation history may be retained for up to 12 months. Payment records are retained for 5 years as required by financial regulations.' },
    { id: 'data-deletion', title: '12. Data Deletion Requests', body: 'To request deletion of your account and data, contact imagify.pro@gmail.com. We will process requests within 30 days. Some data may be retained for legal purposes as described above. Upon deletion, you will lose access to all saved work and history.' },
    { id: 'contact', title: '13. Contact Information', body: 'For privacy inquiries, data requests, or concerns:\n\nEmail: imagify.pro@gmail.com\n\nWe are committed to addressing your privacy concerns promptly and professionally.' },
  ],
};

const DEFAULT_GUEST_ALERTS: GuestAlertSettings = {
  enabled: true,
  showAfterUses: 3,
  showOnLowCredits: true,
  lowCreditThreshold: 10,
  title: 'Save Your Work — Create a Free Account',
  message: "You're currently in Guest Mode. Create a free account to save your work, history, and settings.",
  ctaText: 'Sign Up for Free',
  position: 'bottom',
};

const DEFAULT_SECURITY: SecuritySettings = {
  sessionTimeoutMinutes: 1440,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireSpecialChar: false,
  apiKeyMasking: true,
  activityLoggingEnabled: true,
  rateLimitPerMinute: 60,
  ipWhitelistEnabled: false,
  allowedIPs: '',
  httpsEnforced: true,
  csrfProtection: true,
  xssProtection: true,
};

const DEFAULT_HERO_ANIMATION: HeroAnimationSettings = {
  activeAnimation: 'particles',
};

// ─── Store Interface ──────────────────────────────────────────────────────────

interface AdminState {
  tools: ToolConfig[];
  homepageContent: HomepageContent;
  uiSettings: UISettings;
  siteSettings: SiteSettings;
  demoVideo: DemoVideo;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  scheduledMaintenance: { start: string; duration: number } | null;
  registrationEnabled: boolean;
  adminUsers: AdminUser[];
  systemApiKeys: SystemApiKey[];
  heroAnimationSettings: HeroAnimationSettings;
  announcements: Announcement[];
  featuredTools: FeaturedTool[];
  adminSubscriptions: AdminSubscription[];
  aboutSection: AboutSectionData;
  navSettings: NavSettings;
  themeSettings: ThemeSettings;
  legalContent: LegalContent;
  guestAlertSettings: GuestAlertSettings;
  securitySettings: SecuritySettings;

  // Settings actions
  updateTool: (id: string, updates: Partial<ToolConfig>) => void;
  updateHomepageContent: (content: Partial<HomepageContent>) => void;
  updateUISettings: (settings: Partial<UISettings>) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  updateDemoVideo: (v: Partial<DemoVideo>) => void;
  setMaintenanceMode: (v: boolean) => void;
  setMaintenanceMessage: (msg: string) => void;
  setScheduledMaintenance: (s: { start: string; duration: number } | null) => void;
  setRegistrationEnabled: (v: boolean) => void;
  resetToDefaults: () => void;

  // About section actions
  updateAboutSection: (data: Partial<AboutSectionData>) => void;
  addExpertiseItem: (item: Omit<ExpertiseItem, 'id'>) => void;
  updateExpertiseItem: (id: string, updates: Partial<ExpertiseItem>) => void;
  deleteExpertiseItem: (id: string) => void;

  // User actions
  addAdminUser: (user: Omit<AdminUser, 'id'>) => void;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;

  // API key actions
  addSystemApiKey: (key: Omit<SystemApiKey, 'id'>) => void;
  updateSystemApiKey: (id: string, updates: Partial<SystemApiKey>) => void;
  deleteSystemApiKey: (id: string) => void;

  // Announcement actions
  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  // Featured tool actions
  updateFeaturedTool: (id: string, updates: Partial<FeaturedTool>) => void;

  // Subscription actions
  updateAdminSubscription: (id: string, updates: Partial<AdminSubscription>) => void;

  // New settings actions
  updateNavSettings: (patch: Partial<NavSettings>) => void;
  updateNavItem: (id: string, patch: Partial<NavItem>) => void;
  reorderNavItems: (items: NavItem[]) => void;
  updateThemeSettings: (patch: Partial<ThemeSettings>) => void;
  resetThemeSettings: () => void;
  updateLegalContent: (patch: Partial<LegalContent>) => void;
  updateLegalSection: (type: 'terms' | 'privacy', id: string, patch: Partial<LegalSection>) => void;
  addLegalSection: (type: 'terms' | 'privacy', section: Omit<LegalSection, 'id'>) => void;
  removeLegalSection: (type: 'terms' | 'privacy', id: string) => void;
  updateGuestAlertSettings: (patch: Partial<GuestAlertSettings>) => void;
  updateSecuritySettings: (patch: Partial<SecuritySettings>) => void;
  updateHeroAnimationSettings: (patch: Partial<HeroAnimationSettings>) => void;

  // CMS content (flat key-value — all UI text across the site)
  cmsContent: Record<string, string>;
  updateCMSContent: (key: string, value: string) => void;
  bulkUpdateCMSContent: (updates: Record<string, string>) => void;
  resetCMSContent: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2, 10);

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      tools: DEFAULT_TOOLS,
      homepageContent: DEFAULT_HOMEPAGE,
      uiSettings: DEFAULT_UI,
      siteSettings: DEFAULT_SITE,
      demoVideo: DEFAULT_DEMO_VIDEO,
      aboutSection: DEFAULT_ABOUT,
      navSettings: DEFAULT_NAV_SETTINGS,
      themeSettings: DEFAULT_THEME,
      legalContent: DEFAULT_LEGAL,
      guestAlertSettings: DEFAULT_GUEST_ALERTS,
      securitySettings: DEFAULT_SECURITY,
      heroAnimationSettings: DEFAULT_HERO_ANIMATION,
      maintenanceMode: false,
      maintenanceMessage: "We're performing scheduled maintenance. We'll be back shortly.",
      scheduledMaintenance: null,
      registrationEnabled: true,
      adminUsers: DEFAULT_USERS,
      systemApiKeys: DEFAULT_API_KEYS,
      announcements: DEFAULT_ANNOUNCEMENTS,
      featuredTools: DEFAULT_FEATURED_TOOLS,
      adminSubscriptions: DEFAULT_SUBSCRIPTIONS,
      cmsContent: {},

      updateTool: (id, updates) =>
        set((s) => ({ tools: s.tools.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
      updateHomepageContent: (content) =>
        set((s) => ({ homepageContent: { ...s.homepageContent, ...content } })),
      updateUISettings: (settings) =>
        set((s) => ({ uiSettings: { ...s.uiSettings, ...settings } })),
      updateSiteSettings: (settings) =>
        set((s) => ({ siteSettings: { ...s.siteSettings, ...settings } })),
      updateDemoVideo: (v) =>
        set((s) => ({ demoVideo: { ...s.demoVideo, ...v } })),
      setMaintenanceMode: (v) => set({ maintenanceMode: v }),
      setMaintenanceMessage: (msg) => set({ maintenanceMessage: msg }),
      setScheduledMaintenance: (s) => set({ scheduledMaintenance: s }),
      setRegistrationEnabled: (v) => set({ registrationEnabled: v }),
      updateAboutSection: (data) =>
        set((s) => ({ aboutSection: { ...s.aboutSection, ...data } })),
      addExpertiseItem: (item) =>
        set((s) => ({ aboutSection: { ...s.aboutSection, expertiseItems: [...s.aboutSection.expertiseItems, { ...item, id: genId() }] } })),
      updateExpertiseItem: (id, updates) =>
        set((s) => ({ aboutSection: { ...s.aboutSection, expertiseItems: s.aboutSection.expertiseItems.map((e) => (e.id === id ? { ...e, ...updates } : e)) } })),
      deleteExpertiseItem: (id) =>
        set((s) => ({ aboutSection: { ...s.aboutSection, expertiseItems: s.aboutSection.expertiseItems.filter((e) => e.id !== id) } })),

      resetToDefaults: () =>
        set({
          tools: DEFAULT_TOOLS,
          homepageContent: DEFAULT_HOMEPAGE,
          uiSettings: DEFAULT_UI,
          siteSettings: DEFAULT_SITE,
          demoVideo: DEFAULT_DEMO_VIDEO,
          aboutSection: DEFAULT_ABOUT,
          announcements: DEFAULT_ANNOUNCEMENTS,
          featuredTools: DEFAULT_FEATURED_TOOLS,
          heroAnimationSettings: DEFAULT_HERO_ANIMATION,
        }),

      addAdminUser: (user) =>
        set((s) => ({ adminUsers: [...s.adminUsers, { ...user, id: genId() }] })),
      updateAdminUser: (id, updates) =>
        set((s) => ({ adminUsers: s.adminUsers.map((u) => (u.id === id ? { ...u, ...updates } : u)) })),
      deleteAdminUser: (id) =>
        set((s) => ({ adminUsers: s.adminUsers.filter((u) => u.id !== id) })),

      addSystemApiKey: (key) =>
        set((s) => ({ systemApiKeys: [...s.systemApiKeys, { ...key, id: genId() }] })),
      updateSystemApiKey: (id, updates) =>
        set((s) => ({ systemApiKeys: s.systemApiKeys.map((k) => (k.id === id ? { ...k, ...updates } : k)) })),
      deleteSystemApiKey: (id) =>
        set((s) => ({ systemApiKeys: s.systemApiKeys.filter((k) => k.id !== id) })),

      addAnnouncement: (ann) =>
        set((s) => ({ announcements: [...s.announcements, { ...ann, id: genId() }] })),
      updateAnnouncement: (id, updates) =>
        set((s) => ({ announcements: s.announcements.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),
      deleteAnnouncement: (id) =>
        set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) })),

      updateFeaturedTool: (id, updates) =>
        set((s) => ({ featuredTools: s.featuredTools.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),

      updateAdminSubscription: (id, updates) =>
        set((s) => ({ adminSubscriptions: s.adminSubscriptions.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)) })),

      updateNavSettings: (patch) =>
        set((s) => ({ navSettings: { ...s.navSettings, ...patch } })),
      updateNavItem: (id, patch) =>
        set((s) => ({ navSettings: { ...s.navSettings, items: s.navSettings.items.map(i => i.id === id ? { ...i, ...patch } : i) } })),
      reorderNavItems: (items) =>
        set((s) => ({ navSettings: { ...s.navSettings, items } })),
      updateThemeSettings: (patch) =>
        set((s) => ({ themeSettings: { ...s.themeSettings, ...patch } })),
      resetThemeSettings: () =>
        set({ themeSettings: DEFAULT_THEME }),
      updateLegalContent: (patch) =>
        set((s) => ({ legalContent: { ...s.legalContent, ...patch } })),
      updateLegalSection: (type, id, patch) =>
        set((s) => {
          const key = type === 'terms' ? 'termsSections' : 'privacySections';
          return { legalContent: { ...s.legalContent, [key]: (s.legalContent[key] as LegalSection[]).map(sec => sec.id === id ? { ...sec, ...patch } : sec) } };
        }),
      addLegalSection: (type, section) =>
        set((s) => {
          const key = type === 'terms' ? 'termsSections' : 'privacySections';
          const newSec: LegalSection = { ...section, id: genId() };
          return { legalContent: { ...s.legalContent, [key]: [...(s.legalContent[key] as LegalSection[]), newSec] } };
        }),
      removeLegalSection: (type, id) =>
        set((s) => {
          const key = type === 'terms' ? 'termsSections' : 'privacySections';
          return { legalContent: { ...s.legalContent, [key]: (s.legalContent[key] as LegalSection[]).filter(sec => sec.id !== id) } };
        }),
      updateGuestAlertSettings: (patch) =>
        set((s) => ({ guestAlertSettings: { ...s.guestAlertSettings, ...patch } })),
      updateSecuritySettings: (patch) =>
        set((s) => ({ securitySettings: { ...s.securitySettings, ...patch } })),
      updateHeroAnimationSettings: (patch) =>
        set((s) => ({ heroAnimationSettings: { ...s.heroAnimationSettings, ...patch } })),

      updateCMSContent: (key, value) =>
        set((s) => ({ cmsContent: { ...s.cmsContent, [key]: value } })),
      bulkUpdateCMSContent: (updates) =>
        set((s) => ({ cmsContent: { ...s.cmsContent, ...updates } })),
      resetCMSContent: () =>
        set({ cmsContent: {} }),
    }),
    {
      name: 'pixelmind-admin-storage',
      version: 6,
      migrate: (old: any, fromVersion: number) => {
        if (fromVersion < 2 && old?.systemApiKeys) {
          old.systemApiKeys = (old.systemApiKeys as any[]).filter(
            k => !['1', '2', '3', '4'].includes(k.id)
          );
        }
        if (fromVersion < 3) {
          if (!old.navSettings)         old.navSettings         = DEFAULT_NAV_SETTINGS;
          if (!old.themeSettings)       old.themeSettings       = DEFAULT_THEME;
          if (!old.legalContent)        old.legalContent        = DEFAULT_LEGAL;
          if (!old.guestAlertSettings)  old.guestAlertSettings  = DEFAULT_GUEST_ALERTS;
          if (!old.securitySettings)    old.securitySettings    = DEFAULT_SECURITY;
        }
        if (fromVersion < 4) {
          if (!old.heroAnimationSettings) old.heroAnimationSettings = DEFAULT_HERO_ANIMATION;
        }
        if (fromVersion < 5) {
          if (!old.homepageContent) old.homepageContent = DEFAULT_HOMEPAGE;
          if (!old.homepageContent.heroMicroLabel) old.homepageContent.heroMicroLabel = DEFAULT_HOMEPAGE.heroMicroLabel;
          if (!old.homepageContent.heroTitleLine1) old.homepageContent.heroTitleLine1 = DEFAULT_HOMEPAGE.heroTitleLine1;
          if (!old.homepageContent.heroTitleLine2) old.homepageContent.heroTitleLine2 = DEFAULT_HOMEPAGE.heroTitleLine2;
        }
        if (fromVersion < 6) {
          if (!old.cmsContent) old.cmsContent = {};
        }
        return old;
      },
    }
  )
);
