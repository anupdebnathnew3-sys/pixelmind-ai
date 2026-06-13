import React, { useState } from 'react';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import { Megaphone, Save, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const COLOR = '#F59E0B';

const DEFAULT_PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'Pinterest', 'Google Ads'];

export const AdCopyManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  const [creditsPerUse, setCreditsPerUse] = useState(cmsContent['ac_credits_per_use'] ?? '1');
  const [variationsCount, setVariationsCount] = useState(cmsContent['ac_variations_count'] ?? '3');
  const [guestCredits, setGuestCredits] = useState(cmsContent['ac_guest_credits'] ?? '50');
  const [guestAllowed, setGuestAllowed] = useState(cmsContent['ac_guest_allowed'] !== 'false');
  const [charCountEnabled, setCharCountEnabled] = useState(cmsContent['ac_char_count'] !== 'false');
  const [multiVariationEnabled, setMultiVariationEnabled] = useState(cmsContent['ac_multi_variation'] !== 'false');

  const savedPlatforms = cmsContent['ac_platforms']
    ? (JSON.parse(cmsContent['ac_platforms']) as string[])
    : DEFAULT_PLATFORMS;
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>(savedPlatforms);

  const togglePlatform = (p: string) =>
    setEnabledPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const save = () => {
    bulkUpdateCMSContent({
      ac_credits_per_use:   creditsPerUse,
      ac_variations_count:  variationsCount,
      ac_guest_credits:     guestCredits,
      ac_guest_allowed:     String(guestAllowed),
      ac_char_count:        String(charCountEnabled),
      ac_multi_variation:   String(multiVariationEnabled),
      ac_platforms:         JSON.stringify(enabledPlatforms),
    });
    toast.success('Ad Copy Manager settings saved');
  };

  return (
    <ToolManagerTemplate toolId="ad-copywriter" icon={<Megaphone size={18} />} color={COLOR} toolPath="/tools/ad-copywriter">
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} style={{ color: COLOR }} />
          <h2 className="font-bold text-gray-900 dark:text-white">Credits & Output</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Credits Per Generation" type="number" value={creditsPerUse}
            onChange={e => setCreditsPerUse(e.target.value)} />
          <Input label="Variations Per Generation" type="number" value={variationsCount}
            onChange={e => setVariationsCount(e.target.value)} />
          <Input label="Guest Free Credits" type="number" value={guestCredits}
            onChange={e => setGuestCredits(e.target.value)} />
        </div>
      </Card>

      {/* Platform Toggles */}
      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Enabled Platforms</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEFAULT_PLATFORMS.map(p => (
            <button key={p} onClick={() => togglePlatform(p)}
              className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold ${enabledPlatforms.includes(p)
                ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#F59E0B]/50'}`}>
              {p}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Feature Toggles</h2>
        <div className="space-y-3">
          {[
            { label: 'Allow Guest Access', desc: 'Guests can use this tool with free credits', value: guestAllowed, onChange: setGuestAllowed },
            { label: 'Character Count Display', desc: 'Show character count vs. platform limit on headlines', value: charCountEnabled, onChange: setCharCountEnabled },
            { label: 'Multiple Variations', desc: 'Generate multiple ad copy variations per request', value: multiVariationEnabled, onChange: setMultiVariationEnabled },
          ].map(({ label, desc, value, onChange }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <Toggle checked={value} onChange={onChange} label="" />
            </div>
          ))}
        </div>
      </Card>

      <Button icon={<Save size={14} />} onClick={save}>Save Settings</Button>
    </ToolManagerTemplate>
  );
};
