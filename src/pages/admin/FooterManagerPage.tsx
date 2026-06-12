import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminStore } from '../../store/useAdminStore';
import { PanelTop, Save, Link, ExternalLink, AtSign, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const FooterManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  const get = (key: string, fallback = '') => cmsContent[key] ?? fallback;

  const parseLinks = (key: string, fallbackJson: string): { label: string; url: string }[] => {
    try { return JSON.parse(get(key, fallbackJson)); } catch { return []; }
  };

  const [general, setGeneral] = useState({
    footer_tagline: get('footer_tagline', 'AI-powered creative tools for visual creators worldwide.'),
    footer_copyright: get('footer_copyright', `© ${new Date().getFullYear()} PixelMind AI. All rights reserved.`),
    footer_brand: get('footer_brand', 'PixelMind AI'),
  });

  const [socials, setSocials] = useState({
    footer_twitter: get('footer_twitter', ''),
    footer_github: get('footer_github', ''),
    footer_instagram: get('footer_instagram', ''),
    footer_facebook: get('footer_facebook', ''),
    footer_youtube: get('footer_youtube', ''),
  });

  const defaultQuickLinks = '[{"label":"Home","url":"/"},{"label":"Features","url":"/features"},{"label":"Pricing","url":"/pricing"},{"label":"About","url":"/about"},{"label":"Contact","url":"/contact"}]';
  const defaultLegalLinks = '[{"label":"Terms & Conditions","url":"/terms"},{"label":"Privacy Policy","url":"/privacy"}]';

  const [quickLinks, setQuickLinks] = useState(parseLinks('footer_quick_links', defaultQuickLinks));
  const [legalLinks, setLegalLinks] = useState(parseLinks('footer_legal_links', defaultLegalLinks));

  const save = () => {
    bulkUpdateCMSContent({
      ...general,
      ...socials,
      footer_quick_links: JSON.stringify(quickLinks),
      footer_legal_links: JSON.stringify(legalLinks),
    });
    toast.success('Footer saved');
  };

  const addQuickLink = () => setQuickLinks(l => [...l, { label: 'New Link', url: '/' }]);
  const removeQuickLink = (i: number) => setQuickLinks(l => l.filter((_, idx) => idx !== i));
  const updateQuickLink = (i: number, field: 'label' | 'url', value: string) =>
    setQuickLinks(l => l.map((link, idx) => idx === i ? { ...link, [field]: value } : link));

  const addLegalLink = () => setLegalLinks(l => [...l, { label: 'New Link', url: '/' }]);
  const removeLegalLink = (i: number) => setLegalLinks(l => l.filter((_, idx) => idx !== i));
  const updateLegalLink = (i: number, field: 'label' | 'url', value: string) =>
    setLegalLinks(l => l.map((link, idx) => idx === i ? { ...link, [field]: value } : link));

  return (
    <DashboardLayout requireAdmin>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
            <PanelTop size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Footer Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Edit footer text, links and social icons</p>
          </div>
        </div>
        <Button icon={<Save size={14} />} onClick={save}>Save All Changes</Button>
      </div>

      <div className="space-y-6">

        {/* General */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <PanelTop size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">General</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Footer Brand Name" value={general.footer_brand} onChange={e => setGeneral(g => ({ ...g, footer_brand: e.target.value }))} />
            <Input label="Footer Tagline" value={general.footer_tagline} onChange={e => setGeneral(g => ({ ...g, footer_tagline: e.target.value }))} />
            <div className="sm:col-span-2">
              <Input label="Copyright Text" value={general.footer_copyright} onChange={e => setGeneral(g => ({ ...g, footer_copyright: e.target.value }))} />
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Link size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Social Media Links</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Twitter / X URL" value={socials.footer_twitter} onChange={e => setSocials(s => ({ ...s, footer_twitter: e.target.value }))} icon={<AtSign size={14} />} placeholder="https://twitter.com/..." />
            <Input label="GitHub URL" value={socials.footer_github} onChange={e => setSocials(s => ({ ...s, footer_github: e.target.value }))} icon={<ExternalLink size={14} />} placeholder="https://github.com/..." />
            <Input label="Instagram URL" value={socials.footer_instagram} onChange={e => setSocials(s => ({ ...s, footer_instagram: e.target.value }))} icon={<ExternalLink size={14} />} placeholder="https://instagram.com/..." />
            <Input label="Facebook URL" value={socials.footer_facebook} onChange={e => setSocials(s => ({ ...s, footer_facebook: e.target.value }))} icon={<ExternalLink size={14} />} placeholder="https://facebook.com/..." />
            <Input label="YouTube URL" value={socials.footer_youtube} onChange={e => setSocials(s => ({ ...s, footer_youtube: e.target.value }))} icon={<ExternalLink size={14} />} placeholder="https://youtube.com/..." />
          </div>
        </Card>

        {/* Quick Links */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Link size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Quick Links</h2>
            </div>
            <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={addQuickLink}>Add Link</Button>
          </div>
          <div className="space-y-2">
            {quickLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={link.label}
                  onChange={e => updateQuickLink(i, 'label', e.target.value)}
                  placeholder="Label"
                />
                <Input
                  value={link.url}
                  onChange={e => updateQuickLink(i, 'url', e.target.value)}
                  placeholder="/path or https://..."
                />
                <button
                  onClick={() => removeQuickLink(i)}
                  className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Legal Links */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Link size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Legal Links</h2>
            </div>
            <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={addLegalLink}>Add Link</Button>
          </div>
          <div className="space-y-2">
            {legalLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={link.label}
                  onChange={e => updateLegalLink(i, 'label', e.target.value)}
                  placeholder="Label"
                />
                <Input
                  value={link.url}
                  onChange={e => updateLegalLink(i, 'url', e.target.value)}
                  placeholder="/path"
                />
                <button
                  onClick={() => removeLegalLink(i)}
                  className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};
