import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAdminStore } from '../../store/useAdminStore';
import { UserPlus, Bell, Eye, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

export const GuestAlertManagerPage: React.FC = () => {
  const { guestAlertSettings, updateGuestAlertSettings } = useAdminStore();
  const s = guestAlertSettings;

  const patch = (updates: Partial<typeof s>) => {
    updateGuestAlertSettings(updates);
    toast.success('Alert settings updated');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Guest Alert Manager</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Configure prompts to encourage guest users to create accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${s.enabled ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-[#232650] border-gray-200 dark:border-gray-700 text-gray-500'}`}>
              {s.enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Enable/Settings */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#6366F1]" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Alert Settings</h3>
                </div>
                <button
                  onClick={() => patch({ enabled: !s.enabled })}
                  className={`w-12 h-6 rounded-full transition-all relative ${s.enabled ? 'bg-[#6366F1]' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${s.enabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                    Show after N tool uses: <strong className="text-[#6366F1]">{s.showAfterUses}</strong>
                  </label>
                  <input
                    type="range" min={1} max={15} value={s.showAfterUses}
                    onChange={e => patch({ showAfterUses: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>1 use</span><span>15 uses</span></div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                    Low credit threshold: <strong className="text-[#6366F1]">{s.lowCreditThreshold}</strong>
                  </label>
                  <input
                    type="range" min={1} max={25} value={s.lowCreditThreshold}
                    onChange={e => patch({ lowCreditThreshold: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-[#232650]">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Show on Low Credits</p>
                    <p className="text-xs text-gray-400">Show when guest credits drop below threshold</p>
                  </div>
                  <button
                    onClick={() => patch({ showOnLowCredits: !s.showOnLowCredits })}
                    className={`w-11 h-6 rounded-full transition-all relative ${s.showOnLowCredits ? 'bg-[#6366F1]' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${s.showOnLowCredits ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </Card>

            {/* Content */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <UserPlus size={16} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Alert Content</h3>
              </div>
              <div className="space-y-3">
                <Input
                  label="Alert Title"
                  value={s.title}
                  onChange={e => patch({ title: e.target.value })}
                  placeholder="Save Your Work — Create a Free Account"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Alert Message</label>
                  <textarea
                    value={s.message}
                    onChange={e => patch({ message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-[#6366F1] resize-none"
                    placeholder="You're currently in Guest Mode. Create a free account to..."
                  />
                </div>
                <Input
                  label="CTA Button Text"
                  value={s.ctaText}
                  onChange={e => patch({ ctaText: e.target.value })}
                  placeholder="Sign Up for Free"
                />
              </div>
            </Card>

            {/* Position */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Banner Position</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['top', 'bottom'] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => patch({ position: pos })}
                    className={cn(
                      'p-3 rounded-xl border-2 text-sm font-semibold transition-all capitalize',
                      s.position === pos
                        ? 'border-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1]'
                        : 'border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400 hover:border-[#6366F1]/40'
                    )}
                  >
                    {pos === 'top' ? '↑ Top of page' : '↓ Bottom of page'}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Eye size={15} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Preview</h3>
              </div>

              <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] p-4 shadow-xl shadow-[#6366F1]/20">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <UserPlus size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm leading-tight">{s.title || 'Alert Title'}</p>
                    <p className="text-white/75 text-xs mt-1 leading-snug">{s.message || 'Alert message will appear here.'}</p>
                    <button className="mt-3 px-4 py-1.5 rounded-xl bg-white text-[#6366F1] text-xs font-bold flex items-center gap-1.5 shadow-md">
                      {s.ctaText || 'Sign Up'} <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Zap size={11} className="text-[#6366F1]" />
                  Triggers after <strong className="text-gray-700 dark:text-gray-300">{s.showAfterUses}</strong> tool uses
                </div>
                {s.showOnLowCredits && (
                  <div className="flex items-center gap-2">
                    <Zap size={11} className="text-amber-500" />
                    Also triggers when credits ≤ <strong className="text-gray-700 dark:text-gray-300">{s.lowCreditThreshold}</strong>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Zap size={11} className="text-gray-400" />
                  Position: <strong className="text-gray-700 dark:text-gray-300 capitalize">{s.position}</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
