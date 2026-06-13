import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminStore, AdminSubscription } from '../../store/useAdminStore';
import { CreditCard, TrendingUp, Users, DollarSign, Search, ChevronDown, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  { name: 'Free',       value: 'free',       price: 0,  credits: 1000,  color: '#94a3b8' },
  { name: 'Pro',        value: 'pro',        price: 29, credits: 5000,  color: '#6366F1' },
  { name: 'Enterprise', value: 'enterprise', price: 99, credits: 99999, color: '#8B5CF6' },
];

export const SubscriptionsPage: React.FC = () => {
  const { adminSubscriptions, updateAdminSubscription } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [planModal, setPlanModal] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<AdminSubscription['plan']>('free');

  const filtered = adminSubscriptions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.userName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || s.plan === filter || s.status === filter;
    return matchSearch && matchFilter;
  });

  const monthlyRevenue = adminSubscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0);
  const activeSubs = adminSubscriptions.filter(s => s.status === 'active').length;

  const openPlanModal = (sub: AdminSubscription) => { setNewPlan(sub.plan); setPlanModal(sub.id); };
  const closePlanModal = () => setPlanModal(null);

  const applyPlan = () => {
    if (!planModal) return;
    const planInfo = PLANS.find(p => p.value === newPlan)!;
    updateAdminSubscription(planModal, {
      plan: newPlan,
      amount: planInfo.price,
      creditsPerMonth: planInfo.credits,
      status: newPlan === 'free' ? 'active' : 'active',
    });
    toast.success(`Plan updated to ${planInfo.name}`);
    closePlanModal();
  };

  const handleAction = (id: string, action: 'cancel' | 'reactivate') => {
    updateAdminSubscription(id, { status: action === 'cancel' ? 'cancelled' : 'active' });
    toast.success(action === 'cancel' ? 'Subscription cancelled' : 'Subscription reactivated');
  };

  const sub = adminSubscriptions.find(s => s.id === planModal);

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscriptions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage user subscriptions and billing</p>
          </div>
          <Button icon={<DollarSign size={14} />} onClick={() => toast.success('Billing settings can be configured here.')}>
            Billing Settings
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Monthly Revenue" value={`$${monthlyRevenue}`} change="↑ Active subs" changeType="increase" icon={<TrendingUp size={20} />} color="#6366F1" />
          <StatCard title="Active Subs" value={activeSubs.toString()} change="Currently active" changeType="increase" icon={<Users size={20} />} color="#8B5CF6" />
          <StatCard title="Past Due" value={adminSubscriptions.filter(s => s.status === 'past_due').length.toString()} change="Needs attention" changeType="decrease" icon={<CreditCard size={20} />} color="#EF4444" />
          <StatCard title="Trialing" value={adminSubscriptions.filter(s => s.status === 'trialing').length.toString()} change="Active trials" changeType="neutral" icon={<CreditCard size={20} />} color="#F59E0B" />
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {PLANS.map(plan => {
            const count = adminSubscriptions.filter(s => s.plan === plan.value).length;
            return (
              <Card key={plan.name} className="text-center">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: plan.color + '20' }}>
                  <CreditCard size={20} style={{ color: plan.color }} />
                </div>
                <p className="text-xl font-bold" style={{ color: plan.color }}>{count}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                <p className="text-xs text-gray-500 mt-1">${plan.price}/mo · {plan.credits === 99999 ? '∞' : plan.credits.toLocaleString()} credits</p>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-48">
            <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={15} />} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'free', 'pro', 'enterprise', 'active', 'cancelled', 'past_due', 'trialing'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-[#6366F1] text-white' : 'bg-white dark:bg-[#191c40] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#6366F1]'}`}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EEF2FF] dark:bg-[#0d1030]">
                  {['User', 'Plan', 'Status', 'Amount', 'Cycle', 'Started', 'Next Billing', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{s.userName[0]}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.userName}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.plan === 'enterprise' ? 'purple' : s.plan === 'pro' ? 'success' : 'default'} size="sm">{s.plan}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.status === 'active' ? 'success' : s.status === 'past_due' ? 'error' : s.status === 'trialing' ? 'warning' : 'default'} size="sm">
                        {s.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{s.amount === 0 ? 'Free' : `$${s.amount}`}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{s.billingCycle}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.startDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.nextBilling}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {s.status === 'active' || s.status === 'trialing' ? (
                          <button onClick={() => handleAction(s.id, 'cancel')}
                            className="px-2 py-1 text-xs rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            Cancel
                          </button>
                        ) : s.plan !== 'free' ? (
                          <button onClick={() => handleAction(s.id, 'reactivate')}
                            className="px-2 py-1 text-xs rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                            Reactivate
                          </button>
                        ) : null}
                        <button onClick={() => openPlanModal(s)}
                          className="px-2 py-1 text-xs rounded-lg text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors flex items-center gap-1">
                          <ChevronDown size={10} /> Change Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No subscriptions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Change Plan Modal */}
      {planModal && sub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closePlanModal} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#191c40] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#232650] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Plan</h3>
              <button onClick={closePlanModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Changing plan for <strong className="text-gray-900 dark:text-white">{sub.userName}</strong></p>
            <div className="space-y-2 mb-5">
              {PLANS.map(p => (
                <button key={p.value} onClick={() => setNewPlan(p.value as AdminSubscription['plan'])}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${newPlan === p.value ? 'border-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/10' : 'border-gray-200 dark:border-gray-700 hover:border-[#6366F1]/40'}`}>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.credits === 99999 ? '∞' : p.credits.toLocaleString()} credits/mo</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: p.color }}>${p.price}/mo</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={closePlanModal}>Cancel</Button>
              <Button fullWidth icon={<Save size={14} />} onClick={applyPlan}>Apply Plan</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
