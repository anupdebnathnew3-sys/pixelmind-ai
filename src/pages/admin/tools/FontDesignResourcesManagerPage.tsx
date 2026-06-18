import React, { useState } from 'react';
import { Sparkles, Save } from 'lucide-react';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import toast from 'react-hot-toast';

const COLOR = '#6366F1';

export const FontDesignResourcesManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  const [maxRecs,       setMaxRecs]       = useState(cmsContent['fdr_max_recs']        ?? '3');
  const [creditsPerUse, setCreditsPerUse] = useState(cmsContent['fdr_credits_per_use'] ?? '1');
  const [guestCredits,  setGuestCredits]  = useState(cmsContent['fdr_guest_credits']   ?? '3');
  const [showScores,    setShowScores]    = useState(cmsContent['fdr_show_scores']      !== 'false');
  const [showRationale, setShowRationale] = useState(cmsContent['fdr_show_rationale']  !== 'false');
  const [showUsage,     setShowUsage]     = useState(cmsContent['fdr_show_usage']       !== 'false');
  const [guestAccess,   setGuestAccess]   = useState(cmsContent['fdr_guest_access']    !== 'false');

  const save = () => {
    bulkUpdateCMSContent({
      fdr_max_recs:        maxRecs,
      fdr_credits_per_use: creditsPerUse,
      fdr_guest_credits:   guestCredits,
      fdr_show_scores:     showScores    ? 'true' : 'false',
      fdr_show_rationale:  showRationale ? 'true' : 'false',
      fdr_show_usage:      showUsage     ? 'true' : 'false',
      fdr_guest_access:    guestAccess   ? 'true' : 'false',
    });
    toast.success('Settings saved');
  };

  const Toggle = ({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#6366F1]' : 'bg-gray-200 dark:bg-gray-700'}`}
        style={{ width: 40, height: 22 }}
      >
        <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-[18px]' : ''}`}
          style={{ width: 18, height: 18, transform: value ? 'translateX(18px)' : 'translateX(0)' }} />
      </button>
    </div>
  );

  return (
    <ToolManagerTemplate
      toolId="font-design-resources"
      icon={<Sparkles size={18} />}
      color={COLOR}
      toolPath="/tools/font-design-resources"
    >
      {/* Credits & Output */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Credits & Output</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Credits per use',    value: creditsPerUse, set: setCreditsPerUse, min: 1, max: 10 },
            { label: 'Guest free credits', value: guestCredits,  set: setGuestCredits,  min: 0, max: 20 },
          ].map(({ label, value, set, min, max }) => (
            <div key={label}>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">{label}</label>
              <input
                type="number" min={min} max={max}
                value={value}
                onChange={e => set(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 text-gray-900 dark:text-white"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Max recommendations</label>
            <select
              value={maxRecs}
              onChange={e => setMaxRecs(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm outline-none focus:border-[#6366F1] text-gray-900 dark:text-white"
            >
              <option value="1">1 recommendation</option>
              <option value="2">2 recommendations</option>
              <option value="3">3 recommendations</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">UI Features</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Toggle label="Guest Access"        desc="Allow guests to use this tool"             value={guestAccess}   onChange={setGuestAccess} />
          <Toggle label="Pairing Scores"      desc="Show readability & pairing score bars"      value={showScores}    onChange={setShowScores} />
          <Toggle label="Design Rationale"    desc="Show AI explanation of why fonts work"      value={showRationale} onChange={setShowRationale} />
          <Toggle label="Usage Notes"         desc="Show practical typography usage guidance"   value={showUsage}     onChange={setShowUsage} />
        </div>
      </Card>

      <Button onClick={save} icon={<Save size={14} />}>Save Settings</Button>
    </ToolManagerTemplate>
  );
};
