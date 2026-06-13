import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  tagline: string;
  priceBDT: number;                // active price passed to PaymentModal
  billingCycle: 'free' | 'monthly' | 'yearly';
  creditsPerMonth: number;         // -1 = unlimited
  monthlyPriceBDT: number;         // discounted monthly price shown to users
  monthlyOriginalBDT: number;      // original monthly price (strikethrough)
  yearlyPriceBDT: number;          // discounted yearly price
  yearlyOriginalBDT: number;       // original yearly price (strikethrough = 12× monthly original)
  maxGenerationsPerDay: number;    // -1 = unlimited
  maxTeamMembers: number;          // 0 = none
  platformApiAccess: boolean;
  isPopular: boolean;
  isEnabled: boolean;
  color: string;
  badge?: string;
  features: PlanFeature[];
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  applicablePlans: 'all' | string[];
  createdAt: string;
}

export type PaymentMethodType =
  | 'bkash' | 'nagad' | 'rocket' | 'bank'
  | 'payoneer' | 'stripe' | 'paypal' | 'card';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  category: 'local' | 'international';
  isEnabled: boolean;
  icon: string;
  credentials: Record<string, string>;
  instructions?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: 'BDT' | 'USD';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionRef: string;
  discountCode?: string;
  notes?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled' | 'past_due' | 'trialing';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  currency: 'BDT' | 'USD';
  paymentMethod: string;
  autoRenew: boolean;
  discountCode?: string;
}

export interface TeamMember {
  id: string;
  ownerId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'removed';
  invitedAt: string;
  joinedAt?: string;
}

export interface FeaturePermission {
  id: string;
  name: string;
  description: string;
  enabledPlans: string[];
}

