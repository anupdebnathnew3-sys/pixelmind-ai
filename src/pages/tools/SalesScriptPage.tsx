import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { callAI, extractJSON } from '../../services/aiService';
import { Video, Copy, RefreshCw, AlertCircle, Zap, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';

const VIDEO_LENGTHS = [
  { id: '30', label: '30 Seconds', desc: 'Ultra-short punch', words: '65–80 words' },
  { id: '45', label: '45 Seconds', desc: 'Balanced story', words: '100–120 words' },
  { id: '60', label: '60 Seconds', desc: 'Full pitch', words: '130–160 words' },
];

const VERSIONS = [
  { id: 'tiktok',   label: 'TikTok',         emoji: '🎵', desc: 'Trendy, casual, hook-first' },
  { id: 'reels',    label: 'Instagram Reels', emoji: '📱', desc: 'Visual, aesthetic, lifestyle' },
  { id: 'shorts',   label: 'YouTube Shorts',  emoji: '▶️', desc: 'Informative, value-packed' },
];

interface ScriptSection {
  hook: string;
  problem: string;
  productIntro: string;
  benefits: string[];
  callToAction: string;
  closingLine: string;
}

interface ScriptVariation {
  version: string;
  script: ScriptSection;
  viralHook: string;
}

const SECTION_COLORS: Record<string, string> = {
  hook:          '#EC4899',
  problem:       '#F59E0B',
  productIntro:  '#6366F1',
  benefits:      '#10B981',
  callToAction:  '#0EA5E9',
  closingLine:   '#8B5CF6',
};

const SECTION_LABELS: Record<string, string> = {
  hook:          '🎯 Hook (First 5 Seconds)',
  problem:       '⚠️ Problem Statement',
  productIntro:  '✨ Product Introduction',
  benefits:      '💡 Key Benefits',
  callToAction:  '🔥 Call to Action',
  closingLine:   '🎬 Closing Line',
};

export const SalesScriptPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits } = useStore();
  const { getTemplate } = usePromptStore();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [videoLength, setVideoLength] = useState('30');
  const [selectedVersions, setSelectedVersions] = useState<string[]>(['tiktok']);
  const [scripts, setScripts] = useState<ScriptVariation[]>([]);
  const [activeScript, setActiveScript] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleVersion = (id: string) => {
    setSelectedVersions(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(v => v !== id) : prev) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!productName.trim()) { setError('Product name is required'); return; }
    setError('');
    setLoading(true);
    setScripts([]);

    const lengthObj = VIDEO_LENGTHS.find(l => l.id === videoLength)!;
    const versionsToGenerate = VERSIONS.filter(v => selectedVersions.includes(v.id));

    const template = getTemplate('sales-script');
    const defaultSystemPrompt = `You are a viral short-form video sales script writer and content strategist. Return ONLY valid JSON — no markdown, no explanations.`;
    const prompt = `Write ${versionsToGenerate.length} script variation(s) for:

Product: ${productName}
Description: ${description || 'Not specified'}
Target Audience: ${audience || 'General audience'}
Video Length: ${lengthObj.label} (${lengthObj.words})
Platforms: ${versionsToGenerate.map(v => v.label).join(', ')}

Return ONLY valid JSON (no markdown, no explanation):
{
  "variations": [
    ${versionsToGenerate.map(v => `{
      "version": "${v.label}",
      "viralHook": "An alternative ultra-viral hook line (1 sentence)",
      "script": {
        "hook": "Opening line that stops scrolling (1-2 sentences, creates instant curiosity)",
        "problem": "Problem statement that audience relates to (1-2 sentences)",
        "productIntro": "Natural product introduction that flows from the problem (1-2 sentences)",
        "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
        "callToAction": "Clear, urgent CTA (1 sentence)",
        "closingLine": "Memorable closing that sticks (1 short sentence)"
      }
    }`).join(',\n    ')}
  ]
}

Rules:
- Hook must immediately create curiosity or speak to the audience's pain
- Problem must be relatable and emotionally resonant
- Benefits must be specific and tangible, not generic
- CTA must be urgent and action-oriented
- Total script must fit ${lengthObj.label} when read aloud at normal pace (${lengthObj.words})
- Each platform version must have a distinctly different angle and energy`;

    try {
      const response = await callAI({
        prompt,
        systemPrompt: template?.systemPrompt ?? defaultSystemPrompt,
        maxTokens: 1500,
      });
      const json = extractJSON(response.text);
      const parsed = JSON.parse(json) as { variations: ScriptVariation[] };
      if (!parsed.variations || parsed.variations.length === 0) throw new Error('No scripts returned');
      setScripts(parsed.variations);
      setActiveScript(0);
      deductCredits(1);
      toast.success(`${parsed.variations.length} script(s) generated!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      toast.error('Generation failed');
    }
    setLoading(false);
  };

  const copyScript = (variation: ScriptVariation) => {
    const s = variation.script;
    const text = [
      `[${variation.version.toUpperCase()} SCRIPT — ${videoLength}s]`,
      `\nHOOK: ${s.hook}`,
      `\nPROBLEM: ${s.problem}`,
      `\nINTRO: ${s.productIntro}`,
      `\nBENEFITS:\n${s.benefits.map((b, i) => `${i+1}. ${b}`).join('\n')}`,
      `\nCTA: ${s.callToAction}`,
      `\nCLOSING: ${s.closingLine}`,
      `\nVIRAL HOOK ALT: ${variation.viralHook}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success(`${variation.version} script copied!`);
  };

  const activeVariation = scripts[activeScript];

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Video size={24} className="text-[#EC4899]" />
            Shorts & Reels Script Writer
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Generate viral-ready short-form video sales scripts</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Left Controls */}
          <div className="lg:col-span-2 space-y-4">
            <InlineApiKeySetup />

            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product Details</h3>
              <div className="space-y-3">
                <Input label="Product / Service Name *" placeholder="e.g., PixelMind AI"
                  value={productName} onChange={e => { setProductName(e.target.value); setError(''); }} />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Product Description</label>
                  <textarea
                    placeholder="e.g., AI tool that generates metadata for stock photos in seconds"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/20 outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <Input label="Target Audience" placeholder="e.g., Stock photographers aged 20–45"
                  value={audience} onChange={e => setAudience(e.target.value)} />
              </div>
            </Card>

            {/* Video Length */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Video Length</h3>
              <div className="grid grid-cols-3 gap-2">
                {VIDEO_LENGTHS.map(l => (
                  <button key={l.id} onClick={() => setVideoLength(l.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${videoLength === l.id
                      ? 'border-[#EC4899] bg-[#EC4899]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#EC4899]/50'}`}>
                    <p className={`text-sm font-bold ${videoLength === l.id ? 'text-[#EC4899]' : 'text-gray-800 dark:text-gray-200'}`}>{l.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{l.desc}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Platform Versions */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Platform Versions</h3>
              <div className="space-y-2">
                {VERSIONS.map(v => (
                  <button key={v.id} onClick={() => toggleVersion(v.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all text-left ${selectedVersions.includes(v.id)
                      ? 'border-[#EC4899] bg-[#EC4899]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#EC4899]/50'}`}>
                    <span className="text-lg">{v.emoji}</span>
                    <div>
                      <p className={`text-sm font-semibold ${selectedVersions.includes(v.id) ? 'text-[#EC4899]' : 'text-gray-800 dark:text-gray-200'}`}>{v.label}</p>
                      <p className="text-[10px] text-gray-400">{v.desc}</p>
                    </div>
                    <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedVersions.includes(v.id) ? 'border-[#EC4899] bg-[#EC4899]' : 'border-gray-300'}`}>
                      {selectedVersions.includes(v.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

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
              {loading ? 'Writing Script...' : 'Generate Script'}
            </Button>
          </div>

          {/* Right — Results */}
          <div className="lg:col-span-3 space-y-4">
            {loading && (
              <Card>
                <div className="animate-pulse space-y-4">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!loading && scripts.length > 0 && (
              <>
                {/* Platform tabs */}
                {scripts.length > 1 && (
                  <div className="flex gap-2">
                    {scripts.map((s, i) => {
                      const ver = VERSIONS.find(v => v.label === s.version);
                      return (
                        <button key={i} onClick={() => setActiveScript(i)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${activeScript === i
                            ? 'border-[#EC4899] bg-[#EC4899]/10 text-[#EC4899]'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#EC4899]/50'}`}>
                          <span>{ver?.emoji}</span> {s.version}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeVariation && (
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{activeVariation.version} Script</p>
                        <p className="text-xs text-gray-400">{videoLength} seconds · {VIDEO_LENGTHS.find(l => l.id === videoLength)?.words}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" icon={<Copy size={13} />} onClick={() => copyScript(activeVariation)}>Copy</Button>
                        <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={generate} loading={loading}>Regenerate</Button>
                      </div>
                    </div>

                    {/* Viral hook alt */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#EC4899]/10 to-[#8B5CF6]/10 border border-[#EC4899]/20 mb-4">
                      <p className="text-[10px] font-bold text-[#EC4899] uppercase tracking-wider mb-1">⚡ Alternative Viral Hook</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white italic">"{activeVariation.viralHook}"</p>
                    </div>

                    {/* Script sections */}
                    <div className="space-y-3">
                      {(Object.keys(activeVariation.script) as (keyof ScriptSection)[]).map(key => {
                        const value = activeVariation.script[key];
                        const color = SECTION_COLORS[key];
                        const label = SECTION_LABELS[key];
                        return (
                          <div key={key} className="group rounded-xl border p-3 transition-colors"
                            style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[11px] font-bold" style={{ color }}>{label}</p>
                              <button
                                onClick={() => {
                                  const text = Array.isArray(value) ? value.join('\n') : value;
                                  navigator.clipboard.writeText(text);
                                  toast.success('Copied!');
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy size={12} style={{ color }} />
                              </button>
                            </div>
                            {Array.isArray(value) ? (
                              <ul className="space-y-1">
                                {value.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Play size={10} className="flex-shrink-0 mt-1" style={{ color }} />
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{item}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{value}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </>
            )}

            {!loading && scripts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Video size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Your script will appear here</p>
                <p className="text-sm mt-1">Fill in your product details and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
