import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdminStore } from '../../store/useAdminStore';
import { Palette, Save, RotateCcw, Eye, Sun, Moon, Sparkles, Star, Layers, RotateCw, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  description?: string;
}

function ColorField({ label, value, onChange, description }: ColorFieldProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#232650] last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-28 px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#191c40] text-gray-800 dark:text-gray-200 font-mono focus:border-[#6366F1] outline-none"
        />
      </div>
    </div>
  );
}

const ANIMATION_OPTIONS = [
  {
    id: 'particles' as const,
    label: 'Particle Network',
    description: 'Floating dots connected by lines with mouse interaction',
    icon: <Sparkles size={20} />,
    gradient: 'from-indigo-500 to-violet-500',
    preview: '✦ ✦ ✦',
  },
  {
    id: 'aurora' as const,
    label: 'Aurora Borealis',
    description: 'Flowing colorful northern lights curtains',
    icon: <Layers size={20} />,
    gradient: 'from-cyan-400 via-violet-500 to-green-400',
    preview: '〰 〰 〰',
  },
  {
    id: 'orbit' as const,
    label: 'Orbital Rings',
    description: 'Tilted elliptical orbits with glowing particles',
    icon: <RotateCw size={20} />,
    gradient: 'from-amber-400 via-pink-500 to-cyan-400',
    preview: '◯ ◎ ◯',
  },
  {
    id: 'starfield' as const,
    label: 'Deep Starfield',
    description: 'Star field with twinkling stars and shooting stars',
    icon: <Star size={20} />,
    gradient: 'from-blue-600 via-purple-600 to-indigo-800',
    preview: '★ ✦ ★',
  },
  {
    id: 'neonwave' as const,
    label: 'Neon Waves',
    description: 'Glowing multi-coloured sine waves with neon-tube glow',
    icon: <Sparkles size={20} />,
    gradient: 'from-pink-500 via-blue-500 to-cyan-400',
    preview: '〜 〜 〜',
  },
  {
    id: 'geometry' as const,
    label: 'Floating Geometry',
    description: 'Rotating wireframe polygons that connect when close',
    icon: <RotateCw size={20} />,
    gradient: 'from-amber-400 via-violet-500 to-cyan-400',
    preview: '△ ◇ ⬡',
  },
  {
    id: 'fireflies' as const,
    label: 'Fireflies',
    description: 'Organic glowing orbs drifting with soft colour trails',
    icon: <Sparkles size={20} />,
    gradient: 'from-yellow-400 via-lime-400 to-emerald-500',
    preview: '✦ · ✦',
  },
  {
    id: 'digitalrain' as const,
    label: 'Digital Rain',
    description: 'Falling indigo/violet streams — an elegant matrix effect',
    icon: <Layers size={20} />,
    gradient: 'from-indigo-600 via-violet-600 to-cyan-500',
    preview: '↓ ↓ ↓',
  },
  {
    id: 'plasma' as const,
    label: 'Plasma Blobs',
    description: 'Luminous colour orbs merging via additive light blending',
    icon: <Star size={20} />,
    gradient: 'from-fuchsia-500 via-blue-500 to-lime-400',
    preview: '◉ ◎ ◉',
  },
  {
    id: 'none' as const,
    label: 'No Animation',
    description: 'Static background with atmospheric glow blobs only',
    icon: <EyeOff size={20} />,
    gradient: 'from-gray-400 to-gray-600',
    preview: '— — —',
  },
];

