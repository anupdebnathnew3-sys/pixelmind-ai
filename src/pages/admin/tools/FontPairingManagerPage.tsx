import React, { useState } from 'react';
import { ToolManagerTemplate } from './ToolManagerTemplate';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAdminStore } from '../../../store/useAdminStore';
import {
  Type, Save, Zap, Plus, Trash2, Library, Filter,
  Briefcase, Gem, Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLOR = '#0EA5E9';

type FontCategory = 'sans-serif' | 'serif' | 'display' | 'script' | 'luxury' | 'modern' | 'creative' | 'vintage';

interface CustomFont {
  id: string;
  name: string;
  category: FontCategory;
  source: 'google' | 'adobe' | 'commercial';
  enabled: boolean;
}

const CATEGORY_OPTIONS: { value: FontCategory; label: string }[] = [
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif',      label: 'Serif' },
  { value: 'display',    label: 'Display' },
  { value: 'script',     label: 'Script / Signature' },
  { value: 'luxury',     label: 'Luxury' },
  { value: 'modern',     label: 'Modern' },
  { value: 'creative',   label: 'Creative' },
  { value: 'vintage',    label: 'Vintage' },
];

const SELECT_CLS = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none';

export const FontPairingManagerPage: React.FC = () => {
  const { cmsContent, bulkUpdateCMSContent } = useAdminStore();

  // ── Credits & Output ───────────────────────────────────────────────────────
  const [creditsPerUse, setCreditsPerUse] = useState(cmsContent['fp_credits_per_use'] ?? '1');
  const [guestCredits,  setGuestCredits]  = useState(cmsContent['fp_guest_credits']   ?? '50');
  const [maxResults,    setMaxResults]    = useState(cmsContent['fp_max_results']      ?? '3');

  // ── Font Source Toggles ───────────────────────────────────────────────────
  const [srcGoogle,     setSrcGoogle]     = useState(cmsContent['fp_src_google']     !== 'false');
  const [srcAdobe,      setSrcAdobe]      = useState(cmsContent['fp_src_adobe']      === 'true');
  const [srcCommercial, setSrcCommercial] = useState(cmsContent['fp_src_commercial'] === 'true');
  const [srcSignature,  setSrcSignature]  = useState(cmsContent['fp_src_signature']  !== 'false');
  const [srcLuxury,     setSrcLuxury]     = useState(cmsContent['fp_src_luxury']     !== 'false');
  const [srcCreative,   setSrcCreative]   = useState(cmsContent['fp_src_creative']   !== 'false');

  // ── UI Feature Toggles ────────────────────────────────────────────────────
  const [guestAllowed,    setGuestAllowed]    = useState(cmsContent['fp_guest_allowed']  !== 'false');
  const [googleLinks,     setGoogleLinks]     = useState(cmsContent['fp_google_links']   !== 'false');
  const [showScore,       setShowScore]       = useState(cmsContent['fp_pairing_score']  !== 'false');
  const [showMetrics,     setShowMetrics]     = useState(cmsContent['fp_show_metrics']   !== 'false');
  const [customFontInput, setCustomFontInput] = useState(cmsContent['fp_custom_input']   !== 'false');

  // ── Custom Font Library ───────────────────────────────────────────────────
  const [customFonts, setCustomFonts] = useState<CustomFont[]>(() => {
    const raw = cmsContent['fp_custom_fonts'];
    if (!raw) return [];
    try { return JSON.parse(raw) as CustomFont[]; } catch { return []; }
  });

  // Add font form state
  const [newName,     setNewName]     = useState('');
  const [newCategory, setNewCategory] = useState<FontCategory>('sans-serif');
  const [newSource,   setNewSource]   = useState<'google' | 'adobe' | 'commercial'>('google');

  const addFont = () => {
    const name = newName.trim();
    if (!name) return;
    setCustomFonts(prev => [
      ...prev,
      { id: `${Date.now()}`, name, category: newCategory, source: newSource, enabled: true },
    ]);
    setNewName('');
  };

  const removeFont = (id: string) =>
    setCustomFonts(prev => prev.filter(f => f.id !== id));

  const toggleFont = (id: string) =>
    setCustomFonts(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));

  const save = () => {
    bulkUpdateCMSContent({
      fp_credits_per_use: creditsPerUse,
      fp_guest_credits:   guestCredits,
      fp_max_results:     maxResults,
      fp_src_google:      String(srcGoogle),
      fp_src_adobe:       String(srcAdobe),
      fp_src_commercial:  String(srcCommercial),
      fp_src_signature:   String(srcSignature),
      fp_src_luxury:      String(srcLuxury),
      fp_src_creative:    String(srcCreative),
      fp_guest_allowed:   String(guestAllowed),
      fp_google_links:    String(googleLinks),
      fp_pairing_score:   String(showScore),
      fp_show_metrics:    String(showMetrics),
      fp_custom_input:    String(customFontInput),
      fp_custom_fonts:    JSON.stringify(customFonts),
    });
    toast.success('Font Pairing Manager settings saved');
  };

  return (
    <ToolManagerTemplate
      toolId="font-pairing"
      icon={<Type size={18} />}
      color={COLOR}
      toolPath="/tools/font-pairing"
    >

      {/* ── Set Preview ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'professional', label: 'Professional / Business',  sub: 'Corporate · SaaS · Agency',  icon: <Briefcase size={14} />, color: '#0EA5E9', bg: 'bg-[#0EA5E9]/8 dark:bg-[#0EA5E9]/10', border: 'border-[#0EA5E9]/20', badge: 'bg-[#0EA5E9]/10 text-[#0EA5E9]' },
          { id: 'signature',    label: 'Signature / Luxury',        sub: 'Fashion · Beauty · Wedding',  icon: <Gem size={14} />,       color: '#CA8A04', bg: 'bg-amber-50 dark:bg-amber-950/20',    border: 'border-amber-200/60',            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
          { id: 'creative',     label: 'Creative / Designer',       sub: 'Posters · Social · T-shirts', icon: <Palette size={14} />,   color: '#7C3AED', bg: 'bg-violet-50 dark:bg-violet-950/20',  border: 'border-violet-200/60',           badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
        ].map(s => (
          <div key={s.id} className={`p-3 rounded-xl border ${s.bg} ${s.border}`}>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${s.badge}`}>
              {s.icon} {s.id.charAt(0).toUpperCase() + s.id.slice(1)}
            </div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{s.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Credits & Output ─────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} style={{ color: COLOR }} />
          <h2 className="font-bold text-gray-900 dark:text-white">Credits & Output</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input
            label="Credits Per Generation"
            type="number"
            value={creditsPerUse}
            onChange={e => setCreditsPerUse(e.target.value)}
          />
          <Input
            label="Guest Free Credits"
            type="number"
            value={guestCredits}
            onChange={e => setGuestCredits(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Max Sets Shown (1–3)
            </label>
            <select
              value={maxResults}
              onChange={e => setMaxResults(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="1">1 — Professional only</option>
              <option value="2">2 — Professional + Luxury</option>
              <option value="3">3 — All sets (recommended)</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Always generates all 3 sets (Professional, Signature/Luxury, Creative) — max sets controls how many are displayed.
        </p>
      </Card>

      {/* ── Font Source Controls ─────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} style={{ color: COLOR }} />
          <h2 className="font-bold text-gray-900 dark:text-white">Font Sources</h2>
          <span className="text-xs text-gray-400 ml-auto">Controls which font libraries the AI recommends from</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: 'Google Fonts',           desc: 'Fonts available at fonts.google.com',                           value: srcGoogle,     onChange: setSrcGoogle     },
            { label: 'Adobe Fonts',            desc: 'Adobe Typekit / fonts.adobe.com library',                       value: srcAdobe,      onChange: setSrcAdobe      },
            { label: 'Commercial Fonts',       desc: 'Premium fonts (Neue Haas, Circular, Söhne, GT Walsheim)',       value: srcCommercial, onChange: setSrcCommercial },
            { label: 'Signature Font Library', desc: 'Script, cursive, and signature-style fonts (Luxury set)',       value: srcSignature,  onChange: setSrcSignature  },
            { label: 'Luxury Fonts',           desc: 'Editorial, high-fashion, and luxury typography',                value: srcLuxury,     onChange: setSrcLuxury     },
            { label: 'Creative Display Fonts', desc: 'Bold display, expressive, and unconventional fonts (Creative)', value: srcCreative,   onChange: setSrcCreative   },
          ].map(({ label, desc, value, onChange }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <Toggle checked={value} onChange={onChange} label="" />
            </div>
          ))}
        </div>
      </Card>

      {/* ── UI Feature Toggles ───────────────────────────────────────────── */}
      <Card>
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">UI Features</h2>
        <div className="space-y-3">
          {[
            { label: 'Allow Guest Access',       desc: 'Guests can use this tool with free credits',                       value: guestAllowed,    onChange: setGuestAllowed    },
            { label: 'Google Fonts Links',        desc: 'Show direct Google Fonts links on each font chip',                 value: googleLinks,     onChange: setGoogleLinks     },
            { label: 'Pairing Match Score',       desc: 'Show compatibility score (0–100) in card header',                 value: showScore,       onChange: setShowScore       },
            { label: 'Font Metrics Panel',        desc: 'Show readability score, compatibility bar, branding suitability',  value: showMetrics,     onChange: setShowMetrics     },
            { label: 'Custom Font Input',         desc: 'Allow users to type any font name beyond the built-in library',   value: customFontInput, onChange: setCustomFontInput },
          ].map(({ label, desc, value, onChange }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <Toggle checked={value} onChange={onChange} label="" />
            </div>
          ))}
        </div>
      </Card>

      {/* ── Custom Font Library ───────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Library size={16} style={{ color: COLOR }} />
          <h2 className="font-bold text-gray-900 dark:text-white">Custom Font Library</h2>
          {customFonts.length > 0 && (
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9]">
              {customFonts.filter(f => f.enabled).length} active
            </span>
          )}
        </div>

        {/* Add font form */}
        <div className="grid sm:grid-cols-4 gap-3 mb-4 items-end">
          <div className="sm:col-span-2">
            <Input
              label="Font Name"
              placeholder="e.g., Neue Haas Grotesk"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFont()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as FontCategory)}
              className={SELECT_CLS}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Source</label>
            <select
              value={newSource}
              onChange={e => setNewSource(e.target.value as 'google' | 'adobe' | 'commercial')}
              className={SELECT_CLS}
            >
              <option value="google">Google Fonts</option>
              <option value="adobe">Adobe Fonts</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>
        <Button
          size="sm"
          icon={<Plus size={14} />}
          onClick={addFont}
          disabled={!newName.trim()}
        >
          Add Font
        </Button>

        {/* Font list */}
        {customFonts.length > 0 ? (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Added Fonts ({customFonts.length})
            </p>
            {customFonts.map(font => (
              <div
                key={font.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Toggle checked={font.enabled} onChange={() => toggleFont(font.id)} label="" />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${
                      font.enabled
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-600 line-through'
                    }`}>
                      {font.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {CATEGORY_OPTIONS.find(c => c.value === font.category)?.label ?? font.category}
                      {' · '}
                      {font.source === 'google' ? 'Google Fonts' : font.source === 'adobe' ? 'Adobe Fonts' : 'Commercial'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFont(font.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Library size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No custom fonts added</p>
            <p className="text-xs mt-0.5">Add fonts above to expand the built-in library</p>
          </div>
        )}
      </Card>

      <Button icon={<Save size={14} />} onClick={save}>Save All Settings</Button>
    </ToolManagerTemplate>
  );
};
