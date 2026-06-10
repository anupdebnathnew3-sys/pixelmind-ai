import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useBillingStore, DiscountCode } from '../../store/useBillingStore';
import {
  Plus, Trash2, X, Save, Copy, Tag, ToggleLeft, ToggleRight,
  Hash, Percent, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all';
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5';

type NewCodeForm = {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  expiresAt: string;
  usageLimit: string;
  applicablePlans: 'all' | string;
  isActive: boolean;
};

const BLANK: NewCodeForm = {
  code: '',
  type: 'percentage',
  value: 10,
  description: '',
  expiresAt: '',
  usageLimit: '',
  applicablePlans: 'all',
  isActive: true,
};

const generateId = () => Date.now().toString();

const suggestCode = () => {
  const words = ['SAVE', 'DEAL', 'OFF', 'PROMO', 'LAUNCH', 'SPECIAL', 'BONUS'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${word}${num}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const DiscountManagerPage: React.FC = () => {
  const { discountCodes, plans, addDiscountCode, updateDiscountCode, removeDiscountCode } = useBillingStore();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewCodeForm>(BLANK);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const setF = (patch: Partial<NewCodeForm>) => setForm(f => ({ ...f, ...patch }));

  // ── Stats ────────────────────────────────────────────────────────────────────

  const totalCodes = discountCodes.length;
  const activeCodes = discountCodes.filter(c => c.isActive).length;
  const totalUsed = discountCodes.reduce((sum, c) => sum + c.usedCount, 0);

  // ── Filtered list ────────────────────────────────────────────────────────────

  const filtered = discountCodes.filter(c => {
    if (filterStatus === 'active') return c.isActive;
    if (filterStatus === 'inactive') return !c.isActive;
    return true;
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const isExpired = (code: DiscountCode) =>
    code.expiresAt !== null && new Date(code.expiresAt) < new Date();

  const isExhausted = (code: DiscountCode) =>
    code.usageLimit !== null && code.usedCount >= code.usageLimit;

  const getStatusLabel = (code: DiscountCode) => {
    if (!code.isActive) return { label: 'Inactive', cls: 'bg-gray-100 dark:bg-gray-800 text-gray-500' };
    if (isExpired(code)) return { label: 'Expired', cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' };
    if (isExhausted(code)) return { label: 'Exhausted', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' };
    return { label: 'Active', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' };
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success(`Copied "${code}" to clipboard`));
  };

  const handleToggle = (id: string, current: boolean) => {
    updateDiscountCode(id, { isActive: !current });
    toast.success(`Code ${!current ? 'activated' : 'deactivated'}`);
  };

  const handleDelete = (id: string, code: string) => {
    removeDiscountCode(id);
    toast.success(`Code "${code}" deleted`);
  };

  const handleAdd = () => {
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (form.value <= 0) { toast.error('Value must be greater than 0'); return; }
    if (form.type === 'percentage' && form.value > 100) { toast.error('Percentage cannot exceed 100%'); return; }

    const existing = discountCodes.find(c => c.code.toUpperCase() === form.code.toUpperCase());
    if (existing) { toast.error('A code with this name already exists'); return; }

    const applicable: DiscountCode['applicablePlans'] =
      form.applicablePlans === 'all'
        ? 'all'
        : form.applicablePlans.split(',').map(s => s.trim()).filter(Boolean);

    const newCode: DiscountCode = {
      id: generateId(),
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      description: form.description,
      expiresAt: form.expiresAt || null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      usedCount: 0,
      isActive: form.isActive,
      applicablePlans: applicable,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    addDiscountCode(newCode);
    toast.success(`Coupon "${newCode.code}" created`);
    setShowModal(false);
    setForm(BLANK);
  };

  const openModal = () => {
    setForm({ ...BLANK, code: suggestCode() });
    setShowModal(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discount Manager</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage promo codes</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={15} /> Add Coupon
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Codes', value: totalCodes, icon: <Tag size={18} />, color: '#6366F1' },
            { label: 'Active Codes', value: activeCodes, icon: <ToggleRight size={18} />, color: '#10B981' },
            { label: 'Total Used', value: totalUsed, icon: <Hash size={18} />, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '20', color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filterStatus === f
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400 hover:border-[#6366F1]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EEF2FF] dark:bg-[#0d1030]">
                  {['Code', 'Type', 'Value', 'Description', 'Applies To', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(code => {
                  const status = getStatusLabel(code);
                  return (
                    <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{code.code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${code.type === 'percentage' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                          {code.type === 'percentage' ? <Percent size={10} /> : <DollarSign size={10} />}
                          {code.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                        {code.type === 'percentage' ? `${code.value}%` : `৳${code.value}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[160px] truncate">{code.description || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {code.applicablePlans === 'all'
                          ? <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">All Plans</span>
                          : (code.applicablePlans as string[]).map(pid => (
                            <span key={pid} className="text-xs px-2 py-0.5 bg-[#EEF2FF] dark:bg-[#6366F1]/20 text-[#6366F1] rounded-full mr-1 capitalize">{pid}</span>
                          ))}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {code.usedCount}{code.usageLimit !== null ? `/${code.usageLimit}` : ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {code.expiresAt
                          ? <span className={isExpired(code) ? 'text-red-500' : ''}>{new Date(code.expiresAt).toLocaleDateString()}</span>
                          : <span className="text-gray-400">Never</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(code.code)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors"
                            title="Copy code"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => handleToggle(code.id, code.isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${code.isActive ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                            title={code.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {code.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                          </button>
                          <button
                            onClick={() => handleDelete(code.id, code.code)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                      No discount codes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#191c40] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#232650] p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Coupon Code</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className={labelCls}>Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    className={fieldCls}
                    value={form.code}
                    onChange={e => setF({ code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                  />
                  <button
                    onClick={() => setF({ code: suggestCode() })}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] text-xs text-gray-600 dark:text-gray-400 hover:border-[#6366F1] whitespace-nowrap transition-colors"
                  >
                    Suggest
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className={labelCls}>Discount Type</label>
                  <select className={fieldCls} value={form.type} onChange={e => setF({ type: e.target.value as 'percentage' | 'fixed' })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                {/* Value */}
                <div>
                  <label className={labelCls}>Value {form.type === 'percentage' ? '(%)' : '(৳)'}</label>
                  <input type="number" className={fieldCls} value={form.value} onChange={e => setF({ value: Number(e.target.value) })} min="1" max={form.type === 'percentage' ? 100 : undefined} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description (optional)</label>
                <input className={fieldCls} value={form.description} onChange={e => setF({ description: e.target.value })} placeholder="Launch offer — 20% off" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expires */}
                <div>
                  <label className={labelCls}>Expires At (leave blank for never)</label>
                  <input
                    type="date"
                    className={fieldCls}
                    value={form.expiresAt}
                    onChange={e => setF({ expiresAt: e.target.value })}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                {/* Usage Limit */}
                <div>
                  <label className={labelCls}>Usage Limit (blank = unlimited)</label>
                  <input type="number" className={fieldCls} value={form.usageLimit} onChange={e => setF({ usageLimit: e.target.value })} min="1" placeholder="100" />
                </div>
              </div>

              {/* Applicable Plans */}
              <div>
                <label className={labelCls}>Applicable Plans</label>
                <select
                  className={fieldCls}
                  value={form.applicablePlans}
                  onChange={e => setF({ applicablePlans: e.target.value })}
                >
                  <option value="all">All Plans</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.displayName}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">For multiple plans, create separate codes per plan.</p>
              </div>

              {/* Active toggle */}
              <div className="bg-gray-50 dark:bg-[#0d1030] rounded-xl p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <input type="checkbox" className="sr-only" checked={form.isActive} onChange={e => setF({ isActive: e.target.checked })} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Activate immediately</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 transition-colors">Cancel</button>
              <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-xl transition-colors">
                <Save size={14} /> Create Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
