import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { useBillingStore, Plan } from '../../store/useBillingStore';
import { useStore } from '../../store/useStore';
import {
  Check, X, Zap, Star, Crown, ArrowRight, ChevronDown, ChevronUp,
  Sparkles, Shield, Clock, Headphones, Users, CreditCard, Copy,
} from 'lucide-react';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

// ─── Max-plan promo ───────────────────────────────────────────────────────────

const PROMO_END = new Date('2027-06-20T23:59:59+06:00'); // Bangladesh Standard Time

function getTimeLeft() {
  const diff = PROMO_END.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-xl bg-black/30 border border-white/15 flex items-center justify-center backdrop-blur-sm">
        <span className="text-2xl font-black text-white tabular-nums leading-none">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] font-bold text-amber-200/70 uppercase tracking-widest mt-1.5">{label}</span>
    </div>
  );
}

// ─── Plan static config ───────────────────────────────────────────────────────

const PLAN_VISUAL: Record<string, {
  gradient: string;
  color: string;
  icon: React.ReactNode;
  monthlyCta: string;
  yearlyCta: string;
  monthlyBadge: string | null;
  yearlyBadge: string | null;
  monthlySubtitle: string;
  yearlySubtitle: string;
  monthlyFeatures: string[];
  yearlyFeatures: string[];
}> = {
  free: {
    gradient: 'from-emerald-500 to-teal-400',
    color: '#10B981',
    icon: <Zap size={18} className="text-white" />,
    monthlyCta: 'Start for Free',
    yearlyCta: 'Start for Free',
    monthlyBadge: null,
    yearlyBadge: null,
    monthlySubtitle: 'Everything you need to get started. No credit card.',
    yearlySubtitle: 'Always free — no commitment required.',
    monthlyFeatures: [
      '500 credits / month (auto reset)',
      'All core tools access',
      'Personal API key support',
      'Basic AI generation quality',
      'API management dashboard',
      'Community support',
    ],
    yearlyFeatures: [
      '500 credits / month for 12 months',
      'All core tools access',
      'Personal API key support',
      'API management dashboard',
      'Community support',
    ],
  },
  pro: {
    gradient: 'from-[#6366F1] to-[#8B5CF6]',
    color: '#6366F1',
    icon: <Star size={18} className="text-white" />,
    monthlyCta: 'Get Started with Pro',
    yearlyCta: 'Get Pro — Best Annual',
    monthlyBadge: 'Most Popular',
    yearlyBadge: 'Best Value',
    monthlySubtitle: 'For individuals and creators who need more power.',
    yearlySubtitle: '2 months FREE compared to monthly billing.',
    monthlyFeatures: [
      '5,000 credits / month',
      'Platform AI API — no key needed',
      'High-quality AI generation',
      'Priority processing queue',
      'Generation history & saved projects',
      'Advanced AI features & prompts',
      'Multiple export formats',
      'Email + chat support',
    ],
    yearlyFeatures: [
      'All Pro monthly features included',
      '2 months FREE vs monthly billing',
      'Priority billing support',
      'Early access to new Pro features',
    ],
  },
  max: {
    gradient: 'from-amber-500 to-orange-400',
    color: '#F59E0B',
    icon: <Crown size={18} className="text-white" />,
    monthlyCta: 'Go Max',
    yearlyCta: 'Go Max — Save More',
    monthlyBadge: null,
    yearlyBadge: 'Best Annual',
    monthlySubtitle: 'For professionals who need maximum scale and power.',
    yearlySubtitle: 'The ultimate annual pack — maximum savings.',
    monthlyFeatures: [
      'Unlimited credits / month',
      'Everything in Pro, plus:',
      'VIP priority processing queue',
      'Up to 5 team members',
      'Full commercial usage license',
      'Advanced automation tools',
      'Premium AI model access',
      '24/7 VIP dedicated support',
    ],
    yearlyFeatures: [
      'All Max monthly features included',
      'Ultra-fast VIP processing channels',
      'Full team sharing & collaboration',
      'Direct VIP support line',
      'Maximum annual savings',
    ],
  },
};

