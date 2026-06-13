import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { callAI, extractJSON } from '../../services/aiService';
import { Palette, Copy, RefreshCw, Download, AlertCircle, Sun, Moon, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';

const EXAMPLE_CONCEPTS = [
  'Vintage Cyberpunk', 'Luxury Watch Brand', 'Organic Coffee Shop',
  'Modern Real Estate', 'Kids Toy Brand', 'Tech Startup', 'Spa & Wellness',
];

interface PaletteColor {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface GeneratedPalette {
  name: string;
  mood: string;
  colors: PaletteColor;
}

const COLOR_LABELS: { key: keyof PaletteColor; label: string }[] = [
  { key: 'primary',    label: 'Primary' },
  { key: 'secondary',  label: 'Secondary' },
  { key: 'accent',     label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'text',       label: 'Text' },
];

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  const copy = () => { navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={copy}
        title={`Copy ${hex}`}
        className="w-full aspect-square rounded-xl border border-black/10 dark:border-white/10 shadow-sm hover:scale-105 transition-transform relative group"
        style={{ backgroundColor: hex }}
      >
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Copy size={14} className="text-white drop-shadow" />
        </span>
      </button>
      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-[11px] font-mono text-gray-700 dark:text-gray-200 cursor-pointer hover:text-[#6366F1]" onClick={copy}>{hex}</p>
    </div>
  );
}

function PalettePreview({ palette, darkPreview }: { palette: GeneratedPalette; darkPreview: boolean }) {
  const bg = darkPreview ? palette.colors.primary : palette.colors.background;
  const cardBg = darkPreview ? palette.colors.secondary : '#ffffff';
  const textColor = darkPreview ? palette.colors.background : palette.colors.text;
  const accentColor = palette.colors.accent;

  return (
    <div className="rounded-2xl p-4 transition-all" style={{ backgroundColor: bg }}>
      <div className="rounded-xl p-3 mb-2" style={{ backgroundColor: cardBg }}>
        <p className="text-xs font-bold mb-1" style={{ color: accentColor }}>BRAND</p>
        <p className="text-sm font-bold" style={{ color: textColor }}>Your Brand Name</p>
        <p className="text-[11px] mt-0.5 opacity-70" style={{ color: textColor }}>Tagline goes here</p>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 rounded-lg px-3 py-1.5 text-[11px] font-bold text-center" style={{ backgroundColor: accentColor, color: bg }}>
          CTA Button
        </div>
        <div className="flex-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-center border" style={{ borderColor: accentColor, color: accentColor }}>
          Secondary
        </div>
      </div>
    </div>
  );
}

export const ColorPaletteGeneratorPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits } = useStore();
  const { getTemplate } = usePromptStore();
  const [concept, setConcept] = useState('');
  const [palettes, setPalettes] = useState<GeneratedPalette[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkPreview, setDarkPreview] = useState(false);

  const generate = async () => {
    if (!concept.trim()) { setError('Please describe your brand concept'); return; }
    setError('');
    setLoading(true);
    setPalettes([]);

    const template = getTemplate('color-palette');
    const defaultSystemPrompt = `You are a professional brand color strategist and visual identity designer with expertise in color theory, brand psychology, and digital design. Return ONLY valid JSON — no markdown, no explanations.`;
    const prompt = `Generate exactly 3 distinct, professional color palettes for the brand concept: "${concept}".

Return ONLY valid JSON (no markdown, no explanation):
{
  "palettes": [
    {
      "name": "Palette name (2-3 words)",
      "mood": "Brief 1-sentence brand mood description",
      "colors": {
        "primary": "#RRGGBB",
        "secondary": "#RRGGBB",
        "accent": "#RRGGBB",
        "background": "#RRGGBB",
        "text": "#RRGGBB"
      }
    },
    { ... },
    { ... }
  ]
}

Rules: Valid 6-digit hex only. Sufficient text/background contrast. Each palette distinctly different in mood.`;

    try {
      const response = await callAI({
        prompt,
        systemPrompt: template?.systemPrompt ?? defaultSystemPrompt,
        maxTokens: 1200,
      });
      const json = extractJSON(response.text);
      const parsed = JSON.parse(json) as { palettes: GeneratedPalette[] };
      if (!parsed.palettes || parsed.palettes.length === 0) throw new Error('No palettes returned');
      setPalettes(parsed.palettes.slice(0, 3));
      deductCredits(1);
      toast.success('3 palettes generated!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      toast.error('Generation failed');
    }
    setLoading(false);
  };

  const downloadPalette = (palette: GeneratedPalette) => {
    const css = `/* ${palette.name} — ${palette.mood} */
:root {
  --color-primary:    ${palette.colors.primary};
  --color-secondary:  ${palette.colors.secondary};
  --color-accent:     ${palette.colors.accent};
  --color-background: ${palette.colors.background};
  --color-text:       ${palette.colors.text};
}`;
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${palette.name.replace(/\s+/g, '-').toLowerCase()}-palette.css`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('CSS palette downloaded!');
  };

  const copyAllHex = (palette: GeneratedPalette) => {
    const text = COLOR_LABELS.map(({ key, label }) => `${label}: ${palette.colors[key]}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('All HEX codes copied!');
  };

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette size={24} className="text-[#EC4899]" />
              AI Color Palette Generator
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Describe your brand concept and get 3 professional color palettes</p>
          </div>
          <button
            onClick={() => setDarkPreview(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-[#6366F1] transition-colors"
          >
            {darkPreview ? <Moon size={14} /> : <Sun size={14} />}
            {darkPreview ? 'Dark Preview' : 'Light Preview'}
          </button>
        </div>

        {/* Input Section */}
        <InlineApiKeySetup />

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Brand Concept</h3>
          <div className="space-y-4">
            <Input
              label="Describe your brand concept *"
              placeholder="e.g., Vintage Cyberpunk, Luxury Watch Brand, Organic Coffee Shop"
              value={concept}
              onChange={e => { setConcept(e.target.value); setError(''); }}
            />
            {/* Example chips */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_CONCEPTS.map(ex => (
                  <button
                    key={ex}
                    onClick={() => setConcept(ex)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      concept === ex
                        ? 'bg-[#EC4899] border-[#EC4899] text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#EC4899] hover:text-[#EC4899]'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                  {error.includes('No API') && (
                    <Link to="/ai-settings" className="text-xs text-[#6366F1] underline mt-1 block">Configure API Keys →</Link>
                  )}
                </div>
              </div>
            )}

            <Button fullWidth size="lg" loading={loading} onClick={generate} icon={<Zap size={18} />}>
              {loading ? 'Generating Palettes...' : 'Generate 3 Palettes'}
            </Button>
          </div>
        </Card>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="grid grid-cols-5 gap-2">
                    {[1,2,3,4,5].map(j => <div key={j} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700" />)}
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && palettes.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Generated Palettes for: <span className="text-[#EC4899]">"{concept}"</span></p>
              <Button size="sm" variant="ghost" icon={<RefreshCw size={14} />} onClick={generate} loading={loading}>Regenerate</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {palettes.map((palette, idx) => (
                <Card key={idx}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{palette.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{palette.mood}</p>
                    </div>
                    <span className="text-xs font-bold text-[#EC4899] bg-[#EC4899]/10 px-2 py-0.5 rounded-full">#{idx + 1}</span>
                  </div>

                  {/* Color Swatches */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {COLOR_LABELS.map(({ key, label }) => (
                      <ColorSwatch key={key} hex={palette.colors[key]} label={label} />
                    ))}
                  </div>

                  {/* Brand Preview */}
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Brand Preview</p>
                    <PalettePreview palette={palette} darkPreview={darkPreview} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyAllHex(palette)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-[#EC4899] hover:text-[#EC4899] transition-colors"
                    >
                      <Copy size={12} /> Copy HEX
                    </button>
                    <button
                      onClick={() => downloadPalette(palette)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#EC4899] text-white text-xs font-medium hover:bg-[#DB2777] transition-colors"
                    >
                      <Download size={12} /> Download CSS
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && palettes.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Palette size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Your color palettes will appear here</p>
            <p className="text-sm mt-1">Describe your brand concept above and click Generate</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
