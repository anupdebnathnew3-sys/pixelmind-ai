import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { callAI, extractJSON } from '../../services/aiService';
import { Type, Copy, RefreshCw, AlertCircle, Zap, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';

const POPULAR_FONTS = [
  'Montserrat', 'Poppins', 'Roboto', 'Inter', 'Playfair Display',
  'Lato', 'Raleway', 'Oswald', 'Merriweather', 'Open Sans',
  'Nunito', 'Josefin Sans', 'DM Sans', 'Quicksand', 'Bebas Neue',
];

interface FontSet {
  heading: string;
  subheading: string;
  body: string;
  style: string;
  explanation: string;
  score: number;
}

export const FontPairingPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits } = useStore();
  const { getTemplate } = usePromptStore();
  const [mainFont, setMainFont] = useState('');
  const [customFont, setCustomFont] = useState('');
  const [sets, setSets] = useState<FontSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedFont = customFont.trim() || mainFont;

  const generate = async () => {
    if (!selectedFont) { setError('Please select or type a font'); return; }
    setError('');
    setLoading(true);
    setSets([]);

    const template = getTemplate('font-pairing');
    const defaultSystemPrompt = `You are an expert typographer and UI designer with deep knowledge of Google Fonts. Return ONLY valid JSON — no markdown, no explanations.`;
    const prompt = `Generate exactly 3 professional font pairing sets that work beautifully with "${selectedFont}" as the main font.

Return ONLY valid JSON (no markdown, no explanation):
{
  "sets": [
    {
      "heading": "${selectedFont}",
      "subheading": "Google Font name for subheadings",
      "body": "Google Font name for body text",
      "style": "Design style name (e.g., Modern Corporate, Editorial Luxury, Friendly Tech)",
      "explanation": "1-2 sentences explaining why these fonts work together and best use cases",
      "score": 92
    },
    { ... },
    { ... }
  ]
}

Rules:
- Use only Google Fonts (available on fonts.google.com)
- Each set must have a distinctly different design style/personality
- Heading font is always "${selectedFont}" (keep it exactly as provided)
- Score (0-100) represents pairing harmony — be realistic
- Explanation must be practical and mention specific use cases
- Body font must be highly readable at small sizes (12-16px)`;

    try {
      const response = await callAI({
        prompt,
        systemPrompt: template?.systemPrompt ?? defaultSystemPrompt,
        maxTokens: 1000,
      });
      const json = extractJSON(response.text);
      const parsed = JSON.parse(json) as { sets: FontSet[] };
      if (!parsed.sets || parsed.sets.length === 0) throw new Error('No font sets returned');
      setSets(parsed.sets.slice(0, 3));
      deductCredits(1);
      toast.success('3 font pairings generated!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      toast.error('Generation failed');
    }
    setLoading(false);
  };

  const copyFontList = (set: FontSet) => {
    const text = `Heading: ${set.heading}\nSubheading: ${set.subheading}\nBody: ${set.body}\nStyle: ${set.style}`;
    navigator.clipboard.writeText(text);
    toast.success('Font list copied!');
  };

  const googleFontsUrl = (font: string) =>
    `https://fonts.google.com/specimen/${encodeURIComponent(font.replace(/\s+/g, '+'))}`;

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Type size={24} className="text-[#0EA5E9]" />
            AI Font Pairing Assistant
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Discover perfect font combinations for your design projects</p>
        </div>

        <InlineApiKeySetup />

        {/* Font Selection */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Choose Your Main Font</h3>
          <div className="space-y-4">
            {/* Popular font chips */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular fonts:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_FONTS.map(font => (
                  <button
                    key={font}
                    onClick={() => { setMainFont(font); setCustomFont(''); setError(''); }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      mainFont === font && !customFont
                        ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#0EA5E9] hover:text-[#0EA5E9]'
                    }`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom font input */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Or type any Google Font name</label>
              <input
                type="text"
                placeholder="e.g., Cormorant Garamond, Space Grotesk..."
                value={customFont}
                onChange={e => { setCustomFont(e.target.value); setMainFont(''); setError(''); }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none text-gray-900 dark:text-white"
              />
            </div>

            {selectedFont && (
              <div className="flex items-center justify-between p-3 bg-[#0EA5E9]/10 rounded-xl">
                <p className="text-sm font-semibold text-[#0EA5E9]">Selected: {selectedFont}</p>
                <a href={googleFontsUrl(selectedFont)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#0EA5E9] hover:underline">
                  View on Google Fonts <ExternalLink size={11} />
                </a>
              </div>
            )}

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

            <Button fullWidth size="lg" loading={loading} onClick={generate} icon={<Zap size={18} />}
              disabled={!selectedFont}>
              {loading ? 'Generating Pairings...' : 'Generate Font Pairings'}
            </Button>
          </div>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <Card key={i}>
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-px bg-gray-200 dark:bg-gray-700" />
                  {[1,2,3].map(j => <div key={j} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && sets.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Font pairings for <span className="text-[#0EA5E9]">{selectedFont}</span>
              </p>
              <Button size="sm" variant="ghost" icon={<RefreshCw size={14} />} onClick={generate} loading={loading}>Regenerate</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {sets.map((set, idx) => (
                <Card key={idx}>
                  {/* Style badge + score */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold text-[#0EA5E9] uppercase tracking-wider mb-1">Set {idx + 1}</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{set.style}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black" style={{ color: set.score >= 90 ? '#10B981' : set.score >= 75 ? '#F59E0B' : '#6B7280' }}>
                        {set.score}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase">score</p>
                    </div>
                  </div>

                  {/* Font rows */}
                  {[
                    { role: 'HEADING',    font: set.heading,    desc: 'H1 / H2 / Display' },
                    { role: 'SUBHEADING', font: set.subheading, desc: 'H3 / H4 / Lead' },
                    { role: 'BODY',       font: set.body,       desc: 'Paragraphs / UI' },
                  ].map(({ role, font, desc }) => (
                    <div key={role} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#0d1030] mb-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{role}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{font}</p>
                        <p className="text-[10px] text-gray-400">{desc}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button onClick={() => { navigator.clipboard.writeText(font); toast.success(`${font} copied!`); }}
                          className="p-1 rounded-lg text-gray-400 hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10 transition-colors">
                          <Copy size={12} />
                        </button>
                        <a href={googleFontsUrl(font)} target="_blank" rel="noopener noreferrer"
                          className="p-1 rounded-lg text-gray-400 hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10 transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Explanation */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{set.explanation}</p>

                  {/* Visual preview */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#191c40] border border-gray-100 dark:border-[#232650]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">Heading Text Here</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">Subheading or section title</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Body text looks great at this size with excellent readability for long-form content.</p>
                  </div>

                  {/* Download */}
                  <button onClick={() => copyFontList(set)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[#0EA5E9]/40 text-xs text-[#0EA5E9] hover:bg-[#0EA5E9]/10 transition-colors font-medium">
                    <Copy size={12} /> Copy Font List
                  </button>
                </Card>
              ))}
            </div>
          </>
        )}

        {!loading && sets.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Type size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Font pairings will appear here</p>
            <p className="text-sm mt-1">Select your main font and click Generate</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
