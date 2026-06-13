import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Card';
import { useAdminStore } from '../../../store/useAdminStore';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Image, Save, Hash, Download, Shield } from 'lucide-react';
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
  const [embedEnabled, setEmbedEnabled] = useState(get('meta_embed_enabled', 'true') === 'true');
  const [zipEnabled,   setZipEnabled]   = useState(get('meta_zip_enabled',   'true') === 'true');
  const [embedSettings, setEmbedSettings] = useState({
    meta_embed_copyright: get('meta_embed_copyright', ''),
    meta_embed_creator:   get('meta_embed_creator', ''),
    meta_embed_website:   get('meta_embed_website', ''),
  });

  const save = () => {
    bulkUpdateCMSContent({
      ...settings,
      meta_guest_allowed: guestAllowed ? 'true' : 'false',
      meta_bulk_allowed: bulkAllowed ? 'true' : 'false',
    });
    toast.success('Metadata tool settings saved');
  };

  const saveEmbed = () => {
    bulkUpdateCMSContent({
      ...embedSettings,
      meta_embed_enabled: embedEnabled ? 'true' : 'false',
      meta_zip_enabled:   zipEnabled   ? 'true' : 'false',
    });
    toast.success('Embedding settings saved');
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

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Metadata Embedding</h2>
          </div>
          <Button size="sm" icon={<Save size={14} />} onClick={saveEmbed}>Save</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Metadata Embedding</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Embed XMP + IPTC into image files</p>
            </div>
            <Toggle checked={embedEnabled} onChange={setEmbedEnabled} label="" />
          </div>
          <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">ZIP Export</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bundle images + TXT + CSV in ZIP</p>
            </div>
            <Toggle checked={zipEnabled} onChange={setZipEnabled} label="" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="Default Copyright Text"
            placeholder="© 2024 Your Company"
            value={embedSettings.meta_embed_copyright}
            onChange={e => setEmbedSettings(s => ({ ...s, meta_embed_copyright: e.target.value }))}
          />
          <Input
            label="Default Creator / Author Name"
            placeholder="e.g. PixelMind AI"
            value={embedSettings.meta_embed_creator}
            onChange={e => setEmbedSettings(s => ({ ...s, meta_embed_creator: e.target.value }))}
          />
          <Input
            label="Website / Source URL"
            placeholder="https://yoursite.com"
            value={embedSettings.meta_embed_website}
            onChange={e => setEmbedSettings(s => ({ ...s, meta_embed_website: e.target.value }))}
          />
        </div>

        <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
          <Shield size={14} className="text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Supported formats — zero quality loss</p>
            <div className="flex flex-wrap gap-2">
              {['JPEG · XMP APP1 + IPTC APP13', 'PNG · iTXt + XMP chunk', 'WEBP · XMP chunk (VP8X)'].map(f => (
                <span key={f} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-xs font-mono">{f}</span>
              ))}
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">Metadata is injected as binary segments — image pixels and compression are never touched.</p>
          </div>
        </div>
      </Card>
    </ToolManagerTemplate>
  );
};