export const ThemeManagerPage: React.FC = () => {
  const { themeSettings, updateThemeSettings, resetThemeSettings, heroAnimationSettings, updateHeroAnimationSettings } = useAdminStore();
  const [local, setLocal] = useState({ ...themeSettings });
  const [preview, setPreview] = useState<'light' | 'dark'>('light');
  const [hasChanges, setHasChanges] = useState(false);

  const patch = (k: string, v: string) => {
    setLocal(s => ({ ...s, [k]: v }));
    setHasChanges(true);
  };

  // Apply live preview to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', local.primaryColor);
    root.style.setProperty('--color-gradient-end', local.accentColor);
  }, [local.primaryColor, local.accentColor]);

  const handleSave = () => {
    updateThemeSettings(local);
    setHasChanges(false);
    toast.success('Theme settings saved');
  };

  const handleReset = () => {
    resetThemeSettings();
    setLocal({ ...themeSettings });
    setHasChanges(false);
    toast('Theme reset to defaults');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theme Manager</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Customize global colors and visual appearance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button size="sm" icon={<Save size={14} />} onClick={handleSave} disabled={!hasChanges}>
              Save Theme
            </Button>
          </div>
        </div>

        {hasChanges && (
          <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-sm text-amber-700 dark:text-amber-400 font-medium">
            You have unsaved changes. Colors are previewing live — save to persist.
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Color Groups */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <Palette size={15} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Brand Colors</h3>
              </div>
              <ColorField label="Primary Color" value={local.primaryColor} onChange={v => patch('primaryColor', v)} description="Main action color, buttons, links" />
              <ColorField label="Secondary Color" value={local.secondaryColor} onChange={v => patch('secondaryColor', v)} description="Supporting UI elements" />
              <ColorField label="Accent Color" value={local.accentColor} onChange={v => patch('accentColor', v)} description="Highlights, gradients, badges" />
              <ColorField label="Button Color" value={local.buttonColor} onChange={v => patch('buttonColor', v)} description="CTA and primary buttons" />
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-1">
                <Sun size={15} className="text-amber-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Light Theme</h3>
              </div>
              <ColorField label="Background" value={local.lightBg} onChange={v => patch('lightBg', v)} />
              <ColorField label="Card Background" value={local.lightCard} onChange={v => patch('lightCard', v)} />
              <ColorField label="Text Color" value={local.lightText} onChange={v => patch('lightText', v)} />
              <ColorField label="Navbar Background" value={local.navbarBgColor} onChange={v => patch('navbarBgColor', v)} />
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-1">
                <Moon size={15} className="text-[#A5B4FC]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Dark Theme</h3>
              </div>
              <ColorField label="Background" value={local.darkBg} onChange={v => patch('darkBg', v)} />
              <ColorField label="Card Background" value={local.darkCard} onChange={v => patch('darkCard', v)} />
              <ColorField label="Text Color" value={local.darkText} onChange={v => patch('darkText', v)} />
              <ColorField label="Footer Background" value={local.footerBgColor} onChange={v => patch('footerBgColor', v)} />
            </Card>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye size={15} className="text-[#6366F1]" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
                </div>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-gray-100 dark:bg-[#191c40]">
                  <button onClick={() => setPreview('light')} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${preview === 'light' ? 'bg-white dark:bg-[#131635] shadow-sm text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    <Sun size={12} />
                  </button>
                  <button onClick={() => setPreview('dark')} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${preview === 'dark' ? 'bg-white dark:bg-[#131635] shadow-sm text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    <Moon size={12} />
                  </button>
                </div>
              </div>

              <div
                className="rounded-2xl overflow-hidden border border-gray-200 dark:border-[#232650]"
                style={{ background: preview === 'light' ? local.lightBg : local.darkBg }}
              >
                {/* Mock navbar */}
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background: preview === 'light' ? local.navbarBgColor : local.darkCard, borderBottom: `1px solid ${preview === 'light' ? '#E2E8F0' : '#232650'}` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: local.primaryColor }}>
                      <span className="text-white text-[10px]">P</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: preview === 'light' ? local.lightText : local.darkText }}>PixelMind</span>
                  </div>
                  <div className="flex gap-2">
                    {['Home', 'Tools', 'Pricing'].map(n => (
                      <span key={n} className="text-[10px]" style={{ color: preview === 'light' ? '#6B7280' : '#9CA3AF' }}>{n}</span>
                    ))}
                  </div>
                </div>

                {/* Mock content */}
                <div className="p-4 space-y-3">
                  <div className="rounded-xl p-3" style={{ background: preview === 'light' ? local.lightCard : local.darkCard }}>
                    <div className="w-2/3 h-2 rounded mb-2" style={{ background: local.primaryColor, opacity: 0.8 }} />
                    <div className="w-full h-1.5 rounded mb-1.5" style={{ background: preview === 'light' ? '#E5E7EB' : '#374151' }} />
                    <div className="w-4/5 h-1.5 rounded" style={{ background: preview === 'light' ? '#E5E7EB' : '#374151' }} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 py-2 rounded-xl text-center text-[10px] font-bold text-white" style={{ background: local.buttonColor }}>
                      Get Started
                    </div>
                    <div className="flex-1 py-2 rounded-xl text-center text-[10px] font-semibold border" style={{ borderColor: local.primaryColor, color: local.primaryColor }}>
                      Learn More
                    </div>
                  </div>
                  <div className="px-3 py-2 rounded-xl text-[10px] font-bold text-white text-center" style={{ background: `linear-gradient(135deg, ${local.primaryColor}, ${local.accentColor})` }}>
                    Upgrade to Pro — Special Offer
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Changes are live on the actual site</p>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current Palette</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  local.primaryColor, local.secondaryColor, local.accentColor, local.buttonColor,
                  local.lightBg, local.lightCard, local.darkBg, local.darkCard,
                ].map((color, i) => (
                  <div key={i} className="aspect-square rounded-xl border border-gray-200 dark:border-gray-700" style={{ background: color }} title={color} />
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Hero Animation Selector */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-[#6366F1]" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Hero Animation</h3>
            <span className="ml-auto text-xs text-gray-400">Applied live on the homepage</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {ANIMATION_OPTIONS.map(opt => {
              const active = heroAnimationSettings.activeAnimation === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => { updateHeroAnimationSettings({ activeAnimation: opt.id }); toast.success(`Animation set to "${opt.label}"`); }}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center group ${
                    active
                      ? 'border-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/15 shadow-md'
                      : 'border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] hover:border-[#6366F1]/50 hover:shadow-sm'
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center text-white shadow-md`}>
                    {opt.icon}
                  </div>
                  <div className="font-mono text-sm tracking-widest text-gray-400 dark:text-gray-500">{opt.preview}</div>
                  <div>
                    <p className={`text-xs font-semibold ${active ? 'text-[#6366F1]' : 'text-gray-700 dark:text-gray-200'}`}>{opt.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
