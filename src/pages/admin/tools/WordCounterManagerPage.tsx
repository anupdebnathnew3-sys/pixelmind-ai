import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Card';
import { useAdminStore } from '../../../store/useAdminStore';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Hash, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const STATS = [
  { key: 'show_words', label: 'Word Count' },
  { key: 'show_chars', label: 'Character Count' },
  { key: 'show_chars_no_spaces', label: 'Characters (no spaces)' },
  { key: 'show_sentences', label: 'Sentence Count' },
  { key: 'show_paragraphs', label: 'Paragraph Count' },
  { key: 'show_reading_time', label: 'Reading Time' },
  { key: 'show_speaking_time', label: 'Speaking Time' },
  { key: 'show_syllables', label: 'Syllable Count' },
  { key: 'show_unique_words', label: 'Unique Words' },
];

export const WordCounterManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [settings, setSettings] = useState({
    wc_page_title: get('wc_page_title', 'Word Counter'),
    wc_page_subtitle: get('wc_page_subtitle', 'Count words, characters, sentences and more in real-time.'),
  });

  const [guestAllowed, setGuestAllowed] = useState(get('wc_guest_allowed', 'true') === 'true');

  const statEnabled = (key: string) => get(`wc_${key}`, 'true') === 'true';
  const toggleStat = (key: string, v: boolean) => bulkUpdateCMSContent({ [`wc_${key}`]: v ? 'true' : 'false' });

  const save = () => {
    bulkUpdateCMSContent({
      ...settings,
      wc_guest_allowed: guestAllowed ? 'true' : 'false',
    });
    toast.success('Word Counter settings saved');
  };

  return (
    <ToolManagerTemplate toolId="word-counter" icon={<Hash size={18} />} color="#0EA5E9" toolPath="/tools/word-counter">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#0EA5E9]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Displayed Statistics</h2>
          </div>
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {STATS.map(stat => (
            <div key={stat.key} className="flex items-center justify-between p-3 border border-gray-100 dark:border-[#232650] rounded-xl">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{stat.label}</p>
              <Toggle checked={statEnabled(stat.key)} onChange={v => toggleStat(stat.key, v)} label="" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Guest Access</p>
          <Toggle checked={guestAllowed} onChange={setGuestAllowed} label="" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Hash size={16} className="text-[#0EA5E9]" />
          <h2 className="font-bold text-gray-900 dark:text-white">UI Text</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Page Title" value={settings.wc_page_title} onChange={e => setSettings(s => ({ ...s, wc_page_title: e.target.value }))} />
          <div className="sm:col-span-2">
            <Input label="Page Subtitle" value={settings.wc_page_subtitle} onChange={e => setSettings(s => ({ ...s, wc_page_subtitle: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save UI Text</Button>
        </div>
      </Card>
    </ToolManagerTemplate>
  );
};
