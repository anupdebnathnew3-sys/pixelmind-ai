import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useBillingStore, Transaction, Subscription } from '../../store/useBillingStore';
import {
  CreditCard, RefreshCw, CheckCircle, XCircle, Clock, Ban,
  ChevronDown, Activity, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'transactions' | 'subscriptions';
type TxStatus = 'all' | Transaction['status'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const txStatusBadge: Record<Transaction['status'], string> = {
  completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  pending:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  failed:    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  refunded:  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

const subStatusBadge: Record<Subscription['status'], string> = {
  active:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  expired:   'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  past_due:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  trialing:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
};

const StatusIcon: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  if (status === 'completed') return <CheckCircle size={13} className="text-emerald-500" />;
  if (status === 'pending') return <Clock size={13} className="text-amber-500" />;
  if (status === 'failed') return <XCircle size={13} className="text-red-500" />;
  return <RefreshCw size={13} className="text-gray-400" />;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const BillingManagerPage: React.FC = () => {
  const {
    transactions, subscriptions,
    updateTransaction, updateSubscription, cancelSubscription,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [txFilter, setTxFilter] = useState<TxStatus>('all');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // ── Transaction actions ──────────────────────────────────────────────────────

  const handleApprove = (id: string) => {
    updateTransaction(id, { status: 'completed' });
    toast.success('Transaction marked as completed');
  };

  const handleRefund = (id: string) => {
    updateTransaction(id, { status: 'refunded' });
    toast.success('Transaction marked as refunded');
  };

  const handleMarkFailed = (id: string) => {
    updateTransaction(id, { status: 'failed' });
    toast.error('Transaction marked as failed');
  };

  const handleCancelSubscription = (id: string, name: string) => {
    cancelSubscription(id);
    toast.success(`Subscription for ${name} cancelled`);
  };

  const handleToggleAutoRenew = (id: string, current: boolean) => {
    updateSubscription(id, { autoRenew: !current });
    toast.success(`Auto-renew ${!current ? 'enabled' : 'disabled'}`);
  };

  // ── Filtered data ────────────────────────────────────────────────────────────

  const filteredTxns = transactions.filter(t => txFilter === 'all' || t.status === txFilter);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage transactions and subscriptions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: <CreditCard size={16} />, color: '#10B981' },
            { label: 'Transactions', value: transactions.length, icon: <Activity size={16} />, color: '#6366F1' },
            { label: 'Pending', value: pendingCount, icon: <Clock size={16} />, color: '#F59E0B' },
            { label: 'Active Subs', value: activeSubs, icon: <Users size={16} />, color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '20', color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#0d1030] p-1 rounded-xl w-fit">
          {([
            { id: 'transactions' as Tab, label: 'Transactions', icon: <CreditCard size={14} /> },
            { id: 'subscriptions' as Tab, label: 'Subscriptions', icon: <RefreshCw size={14} /> },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#191c40] text-[#6366F1] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Transactions Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'completed', 'pending', 'failed', 'refunded'] as TxStatus[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    txFilter === f
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400 hover:border-[#6366F1]'
                  }`}
                >
                  {f}{f !== 'all' && ` (${transactions.filter(t => t.status === f).length})`}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#EEF2FF] dark:bg-[#0d1030]">
                      {['TXN ID', 'User', 'Plan', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filteredTxns.map(txn => (
                      <React.Fragment key={txn.id}>
                        <tr
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                          onClick={() => setExpandedTxId(expandedTxId === txn.id ? null : txn.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <ChevronDown size={13} className={`text-gray-400 transition-transform ${expandedTxId === txn.id ? 'rotate-180' : ''}`} />
                              <span className="font-mono text-xs text-gray-600 dark:text-gray-300 font-semibold">{txn.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{txn.userName}</p>
                            <p className="text-xs text-gray-400">{txn.userEmail}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{txn.planName}</td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{txn.amount.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 ml-1">{txn.currency}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{txn.paymentMethod}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${txStatusBadge[txn.status]}`}>
                              <StatusIcon status={txn.status} />
                              {txn.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              {txn.status === 'pending' && (
                                <button
                                  onClick={() => handleApprove(txn.id)}
                                  className="px-2.5 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {txn.status === 'completed' && (
                                <button
                                  onClick={() => handleRefund(txn.id)}
                                  className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Refund
                                </button>
                              )}
                              {(txn.status === 'pending') && (
                                <button
                                  onClick={() => handleMarkFailed(txn.id)}
                                  className="px-2.5 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  Fail
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedTxId === txn.id && (
                          <tr className="bg-gray-50 dark:bg-[#0d1030]">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Transaction Ref</p>
                                  <p className="font-mono text-gray-700 dark:text-gray-300">{txn.transactionRef}</p>
                                </div>
                                {txn.discountCode && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Discount Code</p>
                                    <p className="text-gray-700 dark:text-gray-300">{txn.discountCode}</p>
                                  </div>
                                )}
                                {txn.notes && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                                    <p className="text-gray-700 dark:text-gray-300">{txn.notes}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">User ID</p>
                                  <p className="font-mono text-gray-700 dark:text-gray-300">{txn.userId}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {filteredTxns.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Subscriptions Tab ────────────────────────────────────────────────── */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#EEF2FF] dark:bg-[#0d1030]">
                    {['Sub ID', 'User', 'Plan', 'Status', 'Start', 'End', 'Next Billing', 'Method', 'Auto-Renew', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-300 font-semibold">{sub.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{sub.userName}</p>
                        <p className="text-xs text-gray-400">{sub.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{sub.planName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${subStatusBadge[sub.status]}`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {sub.status === 'active' ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{sub.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={sub.autoRenew}
                            onChange={() => handleToggleAutoRenew(sub.id, sub.autoRenew)}
                            disabled={sub.status === 'cancelled' || sub.status === 'expired'}
                          />
                          <div className={`w-9 h-5 rounded-full transition-colors ${sub.autoRenew ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sub.autoRenew ? 'translate-x-4' : 'translate-x-0'}`} />
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        {sub.status !== 'cancelled' && sub.status !== 'expired' && (
                          <button
                            onClick={() => handleCancelSubscription(sub.id, sub.userName)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <Ban size={11} /> Cancel
                          </button>
                        )}
                        {(sub.status === 'cancelled' || sub.status === 'expired') && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">
                        No subscriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
