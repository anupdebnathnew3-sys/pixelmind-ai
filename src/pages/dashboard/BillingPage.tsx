import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useStore } from '../../store/useStore';
import { useBillingStore } from '../../store/useBillingStore';
import { PaymentModal } from '../../components/payment/PaymentModal';
import {
  CreditCard, Zap, CheckCircle, TrendingUp, Calendar,
  Star, Users, XCircle, Clock, ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

type TabId = 'overview' | 'plans' | 'transactions' | 'team';

export const BillingPage: React.FC = () => {
  const { user, credits } = useStore();
  const {
    plans,
    transactions,
    subscriptions,
    teamMembers,
    currencySettings,
    maxTeamMemberLimit,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<TabId>('plans');
  const [displayCurrency, setDisplayCurrency] = useState<'BDT' | 'USD'>(
    currencySettings.defaultCurrency
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const rate = currencySettings.bdtToUsdRate;

  // Same promo window as the public pricing page
  const PROMO_END_DATE = new Date('2027-06-20T23:59:59+06:00');
  const isPromoActive = PROMO_END_DATE.getTime() > Date.now();

  const activeSub = subscriptions.find(
    s => s.userId === user?.id && s.status === 'active'
  );
  const currentPlan = plans.find(p => p.id === (user?.plan ?? 'free'));
  const userTransactions = transactions.filter(t => t.userId === user?.id);

  const formatPrice = (priceBDT: number): string => {
    if (priceBDT === 0) return 'Free';
    if (displayCurrency === 'USD') {
      return `$${(priceBDT / rate).toFixed(2)}`;
    }
    return `৳${priceBDT.toLocaleString()}`;
  };

  const getPlanBadgeColor = (planId: string) => {
    const p = plans.find(pl => pl.id === planId);
    return p?.color ?? '#6B7280';
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === user?.plan) return;
    setSelectedPlanId(planId);
    setPaymentModalOpen(true);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'plans', label: 'Plans', icon: <Star size={14} /> },
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
    { id: 'transactions', label: 'Transactions', icon: <CreditCard size={14} /> },
    ...(currentPlan?.maxTeamMembers && currentPlan.maxTeamMembers > 1
      ? [{ id: 'team' as TabId, label: 'Team', icon: <Users size={14} /> }]
      : []),
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Plans</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Manage your subscription, transactions, and team
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#0d1030] rounded-xl p-1">
            {(['BDT', 'USD'] as const).map(c => (
              <button
                key={c}
                onClick={() => setDisplayCurrency(c)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  displayCurrency === c
                    ? 'bg-white dark:bg-[#191c40] text-[#6366F1] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {c === 'BDT' ? '৳ BDT' : '$ USD'}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Current Plan',
              value: currentPlan?.displayName ?? 'Free',
              sub: activeSub ? 'Active subscription' : 'No active subscription',
              icon: <Star size={18} />,
              color: currentPlan?.color ?? '#6B7280',
            },
            {
              label: 'Credits',
              value: credits.toLocaleString(),
              sub: 'Available this period',
              icon: <Zap size={18} />,
              color: '#8B5CF6',
            },
            {
              label: 'Next Renewal',
              value: activeSub
                ? new Date(activeSub.nextBillingDate).toLocaleDateString()
                : 'N/A',
              sub: activeSub?.autoRenew ? 'Auto-renew on' : 'Auto-renew off',
              icon: <Calendar size={18} />,
              color: '#F59E0B',
            },
            {
              label: 'Transactions',
              value: userTransactions.length.toString(),
              sub: `${userTransactions.filter(t => t.status === 'pending').length} pending`,
              icon: <CreditCard size={18} />,
              color: '#10B981',
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#191c40] rounded-2xl p-5 border border-gray-100 dark:border-[#232650] flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${stat.color}20` }}
              >
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white truncate">{stat.value}</p>
                <p className="text-xs text-gray-400 truncate">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#0d1030] rounded-xl p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#191c40] text-[#6366F1] shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active subscription */}
            <div className="bg-white dark:bg-[#191c40] rounded-2xl p-6 border border-gray-100 dark:border-[#232650]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Active Subscription</h2>
                {activeSub?.status && (
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', statusBadge(activeSub.status))}>
                    {activeSub.status}
                  </span>
                )}
              </div>
              {activeSub ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${getPlanBadgeColor(activeSub.planId)}20` }}
                    >
                      <Star size={18} style={{ color: getPlanBadgeColor(activeSub.planId) }} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {plans.find(p => p.id === activeSub.planId)?.displayName ?? activeSub.planId}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {plans.find(p => p.id === activeSub.planId)?.billingCycle ?? ''} billing
                      </p>
                    </div>
                  </div>
                  {[
                    { label: 'Started', value: new Date(activeSub.startDate).toLocaleDateString() },
                    { label: 'Ends', value: new Date(activeSub.endDate).toLocaleDateString() },
                    { label: 'Next billing', value: new Date(activeSub.nextBillingDate).toLocaleDateString() },
                    { label: 'Payment method', value: activeSub.paymentMethod.toUpperCase() },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="flex-1 py-2 rounded-xl bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] transition-colors flex items-center justify-center gap-1.5"
                    >
                      Change Plan <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#232650] flex items-center justify-center mx-auto mb-3">
                    <CreditCard size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No active subscription</p>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-4 py-2 rounded-xl bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] transition-colors"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="bg-white dark:bg-[#191c40] rounded-2xl p-6 border border-gray-100 dark:border-[#232650]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs text-[#6366F1] hover:underline flex items-center gap-0.5"
                >
                  View all <ChevronRight size={12} />
                </button>
              </div>
              {userTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
              ) : (
                <div className="space-y-3">
                  {userTransactions.slice(0, 4).map(txn => (
                    <div key={txn.id} className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        txn.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                        txn.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      )}>
                        {txn.status === 'completed' ? <CheckCircle size={14} className="text-emerald-600" /> :
                         txn.status === 'pending' ? <Clock size={14} className="text-amber-600" /> :
                         <XCircle size={14} className="text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {plans.find(p => p.id === txn.planId)?.displayName ?? txn.planId}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {displayCurrency === 'BDT'
                            ? `৳${txn.amount.toLocaleString()}`
                            : `$${(txn.amount / rate).toFixed(2)}`}
                        </p>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', statusBadge(txn.status))}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PLANS TAB ── */}
        {activeTab === 'plans' && (
          <div>
            {/* Promo banner */}
            {isPromoActive && (
              <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/8 border border-amber-500/25">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={15} className="text-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-amber-400">50% OFF</span>
                  <span className="text-sm text-amber-300/70"> on Pro &amp; Max monthly plans — limited time offer until 20 June 2027</span>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {plans.filter(p => p.isEnabled).map(plan => {
                const isCurrent = user?.plan === plan.id;
                const isPopular = plan.isPopular;

                // Promo pricing (display-layer only — same logic as public pricing page)
                const isPaidPromo = isPromoActive && (plan.id === 'pro' || plan.id === 'max');
                const baseBDT = plan.monthlyOriginalBDT || plan.monthlyPriceBDT || plan.priceBDT;
                const promoPriceBDT = isPaidPromo ? Math.round(baseBDT * 0.5) : plan.priceBDT;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'relative rounded-2xl border-2 overflow-hidden transition-all',
                      isCurrent
                        ? 'border-[#6366F1] shadow-xl shadow-[#6366F1]/15'
                        : 'border-gray-200 dark:border-[#232650] hover:border-[#6366F1]/40'
                    )}
                  >
                    {/* Color bar */}
                    <div className="h-1.5 w-full" style={{ background: plan.color }} />

                    {isPopular && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full">
                        {plan.badge ?? 'Popular'}
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#6366F1] text-white text-[10px] font-bold rounded-full">
                        Current
                      </div>
                    )}

                    <div className="p-6 bg-white dark:bg-[#191c40]">
                      <p className="font-bold text-lg text-gray-900 dark:text-white mt-4">{plan.displayName}</p>
                      {plan.tagline && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{plan.tagline}</p>
                      )}
                      <div className="mt-3 mb-4">
                        {/* Strikethrough original + discount badge */}
                        {isPaidPromo && (
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                              {formatPrice(baseBDT)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              50% OFF
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                            {plan.priceBDT === 0 ? 'Free' : formatPrice(promoPriceBDT)}
                          </span>
                          {plan.priceBDT > 0 && (
                            <span className="text-gray-400 text-sm">
                              /{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {plan.features.map((f, i) => (
                          <div key={i} className={cn('flex items-center gap-2.5 text-sm', !f.included && 'opacity-40')}>
                            <CheckCircle size={14} className={f.included ? 'text-emerald-500' : 'text-gray-300'} />
                            <span className="text-gray-700 dark:text-gray-300">{f.text}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isCurrent || plan.priceBDT === 0}
                        className={cn(
                          'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                          isCurrent
                            ? 'bg-gray-100 dark:bg-[#232650] text-gray-400 cursor-default'
                            : plan.priceBDT === 0
                            ? 'bg-gray-100 dark:bg-[#232650] text-gray-400 cursor-default'
                            : 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-sm shadow-[#6366F1]/25'
                        )}
                      >
                        {isCurrent ? 'Current Plan' : plan.priceBDT === 0 ? 'Free Plan' : `Upgrade to ${plan.displayName}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              Need a custom plan?{' '}
              <Link to="/contact" className="text-[#6366F1] hover:underline">Contact us</Link>
            </p>
          </div>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden">
            {userTransactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#232650] bg-gray-50 dark:bg-[#0d1030]/50">
                      {['Transaction', 'Plan', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-[#232650]">
                    {userTransactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-[#232650]/40 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white font-mono">
                          {txn.transactionRef ?? txn.id.slice(0, 10)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {plans.find(p => p.id === txn.planId)?.displayName ?? txn.planId}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          {displayCurrency === 'BDT'
                            ? `৳${txn.amount.toLocaleString()}`
                            : `$${(txn.amount / rate).toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 uppercase">
                          {txn.paymentMethod}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', statusBadge(txn.status))}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TEAM TAB ── */}
        {activeTab === 'team' && (
          <div className="bg-white dark:bg-[#191c40] rounded-2xl p-6 border border-gray-100 dark:border-[#232650]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Team Members</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {teamMembers.length}/{maxTeamMemberLimit} seats used
                </p>
              </div>
              <button
                onClick={() => toast('Team invitations coming soon!', { icon: '📧' })}
                className="px-3 py-1.5 rounded-xl bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] transition-colors"
              >
                + Invite Member
              </button>
            </div>
            {teamMembers.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No team members yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 dark:border-[#232650] hover:bg-gray-50 dark:hover:bg-[#232650]/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] font-bold text-sm flex-shrink-0">
                      {member.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-xs text-gray-400 truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                        member.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        member.role === 'editor' ? 'bg-[#6366F1]/10 text-[#6366F1]' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {member.role}
                      </span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusBadge(member.status))}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment modal */}
      {paymentModalOpen && selectedPlanId && (
        <PaymentModal
          plan={plans.find(p => p.id === selectedPlanId)!}
          currency={displayCurrency}
          onClose={() => { setPaymentModalOpen(false); setSelectedPlanId(null); }}
        />
      )}
    </DashboardLayout>
  );
};