export interface CurrencySettings {
  defaultCurrency: 'BDT' | 'USD';
  bdtToUsdRate: number;
  autoDetect: boolean;
  adminOverride: 'none' | 'BDT' | 'USD';
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'free',
    displayName: 'Starter',
    tagline: 'Get started with basic tools and monthly credits',
    priceBDT: 0,
    billingCycle: 'free',
    creditsPerMonth: 1000,
    monthlyPriceBDT: 0,
    monthlyOriginalBDT: 0,
    yearlyPriceBDT: 0,
    yearlyOriginalBDT: 0,
    maxGenerationsPerDay: 20,
    maxTeamMembers: 0,
    platformApiAccess: false,
    isPopular: false,
    isEnabled: true,
    color: '#10B981',
    features: [
      { text: '1,000 credits per month (auto reset)', included: true },
      { text: 'All core tools access', included: true },
      { text: 'Personal API key support', included: true },
      { text: 'Basic AI generation quality', included: true },
      { text: 'API management dashboard', included: true },
      { text: 'Standard output quality', included: true },
      { text: 'Community updates', included: true },
      { text: 'Basic support access', included: true },
      { text: 'Platform-provided APIs', included: false },
      { text: 'Priority processing', included: false },
      { text: 'Team members', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro',
    tagline: 'No API key needed — platform API included',
    priceBDT: 499,
    billingCycle: 'monthly',
    creditsPerMonth: 5000,
    monthlyPriceBDT: 499,
    monthlyOriginalBDT: 0,
    yearlyPriceBDT: 4399,
    yearlyOriginalBDT: 5988,   // 12 × ৳৪৯৯
    maxGenerationsPerDay: -1,
    maxTeamMembers: 0,
    platformApiAccess: true,
    isPopular: true,
    isEnabled: true,
    color: '#6366F1',
    badge: 'Most Popular',
    features: [
      { text: '5,000 credits per month', included: true },
      { text: 'Platform AI API — no personal key needed', included: true },
      { text: 'High-quality AI generation', included: true },
      { text: 'Priority processing queue', included: true },
      { text: 'Saved projects & generation history', included: true },
      { text: 'Advanced AI features & prompts', included: true },
      { text: 'Export in multiple formats', included: true },
      { text: 'Email + chat support', included: true },
      { text: 'Team members', included: false },
    ],
  },
  {
    id: 'max',
    name: 'max',
    displayName: 'Max',
    tagline: 'Unlimited power for teams & power users',
    priceBDT: 1749,
    billingCycle: 'monthly',
    creditsPerMonth: -1,
    monthlyPriceBDT: 1749,
    monthlyOriginalBDT: 2499,
    yearlyPriceBDT: 21999,
    yearlyOriginalBDT: 29988,  // 12 × ৳২,৪৯৯
    maxGenerationsPerDay: -1,
    maxTeamMembers: 5,
    platformApiAccess: true,
    isPopular: false,
    isEnabled: true,
    color: '#F59E0B',
    badge: 'Best Value',
    features: [
      { text: 'Unlimited credits per month', included: true },
      { text: 'Everything in Pro included', included: true },
      { text: 'Fastest processing — VIP priority queue', included: true },
      { text: 'Up to 5 team members', included: true },
      { text: 'Full commercial usage license', included: true },
      { text: 'Advanced AI automation tools', included: true },
      { text: 'Premium AI model access', included: true },
      { text: '24/7 Dedicated VIP support', included: true },
    ],
  },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bkash',
    type: 'bkash',
    label: 'bKash',
    category: 'local',
    isEnabled: true,
    icon: '💳',
    credentials: { number: '', merchantId: '', apiKey: '' },
    instructions: 'Send payment to our bKash merchant number and enter your Transaction ID.',
  },
  {
    id: 'nagad',
    type: 'nagad',
    label: 'Nagad',
    category: 'local',
    isEnabled: true,
    icon: '📱',
    credentials: { number: '', merchantId: '' },
    instructions: 'Send payment to our Nagad number and enter your Transaction ID.',
  },
  {
    id: 'rocket',
    type: 'rocket',
    label: 'Rocket',
    category: 'local',
    isEnabled: false,
    icon: '🚀',
    credentials: { number: '' },
    instructions: 'Send payment to our Rocket number and enter your Transaction ID.',
  },
  {
    id: 'bank',
    type: 'bank',
    label: 'Bank Transfer',
    category: 'local',
    isEnabled: false,
    icon: '🏦',
    credentials: { bankName: '', accountName: '', accountNumber: '', routingNumber: '', branchName: '' },
    instructions: 'Transfer to our bank account and email us the receipt.',
  },
  {
    id: 'payoneer',
    type: 'payoneer',
    label: 'Payoneer',
    category: 'international',
    isEnabled: false,
    icon: '🌐',
    credentials: { email: '' },
    instructions: 'Send payment to our Payoneer email and share the confirmation.',
  },
  {
    id: 'stripe',
    type: 'stripe',
    label: 'Card (Stripe)',
    category: 'international',
    isEnabled: false,
    icon: '💳',
    credentials: { publishableKey: '', secretKey: '', webhookSecret: '' },
    instructions: 'Pay securely with your credit or debit card via Stripe.',
  },
  {
    id: 'paypal',
    type: 'paypal',
    label: 'PayPal',
    category: 'international',
    isEnabled: false,
    icon: '🅿️',
    credentials: { clientId: '', secretKey: '', email: '' },
    instructions: 'Pay with your PayPal account or card.',
  },
];

const DEFAULT_DISCOUNT_CODES: DiscountCode[] = [
  {
    id: '1',
    code: 'LAUNCH50',
    type: 'percentage',
    value: 50,
    description: 'Special launch offer — 50% off',
    expiresAt: '2026-12-31',
    usageLimit: 100,
    usedCount: 12,
    isActive: true,
    applicablePlans: 'all',
    createdAt: '2026-06-01',
  },
  {
    id: '2',
    code: 'PRO20',
    type: 'percentage',
    value: 20,
    description: '20% off Pro plan',
    expiresAt: null,
    usageLimit: null,
    usedCount: 5,
    isActive: true,
    applicablePlans: ['pro'],
    createdAt: '2026-06-05',
  },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN001',
    userId: '10',
    userName: 'Pro User',
    userEmail: 'pro@pixelmind.ai',
    planId: 'pro',
    planName: 'Pro',
    amount: 499,
    currency: 'BDT',
    status: 'completed',
    paymentMethod: 'bKash',
    transactionRef: 'BK8X9Y2Z1',
    createdAt: '2026-06-01',
  },
  {
    id: 'TXN002',
    userId: '11',
    userName: 'Enterprise User',
    userEmail: 'enterprise@pixelmind.ai',
    planId: 'max',
    planName: 'Max',
    amount: 4900,
    currency: 'BDT',
    status: 'completed',
    paymentMethod: 'Nagad',
    transactionRef: 'NG3A7B5C2',
    createdAt: '2026-05-15',
  },
  {
    id: 'TXN003',
    userId: '2',
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    planId: 'pro',
    planName: 'Pro',
    amount: 499,
    currency: 'BDT',
    status: 'pending',
    paymentMethod: 'bKash',
    transactionRef: 'BK1M4N8P3',
    notes: 'Awaiting admin verification',
    createdAt: '2026-06-08',
  },
];

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'SUB001',
    userId: '10',
    userName: 'Pro User',
    userEmail: 'pro@pixelmind.ai',
    planId: 'pro',
    planName: 'Pro',
    status: 'active',
    startDate: '2026-06-01',
    endDate: '2026-07-01',
    nextBillingDate: '2026-07-01',
    amount: 499,
    currency: 'BDT',
    paymentMethod: 'bKash',
    autoRenew: true,
  },
  {
    id: 'SUB002',
    userId: '11',
    userName: 'Enterprise User',
    userEmail: 'enterprise@pixelmind.ai',
    planId: 'max',
    planName: 'Max',
    status: 'active',
    startDate: '2026-05-15',
    endDate: '2027-05-15',
    nextBillingDate: '2027-05-15',
    amount: 4900,
    currency: 'BDT',
    paymentMethod: 'Nagad',
    autoRenew: true,
  },
];

