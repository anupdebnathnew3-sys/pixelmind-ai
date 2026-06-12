import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Card';
import { useAdminStore } from '../../../store/useAdminStore';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { MessageSquare, Save, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export const SloganManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [settings, setSettings] = useState({
    slogan_credits_per_use: get('slogan_credits_per_use', '5'),
    slogan_results_per_gen: get('slogan_results_per_gen', '5'),
    slogan_guest_credits: get('slogan_guest_credits', '50'),
    slogan_page_title: get('slogan_page_title', 'Slogan Generator'),
    slogan_page_subtitle: get('slogan_page_subtitle', 'Create memorable slogans and taglines for your brand.'),
  });

  const [guestAllowed, setGuestAllowed] = useState(get('slogan_guest_allowed', 'true') === 'true');

  const save = () => {
    bulkUpdateCMSContent({
      ...settings,
      slogan_guest_allowed: guestAllowed ? 'true' : 'false',
    });
    toast.success('Slogan Generator settings saved');
  };

  return (
    <ToolManagerTemplate toolId="slogan-generator" icon={<MessageSquare size={18} />} color="#F59E0B" toolPath="/tools/slogan-generator">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#F59E0B]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Credits &amp; Limits</h2>
          </div>
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save</Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <Input label="Credits Per Generation" type="number" value={settings.slogan_credits_per_use} onChange={e => setSettings(s => ({ ...s, slogan_credits_per_use: e.target.value }))} />
          <Input label="Results Per Generation" type="number" value={settings.slogan_results_per_gen} onChange={e => setSettings(s => ({ ...s, slogan_results_per_gen: e.target.value }))} />
          <Input label="Guest Free Credits" type="number" value={settings.slogan_guest_credits} onChange={e => setSettings(s => ({ ...s, slogan_guest_credits: e.target.value }))} />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Guest Access</p>
          <Toggle checked={guestAllowed} onChange={setGuestAllowed} label="" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare size={16} className="text-[#F59E0B]" />
          <h2 className="font-bold text-gray-900 dark:text-white">UI Text</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Page Title" value={settings.slogan_page_title} onChange={e => setSettings(s => ({ ...s, slogan_page_title: e.target.value }))} />
          <div className="sm:col-span-2">
            <Input label="Page Subtitle" value={settings.slogan_page_subtitle} onChange={e => setSettings(s => ({ ...s, slogan_page_subtitle: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save UI Text</Button>
        </div>
      </Card>
    </ToolManagerTemplate>
  );
};
