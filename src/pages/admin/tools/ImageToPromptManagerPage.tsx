import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Card';
import { useAdminStore } from '../../../store/useAdminStore';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { ImagePlus, Save, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export const ImageToPromptManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [settings, setSettings] = useState({
    i2p_credits_per_use: get('i2p_credits_per_use', '10'),
    i2p_max_images_per_batch: get('i2p_max_images_per_batch', '10'),
    i2p_page_title: get('i2p_page_title', 'Image to Prompt Generator'),
    i2p_page_subtitle: get('i2p_page_subtitle', 'Upload an image and instantly get AI-optimized prompts for any platform.'),
    i2p_output_placeholder: get('i2p_output_placeholder', 'Your generated prompt will appear here...'),
    i2p_upload_label: get('i2p_upload_label', 'Drop your image here or click to browse'),
    i2p_guestCredits: get('i2p_guestCredits', '50'),
  });

  const [allowBatch, setAllowBatch] = useState(get('i2p_allow_batch', 'true') === 'true');
  const [guestAllowed, setGuestAllowed] = useState(get('i2p_guest_allowed', 'true') === 'true');

  const save = () => {
    bulkUpdateCMSContent({
      ...settings,
      i2p_allow_batch: allowBatch ? 'true' : 'false',
      i2p_guest_allowed: guestAllowed ? 'true' : 'false',
    });
    toast.success('Image to Prompt settings saved');
  };

  return (
    <ToolManagerTemplate toolId="image-to-prompt" icon={<ImagePlus size={18} />} color="#8B5CF6" toolPath="/tools/image-to-prompt">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#8B5CF6]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Credits &amp; Limits</h2>
          </div>
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save</Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <Input label="Credits Per Use" type="number" value={settings.i2p_credits_per_use} onChange={e => setSettings(s => ({ ...s, i2p_credits_per_use: e.target.value }))} />
          <Input label="Max Images Per Batch" type="number" value={settings.i2p_max_images_per_batch} onChange={e => setSettings(s => ({ ...s, i2p_max_images_per_batch: e.target.value }))} />
          <Input label="Guest Free Credits" type="number" value={settings.i2p_guestCredits} onChange={e => setSettings(s => ({ ...s, i2p_guestCredits: e.target.value }))} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Allow Batch Processing</p>
            <Toggle checked={allowBatch} onChange={setAllowBatch} label="" />
          </div>
          <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Guest Access</p>
            <Toggle checked={guestAllowed} onChange={setGuestAllowed} label="" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <ImagePlus size={16} className="text-[#8B5CF6]" />
          <h2 className="font-bold text-gray-900 dark:text-white">UI Text</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Page Title" value={settings.i2p_page_title} onChange={e => setSettings(s => ({ ...s, i2p_page_title: e.target.value }))} />
          <Input label="Upload Label" value={settings.i2p_upload_label} onChange={e => setSettings(s => ({ ...s, i2p_upload_label: e.target.value }))} />
          <div className="sm:col-span-2">
            <Input label="Page Subtitle" value={settings.i2p_page_subtitle} onChange={e => setSettings(s => ({ ...s, i2p_page_subtitle: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Output Placeholder" value={settings.i2p_output_placeholder} onChange={e => setSettings(s => ({ ...s, i2p_output_placeholder: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save UI Text</Button>
        </div>
      </Card>
    </ToolManagerTemplate>
  );
};
