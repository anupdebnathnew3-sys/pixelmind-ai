import React, { useState } from 'react';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import { Palette, Save, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const COLOR = '#EC4899';

export const ColorPaletteManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  const [creditsPerUse, setCreditsPerUse] = useState(cmsContent['cp_credits_per_use'] ?? '1');
  const [paletteCount, setPaletteCount] = useState(cmsContent['cp_palette_count'] ?? '3');
  const [guestCredits, setGuestCredits] = useState(cmsContent['cp_guest_credits'] ?? '50');
  const [guestAllowed, setGuestAllowed] = useState(cmsContent['cp_guest_allowed'] !== 'false');
  const [downloadEnabled, setDownloadEnabled] = useState(cmsContent['cp_download_enabled'] !== 'false');
  const [darkPreviewEnabled, setDarkPreviewEnabled] = useState(cmsContent['cp_dark_preview'] !== 'false');

  const save = () => {
    bulkUpdateCMSContent({
      cp_credits_per_use:   creditsPerUse,
      cp_palette_count:     paletteCount,
      cp_guest_credits:     guestCredits,
      cp_guest_allowed:     String(guestAllowed),
      cp_download_enabled:  String(downloadEnabled),
      cp_dark_preview:      String(darkPreviewEnabled),
    });
    toast.success('Color Palette Manager settings saved');
  };

  return (
    <ToolManagerTemplate toolId="color-palette" icon={<Palette size={18} />} color={COLOR} toolPath="/tools/color-palette">
      {/* Credits & Limits */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} style={{ color: COLOR }} />
          <h2 className="font-bold text-gray-900 dark:text-white">Credits & Limits</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <Input label="Credits Per Generation" type="number" value={creditsPerUse}
            onChange={e => setCreditsPerUse(e.target.value)} />
          <Input label="Palettes Per Generation" type="number" value={paletteCount}
            onChange={e => setPaletteCount(e.target.value)} />
          <Input label="Guest Free Credits" type="number" value={guestCredits}
            onChange={e => setGuestCredits(e.target.value)} />
        </div>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Feature Toggles</h2>
        <div className="space-y-3">
          {[
            { label: 'Allow Guest Access', desc: 'Guests can use this tool with free credits', value: guestAllowed, onChange: setGuestAllowed },
            { label: 'Enable CSS Download', desc: 'Users can download palettes as CSS variables', value: downloadEnabled, onChange: setDownloadEnabled },
            { label: 'Enable Dark Mode Preview', desc: 'Show dark mode brand preview for palettes', value: darkPreviewEnabled, onChange: setDarkPreviewEnabled },
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
