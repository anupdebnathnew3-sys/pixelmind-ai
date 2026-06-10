import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useBillingStore, FeaturePermission } from '../../store/useBillingStore';
import { Shield, Check, Lock, Info } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Plan color/label config ──────────────────────────────────────────────────

interface PlanMeta {
  id: string;
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  checkClass: string;
}

const PLAN_META: PlanMeta[] = [
  {
    id: 'free',
    label: 'Free',
    color: '#6B7280',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    borderClass: 'border-gray-300 dark:border-gray-600',
    checkClass: 'bg-gray-500',
  },
  {
    id: 'pro',
    label: 'Pro',
    color: '#6366F1',
    bgClass: 'bg-[#EEF2FF] dark:bg-[#6366F1]/20',
    borderClass: 'border-[#6366F1]',
    checkClass: 'bg-[#6366F1]',
  },
  {
    id: 'max',
    label: 'Max',
    color: '#F59E0B',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    borderClass: 'border-amber-400',
    checkClass: 'bg-amber-500',
  },
];

// ─── Checkbox component ───────────────────────────────────────────────────────

interface PlanCheckboxProps {
  checked: boolean;
  plan: PlanMeta;
  onChange: (v: boolean) => void;
}

const PlanCheckbox: React.FC<PlanCheckboxProps> = ({ checked, plan, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all mx-auto ${
      checked
        ? `${plan.checkClass} border-transparent`
        : `bg-transparent ${plan.borderClass} hover:${plan.bgClass}`
    }`}
    title={`Toggle ${plan.label} access`}
  >
    {checked && <Check size={14} className="text-white" />}
  </button>
);

// ─── Feature Row ──────────────────────────────────────────────────────────────

interface FeatureRowProps {
  feature: FeaturePermission;
  plans: PlanMeta[];
  onToggle: (featureId: string, planId: string, enabled: boolean) => void;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ feature, plans, onToggle }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{feature.description}</p>
          </div>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 transition-colors"
            >
              <Info size={12} />
            </button>
            {showTooltip && (
              <div className="absolute left-6 top-0 z-10 w-48 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg pointer-events-none">
                {feature.description}
              </div>
            )}
          </div>
        </div>
      </td>
      {plans.map(plan => {
        const enabled = feature.enabledPlans.includes(plan.id);
        return (
          <td key={plan.id} className="px-4 py-3.5 text-center">
            <PlanCheckbox
              checked={enabled}
              plan={plan}
              onChange={v => onToggle(feature.id, plan.id, v)}
            />
          </td>
        );
      })}
    </tr>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const FeatureAccessPage: React.FC = () => {
  const { featurePermissions, plans, updateFeaturePermission } = useBillingStore();

  // Only show known plans in the defined order; fall back to any extra plans
  const knownIds = PLAN_META.map(p => p.id);
  const extraPlans = plans
    .filter(p => !knownIds.includes(p.id) && p.isEnabled)
    .map(p => ({
      id: p.id,
      label: p.displayName,
      color: p.color,
      bgClass: 'bg-gray-50 dark:bg-gray-800',
      borderClass: 'border-gray-300 dark:border-gray-600',
      checkClass: 'bg-gray-500',
    }));

  const allPlanMeta: PlanMeta[] = [...PLAN_META, ...extraPlans];

  // ── Toggle handler ───────────────────────────────────────────────────────────

  const handleToggle = (featureId: string, planId: string, enable: boolean) => {
    const feature = featurePermissions.find(f => f.id === featureId);
    if (!feature) return;

    let enabledPlans: string[];
    if (enable) {
      enabledPlans = [...new Set([...feature.enabledPlans, planId])];
    } else {
      enabledPlans = feature.enabledPlans.filter(id => id !== planId);
    }

    updateFeaturePermission(featureId, { enabledPlans });
    toast.success(`${enable ? 'Granted' : 'Revoked'} ${planId} access to "${feature.name}"`);
  };

  // ── Count summaries per plan ─────────────────────────────────────────────────

  const countPerPlan = (planId: string) =>
    featurePermissions.filter(f => f.enabledPlans.includes(planId)).length;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Access</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5">Control which features each plan can access</p>
          </div>
        </div>

        {/* Plan summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLAN_META.map(plan => {
            const count = countPerPlan(plan.id);
            const total = featurePermissions.length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={plan.id} className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
                    <span className="font-semibold text-gray-900 dark:text-white">{plan.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{pct}%</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: plan.color }}>{count}</p>
                <p className="text-xs text-gray-500 mt-1">of {total} features</p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: plan.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Table */}
        <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EEF2FF] dark:bg-[#0d1030]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC] w-full">
                    Feature
                  </th>
                  {allPlanMeta.map(plan => (
                    <th key={plan.id} className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap min-w-[80px]" style={{ color: plan.color }}>
                      {plan.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {featurePermissions.map(feature => (
                  <FeatureRow
                    key={feature.id}
                    feature={feature}
                    plans={allPlanMeta}
                    onToggle={handleToggle}
                  />
                ))}
                {featurePermissions.length === 0 && (
                  <tr>
                    <td colSpan={allPlanMeta.length + 1} className="px-4 py-10 text-center text-sm text-gray-400">
                      No features configured
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer legend */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-[#232650] bg-gray-50 dark:bg-[#0d1030]">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#6366F1] flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Access granted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <Lock size={10} className="text-gray-400" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">No access</span>
              </div>
              <p className="text-xs text-gray-400 ml-auto">
                Click any checkbox to toggle access — changes apply immediately
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