const DEFAULT_FEATURE_PERMISSIONS: FeaturePermission[] = [
  { id: 'ai-metadata', name: 'AI Metadata Generator', description: 'Generate SEO metadata for stock images', enabledPlans: ['free', 'pro', 'max'] },
  { id: 'image-to-prompt', name: 'Image to Prompt', description: 'Convert images to AI prompts', enabledPlans: ['free', 'pro', 'max'] },
  { id: 'content-writer', name: 'Content Writer', description: 'AI-powered content writing tool', enabledPlans: ['free', 'pro', 'max'] },
  { id: 'social-scheduler', name: 'Social Scheduler', description: 'Schedule posts across social platforms', enabledPlans: ['free', 'pro', 'max'] },
  { id: 'platform-api', name: 'Platform API Access', description: 'Use admin-configured platform APIs without a personal key', enabledPlans: ['pro', 'max'] },
  { id: 'generation-history', name: 'Generation History', description: 'Save and review past generations', enabledPlans: ['pro', 'max'] },
  { id: 'priority-processing', name: 'Priority Processing', description: 'Faster processing queue priority', enabledPlans: ['pro', 'max'] },
  { id: 'unlimited-generations', name: 'Unlimited Generations', description: 'No daily generation limit', enabledPlans: ['max'] },
  { id: 'team-features', name: 'Team Collaboration', description: 'Invite and manage team members', enabledPlans: ['max'] },
  { id: 'advanced-ai', name: 'Advanced AI Tools', description: 'Access to premium AI automation features', enabledPlans: ['pro', 'max'] },
];

const DEFAULT_CURRENCY: CurrencySettings = {
  defaultCurrency: 'BDT',
  bdtToUsdRate: 110,
  autoDetect: true,
  adminOverride: 'none',
};

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'TM001',
    ownerId: '11',
    email: 'teammate@example.com',
    name: 'Team Member',
    role: 'editor',
    status: 'active',
    invitedAt: '2026-05-16',
    joinedAt: '2026-05-17',
  },
];

// ─── Store Interface ──────────────────────────────────────────────────────────