// ─── Local plan type ──────────────────────────────────────────────────────────

interface LocalPlan {
  id: string;
  cycle: 'monthly' | 'yearly';
  name: string;
  subtitle: string;
  originalBDT: number;
  priceBDT: number;
  discountPct: number;
  badge: string | null;
  cta: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
  features: string[];
  creditsPerMonth: number;
  priceSuffix: string;           // '/ mo' always for paid plans
  annualBilledBDT: number | null; // yearly total for the "billed annually" note
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCredits(n: number): string {
  if (n === -1) return 'Unlimited credits / mo';
  return `${n.toLocaleString()} credits / mo`;
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: LocalPlan;
  currency: 'BDT' | 'USD';
  rate: number;
  onSelect: (plan: LocalPlan) => void;
  currentPlanId?: string;
  isLoggedIn: boolean;
}

function PlanCard({ plan, currency, rate, onSelect, currentPlanId, isLoggedIn }: PlanCardProps) {
  const isFree        = plan.priceBDT === 0;
  const isFeatured    = plan.badge !== null;
  const isCurrentPlan = currentPlanId === plan.id;
  const symbol = currency === 'USD' ? '$' : '৳';

  const fmt = (bdt: number) =>
    currency === 'USD'
      ? `${symbol}${(bdt / rate).toFixed(2)}`
      : `${symbol}${bdt.toLocaleString('en-BD')}`;

  const displayName = { free: 'Starter', pro: 'Pro', max: 'Max' }[plan.id] ?? plan.name;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl bg-white dark:bg-[#131635] transition-all duration-300',
        isFeatured
          ? 'border-2 border-[#6366F1] shadow-2xl shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30'
          : 'border border-gray-200 dark:border-[#232650] shadow-sm hover:shadow-md'
      )}
    >
      {/* Floating badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-full text-[11px] font-extrabold text-white tracking-wide shadow-lg"
          style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 20px rgba(99,102,241,0.45)' }}>
          ★ {plan.badge}
        </div>
      )}

      {/* Coloured top accent line */}
      <div className={cn('h-1 w-full rounded-t-2xl bg-gradient-to-r', plan.gradient)} />

      <div className="p-7 flex flex-col flex-1">

