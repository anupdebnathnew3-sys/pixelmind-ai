import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Card';
import { useAdminStore } from '../../store/useAdminStore';
import { Home, Save, Star, BarChart3, Zap, MessageSquare, Play, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const HomepageManagerPage: React.FC = () => {
  const {
    homepageContent, updateHomepageContent,
    featuredTools, updateFeaturedTool,
    demoVideo, updateDemoVideo,
    heroAnimationSettings, updateHeroAnimationSettings,
  } = useAdminStore();

  const [hero, setHero] = useState({ ...homepageContent });
  const [video, setVideo] = useState({ ...demoVideo });

  const saveHero = () => {
    updateHomepageContent(hero);
    toast.success('Hero section saved');
  };

  const saveVideo = () => {
    updateDemoVideo(video);
    toast.success('Demo video saved');
  };

  const animations = ['particles', 'aurora', 'orbit', 'starfield', 'neonwave', 'geometry', 'fireflies', 'digitalrain', 'plasma', 'none'] as const;

  return (
    <DashboardLayout requireAdmin>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
          <Home size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Homepage Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Edit every section of the public homepage</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Hero Section */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Hero Section</h2>
            </div>
            <Button size="sm" icon={<Save size={14} />} onClick={saveHero}>Save Hero</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Hero Badge Text" value={hero.heroBadge} onChange={e => setHero(h => ({ ...h, heroBadge: e.target.value }))} placeholder="The AI Creative Suite..." />
            <Input label="Micro Label (below badge)" value={hero.heroMicroLabel} onChange={e => setHero(h => ({ ...h, heroMicroLabel: e.target.value }))} placeholder="AI Prompts · Stock Metadata..." />
            <Input label="Hero Title Line 1" value={hero.heroTitleLine1} onChange={e => setHero(h => ({ ...h, heroTitleLine1: e.target.value }))} placeholder="Your Images Deserve" />
            <Input label="Hero Title Line 2" value={hero.heroTitleLine2} onChange={e => setHero(h => ({ ...h, heroTitleLine2: e.target.value }))} placeholder="Perfect Words." />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Hero Subtitle</label>
              <textarea
                value={hero.heroSubtitle}
                onChange={e => setHero(h => ({ ...h, heroSubtitle: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-none transition-colors"
              />
            </div>
          </div>
        </Card>

        {/* Stats Labels */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Stats Labels</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Stat 1 Label" value={hero.statsLabel1} onChange={e => setHero(h => ({ ...h, statsLabel1: e.target.value }))} />
            <Input label="Stat 2 Label" value={hero.statsLabel2} onChange={e => setHero(h => ({ ...h, statsLabel2: e.target.value }))} />
            <Input label="Stat 3 Label" value={hero.statsLabel3} onChange={e => setHero(h => ({ ...h, statsLabel3: e.target.value }))} />
            <Input label="Stat 4 Label" value={hero.statsLabel4} onChange={e => setHero(h => ({ ...h, statsLabel4: e.target.value }))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-[#232650]">
            <Input label="Features Section Title" value={hero.featuresTitle} onChange={e => setHero(h => ({ ...h, featuresTitle: e.target.value }))} />
            <Input label="Tools Section Title" value={hero.toolsSectionTitle} onChange={e => setHero(h => ({ ...h, toolsSectionTitle: e.target.value }))} />
            <div className="sm:col-span-2">
              <Input label="Features Subtitle" value={hero.featuresSubtitle} onChange={e => setHero(h => ({ ...h, featuresSubtitle: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Tools Section Subtitle" value={hero.toolsSectionSubtitle} onChange={e => setHero(h => ({ ...h, toolsSectionSubtitle: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#232650] grid sm:grid-cols-2 gap-4">
            <Input label="CTA Title" value={hero.ctaTitle} onChange={e => setHero(h => ({ ...h, ctaTitle: e.target.value }))} />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">CTA Subtitle</label>
              <textarea
                value={hero.ctaSubtitle}
                onChange={e => setHero(h => ({ ...h, ctaSubtitle: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-none transition-colors"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" icon={<Save size={14} />} onClick={saveHero}>Save All Text</Button>
          </div>
        </Card>

        {/* Hero Animation */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Hero Background Animation</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {animations.map(anim => (
              <button
                key={anim}
                onClick={() => updateHeroAnimationSettings({ activeAnimation: anim })}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${heroAnimationSettings.activeAnimation === anim ? 'bg-[#6366F1] text-white border-[#6366F1]' : 'border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400 hover:border-[#6366F1]'}`}
              >
                {anim}
              </button>
            ))}
          </div>
        </Card>

        {/* Featured Tools */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Star size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Featured Tools</h2>
            <span className="ml-auto text-xs text-gray-400">Toggle to show/hide on homepage</span>
          </div>
          <div className="space-y-3">
            {featuredTools.map(tool => (
              <div key={tool.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-[#232650] rounded-xl">
                <Toggle
                  checked={tool.active}
                  onChange={v => updateFeaturedTool(tool.id, { active: v })}
                  label=""
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{tool.name}</p>
                  <p className="text-xs text-gray-400">{tool.description}</p>
                </div>
                {tool.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#6366F1]">{tool.badge}</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Demo Video */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Play size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Demo Video Section</h2>
            </div>
            <Toggle checked={video.enabled} onChange={v => setVideo(vd => ({ ...vd, enabled: v }))} label="Show on homepage" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Video Title" value={video.title} onChange={e => setVideo(vd => ({ ...vd, title: e.target.value }))} />
            <Input label="YouTube / Video URL" value={video.url} onChange={e => setVideo(vd => ({ ...vd, url: e.target.value }))} placeholder="https://youtube.com/embed/..." />
            <Input label="Thumbnail URL" value={video.thumbnailUrl} onChange={e => setVideo(vd => ({ ...vd, thumbnailUrl: e.target.value }))} placeholder="https://..." />
            <div className="sm:col-span-2">
              <Input label="Video Description" value={video.description} onChange={e => setVideo(vd => ({ ...vd, description: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" icon={<Save size={14} />} onClick={saveVideo}>Save Video</Button>
          </div>
        </Card>

        {/* Quick reset */}
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl">
          <RefreshCw size={16} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Reset Homepage Content</p>
            <p className="text-xs text-red-500">This will restore all homepage text to the original default values.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setHero({ ...homepageContent }); toast('Reset to current saved values'); }}>
            <MessageSquare size={13} /> Reset Form
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
};