interface BillingState {
  plans: Plan[];
  discountCodes: DiscountCode[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  teamMembers: TeamMember[];
  featurePermissions: FeaturePermission[];
  currencySettings: CurrencySettings;
  maxTeamMemberLimit: number;

  // Plans
  updatePlan: (id: string, patch: Partial<Plan>) => void;
  addPlan: (plan: Plan) => void;
  removePlan: (id: string) => void;

  // Discounts
  addDiscountCode: (code: DiscountCode) => void;
  updateDiscountCode: (id: string, patch: Partial<DiscountCode>) => void;
  removeDiscountCode: (id: string) => void;

  // Payment methods
  updatePaymentMethod: (id: string, patch: Partial<PaymentMethod>) => void;

  // Transactions
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;

  // Subscriptions
  addSubscription: (sub: Subscription) => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  cancelSubscription: (id: string) => void;

  // Team
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, patch: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  setMaxTeamMemberLimit: (n: number) => void;

  // Feature permissions
  updateFeaturePermission: (id: string, patch: Partial<FeaturePermission>) => void;

  // Currency
  updateCurrencySettings: (patch: Partial<CurrencySettings>) => void;

  // Helpers
  getPlanById: (id: string) => Plan | undefined;
  validateDiscountCode: (code: string, planId: string) => DiscountCode | null;
  convertToUSD: (bdt: number) => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      plans: DEFAULT_PLANS,
      discountCodes: DEFAULT_DISCOUNT_CODES,
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      transactions: DEFAULT_TRANSACTIONS,
      subscriptions: DEFAULT_SUBSCRIPTIONS,
      teamMembers: DEFAULT_TEAM_MEMBERS,
      featurePermissions: DEFAULT_FEATURE_PERMISSIONS,
      currencySettings: DEFAULT_CURRENCY,
      maxTeamMemberLimit: 5,

      updatePlan: (id, patch) =>
        set(s => ({ plans: s.plans.map(p => p.id === id ? { ...p, ...patch } : p) })),
      addPlan: (plan) =>
        set(s => ({ plans: [...s.plans, plan] })),
      removePlan: (id) =>
        set(s => ({ plans: s.plans.filter(p => p.id !== id) })),

      addDiscountCode: (code) =>
        set(s => ({ discountCodes: [...s.discountCodes, code] })),
      updateDiscountCode: (id, patch) =>
        set(s => ({ discountCodes: s.discountCodes.map(c => c.id === id ? { ...c, ...patch } : c) })),
      removeDiscountCode: (id) =>
        set(s => ({ discountCodes: s.discountCodes.filter(c => c.id !== id) })),

      updatePaymentMethod: (id, patch) =>
        set(s => ({ paymentMethods: s.paymentMethods.map(m => m.id === id ? { ...m, ...patch } : m) })),

      addTransaction: (tx) =>
        set(s => ({ transactions: [tx, ...s.transactions] })),
      updateTransaction: (id, patch) =>
        set(s => ({ transactions: s.transactions.map(t => t.id === id ? { ...t, ...patch } : t) })),

      addSubscription: (sub) =>
        set(s => ({ subscriptions: [sub, ...s.subscriptions] })),
      updateSubscription: (id, patch) =>
        set(s => ({ subscriptions: s.subscriptions.map(s2 => s2.id === id ? { ...s2, ...patch } : s2) })),
      cancelSubscription: (id) =>
        set(s => ({ subscriptions: s.subscriptions.map(s2 => s2.id === id ? { ...s2, status: 'cancelled', autoRenew: false } : s2) })),

      addTeamMember: (member) =>
        set(s => ({ teamMembers: [...s.teamMembers, member] })),
      updateTeamMember: (id, patch) =>
        set(s => ({ teamMembers: s.teamMembers.map(m => m.id === id ? { ...m, ...patch } : m) })),
      removeTeamMember: (id) =>
        set(s => ({ teamMembers: s.teamMembers.map(m => m.id === id ? { ...m, status: 'removed' } : m) })),
      setMaxTeamMemberLimit: (n) => set({ maxTeamMemberLimit: n }),

      updateFeaturePermission: (id, patch) =>
        set(s => ({ featurePermissions: s.featurePermissions.map(f => f.id === id ? { ...f, ...patch } : f) })),

      updateCurrencySettings: (patch) =>
        set(s => ({ currencySettings: { ...s.currencySettings, ...patch } })),

      getPlanById: (id) => get().plans.find(p => p.id === id),

      validateDiscountCode: (code, planId) => {
        const dc = get().discountCodes.find(
          c => c.code.toUpperCase() === code.toUpperCase() && c.isActive
        );
        if (!dc) return null;
        if (dc.expiresAt && new Date(dc.expiresAt) < new Date()) return null;
        if (dc.usageLimit !== null && dc.usedCount >= dc.usageLimit) return null;
        if (dc.applicablePlans !== 'all' && !dc.applicablePlans.includes(planId)) return null;
        return dc;
      },

      convertToUSD: (bdt) => {
        const rate = get().currencySettings.bdtToUsdRate;
        return Math.round((bdt / rate) * 100) / 100;
      },
    }),
    {
      name: 'pixelmind-billing-storage',
      version: 5,
      migrate: (old: any, fromVersion: number) => {
        if (fromVersion < 2) {
          // Merge new pricing/credit fields into any existing plans
          const v2patches: Record<string, Partial<Plan>> = {
            free:  { creditsPerMonth: 1000, monthlyPriceBDT: 0,    monthlyOriginalBDT: 0,    yearlyPriceBDT: 0,     yearlyOriginalBDT: 0 },
            pro:   { creditsPerMonth: 5000, monthlyPriceBDT: 349,  monthlyOriginalBDT: 499,  yearlyPriceBDT: 4399,  yearlyOriginalBDT: 5988 },
            max:   { creditsPerMonth: -1,   monthlyPriceBDT: 1749, monthlyOriginalBDT: 2499, yearlyPriceBDT: 21999, yearlyOriginalBDT: 29988 },
          };
          if (Array.isArray(old?.plans)) {
            old.plans = (old.plans as Plan[]).map(p =>
              v2patches[p.id] ? { ...p, ...v2patches[p.id] } : p
            );
          }
        }
        if (fromVersion < 3) {
          // Fix Pro monthly pricing (no discount), update all plan features
          const v3patches: Record<string, Partial<Plan>> = {
            free: {
              priceBDT: 0,
              monthlyPriceBDT: 0, monthlyOriginalBDT: 0,
              yearlyPriceBDT: 0,  yearlyOriginalBDT: 0,
              features: [
                { text: '1,000 credits per month (auto reset)', included: true },
                { text: 'All core tools access', included: true },
                { text: 'Personal API key support', included: true },
                { text: 'Basic AI generation quality', included: true },
                { text: 'API management dashboard', included: true },
                { text: 'Standard output quality', included: true },
                { text: 'Community updates', included: true },
                { text: 'Basic support access', included: true },
                { text: 'Platform-provided APIs', included: false },
                { text: 'Priority processing', included: false },
                { text: 'Team members', included: false },
              ],
            },
            pro: {
              priceBDT: 499,
              monthlyPriceBDT: 499, monthlyOriginalBDT: 0,
              yearlyPriceBDT: 4399, yearlyOriginalBDT: 5988,
              features: [
                { text: '5,000 credits per month', included: true },
                { text: 'Platform AI API — no personal key needed', included: true },
                { text: 'High-quality AI generation', included: true },
                { text: 'Priority processing queue', included: true },
                { text: 'Saved projects & generation history', included: true },
                { text: 'Advanced AI features & prompts', included: true },
                { text: 'Export in multiple formats', included: true },
                { text: 'Email + chat support', included: true },
                { text: 'Team members', included: false },
              ],
            },
            max: {
              priceBDT: 1749,
              monthlyPriceBDT: 1749, monthlyOriginalBDT: 2499,
              yearlyPriceBDT: 21999, yearlyOriginalBDT: 29988,
              features: [
                { text: 'Unlimited credits per month', included: true },
                { text: 'Everything in Pro included', included: true },
                { text: 'Fastest processing — VIP priority queue', included: true },
                { text: 'Up to 5 team members', included: true },
                { text: 'Full commercial usage license', included: true },
                { text: 'Advanced AI automation tools', included: true },
                { text: 'Premium AI model access', included: true },
                { text: '24/7 Dedicated VIP support', included: true },
              ],
            },
          };
          if (Array.isArray(old?.plans)) {
            old.plans = (old.plans as Plan[]).map(p =>
              v3patches[p.id] ? { ...p, ...v3patches[p.id] } : p
            );
          }
        }
        if (fromVersion < 4) {
          const v4patch: Partial<Plan> = {
            displayName: 'Starter',
            tagline: 'Get started with basic tools and monthly credits',
            priceBDT: 125,
            billingCycle: 'monthly',
            color: '#10B981',
            monthlyPriceBDT: 125, monthlyOriginalBDT: 0,
            yearlyPriceBDT: 999,  yearlyOriginalBDT: 1500,
          };
          if (Array.isArray(old?.plans)) {
            old.plans = (old.plans as Plan[]).map((p: Plan) =>
              p.id === 'free' ? { ...p, ...v4patch } : p
            );
          }
        }
        if (fromVersion < 5) {
          const v5patch: Partial<Plan> = {
            priceBDT: 0,
            billingCycle: 'free' as const,
            monthlyPriceBDT: 0,
            monthlyOriginalBDT: 0,
            yearlyPriceBDT: 0,
            yearlyOriginalBDT: 0,
          };
          if (Array.isArray(old?.plans)) {
            old.plans = (old.plans as Plan[]).map((p: Plan) =>
              p.id === 'free' ? { ...p, ...v5patch } : p
            );
          }
        }
        return old;
      },
    }
  )
);
