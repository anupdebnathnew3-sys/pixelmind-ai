import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Card';
import { useAdminStore } from '../../../store/useAdminStore';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Globe, Save, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORMS = ['Facebook', 'Instagram', 'Twitter / X', 'LinkedIn', 'Pinterest', 'TikTok', 'YouTube'];

export const SocialManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [settings, setSettings] = useState({
    social_credits_per_use: get('social_credits_per_use', '8'),
    social_guest_credits: get('social_guest_credits', '50'),
    social_page_title: get('social_page_title', 'Social Media Scheduler'),
    social_page_subtitle: get('social_page_subtitle', 'Schedule and manage posts across all your social platforms.'),
  });

  const [guestAllowed, setGuestAllowed] = useState(get('social_guest_allowed', 'true') === 'true');

  const platformEnabled = (p: string) => get(`social_platform_${p.toLowerCase().replace(/[^a-z]/g, '_')}`, 'true') === 'true';
  const togglePlatform = (p: string, v: boolean) => {
    bulkUpdateCMSContent({ [`social_platform_${p.toLowerCase().replace(/[^a-z]/g, '_')}`]: v ? 'true' : 'false' });
  };

  const save = () => {
    bulkUpdateCMSContent({
      ...settings,
      social_guest_allowed: guestAllowed ? 'true' : 'false',
    });
    toast.success('Social Scheduler settings saved');
  };

  return (
    <ToolManagerTemplate toolId="social-scheduler" icon={<Globe size={18} />} color="#EC4899" toolPath="/tools/social-scheduler">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#EC4899]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Credits &amp; Access</h2>
          </div>
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Input label="Credits Per Post" type="number" value={settings.social_credits_per_use} onChange={e => setSettings(s => ({ ...s, social_credits_per_use: e.target.value }))} />
          <Input label="Guest Free Credits" type="number" value={settings.social_guest_credits} onChange={e => setSettings(s => ({ ...s, social_guest_credits: e.target.value }))} />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Guest Access</p>
          <Toggle checked={guestAllowed} onChange={setGuestAllowed} label="" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Globe size={16} className="text-[#EC4899]" />
          <h2 className="font-bold text-gray-900 dark:text-white">Platform Toggles</h2>
          <span className="ml-auto text-xs text-gray-400">Enable/disable individual platforms</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLATFORMS.map(platform => (
            <div key={platform} className="flex items-center justify-between p-3 border border-gray-100 dark:border-[#232650] rounded-xl">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{platform}</p>
              <Toggle checked={platformEnabled(platform)} onChange={v => togglePlatform(platform, v)} label="" />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Globe size={16} className="text-[#EC4899]" />
          <h2 className="font-bold text-gray-900 dark:text-white">UI Text</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Page Title" value={settings.social_page_title} onChange={e => setSettings(s => ({ ...s, social_page_title: e.target.value }))} />
          <div className="sm:col-span-2">
            <Input label="Page Subtitle" value={settings.social_page_subtitle} onChange={e => setSettings(s => ({ ...s, social_page_subtitle: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save UI Text</Button>
        </div>
      </Card>
    </ToolManagerTemplate>
  );
};
