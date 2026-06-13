import React, { useState } from 'react';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import { Video, Save, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const COLOR = '#EC4899';

export const SalesScriptManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  const [creditsPerUse, setCreditsPerUse] = useState(cmsContent['ss_credits_per_use'] ?? '1');
  const [guestCredits, setGuestCredits] = useState(cmsContent['ss_guest_credits'] ?? '50');
  const [guestAllowed, setGuestAllowed] = useState(cmsContent['ss_guest_allowed'] !== 'false');
  const [tiktokEnabled, setTiktokEnabled] = useState(cmsContent['ss_tiktok'] !== 'false');
  const [reelsEnabled, setReelsEnabled] = useState(cmsContent['ss_reels'] !== 'false');
  const [shortsEnabled, setShortsEnabled] = useState(cmsContent['ss_shorts'] !== 'false');
  const [viralHookEnabled, setViralHookEnabled] = useState(cmsContent['ss_viral_hook'] !== 'false');
  const [length30, setLength30] = useState(cmsContent['ss_length_30'] !== 'false');
  const [length45, setLength45] = useState(cmsContent['ss_length_45'] !== 'false');
  const [length60, setLength60] = useState(cmsContent['ss_length_60'] !== 'false');

  const save = () => {
    bulkUpdateCMSContent({
      ss_credits_per_use: creditsPerUse,
      ss_guest_credits:   guestCredits,
      ss_guest_allowed:   String(guestAllowed),
      ss_tiktok:          String(tiktokEnabled),
      ss_reels:           String(reelsEnabled),
      ss_shorts:          String(shortsEnabled),
      ss_viral_hook:      String(viralHookEnabled),
      ss_length_30:       String(length30),
      ss_length_45:       String(length45),
      ss_length_60:       String(length60),
    });
    toast.success('Sales Script Manager settings saved');
  };

  return (
    <ToolManagerTemplate toolId="sales-script" icon={<Video size={18} />} color={COLOR} toolPath="/tools/sales-script">
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} style={{ color: COLOR }} />
          <h2 className="font-bold text-gray-900 dark:text-white">Credits & Access</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Credits Per Generation" type="number" value={creditsPerUse}
            onChange={e => setCreditsPerUse(e.target.value)} />
          <Input label="Guest Free Credits" type="number" value={guestCredits}
            onChange={e => setGuestCredits(e.target.value)} />
        </div>
      </Card>

      {/* Platform & Length Toggles */}
      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Platform Versions</h2>
        <div className="space-y-3">
          {[
            { label: 'TikTok Version', desc: 'Casual, trend-driven scripts for TikTok', value: tiktokEnabled, onChange: setTiktokEnabled },
            { label: 'Instagram Reels Version', desc: 'Aesthetic, lifestyle-focused scripts', value: reelsEnabled, onChange: setReelsEnabled },
            { label: 'YouTube Shorts Version', desc: 'Value-packed, informative scripts', value: shortsEnabled, onChange: setShortsEnabled },
            { label: 'Viral Hook Generator', desc: 'Generate alternative viral hook suggestions', value: viralHookEnabled, onChange: setViralHookEnabled },
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

      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Video Length Options</h2>
        <div className="space-y-3">
          {[
            { label: '30 Second Scripts', desc: 'Ultra-short, punch scripts', value: length30, onChange: setLength30 },
            { label: '45 Second Scripts', desc: 'Balanced story scripts', value: length45, onChange: setLength45 },
            { label: '60 Second Scripts', desc: 'Full pitch scripts', value: length60, onChange: setLength60 },
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

      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Access Control</h2>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Allow Guest Access</p>
            <p className="text-xs text-gray-400">Guests can use this tool with free credits</p>
          </div>
          <Toggle checked={guestAllowed} onChange={setGuestAllowed} label="" />
        </div>
      </Card>

      <Button icon={<Save size={14} />} onClick={save}>Save Settings</Button>
    </ToolManagerTemplate>
  );
};