        {/* Icon + name + tagline */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-md', plan.gradient)}>
            {plan.icon}
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{displayName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug max-w-[220px]">{plan.subtitle}</p>
          </div>
        </div>

        {/* Price block */}
        <div className="mb-5 pb-5 border-b border-gray-100 dark:border-[#1e2347]">
          {isFree ? (
            <div>
              <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Free</span>
              <p className="text-xs text-gray-400 mt-1.5">No credit card required · Ever</p>
            </div>
          ) : (
            <div>
              {plan.originalBDT > plan.priceBDT && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm text-gray-400 line-through">{fmt(plan.originalBDT)}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {plan.discountPct}% OFF
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{fmt(plan.priceBDT)}</span>
                <span className="text-sm text-gray-400 font-medium">{plan.priceSuffix}</span>
              </div>
              {/* Annual plan: show "billed annually as ৳X" note */}
              {plan.annualBilledBDT !== null && (
                <p className="text-xs text-gray-400 mt-1">
                  Billed annually · {fmt(plan.annualBilledBDT)} / year
                </p>
              )}
              {currency === 'USD' && plan.annualBilledBDT === null && (
                <p className="text-xs text-gray-400 mt-1">≈ ৳{plan.priceBDT.toLocaleString('en-BD')} BDT</p>
              )}
            </div>
          )}

          {/* Credits chip */}
          <div
            className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ background: `${plan.color}14`, color: plan.color }}
          >
            <Zap size={11} />
            {formatCredits(plan.creditsPerMonth)}
          </div>
        </div>

        {/* Feature list */}
        <ul className="space-y-2.5 flex-1 mb-7">
          {plan.features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: `${plan.color}18` }}>
                <Check size={10} style={{ color: plan.color }} />
              </div>
              <span className="text-[13px] text-gray-600 dark:text-gray-300 leading-snug">{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isCurrentPlan ? (
          <div className="w-full py-3 rounded-xl text-center text-sm font-bold bg-gray-100 dark:bg-[#1e2347] text-gray-400 cursor-default">
            ✓ Your current plan
          </div>
        ) : isFree ? (
          <Link
            to={isLoggedIn ? '/dashboard' : '/register'}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, #10B981, #059669)` }}
          >
            {plan.cta} <ArrowRight size={14} />
          </Link>
        ) : isFeatured ? (
          <button
            onClick={() => isLoggedIn ? onSelect(plan) : undefined}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[#6366F1]/30"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
          >
            {!isLoggedIn
              ? <Link to="/register" className="flex items-center gap-2 w-full justify-center">{plan.cta} <ArrowRight size={14} /></Link>
              : <>{plan.cta} <ArrowRight size={14} /></>
            }
          </button>
        ) : (
          <button
            onClick={() => isLoggedIn ? onSelect(plan) : undefined}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 hover:text-white active:scale-[0.98]"
            style={{ borderColor: plan.color, color: plan.color }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = plan.color;
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '';
              (e.currentTarget as HTMLButtonElement).style.color = plan.color;
            }}
          >
            {!isLoggedIn
              ? <Link to="/register" className="flex items-center gap-2 w-full justify-center">{plan.cta} <ArrowRight size={14} /></Link>
              : <>{plan.cta} <ArrowRight size={14} /></>
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ = [
  { q: 'Do I need a credit card to start?', a: 'No. The Free plan requires no payment information. Just sign up and start using the tools with your own API keys.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel your subscription at any time from your billing page. You retain access until the end of your current billing period.' },
  { q: 'What payment methods are accepted?', a: 'Bangladesh: bKash, Nagad, Rocket, Bank Transfer. International: Payoneer, Stripe (Card), PayPal.' },
  { q: 'What happens if I downgrade?', a: 'Your generated content is preserved. You lose access to platform APIs and premium features at the next billing cycle.' },
  { q: 'Can I switch plans mid-cycle?', a: 'Yes. Upgrades take effect immediately. Downgrades apply at your next billing date.' },
  { q: 'Is there a free trial for paid plans?', a: 'Contact us to arrange a trial. The Free plan is a great way to evaluate the platform before committing.' },
];

// ─── Comparison table ─────────────────────────────────────────────────────────

const COMPARISON: { feature: string; free: boolean | string; pro: boolean | string; max: boolean | string }[] = [
  { feature: 'Monthly credits',              free: '500',   pro: '5,000', max: 'Unlimited'  },
  { feature: 'All tools access',             free: true,    pro: true,    max: true         },
  { feature: 'Personal API keys',            free: true,    pro: true,    max: true         },
  { feature: 'Platform API (no key needed)', free: false,   pro: true,    max: true         },
  { feature: 'AI generation quality',        free: 'Basic', pro: 'High',  max: 'Premium'    },
  { feature: 'Processing priority',          free: 'Low',   pro: 'High',  max: 'VIP'        },
  { feature: 'Generation history',           free: false,   pro: true,    max: true         },
  { feature: 'Saved projects',               free: false,   pro: true,    max: true         },
  { feature: 'Advanced AI features',         free: false,   pro: true,    max: true         },
  { feature: 'Multiple export formats',      free: false,   pro: true,    max: true         },
  { feature: 'Support level',                free: 'Basic', pro: 'Email', max: 'VIP 24/7'  },
  { feature: 'Team members',                 free: false,   pro: false,   max: '5'          },
  { feature: 'Commercial license',           free: false,   pro: false,   max: true         },
  { feature: 'Automation tools',             free: false,   pro: false,   max: true         },
];

function CompCell({ val }: { val: boolean | string }) {
  if (val === true)  return <Check size={15} className="text-emerald-500 mx-auto" />;
  if (val === false) return <X size={13} className="text-gray-300 dark:text-gray-600 mx-auto" />;
  return <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{val}</span>;
}

// ─── How to Pay ───────────────────────────────────────────────────────────────

function HowToPaySection() {
  const { paymentMethods } = useBillingStore();
  const enabled  = paymentMethods.filter(m => m.isEnabled);
  const local    = enabled.filter(m => m.category === 'local');
  const intl     = enabled.filter(m => m.category === 'international');
  if (enabled.length === 0) return null;

  const getNum = (m: (typeof paymentMethods)[0]) =>
    m.credentials.number || m.credentials.email || m.credentials.accountNumber || '';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const renderMethod = (m: (typeof paymentMethods)[0]) => {
    const num = getNum(m);
    return (
      <div key={m.id} className="flex items-center gap-3.5 p-4 rounded-xl bg-[#0d1030] border border-[#232650] hover:border-[#6366F1]/40 transition-colors">
        <span className="text-2xl flex-shrink-0">{m.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{m.label}</p>
          {num ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-bold text-[#A5B4FC] text-sm tracking-wider truncate">{num}</span>
              <button onClick={() => handleCopy(num)} className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
                <Copy size={12} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">Contact admin</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="max-w-4xl mx-auto px-6 pb-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <CreditCard size={16} className="text-[#6366F1]" />
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">How to Pay</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manual payments verified within a few hours on business days</p>
      </div>

      <div className="rounded-2xl border border-[#232650] bg-[#131635] overflow-hidden">
        <div className="p-7">
          <div className="grid sm:grid-cols-2 gap-6 mb-7">
            {local.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">🇧🇩 Bangladesh</p>
                <div className="space-y-2">{local.map(renderMethod)}</div>
              </div>
            )}
            {intl.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">🌐 International</p>
                <div className="space-y-2">{intl.map(renderMethod)}</div>
              </div>
            )}
          </div>

          <div className="border-t border-[#232650] pt-6">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Payment steps</p>
            <ol className="grid sm:grid-cols-2 gap-3">
              {[
                'Select your plan and click the button',
                'Send the exact amount to the number above',
                'Note your Transaction ID / Reference',
                'Enter your TX ID in the checkout form',
                'Admin activates your plan within a few hours',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full border border-[#6366F1]/40 text-[#6366F1] text-[11px] font-black flex items-center justify-center bg-[#6366F1]/10">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300 leading-snug pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const PricingPage: React.FC = () => {
  const { currencySettings, plans: storePlans } = useBillingStore();
  const { isAuthenticated, user } = useStore();
  const navigate = useNavigate();

  // BDT is the default — respect admin override on top of it
  const [currency, setCurrency]        = useState<'BDT' | 'USD'>('BDT');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [openFaq, setOpenFaq]           = useState<number | null>(null);
  const [timeLeft, setTimeLeft]         = useState(getTimeLeft());
  const isPromoActive                   = timeLeft !== null;

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (currencySettings.adminOverride !== 'none') {
      setCurrency(currencySettings.adminOverride as 'BDT' | 'USD');
    }
    // autoDetect is intentionally not applied — BDT is the business default
  }, [currencySettings]);

  const activePlans = useMemo<LocalPlan[]>(() => {
    return storePlans
      .filter(p => p.isEnabled)
      .map(p => {
        const v          = PLAN_VISUAL[p.id];
        const isMonthly  = billingCycle === 'monthly';
        const isPaidPlan = p.id === 'pro' || p.id === 'max';

        // Base monthly original from store (used as the reference price)
        const baseMonthly = p.monthlyOriginalBDT || p.monthlyPriceBDT;

        let finalOriginal: number;
        let finalPrice:    number;
        let finalDiscount: number;
        let priceSuffix:   string;
        let annualBilledBDT: number | null = null;

        if (!isPaidPlan) {
          // Free plan — no overrides
          const rawOrig  = isMonthly ? p.monthlyOriginalBDT : p.yearlyOriginalBDT;
          const rawPrice = isMonthly ? p.monthlyPriceBDT    : p.yearlyPriceBDT;
          finalOriginal  = rawOrig;
          finalPrice     = rawPrice;
          finalDiscount  = rawOrig > 0 ? Math.round((1 - rawPrice / rawOrig) * 100) : 0;
          priceSuffix    = isMonthly ? '/ mo' : '/ yr';
        } else if (isMonthly) {
          // Pro & Max monthly: 50% off (promo active until June 2027)
          finalOriginal  = baseMonthly;
          finalPrice     = Math.round(baseMonthly * 0.5);
          finalDiscount  = 50;
          priceSuffix    = '/ mo';
        } else {
          // Pro & Max annual: 27% off the monthly base, shown as per-month rate
          const monthlyRate = Math.round(baseMonthly * 0.73);
          finalOriginal     = baseMonthly;        // "was" = regular monthly price
          finalPrice        = monthlyRate;         // discounted monthly rate
          finalDiscount     = 27;
          priceSuffix       = '/ mo';
          annualBilledBDT   = monthlyRate * 12;   // total billed yearly
        }

        return {
          id:             p.id,
          cycle:          billingCycle,
          name:           p.displayName,
          subtitle:       isMonthly ? (v?.monthlySubtitle ?? p.tagline) : (v?.yearlySubtitle ?? p.tagline),
          originalBDT:    finalOriginal,
          priceBDT:       finalPrice,
          discountPct:    finalDiscount,
          badge:          isMonthly ? (v?.monthlyBadge ?? null) : (v?.yearlyBadge ?? null),
          cta:            isMonthly ? (v?.monthlyCta ?? `Get ${p.displayName}`) : (v?.yearlyCta ?? `Get ${p.displayName} Yearly`),
          color:          v?.color ?? p.color,
          gradient:       v?.gradient ?? 'from-gray-400 to-gray-600',
          icon:           v?.icon ?? <Star size={18} className="text-white" />,
          features:       isMonthly ? (v?.monthlyFeatures ?? []) : (v?.yearlyFeatures ?? []),
          creditsPerMonth: p.creditsPerMonth,
          priceSuffix,
          annualBilledBDT,
        };
      });
  }, [storePlans, billingCycle]);

  // Annual discount is always 27% for Pro & Max
  const yearlySavePct = 27;

  const handleSelectPlan = (localPlan: LocalPlan) => {
    if (!isAuthenticated) { navigate('/register'); return; }
    const storePlan = storePlans.find(p => p.id === localPlan.id);
    setSelectedPlan(
      storePlan
        ? { ...storePlan, priceBDT: localPlan.priceBDT, billingCycle: localPlan.cycle }
        : {
            id: localPlan.id,
            name: localPlan.id,
            displayName: localPlan.name,
            tagline: localPlan.subtitle,
            priceBDT: localPlan.priceBDT,
            billingCycle: localPlan.cycle,
            creditsPerMonth: localPlan.creditsPerMonth,
            monthlyPriceBDT:    localPlan.cycle === 'monthly' ? localPlan.priceBDT    : 0,
            monthlyOriginalBDT: localPlan.cycle === 'monthly' ? localPlan.originalBDT : 0,
            yearlyPriceBDT:     localPlan.cycle === 'yearly'  ? localPlan.priceBDT    : 0,
            yearlyOriginalBDT:  localPlan.cycle === 'yearly'  ? localPlan.originalBDT : 0,
            maxGenerationsPerDay: -1,
            maxTeamMembers: localPlan.id === 'max' ? 5 : 0,
            platformApiAccess: true,
            isPopular: localPlan.badge === 'Most Popular',
            isEnabled: true,
            color: localPlan.color,
            badge: localPlan.badge ?? undefined,
            features: localPlan.features.map(f => ({ text: f, included: true })),
          }
    );
  };

  return (
    <>
      <PublicNavbar />

      <div className="min-h-screen bg-white dark:bg-[#0d1030]">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative bg-[#0d1030] pt-32 pb-16 overflow-hidden">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#6366F1]/10 rounded-full blur-[100px]" />
            <div className="absolute top-20 right-0 w-96 h-96 bg-[#8B5CF6]/8 rounded-full blur-[80px]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 text-[#A5B4FC] text-xs font-bold mb-6">
              <Sparkles size={12} /> Simple, transparent pricing
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-white mb-4">
              Plans for every <br />
              <span className="bg-gradient-to-r from-[#A5B4FC] via-[#8B5CF6] to-[#C4B5FD] bg-clip-text text-transparent">
                stage of growth
              </span>
            </h1>
            <p className="text-[#71717A] text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Start free and upgrade when you're ready. All prices in BDT — no hidden fees.
            </p>

            {/* Controls row */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Billing cycle toggle */}
              <div className="relative inline-flex items-center p-1 rounded-xl bg-[#191c40] border border-[#232650]">
                <div
                  className={cn(
                    'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-250',
                    billingCycle === 'monthly' ? 'left-1 bg-[#6366F1]' : 'left-[calc(50%+3px)] bg-[#6366F1]'
                  )}
                  style={{ boxShadow: '0 2px 12px rgba(99,102,241,0.45)' }}
                />
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={cn('relative z-10 px-5 py-2 text-sm font-semibold transition-colors rounded-lg',
                    billingCycle === 'monthly' ? 'text-white' : 'text-gray-400 hover:text-gray-200')}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={cn('relative z-10 px-5 py-2 text-sm font-semibold transition-colors rounded-lg flex items-center gap-2',
                    billingCycle === 'yearly' ? 'text-white' : 'text-gray-400 hover:text-gray-200')}
                >
                  Annual
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white">
                    −{yearlySavePct}%
                  </span>
                </button>
              </div>

              {/* Currency toggle */}
              <div className="inline-flex items-center p-1 rounded-xl bg-[#191c40] border border-[#232650]">
                {(['BDT', 'USD'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                      currency === c
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    )}
                  >
                    {c === 'BDT' ? '৳ BDT' : '$ USD'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Promo banner ─────────────────────────────────────────────────── */}
        {isPromoActive && timeLeft && (
          <section className="max-w-5xl mx-auto px-6 pt-10 pb-2">
            <div className="relative overflow-hidden rounded-2xl">
              {/* Layered background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#92400E] via-[#B45309] to-[#D97706]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />

              {/* Decorative large "50%" watermark */}
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-[160px] font-black text-white/8 leading-none select-none pointer-events-none">
                50%
              </div>
              {/* Corner glows */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative px-7 py-7 flex flex-col lg:flex-row items-center gap-7">

                {/* Left — content */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  {/* Crown icon */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-sm">
                    <Crown size={30} className="text-amber-200" />
                  </div>

                  <div className="min-w-0">
                    {/* Badge row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/25 text-white text-[11px] font-black tracking-widest uppercase">
                        <Sparkles size={10} /> Limited Time
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white text-amber-700 text-[11px] font-black tracking-wider uppercase">
                        Ends 20 June 2027
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      Pro &amp; Max Monthly — <span className="text-amber-200">50% OFF</span>
                    </h3>
                    <p className="text-amber-100/80 text-sm mt-1 leading-snug">
                      Monthly packages at half price · Annual packages at 27% off. Offer expires on the deadline.
                    </p>
                  </div>
                </div>

                {/* Right — countdown */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <p className="text-amber-200/70 text-[11px] font-bold uppercase tracking-widest">Offer ends in</p>
                  <div className="flex items-end gap-2.5">
                    <CountdownBox value={timeLeft.days}    label="Days" />
                    <span className="text-white/50 text-2xl font-black pb-5 leading-none">:</span>
                    <CountdownBox value={timeLeft.hours}   label="Hrs" />
                    <span className="text-white/50 text-2xl font-black pb-5 leading-none">:</span>
                    <CountdownBox value={timeLeft.minutes} label="Min" />
                    <span className="text-white/50 text-2xl font-black pb-5 leading-none">:</span>
                    <CountdownBox value={timeLeft.seconds} label="Sec" />
                  </div>
                </div>

              </div>

              {/* Bottom highlight strip */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 opacity-60" />
            </div>
          </section>
        )}

        {/* ── Plan cards ────────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-start">
            {activePlans.map(plan => (
              <PlanCard
                key={`${plan.id}-${plan.cycle}`}
                plan={plan}
                currency={currency}
                rate={currencySettings.bdtToUsdRate}
                onSelect={handleSelectPlan}
                currentPlanId={isAuthenticated ? user?.plan : undefined}
                isLoggedIn={isAuthenticated}
              />
            ))}
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12 pt-8 border-t border-gray-100 dark:border-[#1e2347]">
            {[
              { icon: <Shield size={13} />, text: 'Secure payments' },
              { icon: <Clock size={13} />, text: 'Cancel anytime' },
              { icon: <Headphones size={13} />, text: 'Priority support on paid plans' },
              { icon: <Users size={13} />, text: 'Team features on Max' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#191c40] border border-gray-100 dark:border-[#232650]">
                <span className="text-[#6366F1]">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </section>

        {/* ── How to Pay ────────────────────────────────────────────────────── */}
        <HowToPaySection />

        {/* ── Comparison table ──────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Compare all features</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">See exactly what's included in each plan</p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-[#232650] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 bg-gray-50 dark:bg-[#191c40] border-b border-gray-200 dark:border-[#232650]">
              <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Feature</div>
              {[
                { label: 'Starter', color: '#10B981' },
                { label: 'Pro',     color: '#6366F1' },
                { label: 'Max',     color: '#F59E0B' },
              ].map(({ label, color }, i) => (
                <div key={label} className={cn('p-4 text-center', i === 1 && 'bg-[#6366F1]/8 dark:bg-[#6366F1]/12')}>
                  <span className="text-sm font-extrabold" style={{ color }}>{label}</span>
                </div>
              ))}
            </div>

            {COMPARISON.map((row, i) => (
              <div
                key={i}
                className={cn(
                  'grid grid-cols-4 border-t border-gray-100 dark:border-[#232650]/50',
                  i % 2 === 0 ? 'bg-white dark:bg-[#131635]' : 'bg-gray-50/60 dark:bg-[#191c40]/25'
                )}
              >
                <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.feature}</div>
                <div className="px-4 py-3 flex items-center justify-center"><CompCell val={row.free} /></div>
                <div className="px-4 py-3 flex items-center justify-center bg-[#6366F1]/5 dark:bg-[#6366F1]/8"><CompCell val={row.pro} /></div>
                <div className="px-4 py-3 flex items-center justify-center"><CompCell val={row.max} /></div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="max-w-2xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#131635] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-[#191c40] transition-colors gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={14} className="text-[#6366F1] flex-shrink-0" />
                    : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 pt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-[#232650]">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <div className="relative rounded-2xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[#0d1030]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/30 via-transparent to-[#8B5CF6]/20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/15 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8B5CF6]/15 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />

            <div className="relative px-8 py-14 text-center">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                Start building today
              </h2>
              <p className="text-[#71717A] mb-8 max-w-md mx-auto text-sm leading-relaxed">
                Join thousands of creators using PixelMind AI. Free forever — no credit card needed.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="px-7 py-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-bold transition-all shadow-xl shadow-[#6366F1]/30 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Create free account <ArrowRight size={14} />
                </Link>
                <Link
                  to="/tools/image-to-prompt"
                  className="px-7 py-3 rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-sm font-semibold transition-all hover:-translate-y-0.5"
                >
                  Try without account
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>

      <Footer />

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          currency={currency}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </>
  );
};
