import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdminStore } from '../../store/useAdminStore';
import {
  Settings, Wrench, FileText, Palette, Shield,
  RotateCcw, Save, ChevronDown, ChevronUp, Play, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'tools' | 'homepage' | 'ui' | 'system';

const FONT_FAMILIES = [
  'Noto Sans',
  'Open Sans',
  'Inter',
  'Roboto',
  'Lato',
  'Poppins',
  'Source Sans Pro',
];

const FONT_SIZES = ['12px', '13px', '14px', '15px', '16px', '18px'];

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`} />
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
);

export const GlobalSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('tools');
  const {
    tools, homepageContent, uiSettings, siteSettings, demoVideo, maintenanceMode, registrationEnabled,
    updateTool, updateHomepageContent, updateUISettings, updateSiteSettings, updateDemoVideo,
    setMaintenanceMode, setRegistrationEnabled, resetToDefaults,
  } = useAdminStore();

  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tools', label: 'Tools Control', icon: <Wrench size={16} /> },
    { id: 'homepage', label: 'Homepage Content', icon: <FileText size={16} /> },
    { id: 'ui', label: 'UI Settings', icon: <Palette size={16} /> },
    { id: 'system', label: 'System', icon: <Shield size={16} /> },
  ];

  const handleSaveToast = (section: string) => {
    toast.success(`${section} saved successfully!`);
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global Settings</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                Configure platform-wide settings and appearance
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            icon={<RotateCcw size={15} />}
            onClick={() => {
              resetToDefaults();
              toast.success('Settings reset to defaults!');
            }}
          >
            Reset Defaults
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-[#6366F1] shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Tools Control */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <SectionHeader
              title="Tool Configuration"
              subtitle="Enable or disable tools and configure their default appearance settings."
            />
            {tools.map(tool => (
              <Card key={tool.id} className="overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center">
                      <Wrench size={14} className="text-[#6366F1]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{tool.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {tool.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      checked={tool.enabled}
                      onChange={(v) => {
                        updateTool(tool.id, { enabled: v });
                        toast.success(`${tool.name} ${v ? 'enabled' : 'disabled'}`);
                      }}
                      label={tool.enabled ? 'Enabled' : 'Disabled'}
                    />
                    <button
                      onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {expandedTool === tool.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {expandedTool === tool.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        Font Family
                      </label>
                      <select
                        value={tool.fontFamily}
                        onChange={(e) => updateTool(tool.id, { fontFamily: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      >
                        {FONT_FAMILIES.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        Font Size
                      </label>
                      <select
                        value={tool.fontSize}
                        onChange={(e) => updateTool(tool.id, { fontSize: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      >
                        {FONT_SIZES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <Button
                        size="sm"
                        icon={<Save size={13} />}
                        onClick={() => handleSaveToast(tool.name)}
                      >
                        Save Tool Settings
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Homepage Content */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <SectionHeader
              title="Homepage Content"
              subtitle="Edit all text displayed on the public homepage."
            />

            {/* Hero Section */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-xs font-bold">1</span>
                Hero Section
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Hero Badge Text</label>
                  <input
                    type="text"
                    value={homepageContent.heroBadge}
                    onChange={(e) => updateHomepageContent({ heroBadge: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Hero Micro-Label <span className="text-gray-400 font-normal">(small uppercase line above headline)</span></label>
                  <input
                    type="text"
                    value={homepageContent.heroMicroLabel}
                    onChange={(e) => updateHomepageContent({ heroMicroLabel: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Headline Line 1 <span className="text-gray-400 font-normal">(white text)</span></label>
                  <input
                    type="text"
                    value={homepageContent.heroTitleLine1}
                    onChange={(e) => updateHomepageContent({ heroTitleLine1: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Headline Line 2 <span className="text-gray-400 font-normal">(gradient text)</span></label>
                  <input
                    type="text"
                    value={homepageContent.heroTitleLine2}
                    onChange={(e) => updateHomepageContent({ heroTitleLine2: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Hero Subtitle</label>
                  <textarea
                    rows={3}
                    value={homepageContent.heroSubtitle}
                    onChange={(e) => updateHomepageContent({ heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('Hero section')}>
                  Save Hero
                </Button>
              </div>
            </Card>

            {/* Stats Labels */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-xs font-bold">2</span>
                Stats Labels
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {(['statsLabel1', 'statsLabel2', 'statsLabel3', 'statsLabel4'] as const).map((key, i) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Stat {i + 1} Label
                    </label>
                    <input
                      type="text"
                      value={homepageContent[key]}
                      onChange={(e) => updateHomepageContent({ [key]: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('Stats labels')}>
                  Save Stats
                </Button>
              </div>
            </Card>

            {/* Tools Section */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-xs font-bold">3</span>
                Tools Section
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Section Title</label>
                  <input
                    type="text"
                    value={homepageContent.toolsSectionTitle}
                    onChange={(e) => updateHomepageContent({ toolsSectionTitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Section Subtitle</label>
                  <input
                    type="text"
                    value={homepageContent.toolsSectionSubtitle}
                    onChange={(e) => updateHomepageContent({ toolsSectionSubtitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('Tools section')}>
                  Save Tools Section
                </Button>
              </div>
            </Card>

            {/* Features Section */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-xs font-bold">4</span>
                Features &amp; CTA Section
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Features Title</label>
                  <input
                    type="text"
                    value={homepageContent.featuresTitle}
                    onChange={(e) => updateHomepageContent({ featuresTitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Features Subtitle</label>
                  <textarea
                    rows={3}
                    value={homepageContent.featuresSubtitle}
                    onChange={(e) => updateHomepageContent({ featuresSubtitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('Features section')}>
                  Save Features
                </Button>
              </div>
            </Card>

            {/* CTA Section */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-xs font-bold">5</span>
                CTA Section
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">CTA Title</label>
                  <input
                    type="text"
                    value={homepageContent.ctaTitle}
                    onChange={(e) => updateHomepageContent({ ctaTitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">CTA Subtitle</label>
                  <input
                    type="text"
                    value={homepageContent.ctaSubtitle}
                    onChange={(e) => updateHomepageContent({ ctaSubtitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('CTA section')}>
                  Save CTA
                </Button>
              </div>
            </Card>

            {/* Demo Video Section */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-xs font-bold">6</span>
                <Play size={14} className="text-[#6366F1]" />
                Demo Video
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Show video section on homepage</p>
                    <p className="text-xs text-gray-500 mt-0.5">Displays the demo video section below the features grid</p>
                  </div>
                  <ToggleSwitch
                    checked={demoVideo.enabled}
                    onChange={(v) => updateDemoVideo({ enabled: v })}
                    label={demoVideo.enabled ? 'Visible' : 'Hidden'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Video URL <span className="text-gray-400 font-normal">(YouTube, Vimeo, or direct URL)</span>
                  </label>
                  <input
                    type="text"
                    value={demoVideo.url}
                    onChange={(e) => updateDemoVideo({ url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 font-mono"
                  />
                  {demoVideo.url && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Video URL set — will be embedded on homepage
                    </p>
                  )}
                  {!demoVideo.url && (
                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      No URL set — placeholder will be shown
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Section Title</label>
                  <input
                    type="text"
                    value={demoVideo.title}
                    onChange={(e) => updateDemoVideo({ title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Section Description</label>
                  <textarea
                    rows={2}
                    value={demoVideo.description}
                    onChange={(e) => updateDemoVideo({ description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('Demo video')}>
                  Save Video Settings
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Tab: UI Settings */}
        {activeTab === 'ui' && (
          <div className="space-y-6">
            <SectionHeader
              title="UI Settings"
              subtitle="Customize the platform's visual appearance."
            />

            {/* Branding */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe size={16} className="text-[#6366F1]" />
                Site Branding
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Site Name</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => updateSiteSettings({ siteName: e.target.value })}
                    placeholder="PixelMind AI"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Navbar Brand Name</label>
                  <input
                    type="text"
                    value={siteSettings.navbarBrand}
                    onChange={(e) => updateSiteSettings({ navbarBrand: e.target.value })}
                    placeholder="PixelMind Pro"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Sidebar Brand Name</label>
                  <input
                    type="text"
                    value={siteSettings.sidebarBrand}
                    onChange={(e) => updateSiteSettings({ sidebarBrand: e.target.value })}
                    placeholder="PixelMind AI"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('Branding')}>
                  Save Branding
                </Button>
              </div>
            </Card>

            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Colors &amp; Color Presets</h4>
              {/* Quick color presets */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Indigo (Default)', primary: '#6366F1', accent: '#8B5CF6' },
                    { label: 'Blue', primary: '#3B82F6', accent: '#6366F1' },
                    { label: 'Violet', primary: '#7C3AED', accent: '#A855F7' },
                    { label: 'Rose', primary: '#E11D48', accent: '#F43F5E' },
                    { label: 'Emerald', primary: '#059669', accent: '#10B981' },
                    { label: 'Amber', primary: '#D97706', accent: '#F59E0B' },
                    { label: 'Cyan', primary: '#0891B2', accent: '#06B6D4' },
                    { label: 'Slate', primary: '#475569', accent: '#64748B' },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      title={preset.label}
                      onClick={() => {
                        updateUISettings({ primaryColor: preset.primary, accentColor: preset.accent });
                        toast.success(`Theme: ${preset.label}`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 transition-colors"
                    >
                      <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})` }} />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={uiSettings.primaryColor}
                      onChange={(e) => updateUISettings({ primaryColor: e.target.value })}
                      className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={uiSettings.primaryColor}
                      onChange={(e) => updateUISettings({ primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={uiSettings.accentColor}
                      onChange={(e) => updateUISettings({ accentColor: e.target.value })}
                      className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={uiSettings.accentColor}
                      onChange={(e) => updateUISettings({ accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('Colors')}>
                  Apply Colors
                </Button>
              </div>
            </Card>

            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Layout &amp; Style</h4>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Border Radius
                  </label>
                  <div className="flex gap-3">
                    {(['sharp', 'normal', 'rounded'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => updateUISettings({ borderRadius: r })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all capitalize ${
                          uiSettings.borderRadius === r
                            ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1] dark:bg-[#6366F1]/20'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Sidebar Style
                  </label>
                  <div className="flex gap-3">
                    {(['light', 'dark'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => updateUISettings({ sidebarStyle: s })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all capitalize ${
                          uiSettings.sidebarStyle === s
                            ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1] dark:bg-[#6366F1]/20'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Card Shadows</p>
                    <p className="text-xs text-gray-500 mt-0.5">Show drop shadows on cards</p>
                  </div>
                  <ToggleSwitch
                    checked={uiSettings.cardShadow}
                    onChange={(v) => updateUISettings({ cardShadow: v })}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</p>
                    <p className="text-xs text-gray-500 mt-0.5">Reduce padding and spacing</p>
                  </div>
                  <ToggleSwitch
                    checked={uiSettings.compactMode}
                    onChange={(v) => updateUISettings({ compactMode: v })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" icon={<Save size={13} />} onClick={() => handleSaveToast('UI settings')}>
                  Save UI Settings
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Tab: System */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <SectionHeader
              title="System Settings"
              subtitle="Control platform-wide system behavior and access."
            />

            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Access & Registration</h4>
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">User Registration</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={registrationEnabled}
                    onChange={(v) => {
                      setRegistrationEnabled(v);
                      toast.success(`Registration ${v ? 'enabled' : 'disabled'}`);
                    }}
                    label={registrationEnabled ? 'Enabled' : 'Disabled'}
                  />
                </div>

                <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                  maintenanceMode
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-transparent'
                }`}>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      Maintenance Mode
                      {maintenanceMode && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300 rounded-full font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Show maintenance page to non-admin users
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={maintenanceMode}
                    onChange={(v) => {
                      setMaintenanceMode(v);
                      toast.success(`Maintenance mode ${v ? 'activated' : 'deactivated'}`);
                    }}
                    label={maintenanceMode ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Danger Zone</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                These actions are irreversible. Proceed with caution.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  icon={<RotateCcw size={15} />}
                  onClick={() => {
                    resetToDefaults();
                    toast.success('All settings reset to defaults!');
                  }}
                >
                  Reset All Settings
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
