import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Card';
import { useAdminStore } from '../../store/useAdminStore';
import { Search, Save, Globe, Image, FileText, Link } from 'lucide-react';
import toast from 'react-hot-toast';

export const SEOSettingsPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [meta, setMeta] = useState({
    seo_site_title: get('seo_site_title', 'PixelMind AI — AI Creative Suite for Visual Creators'),
    seo_site_description: get('seo_site_description', 'Generate AI prompts for Midjourney & DALL·E, create stock metadata for Adobe Stock & Shutterstock. 50 free credits, no signup required.'),
    seo_keywords: get('seo_keywords', 'AI prompts, Midjourney prompts, stock image metadata, Adobe Stock, Shutterstock, AI creative tools'),
    seo_og_title: get('seo_og_title', 'PixelMind AI — AI Creative Suite for Visual Creators'),
    seo_og_description: get('seo_og_description', 'Generate perfect AI prompts and stock metadata in seconds. Free to try, no account needed.'),
    seo_og_image: get('seo_og_image', ''),
    seo_twitter_card: get('seo_twitter_card', 'summary_large_image'),
    seo_twitter_handle: get('seo_twitter_handle', '@pixelmindai'),
    seo_canonical_url: get('seo_canonical_url', 'https://anupdebnath.github.io/enterprise-ai-saas-architecture'),
    seo_robots_txt: get('seo_robots_txt', 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api'),
    seo_sitemap_url: get('seo_sitemap_url', '/sitemap.xml'),
    seo_google_analytics: get('seo_google_analytics', ''),
    seo_google_search_console: get('seo_google_search_console', ''),
  });

  const [sitemapEnabled, setSitemapEnabled] = useState(get('seo_sitemap_enabled', 'true') === 'true');
  const [robotsEnabled, setRobotsEnabled] = useState(get('seo_robots_enabled', 'true') === 'true');

  const save = () => {
    bulkUpdateCMSContent({
      ...meta,
      seo_sitemap_enabled: sitemapEnabled ? 'true' : 'false',
      seo_robots_enabled: robotsEnabled ? 'true' : 'false',
    });
    toast.success('SEO settings saved');
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
            <Search size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">SEO Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Meta tags, Open Graph, sitemap and search console</p>
          </div>
        </div>
        <Button icon={<Save size={14} />} onClick={save}>Save All SEO</Button>
      </div>

      <div className="space-y-6">

        {/* Basic Meta */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <FileText size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Basic Meta Tags</h2>
          </div>
          <div className="space-y-4">
            <Input label="Site Title (shown in browser tab)" value={meta.seo_site_title} onChange={e => setMeta(m => ({ ...m, seo_site_title: e.target.value }))} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Meta Description <span className="font-normal text-gray-400">({meta.seo_site_description.length}/160)</span>
              </label>
              <textarea value={meta.seo_site_description} onChange={e => setMeta(m => ({ ...m, seo_site_description: e.target.value }))} rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Keywords (comma-separated)</label>
              <textarea value={meta.seo_keywords} onChange={e => setMeta(m => ({ ...m, seo_keywords: e.target.value }))} rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-none transition-colors" />
            </div>
            <Input label="Canonical URL" value={meta.seo_canonical_url} onChange={e => setMeta(m => ({ ...m, seo_canonical_url: e.target.value }))} icon={<Link size={14} />} />
          </div>
        </Card>

        {/* Open Graph */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Globe size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Open Graph / Social Sharing</h2>
          </div>
          <div className="space-y-4">
            <Input label="OG Title" value={meta.seo_og_title} onChange={e => setMeta(m => ({ ...m, seo_og_title: e.target.value }))} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">OG Description</label>
              <textarea value={meta.seo_og_description} onChange={e => setMeta(m => ({ ...m, seo_og_description: e.target.value }))} rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-none transition-colors" />
            </div>
            <Input label="OG Image URL (1200×630 recommended)" value={meta.seo_og_image} onChange={e => setMeta(m => ({ ...m, seo_og_image: e.target.value }))} icon={<Image size={14} />} placeholder="https://..." />
          </div>
        </Card>

        {/* Twitter Card */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Globe size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Twitter Card</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Card Type</label>
              <select value={meta.seo_twitter_card} onChange={e => setMeta(m => ({ ...m, seo_twitter_card: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] transition-colors">
                <option value="summary_large_image">Summary Large Image</option>
                <option value="summary">Summary</option>
                <option value="app">App</option>
              </select>
            </div>
            <Input label="Twitter Handle" value={meta.seo_twitter_handle} onChange={e => setMeta(m => ({ ...m, seo_twitter_handle: e.target.value }))} placeholder="@handle" />
          </div>
        </Card>

        {/* Analytics */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Search size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Analytics &amp; Search Console</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Google Analytics ID" value={meta.seo_google_analytics} onChange={e => setMeta(m => ({ ...m, seo_google_analytics: e.target.value }))} placeholder="G-XXXXXXXXXX" />
            <Input label="Google Search Console Verification" value={meta.seo_google_search_console} onChange={e => setMeta(m => ({ ...m, seo_google_search_console: e.target.value }))} placeholder="Verification meta content value" />
          </div>
        </Card>

        {/* Sitemap & Robots */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <FileText size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Sitemap &amp; Robots.txt</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Sitemap.xml</p>
                <p className="text-xs text-gray-400">Serve /sitemap.xml for search engine indexing</p>
              </div>
              <Toggle checked={sitemapEnabled} onChange={setSitemapEnabled} label="" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Robots.txt</p>
                <p className="text-xs text-gray-400">Serve /robots.txt with the rules below</p>
              </div>
              <Toggle checked={robotsEnabled} onChange={setRobotsEnabled} label="" />
            </div>
            {robotsEnabled && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">robots.txt Content</label>
                <textarea value={meta.seo_robots_txt} onChange={e => setMeta(m => ({ ...m, seo_robots_txt: e.target.value }))} rows={5}
                  className="w-full px-3 py-2 text-sm font-mono border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-y transition-colors" />
              </div>
            )}
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};
