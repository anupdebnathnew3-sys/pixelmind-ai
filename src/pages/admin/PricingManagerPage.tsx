import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  useBillingStore,
  Plan,
  PlanFeature,
  CurrencySettings,
} from '../../store/useBillingStore';
import {
  Plus, Edit3, Trash2, X, Save, Check, ChevronDown, ChevronUp,
  Users, Zap, Star, Globe, Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}> = ({ checked, onChange, label, size = 'md' }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <div className="relative flex-shrink-0">
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className={`rounded-full transition-colors ${size === 'sm' ? 'w-8 h-4' : 'w-11 h-6'} ${checked ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`} />
      <div className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform ${size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'} ${checked ? (size === 'sm' ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'}`} />
    </div>
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);

const fieldCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all';
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5';

type EditForm = Omit<Plan, 'id' | 'name'>;

const BLANK_FORM: EditForm = {
  displayName: '',
  tagline: '',
  priceBDT: 0,
  billingCycle: 'monthly',
  creditsPerMonth: 1000,
  monthlyPriceBDT: 0,
  monthlyOriginalBDT: 0,
  yearlyPriceBDT: 0,
  yearlyOriginalBDT: 0,
  maxGenerationsPerDay: 100,
  maxTeamMembers: 0,
  platformApiAccess: false,
  isPopular: false,
  isEnabled: true,
  color: '#6366F1',
  badge: '',
  features: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export const PricingManagerPage: React.FC = () => {
  const {
    plans, currencySettings, maxTeamMemberLimit,
    updatePlan, addPlan, removePlan,
    updateCurrencySettings, setMaxTeamMemberLimit,
  } = useBillingStore();

  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(BLANK_FORM);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlanId, setNewPlanId] = useState('');
  const [currencyForm, setCurrencyForm] = useState<CurrencySettings>({ ...currencySettings });
  const [teamLimit, setTeamLimit] = useState(maxTeamMemberLimit);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const activePlans = plans.filter(p => p.isEnabled);
  const proPlan = plans.find(p => p.id === 'pro');
  const maxPlan = plans.find(p => p.id === 'max');

  // ── Plan editing helpers ─────────────────────────────────────────────────────

  const openEdit = (plan: Plan) => {
    setForm({
      displayName: plan.displayName,
      tagline: plan.tagline,
      priceBDT: plan.priceBDT,
      billingCycle: plan.billingCycle,
      creditsPerMonth: plan.creditsPerMonth ?? 1000,
      monthlyPriceBDT: plan.monthlyPriceBDT ?? 0,
      monthlyOriginalBDT: plan.monthlyOriginalBDT ?? 0,
      yearlyPriceBDT: plan.yearlyPriceBDT ?? 0,
      yearlyOriginalBDT: plan.yearlyOriginalBDT ?? 0,
      maxGenerationsPerDay: plan.maxGenerationsPerDay,
      maxTeamMembers: plan.maxTeamMembers,
      platformApiAccess: plan.platformApiAccess,
      isPopular: plan.isPopular,
      isEnabled: plan.isEnabled,
      color: plan.color,
      badge: plan.badge ?? '',
      features: plan.features.map(f => ({ ...f })),
    });
    setEditingPlan(plan.id);
    setExpandedPlan(plan.id);
  };

  const closeEdit = () => { setEditingPlan(null); };

  const handleSavePlan = () => {
    if (!editingPlan) return;
    if (!form.displayName.trim()) { toast.error('Display name is required'); return; }
    updatePlan(editingPlan, { ...form, badge: form.badge || undefined });
    toast.success(`Plan "${form.displayName}" updated`);
    closeEdit();
  };

  const handleRemovePlan = (id: string, name: string) => {
    removePlan(id);
    toast.success(`Plan "${name}" removed`);
  };

  const handleAddPlan = () => {
    if (!newPlanId.trim() || !form.displayName.trim()) {
      toast.error('Plan ID and display name are required');
      return;
    }
    const id = newPlanId.toLowerCase().replace(/\s+/g, '-');
    if (plans.find(p => p.id === id)) { toast.error('Plan ID already exists'); return; }
    addPlan({ id, name: id, ...form, badge: form.badge || undefined });
    toast.success(`Plan "${form.displayName}" added`);
    setShowAddModal(false);
    setNewPlanId('');
    setForm(BLANK_FORM);
  };

  // ── Feature helpers ──────────────────────────────────────────────────────────

  const setF = (patch: Partial<EditForm>) => setForm(f => ({ ...f, ...patch }));

  const addFeature = () => setF({ features: [...form.features, { text: '', included: true }] });
  const removeFeature = (i: number) => setF({ features: form.features.filter((_, idx) => idx !== i) });
  const updateFeature = (i: number, patch: Partial<PlanFeature>) =>
    setF({ features: form.features.map((f, idx) => idx === i ? { ...f, ...patch } : f) });

  // ── Currency / team ──────────────────────────────────────────────────────────

  const handleSaveCurrency = () => {
    updateCurrencySettings(currencyForm);
    toast.success('Currency settings saved');
  };

  const handleSaveTeamLimit = () => {
    setMaxTeamMemberLimit(teamLimit);
    toast.success(`Max team member limit set to ${teamLimit}`);
  };

  // ── Plan form (shared for add/edit) ─────────────────────────────────────────

  const PlanForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Display Name</label>
          <input className={fieldCls} value={form.displayName} onChange={e => setF({ displayName: e.target.value })} placeholder="Pro" />
        </div>
        <div>
          <label className={labelCls}>Tagline</label>
          <input className={fieldCls} value={form.tagline} onChange={e => setF({ tagline: e.target.value })} placeholder="Short description" />
        </div>
        <div>
          <label className={labelCls}>Default Billing Cycle</label>
          <select className={fieldCls} value={form.billingCycle} onChange={e => setF({ billingCycle: e.target.value as Plan['billingCycle'] })}>
            <option value="free">Free</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Credits / Month (-1 = unlimited)</label>
          <input type="number" className={fieldCls} value={form.creditsPerMonth} onChange={e => setF({ creditsPerMonth: Number(e.target.value) })} min="-1" />
        </div>
      </div>

      {/* Pricing tiers */}
      <div className="rounded-xl border border-gray-200 dark:border-[#232650] overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-[#0d1030] text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Pricing Tiers (BDT)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
          <div>
            <label className={labelCls}>Monthly Price</label>
            <input type="number" className={fieldCls} value={form.monthlyPriceBDT} onChange={e => setF({ monthlyPriceBDT: Number(e.target.value), priceBDT: Number(e.target.value) })} min="0" />
          </div>
          <div>
            <label className={labelCls}>Monthly Original (strikethrough)</label>
            <input type="number" className={fieldCls} value={form.monthlyOriginalBDT} onChange={e => setF({ monthlyOriginalBDT: Number(e.target.value) })} min="0" />
          </div>
          <div>
            <label className={labelCls}>Yearly Price</label>
            <input type="number" className={fieldCls} value={form.yearlyPriceBDT} onChange={e => setF({ yearlyPriceBDT: Number(e.target.value) })} min="0" />
          </div>
          <div>
            <label className={labelCls}>Yearly Original (strikethrough)</label>
            <input type="number" className={fieldCls} value={form.yearlyOriginalBDT} onChange={e => setF({ yearlyOriginalBDT: Number(e.target.value) })} min="0" />
          </div>
        </div>
        {form.monthlyOriginalBDT > 0 && form.monthlyPriceBDT > 0 && (
          <div className="px-4 pb-3 flex gap-4 text-xs text-gray-400">
            <span>Monthly discount: <strong className="text-emerald-500">{Math.round((1 - form.monthlyPriceBDT / form.monthlyOriginalBDT) * 100)}% OFF</strong></span>
            {form.yearlyOriginalBDT > 0 && form.yearlyPriceBDT > 0 && (
              <span>Yearly discount: <strong className="text-emerald-500">{Math.round((1 - form.yearlyPriceBDT / form.yearlyOriginalBDT) * 100)}% OFF</strong></span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Max Generations / Day (-1 = unlimited)</label>
          <input type="number" className={fieldCls} value={form.maxGenerationsPerDay} onChange={e => setF({ maxGenerationsPerDay: Number(e.target.value) })} min="-1" />
        </div>
        <div>
          <label className={labelCls}>Max Team Members (0 = none)</label>
          <input type="number" className={fieldCls} value={form.maxTeamMembers} onChange={e => setF({ maxTeamMembers: Number(e.target.value) })} min="0" />
        </div>
        <div>
          <label className={labelCls}>Color</label>
          <div className="flex gap-2">
            <input type="color" className="w-10 h-10 rounded-lg border border-gray-200 dark:border-[#232650] cursor-pointer bg-transparent" value={form.color} onChange={e => setF({ color: e.target.value })} />
            <input className={fieldCls} value={form.color} onChange={e => setF({ color: e.target.value })} placeholder="#6366F1" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Badge Text (optional)</label>
          <input className={fieldCls} value={form.badge ?? ''} onChange={e => setF({ badge: e.target.value })} placeholder="Most Popular" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="bg-gray-50 dark:bg-[#0d1030] rounded-xl p-3">
          <ToggleSwitch checked={form.platformApiAccess} onChange={v => setF({ platformApiAccess: v })} label="Platform API Access" />
        </div>
        <div className="bg-gray-50 dark:bg-[#0d1030] rounded-xl p-3">
          <ToggleSwitch checked={form.isPopular} onChange={v => setF({ isPopular: v })} label="Mark as Popular" />
        </div>
        <div className="bg-gray-50 dark:bg-[#0d1030] rounded-xl p-3">
          <ToggleSwitch checked={form.isEnabled} onChange={v => setF({ isEnabled: v })} label="Enabled" />
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Plan Features</label>
          <button onClick={addFeature} className="flex items-center gap-1.5 text-xs text-[#6366F1] hover:text-[#4F46E5] font-medium">
            <Plus size={13} /> Add Feature
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {form.features.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No features. Click "Add Feature" to add one.</p>
          )}
          {form.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => updateFeature(i, { included: !feat.included })}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${feat.included ? 'bg-[#6366F1] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}
              >
                {feat.included && <Check size={10} />}
              </button>
              <input
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white focus:border-[#6366F1] outline-none"
                value={feat.text}
                onChange={e => updateFeature(i, { text: e.target.value })}
                placeholder="Feature description"
              />
              <button onClick={() => removeFeature(i)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Manager</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage subscription plans, pricing, and features</p>
          </div>
          <button
            onClick={() => { setForm(BLANK_FORM); setNewPlanId(''); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={15} /> Add Plan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Plans', value: plans.length, icon: <Settings size={16} />, color: '#6366F1' },
            { label: 'Active Plans', value: activePlans.length, icon: <Check size={16} />, color: '#10B981' },
            { label: 'Pro Price', value: proPlan ? `৳${proPlan.priceBDT}` : '—', icon: <Star size={16} />, color: '#8B5CF6' },
            { label: 'Max Price', value: maxPlan ? `৳${maxPlan.priceBDT}` : '—', icon: <Zap size={16} />, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Subscription Plans</h2>
          {plans.map(plan => {
            const isExpanded = expandedPlan === plan.id;
            const isEditing = editingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden"
              >
                {/* Plan Header Row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Color swatch */}
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 border-2 border-white shadow" style={{ background: plan.color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">{plan.displayName}</span>
                      {plan.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full text-white" style={{ background: plan.color }}>{plan.badge}</span>
                      )}
                      {!plan.isEnabled && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500">Disabled</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{plan.tagline}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white">৳{plan.priceBDT.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 capitalize">{plan.billingCycle}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white">{plan.maxGenerationsPerDay === -1 ? '∞' : plan.maxGenerationsPerDay}</p>
                      <p className="text-xs text-gray-400">Gen/Day</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white">{plan.maxTeamMembers === 0 ? 'None' : plan.maxTeamMembers}</p>
                      <p className="text-xs text-gray-400">Team</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <ToggleSwitch size="sm" checked={plan.isEnabled} onChange={v => { updatePlan(plan.id, { isEnabled: v }); toast.success(`Plan ${v ? 'enabled' : 'disabled'}`); }} />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(plan)}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    {plan.id !== 'free' && plan.id !== 'pro' && plan.id !== 'max' && (
                      <button
                        onClick={() => handleRemovePlan(plan.id, plan.displayName)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedPlan(isExpanded && !isEditing ? null : plan.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded: Edit Form or Feature Preview */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-[#232650] p-5">
                    {isEditing ? (
                      <>
                        <PlanForm />
                        <div className="flex justify-end gap-3 mt-5">
                          <button onClick={closeEdit} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Cancel</button>
                          <button onClick={handleSavePlan} className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-xl transition-colors">
                            <Save size={14} /> Save Plan
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Features ({plan.features.length})</p>
                          <div className="space-y-1.5">
                            {plan.features.map((f, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${f.included ? 'bg-[#6366F1] text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                  {f.included && <Check size={9} />}
                                </div>
                                <span className={f.included ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 line-through'}>{f.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Settings</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Platform API</span>
                              <span className={`font-medium ${plan.platformApiAccess ? 'text-emerald-500' : 'text-red-400'}`}>{plan.platformApiAccess ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Is Popular</span>
                              <span className={`font-medium ${plan.isPopular ? 'text-amber-500' : 'text-gray-400'}`}>{plan.isPopular ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Generations/Day</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{plan.maxGenerationsPerDay === -1 ? 'Unlimited' : plan.maxGenerationsPerDay}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Team Members</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{plan.maxTeamMembers === 0 ? 'None' : plan.maxTeamMembers}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Currency Settings */}
        <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Currency Settings</h3>
              <p className="text-xs text-gray-500">Configure currency conversion and display</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>BDT → USD Rate</label>
              <input type="number" className={fieldCls} value={currencyForm.bdtToUsdRate} onChange={e => setCurrencyForm(f => ({ ...f, bdtToUsdRate: Number(e.target.value) }))} min="1" step="0.01" />
            </div>
            <div>
              <label className={labelCls}>Default Currency</label>
              <select className={fieldCls} value={currencyForm.defaultCurrency} onChange={e => setCurrencyForm(f => ({ ...f, defaultCurrency: e.target.value as 'BDT' | 'USD' }))}>
                <option value="BDT">BDT (Bangladeshi Taka)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Admin Override</label>
              <select className={fieldCls} value={currencyForm.adminOverride} onChange={e => setCurrencyForm(f => ({ ...f, adminOverride: e.target.value as CurrencySettings['adminOverride'] }))}>
                <option value="none">None (use auto-detect)</option>
                <option value="BDT">Force BDT</option>
                <option value="USD">Force USD</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <ToggleSwitch checked={currencyForm.autoDetect} onChange={v => setCurrencyForm(f => ({ ...f, autoDetect: v }))} label="Auto-detect user currency" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveCurrency} className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-xl transition-colors">
              <Save size={14} /> Save Currency Settings
            </button>
          </div>
        </div>

        {/* Max Team Limit */}
        <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Global Team Member Limit</h3>
              <p className="text-xs text-gray-500">Maximum team members allowed across all plans</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <input type="number" className={fieldCls} value={teamLimit} onChange={e => setTeamLimit(Number(e.target.value))} min="1" max="100" />
            </div>
            <button onClick={handleSaveTeamLimit} className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-xl transition-colors">
              <Save size={14} /> Save Limit
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Current global limit: <strong className="text-gray-600 dark:text-gray-300">{maxTeamMemberLimit} members</strong></p>
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#191c40] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#232650] p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Plan</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Plan ID (unique, no spaces)</label>
              <input
                className={fieldCls}
                value={newPlanId}
                onChange={e => setNewPlanId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="custom-plan"
              />
            </div>
            <PlanForm />
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Cancel</button>
              <button onClick={handleAddPlan} className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-medium rounded-xl transition-colors">
                <Plus size={14} /> Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
