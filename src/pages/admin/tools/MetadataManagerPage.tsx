import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Card';
import { useAdminStore } from '../../../store/useAdminStore';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Image, Save, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export const MetadataManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [settings, setSettings] = useState({
    meta_credits_per_use: get('meta_credits_per_use', '5'),
    meta_max_keywords: get('meta_max_keywords', '50'),
    meta_max_title_chars: get('meta_max_title_chars', '200'),
    meta_max_description_chars: get('meta_max_description_chars', '2000'),
    meta_page_title: get('meta_page_title', 'AI Metadata Generator'),
    meta_page_subtitle: get('meta_page_subtitle', 'Generate SEO-optimized titles, keywords and descriptions for stock platforms.'),
    meta_guest_credits: get('meta_guest_credits', '50'),
  });

  const [guestAllowed, setGuestAllowed] = useState(get('meta_guest_allowed', 'true') === 'true');
  const [bulkAllowed, setBulkAllowed] = useState(get('meta_bulk_allowed', 'true') === 'true');

  const save = () => {
    bulkUpdateCMSContent({
      ...settings,
      meta_guest_allowed: guestAllowed ? 'true' : 'false',
      meta_bulk_allowed: bulkAllowed ? 'true' : 'false',
    });
    toast.success('Metadata tool settings saved');
  };

  return (
    <ToolManagerTemplate toolId="metadata" icon={<Image size={18} />} color="#6366F1" toolPath="/tools/metadata">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Credits &amp; Limits</h2>
          </div>
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save</Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <Input label="Credits Per Generation" type="number" value={settings.meta_credits_per_use} onChange={e => setSettings(s => ({ ...s, meta_credits_per_use: e.target.value }))} />
          <Input label="Max Keywords" type="number" value={settings.meta_max_keywords} onChange={e => setSettings(s => ({ ...s, meta_max_keywords: e.target.value }))} />
          <Input label="Guest Free Credits" type="number" value={settings.meta_guest_credits} onChange={e => setSettings(s => ({ ...s, meta_guest_credits: e.target.value }))} />
          <Input label="Max Title Characters" type="number" value={settings.meta_max_title_chars} onChange={e => setSettings(s => ({ ...s, meta_max_title_chars: e.target.value }))} />
          <Input label="Max Description Characters" type="number" value={settings.meta_max_description_chars} onChange={e => setSettings(s => ({ ...s, meta_max_description_chars: e.target.value }))} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Guest Access</p>
            <Toggle checked={guestAllowed} onChange={setGuestAllowed} label="" />
          </div>
          <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Bulk Generation</p>
            <Toggle checked={bulkAllowed} onChange={setBulkAllowed} label="" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Image size={16} className="text-[#6366F1]" />
          <h2 className="font-bold text-gray-900 dark:text-white">UI Text</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Page Title" value={settings.meta_page_title} onChange={e => setSettings(s => ({ ...s, meta_page_title: e.target.value }))} />
          <div className="sm:col-span-2">
            <Input label="Page Subtitle" value={settings.meta_page_subtitle} onChange={e => setSettings(s => ({ ...s, meta_page_subtitle: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save UI Text</Button>
        </div>
      </Card>
    </ToolManagerTemplate>
  );
};
