import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Card';
import { useAdminStore } from '../../store/useAdminStore';
import { Zap, Save, CreditCard, Gift, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const TOOL_COSTS = [
  { key: 'credit_cost_metadata',     label: 'AI Metadata Generator',    color: '#6366F1', default: '5' },
  { key: 'credit_cost_image_prompt', label: 'Image to Prompt',          color: '#8B5CF6', default: '10' },
  { key: 'credit_cost_content',      label: 'AI Content Writer',        color: '#10B981', default: '15' },
  { key: 'credit_cost_slogan',       label: 'Slogan Generator',         color: '#F59E0B', default: '5' },
  { key: 'credit_cost_social',       label: 'Social Scheduler',         color: '#EC4899', default: '8' },
  { key: 'credit_cost_word_counter', label: 'Word Counter',             color: '#0EA5E9', default: '0' },
  { key: 'credit_cost_age_calc',     label: 'Age Calculator',           color: '#64748B', default: '0' },
  { key: 'credit_cost_event_cal',    label: 'Event Calendar',           color: '#64748B', default: '0' },
];

export const CreditsSystemPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [plans, setPlans] = useState({
    credit_free_plan: get('credit_free_plan', '500'),
    credit_pro_plan: get('credit_pro_plan', '5000'),
    credit_enterprise_plan: get('credit_enterprise_plan', '99999'),
    credit_guest_plan: get('credit_guest_plan', '50'),
    credit_monthly_reset: get('credit_monthly_reset', 'true') === 'true',
    credit_rollover: get('credit_rollover', 'false') === 'true',
    credit_bonus_on_signup: get('credit_bonus_on_signup', '100'),
    credit_referral_bonus: get('credit_referral_bonus', '50'),
  });

  const [toolCosts, setToolCosts] = useState(
    Object.fromEntries(TOOL_COSTS.map(t => [t.key, get(t.key, t.default)]))
  );

  const [purchaseEnabled, setPurchaseEnabled] = useState(get('credit_purchase_enabled', 'true') === 'true');
  const [creditPacks] = useState([
    { credits: 500, price: 'BDT 50' },
    { credits: 1500, price: 'BDT 120' },
    { credits: 5000, price: 'BDT 350' },
  ]);

  const savePlans = () => {
    bulkUpdateCMSContent({
      credit_free_plan: plans.credit_free_plan,
      credit_pro_plan: plans.credit_pro_plan,
      credit_enterprise_plan: plans.credit_enterprise_plan,
      credit_guest_plan: plans.credit_guest_plan,
      credit_monthly_reset: plans.credit_monthly_reset ? 'true' : 'false',
      credit_rollover: plans.credit_rollover ? 'true' : 'false',
      credit_bonus_on_signup: plans.credit_bonus_on_signup,
      credit_referral_bonus: plans.credit_referral_bonus,
      credit_purchase_enabled: purchaseEnabled ? 'true' : 'false',
    });
    toast.success('Credit plans saved');
  };

  const saveCosts = () => {
    bulkUpdateCMSContent(toolCosts);
    toast.success('Tool credit costs saved');
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Credits System</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Free/pro/enterprise credits and tool costs</p>
          </div>
        </div>
        <Button icon={<Save size={14} />} onClick={() => { savePlans(); saveCosts(); }}>Save All</Button>
      </div>

      <div className="space-y-6">

        {/* Plan Credits */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Credits Per Plan</h2>
            </div>
            <Button size="sm" icon={<Save size={14} />} onClick={savePlans}>Save Plans</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'credit_guest_plan', label: 'Guest (One-time)', color: '#64748B' },
              { key: 'credit_free_plan', label: 'Free Plan / Month', color: '#6366F1' },
              { key: 'credit_pro_plan', label: 'Pro Plan / Month', color: '#8B5CF6' },
              { key: 'credit_enterprise_plan', label: 'Enterprise / Month', color: '#EC4899' },
            ].map(plan => (
              <div key={plan.key} className="p-4 rounded-2xl border-2" style={{ borderColor: `${plan.color}30`, background: `${plan.color}08` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: plan.color }}>{plan.label}</p>
                <input
                  type="number"
                  value={plans[plan.key as keyof typeof plans] as string}
                  onChange={e => setPlans(p => ({ ...p, [plan.key]: e.target.value }))}
                  className="w-full text-2xl font-extrabold bg-transparent outline-none text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-400 mt-1">credits</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Signup Bonus Credits" type="number" value={plans.credit_bonus_on_signup}
              onChange={e => setPlans(p => ({ ...p, credit_bonus_on_signup: e.target.value }))} />
            <Input label="Referral Bonus Credits" type="number" value={plans.credit_referral_bonus}
              onChange={e => setPlans(p => ({ ...p, credit_referral_bonus: e.target.value }))} />
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Credit Reset</p>
                <p className="text-xs text-gray-400">Credits reset every billing cycle</p>
              </div>
              <Toggle checked={plans.credit_monthly_reset} onChange={v => setPlans(p => ({ ...p, credit_monthly_reset: v }))} label="" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Credit Rollover</p>
                <p className="text-xs text-gray-400">Unused credits carry over next month</p>
              </div>
              <Toggle checked={plans.credit_rollover} onChange={v => setPlans(p => ({ ...p, credit_rollover: v }))} label="" />
            </div>
          </div>
        </Card>

        {/* Tool Credit Costs */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Credits Per Tool Use</h2>
            </div>
            <Button size="sm" icon={<Save size={14} />} onClick={saveCosts}>Save Costs</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOL_COSTS.map(tool => (
              <div key={tool.key} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-[#232650] rounded-xl">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tool.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{tool.label}</p>
                  <input
                    type="number"
                    value={toolCosts[tool.key]}
                    onChange={e => setToolCosts(c => ({ ...c, [tool.key]: e.target.value }))}
                    className="w-full text-sm font-bold bg-transparent outline-none text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#232650] focus:border-[#6366F1] mt-0.5"
                  />
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">cr</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Credit Packs */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Credit Purchase Packs</h2>
            </div>
            <Toggle checked={purchaseEnabled} onChange={setPurchaseEnabled} label="Allow credit purchases" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {creditPacks.map(pack => (
              <div key={pack.credits} className="p-4 rounded-2xl border-2 border-[#6366F1]/20 bg-[#6366F1]/5 text-center">
                <p className="text-2xl font-extrabold text-[#6366F1]">{pack.credits.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">credits</p>
                <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{pack.price}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Credit pack prices are managed in the Pricing Manager. Edit them there.</p>
        </Card>

      </div>
    </DashboardLayout>
  );
};
