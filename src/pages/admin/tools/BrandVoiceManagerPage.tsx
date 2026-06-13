import React, { useState } from 'react';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import { Mic2, Save, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const COLOR = '#8B5CF6';

export const BrandVoiceManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  const [creditsPerUse, setCreditsPerUse] = useState(cmsContent['bv_credits_per_use'] ?? '1');
  const [sloganCount, setSloganCount] = useState(cmsContent['bv_slogan_count'] ?? '5');
  const [hookCount, setHookCount] = useState(cmsContent['bv_hook_count'] ?? '3');
  const [guestCredits, setGuestCredits] = useState(cmsContent['bv_guest_credits'] ?? '50');
  const [guestAllowed, setGuestAllowed] = useState(cmsContent['bv_guest_allowed'] !== 'false');
  const [toneSelectionEnabled, setToneSelectionEnabled] = useState(cmsContent['bv_tone_selection'] !== 'false');
  const [positioningEnabled, setPositioningEnabled] = useState(cmsContent['bv_positioning'] !== 'false');

  const save = () => {
    bulkUpdateCMSContent({
      bv_credits_per_use:  creditsPerUse,
      bv_slogan_count:     sloganCount,
      bv_hook_count:       hookCount,
      bv_guest_credits:    guestCredits,
      bv_guest_allowed:    String(guestAllowed),
      bv_tone_selection:   String(toneSelectionEnabled),
      bv_positioning:      String(positioningEnabled),
    });
    toast.success('Brand Voice Manager settings saved');
  };

  return (
    <ToolManagerTemplate toolId="brand-voice" icon={<Mic2 size={18} />} color={COLOR} toolPath="/tools/brand-voice">
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} style={{ color: COLOR }} />
          <h2 className="font-bold text-gray-900 dark:text-white">Credits & Output Settings</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Input label="Credits Per Generation" type="number" value={creditsPerUse}
            onChange={e => setCreditsPerUse(e.target.value)} />
          <Input label="Guest Free Credits" type="number" value={guestCredits}
            onChange={e => setGuestCredits(e.target.value)} />
          <Input label="Slogan Variations Count" type="number" value={sloganCount}
            onChange={e => setSloganCount(e.target.value)} />
          <Input label="Marketing Hooks Count" type="number" value={hookCount}
            onChange={e => setHookCount(e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Feature Toggles</h2>
        <div className="space-y-3">
          {[
            { label: 'Allow Guest Access', desc: 'Guests can use this tool with free credits', value: guestAllowed, onChange: setGuestAllowed },
            { label: 'Tone Selection', desc: 'Allow users to select brand tone (Professional, Luxury, etc.)', value: toneSelectionEnabled, onChange: setToneSelectionEnabled },
            { label: 'Brand Positioning Statement', desc: 'Include positioning statement in output', value: positioningEnabled, onChange: setPositioningEnabled },
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
