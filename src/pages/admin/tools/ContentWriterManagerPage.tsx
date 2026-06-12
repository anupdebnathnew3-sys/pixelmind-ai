import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Card';
import { useAdminStore } from '../../../store/useAdminStore';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { FileText, Save, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContentWriterManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [settings, setSettings] = useState({
    cw_credits_per_use: get('cw_credits_per_use', '15'),
    cw_max_output_words: get('cw_max_output_words', '2000'),
    cw_guest_credits: get('cw_guest_credits', '50'),
    cw_page_title: get('cw_page_title', 'AI Content Writer'),
    cw_page_subtitle: get('cw_page_subtitle', 'Write blogs, scripts, emails and product descriptions with AI.'),
  });

  const [guestAllowed, setGuestAllowed] = useState(get('cw_guest_allowed', 'true') === 'true');
  const [markdownEnabled, setMarkdownEnabled] = useState(get('cw_markdown_enabled', 'true') === 'true');

  const save = () => {
    bulkUpdateCMSContent({
      ...settings,
      cw_guest_allowed: guestAllowed ? 'true' : 'false',
      cw_markdown_enabled: markdownEnabled ? 'true' : 'false',
    });
    toast.success('Content Writer settings saved');
  };

  return (
    <ToolManagerTemplate toolId="content-writer" icon={<FileText size={18} />} color="#10B981" toolPath="/tools/content-writer">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#10B981]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Credits &amp; Limits</h2>
          </div>
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save</Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <Input label="Credits Per Generation" type="number" value={settings.cw_credits_per_use} onChange={e => setSettings(s => ({ ...s, cw_credits_per_use: e.target.value }))} />
          <Input label="Max Output Words" type="number" value={settings.cw_max_output_words} onChange={e => setSettings(s => ({ ...s, cw_max_output_words: e.target.value }))} />
          <Input label="Guest Free Credits" type="number" value={settings.cw_guest_credits} onChange={e => setSettings(s => ({ ...s, cw_guest_credits: e.target.value }))} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Guest Access</p>
            <Toggle checked={guestAllowed} onChange={setGuestAllowed} label="" />
          </div>
          <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Markdown Output</p>
            <Toggle checked={markdownEnabled} onChange={setMarkdownEnabled} label="" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <FileText size={16} className="text-[#10B981]" />
          <h2 className="font-bold text-gray-900 dark:text-white">UI Text</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Page Title" value={settings.cw_page_title} onChange={e => setSettings(s => ({ ...s, cw_page_title: e.target.value }))} />
          <div className="sm:col-span-2">
            <Input label="Page Subtitle" value={settings.cw_page_subtitle} onChange={e => setSettings(s => ({ ...s, cw_page_subtitle: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save UI Text</Button>
        </div>
      </Card>
    </ToolManagerTemplate>
  );
};
