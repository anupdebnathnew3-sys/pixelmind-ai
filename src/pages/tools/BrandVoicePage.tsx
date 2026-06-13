import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { callAI, extractJSON } from '../../services/aiService';
import { Mic2, Copy, RefreshCw, AlertCircle, Zap, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';

const TONES = [
  { id: 'professional', label: 'Professional', emoji: '💼', desc: 'Corporate, trustworthy' },
  { id: 'luxury',       label: 'Luxury',       emoji: '💎', desc: 'Premium, exclusive' },
  { id: 'modern',       label: 'Modern',       emoji: '🚀', desc: 'Trendy, forward-thinking' },
  { id: 'minimal',      label: 'Minimal',      emoji: '✦',  desc: 'Clean, simple' },
  { id: 'bold',         label: 'Bold',         emoji: '⚡', desc: 'Energetic, daring' },
  { id: 'creative',     label: 'Creative',     emoji: '🎨', desc: 'Innovative, artistic' },
];

const INDUSTRIES = [
  'Technology', 'Fashion', 'Food & Beverage', 'Healthcare', 'Finance',
  'Education', 'Real Estate', 'Luxury Goods', 'Sports & Fitness', 'Beauty',
  'Entertainment', 'E-Commerce', 'Travel', 'Automotive', 'Other',
];

interface BrandVoiceResult {
  brandVoice: string;
  tagline: string;
  slogans: string[];
  marketingHooks: string[];
  positioningStatement: string;
}

function CopyCard({ label, content, multiline = false }: { label: string; content: string | string[]; multiline?: boolean }) {
  const text = Array.isArray(content) ? content.join('\n') : content;
  const copy = () => { navigator.clipboard.writeText(text); toast.success(`${label} copied!`); };

  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650] group">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#232650]">
          <Copy size={12} className="text-gray-500" />
        </button>
      </div>
      {Array.isArray(content) ? (
        <ul className="space-y-1.5">
          {content.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle size={12} className="text-[#8B5CF6] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{item}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`text-sm text-gray-800 dark:text-gray-200 leading-relaxed ${multiline ? '' : 'font-semibold'}`}>{content}</p>
      )}
    </div>
  );
}

export const BrandVoicePage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits } = useStore();
  const { getTemplate } = usePromptStore();
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [personality, setPersonality] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('professional');
  const [result, setResult] = useState<BrandVoiceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!brandName.trim()) { setError('Brand name is required'); return; }
    setError('');
    setLoading(true);
    setResult(null);

    const selectedTone = TONES.find(t => t.id === tone);
    const template = getTemplate('brand-voice');
    const defaultSystemPrompt = `You are a world-class brand strategist and copywriter. Return ONLY valid JSON — no markdown, no explanations.`;
    const prompt = `Create a comprehensive brand voice package for:

Brand Name: ${brandName}
Industry: ${industry}
Personality: ${personality || 'Not specified'}
Target Audience: ${audience || 'Not specified'}
Tone: ${selectedTone?.label} (${selectedTone?.desc})

Return ONLY valid JSON (no markdown, no explanation):
{
  "brandVoice": "A 2-sentence description of the brand's voice, personality and communication style",
  "tagline": "The primary brand tagline (short, memorable, under 8 words)",
  "slogans": ["slogan 1", "slogan 2", "slogan 3", "slogan 4", "slogan 5"],
  "marketingHooks": ["hook 1", "hook 2", "hook 3"],
  "positioningStatement": "For [target audience], ${brandName} is the [category] that [key benefit] because [reason to believe]."
}

Rules:
- All content must match the ${selectedTone?.label} tone
- Slogans must be memorable, unique, and directly tied to the brand
- Marketing hooks must be scroll-stopping, emotionally compelling
- Positioning statement must follow the classic format above`;

    try {
      const response = await callAI({
        prompt,
        systemPrompt: template?.systemPrompt ?? defaultSystemPrompt,
        maxTokens: 1000,
      });
      const json = extractJSON(response.text);
      const parsed = JSON.parse(json) as BrandVoiceResult;
      setResult(parsed);
      deductCredits(1);
      toast.success('Brand voice generated!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      toast.error('Generation failed');
    }
    setLoading(false);
  };

  const copyAll = () => {
    if (!result) return;
    const text = [
      `BRAND VOICE\n${result.brandVoice}`,
      `\nTAGLINE\n${result.tagline}`,
      `\nSLOGANS\n${result.slogans.map((s, i) => `${i+1}. ${s}`).join('\n')}`,
      `\nMARKETING HOOKS\n${result.marketingHooks.map((h, i) => `${i+1}. ${h}`).join('\n')}`,
      `\nPOSITIONING STATEMENT\n${result.positioningStatement}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success('All content copied!');
  };

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mic2 size={24} className="text-[#8B5CF6]" />
            Brand Voice & Slogan Matcher
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Generate your brand voice, taglines, slogans, and marketing hooks</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Left — Controls */}
          <div className="lg:col-span-2 space-y-4">
            <InlineApiKeySetup />

            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Brand Details</h3>
              <div className="space-y-3">
                <Input label="Brand Name *" placeholder="e.g., Lumière Watch" value={brandName}
                  onChange={e => { setBrandName(e.target.value); setError(''); }} />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Industry</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none">
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <Input label="Brand Personality" placeholder="e.g., Sophisticated, timeless, precise"
                  value={personality} onChange={e => setPersonality(e.target.value)} />
                <Input label="Target Audience" placeholder="e.g., High-income professionals aged 35–55"
                  value={audience} onChange={e => setAudience(e.target.value)} />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tone</h3>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${tone === t.id
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#8B5CF6]/50'}`}>
                    <span className="text-lg">{t.emoji}</span>
                    <div>
                      <p className={`text-xs font-bold ${tone === t.id ? 'text-[#8B5CF6]' : 'text-gray-800 dark:text-gray-200'}`}>{t.label}</p>
                      <p className="text-[10px] text-gray-400">{t.desc}</p>
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
              {loading ? 'Generating...' : 'Generate Brand Voice'}
            </Button>
          </div>

          {/* Right — Results */}
          <div className="lg:col-span-3 space-y-4">
            {loading && (
              <Card>
                <div className="animate-pulse space-y-4">
                  {[80, 60, 100, 90, 70].map((w, i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </Card>
            )}

            {!loading && result && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Brand voice for <span className="text-[#8B5CF6]">{brandName}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" icon={<Copy size={13} />} onClick={copyAll}>Copy All</Button>
                    <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={generate} loading={loading}>Regenerate</Button>
                  </div>
                </div>

                {/* Tagline — hero card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] text-white text-center">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Primary Tagline</p>
                  <p className="text-xl font-bold leading-snug">"{result.tagline}"</p>
                  <button onClick={() => { navigator.clipboard.writeText(result.tagline); toast.success('Tagline copied!'); }}
                    className="mt-3 text-xs opacity-70 hover:opacity-100 flex items-center gap-1 mx-auto">
                    <Copy size={11} /> Copy tagline
                  </button>
                </div>

                <CopyCard label="Brand Voice" content={result.brandVoice} multiline />
                <CopyCard label="Slogan Variations" content={result.slogans} />
                <CopyCard label="Marketing Hooks" content={result.marketingHooks} />
                <CopyCard label="Brand Positioning Statement" content={result.positioningStatement} multiline />
              </>
            )}

            {!loading && !result && (
              <div className="text-center py-16 text-gray-400">
                <Mic2 size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Your brand voice will appear here</p>
                <p className="text-sm mt-1">Fill in your brand details and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
