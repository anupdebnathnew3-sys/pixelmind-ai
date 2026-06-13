import React, { useState } from 'react';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import { Type, Save, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const COLOR = '#0EA5E9';

export const FontPairingManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  const [creditsPerUse, setCreditsPerUse] = useState(cmsContent['fp_credits_per_use'] ?? '1');
  const [pairingSetsCount, setPairingSetsCount] = useState(cmsContent['fp_pairing_sets'] ?? '3');
  const [guestCredits, setGuestCredits] = useState(cmsContent['fp_guest_credits'] ?? '50');
  const [guestAllowed, setGuestAllowed] = useState(cmsContent['fp_guest_allowed'] !== 'false');
  const [googleFontsLinks, setGoogleFontsLinks] = useState(cmsContent['fp_google_links'] !== 'false');
  const [pairingScore, setPairingScore] = useState(cmsContent['fp_pairing_score'] !== 'false');
  const [customFontInput, setCustomFontInput] = useState(cmsContent['fp_custom_input'] !== 'false');

  const save = () => {
    bulkUpdateCMSContent({
      fp_credits_per_use: creditsPerUse,
      fp_pairing_sets:    pairingSetsCount,
      fp_guest_credits:   guestCredits,
      fp_guest_allowed:   String(guestAllowed),
      fp_google_links:    String(googleFontsLinks),
      fp_pairing_score:   String(pairingScore),
      fp_custom_input:    String(customFontInput),
    });
    toast.success('Font Pairing Manager settings saved');
  };

  return (
    <ToolManagerTemplate toolId="font-pairing" icon={<Type size={18} />} color={COLOR} toolPath="/tools/font-pairing">
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} style={{ color: COLOR }} />
          <h2 className="font-bold text-gray-900 dark:text-white">Credits & Output</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Credits Per Generation" type="number" value={creditsPerUse}
            onChange={e => setCreditsPerUse(e.target.value)} />
          <Input label="Pairing Sets Per Result" type="number" value={pairingSetsCount}
            onChange={e => setPairingSetsCount(e.target.value)} />
          <Input label="Guest Free Credits" type="number" value={guestCredits}
            onChange={e => setGuestCredits(e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Feature Toggles</h2>
        <div className="space-y-3">
          {[
            { label: 'Allow Guest Access', desc: 'Guests can use this tool with free credits', value: guestAllowed, onChange: setGuestAllowed },
            { label: 'Google Fonts Links', desc: 'Show direct links to Google Fonts for each font', value: googleFontsLinks, onChange: setGoogleFontsLinks },
            { label: 'Pairing Score', desc: 'Display harmony score for each font pairing set', value: pairingScore, onChange: setPairingScore },
            { label: 'Custom Font Input', desc: 'Allow users to type any font name (not just popular list)', value: customFontInput, onChange: setCustomFontInput },
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
