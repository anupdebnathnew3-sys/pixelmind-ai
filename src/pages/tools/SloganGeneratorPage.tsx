import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { callAI } from '../../services/aiService';
import { Zap, Copy, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const STYLES = [
  { id: 'professional', label: 'Professional', emoji: '💼', desc: 'Corporate, trustworthy' },
  { id: 'creative', label: 'Creative', emoji: '🎨', desc: 'Innovative, unique' },
  { id: 'marketing', label: 'Marketing', emoji: '📣', desc: 'Catchy, persuasive' },
  { id: 'luxury', label: 'Luxury', emoji: '💎', desc: 'Premium, exclusive' },
  { id: 'modern', label: 'Modern', emoji: '🚀', desc: 'Trendy, forward' },
  { id: 'minimalist', label: 'Minimalist', emoji: '✦', desc: 'Clean, simple' },
];

const LENGTHS = [
  { id: 'short', label: 'Short', desc: '3–5 words' },
  { id: 'medium', label: 'Medium', desc: '6–9 words' },
  { id: 'long', label: 'Long', desc: '10+ words' },
];

const INDUSTRIES = [
  'Technology', 'E-Commerce', 'Fashion', 'Food & Beverage', 'Healthcare',
  'Finance', 'Education', 'Real Estate', 'Travel', 'Sports', 'Beauty',
  'Automotive', 'Entertainment', 'Sustainability', 'Other',
];

interface SloganResult {
  text: string;
  style: string;
}

export const SloganGeneratorPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits } = useStore();
  const { getTemplate } = usePromptStore();
  const [brandName, setBrandName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [length, setLength] = useState('medium');
  const [count, setCount] = useState(5);
  const [slogans, setSlogans] = useState<SloganResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!brandName.trim()) { setError('Brand name is required'); return; }
    setError('');
    setLoading(true);

    const style = STYLES.find(s => s.id === selectedStyle);
    const lengthObj = LENGTHS.find(l => l.id === length);

    const prompt = `Generate exactly ${count} unique and memorable slogans for the brand "${brandName}".

Brand Details:
- Brand Name: ${brandName}
- Core Keyword/Theme: ${keyword || 'not specified'}
- Industry: ${industry}
- Style: ${style?.label} (${style?.desc})
- Length: ${lengthObj?.label} (${lengthObj?.desc})

Requirements:
- Each slogan must be ${lengthObj?.desc}
- Style must be ${style?.label}: ${style?.desc}
- Make them catchy, memorable, and unique to the brand
- Avoid clichés and overused phrases
- Incorporate the brand name or keyword naturally when it fits
- Each slogan should feel different from the others

Return ONLY a numbered list format:
1. [slogan]
2. [slogan]
...and so on.

No explanations, no headers, just the numbered list.`;

    const systemPrompt = `You are an expert brand copywriter and marketing strategist. You create compelling, memorable slogans that resonate with target audiences and communicate brand values clearly. Always return exactly the number of slogans requested in a clean numbered list.`;

    try {
      // Try prompt store first
      const template = getTemplate('slogan-generator');
      const response = await callAI({
        prompt: template ? prompt : prompt,
        systemPrompt: template ? template.systemPrompt : systemPrompt,
        maxTokens: 800,
      });

      const cleanText = (t: string) => t.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^["']|["']$/g, '').trim();

      const lines = response.text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.match(/^\d+\.\s+/))
        .map(l => cleanText(l.replace(/^\d+\.\s+/, '')))
        .filter(Boolean);

      if (lines.length === 0) {
        const fallback = response.text.split('\n').map(l => cleanText(l)).filter(l => l.length > 5 && !l.match(/^\d+\.$/)).slice(0, count);
        setSlogans(fallback.map(text => ({ text, style: selectedStyle })));
      } else {
        setSlogans(lines.slice(0, count).map(text => ({ text, style: selectedStyle })));
      }
      deductCredits(1);
      toast.success(`${lines.length || count} slogans generated!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Slogan Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create powerful, memorable brand slogans with AI</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Brand Details</h3>
              <div className="space-y-3">
                <Input
                  label="Brand Name *"
                  placeholder="e.g., PixelMind"
                  value={brandName}
                  onChange={e => { setBrandName(e.target.value); setError(''); }}
                />
                <Input
                  label="Core Keyword / Theme"
                  placeholder="e.g., innovation, speed"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Industry</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                  >
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Length</h3>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map(l => (
                  <button key={l.id} onClick={() => setLength(l.id)}
                    className={`py-2 px-2 rounded-xl text-center transition-all ${length === l.id ? 'bg-[#6366F1] text-white' : 'bg-gray-100 dark:bg-[#0d1030] text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                    <p className="text-xs font-bold">{l.label}</p>
                    <p className={`text-[10px] ${length === l.id ? 'text-white/75' : 'text-gray-400'}`}>{l.desc}</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Count</span>
                <span className="text-sm font-bold text-[#6366F1]">{count} slogans</span>
              </div>
              <input type="range" min={3} max={10} value={count} onChange={e => setCount(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>3</span><span>10</span></div>
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
              {loading ? 'Generating...' : 'Generate Slogans'}
            </Button>
          </div>

          {/* Style + Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Style Selection */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Slogan Style</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${selectedStyle === s.id
                      ? 'border-[#6366F1] bg-[#6366F1] text-white'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#6366F1] bg-white dark:bg-[#191c40]'
                    }`}>
                    <span className="text-xl">{s.emoji}</span>
                    <span className={`text-xs font-bold ${selectedStyle === s.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{s.label}</span>
                    <span className={`text-[10px] ${selectedStyle === s.id ? 'text-white/75' : 'text-gray-400'}`}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Results */}
            {loading && (
              <Card>
                <div className="space-y-3">
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!loading && slogans.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Generated Slogans <span className="text-sm text-gray-400 font-normal">({slogans.length})</span>
                  </h3>
                  <Button size="sm" variant="ghost" icon={<RefreshCw size={14} />} onClick={generate} loading={loading}>
                    Regenerate
                  </Button>
                </div>
                <div className="space-y-2">
                  {slogans.map((slogan, i) => (
                    <div key={i}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#0d1030] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors border border-transparent hover:border-[#6366F1]/20">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-bold text-[#6366F1] flex-shrink-0">#{i + 1}</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{slogan.text}</p>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(slogan.text); toast.success('Copied!'); }}
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[#6366F1] hover:bg-white transition-all"
                        title="Copy"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const text = slogans.map((s, i) => `${i + 1}. ${s.text}`).join('\n');
                    navigator.clipboard.writeText(text);
                    toast.success('All slogans copied!');
                  }}
                  className="mt-3 w-full py-2 rounded-xl border border-dashed border-[#6366F1]/40 text-sm text-[#6366F1] hover:bg-[#EEF2FF] transition-colors"
                >
                  Copy All Slogans
                </button>
              </Card>
            )}

            {!loading && slogans.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Your slogans will appear here</p>
                <p className="text-sm mt-1">Fill in your brand details and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
