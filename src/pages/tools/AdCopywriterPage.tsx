import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { callAI, extractJSON } from '../../services/aiService';
import { Megaphone, Copy, RefreshCw, AlertCircle, Zap, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',  emoji: '📘', charLimit: 125 },
  { id: 'instagram', label: 'Instagram', emoji: '📷', charLimit: 150 },
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵', charLimit: 100 },
  { id: 'linkedin',  label: 'LinkedIn',  emoji: '💼', charLimit: 140 },
  { id: 'pinterest', label: 'Pinterest', emoji: '📌', charLimit: 100 },
  { id: 'google',    label: 'Google Ads',emoji: '🔍', charLimit: 90 },
];

const TONES = [
  { id: 'urgent',      label: 'Urgent',      emoji: '🔥' },
  { id: 'professional',label: 'Professional',emoji: '💼' },
  { id: 'friendly',    label: 'Friendly',    emoji: '😊' },
  { id: 'luxury',      label: 'Luxury',      emoji: '💎' },
  { id: 'playful',     label: 'Playful',     emoji: '🎉' },
  { id: 'informative', label: 'Informative', emoji: '📋' },
];

interface AdVariation {
  headline: string;
  primaryText: string;
  callToAction: string;
  promoMessage: string;
  discountText: string;
}

export const AdCopywriterPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits } = useStore();
  const { getTemplate } = usePromptStore();
  const [productName, setProductName] = useState('');
  const [offer, setOffer] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [tone, setTone] = useState('urgent');
  const [variations, setVariations] = useState<AdVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPlatform = PLATFORMS.find(p => p.id === platform)!;
  const selectedTone = TONES.find(t => t.id === tone)!;

  const generate = async () => {
    if (!productName.trim()) { setError('Product name is required'); return; }
    setError('');
    setLoading(true);
    setVariations([]);

    const template = getTemplate('ad-copywriter');
    const defaultSystemPrompt = `You are a high-converting ad copywriter and direct-response marketing expert. Return ONLY valid JSON — no markdown, no explanations.`;
    const prompt = `Write 3 different ${selectedPlatform.label} ad copy variations for:

Product: ${productName}
Offer: ${offer || 'No specific offer'}
Target Audience: ${audience || 'General audience'}
Platform: ${selectedPlatform.label} (headline max ${selectedPlatform.charLimit} chars)
Tone: ${selectedTone.label}

Return ONLY valid JSON (no markdown, no explanation):
{
  "variations": [
    {
      "headline": "Attention-grabbing headline (under ${selectedPlatform.charLimit} characters)",
      "primaryText": "Main ad body text (2-3 sentences, compelling and persuasive)",
      "callToAction": "CTA button text (2-4 words, action-oriented)",
      "promoMessage": "Short promotional message (1 sentence)",
      "discountText": "Discount/offer text if applicable, else empty string"
    },
    { ... },
    { ... }
  ]
}

Rules:
- Each variation must take a completely different angle/hook
- Headlines must be under ${selectedPlatform.charLimit} characters
- CTAs must be clear action verbs (Shop Now, Get Started, Claim Offer, etc.)
- Match the ${selectedTone.label} tone throughout
- Optimize for ${selectedPlatform.label}'s audience and format
- Make primary text emotionally compelling and benefit-focused`;

    try {
      const response = await callAI({
        prompt,
        systemPrompt: template?.systemPrompt ?? defaultSystemPrompt,
        maxTokens: 1200,
      });
      const json = extractJSON(response.text);
      const parsed = JSON.parse(json) as { variations: AdVariation[] };
      if (!parsed.variations || parsed.variations.length === 0) throw new Error('No variations returned');
      setVariations(parsed.variations.slice(0, 3));
      deductCredits(1);
      toast.success('3 ad variations generated!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg);
      toast.error('Generation failed');
    }
    setLoading(false);
  };

  const copyVariation = (v: AdVariation, idx: number) => {
    const text = [
      `HEADLINE: ${v.headline}`,
      `PRIMARY TEXT: ${v.primaryText}`,
      `CTA: ${v.callToAction}`,
      `PROMO: ${v.promoMessage}`,
      v.discountText ? `DISCOUNT: ${v.discountText}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    toast.success(`Variation ${idx + 1} copied!`);
  };

  const copyAll = () => {
    const text = variations.map((v, i) => [
      `--- VARIATION ${i+1} ---`,
      `HEADLINE: ${v.headline}`,
      `PRIMARY TEXT: ${v.primaryText}`,
      `CTA: ${v.callToAction}`,
      `PROMO: ${v.promoMessage}`,
      v.discountText ? `DISCOUNT: ${v.discountText}` : '',
    ].filter(Boolean).join('\n')).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('All variations copied!');
  };

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone size={24} className="text-[#F59E0B]" />
            Social Media Ad Copywriter
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Generate high-converting ad copy for any platform</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Left Controls */}
          <div className="lg:col-span-2 space-y-4">
            <InlineApiKeySetup />

            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Campaign Details</h3>
              <div className="space-y-3">
                <Input label="Product / Service Name *" placeholder="e.g., PixelMind AI Pro Plan"
                  value={productName} onChange={e => { setProductName(e.target.value); setError(''); }} />
                <Input label="Offer / Promotion" placeholder="e.g., 50% off first month, Free trial"
                  value={offer} onChange={e => setOffer(e.target.value)} />
                <Input label="Target Audience" placeholder="e.g., Freelance designers aged 25–40"
                  value={audience} onChange={e => setAudience(e.target.value)} />
              </div>
            </Card>

            {/* Platform */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Platform</h3>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${platform === p.id
                      ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#F59E0B]/50'}`}>
                    <span className="text-base">{p.emoji}</span>
                    <div className="text-left min-w-0">
                      <p className={`text-xs font-bold truncate ${platform === p.id ? 'text-[#F59E0B]' : 'text-gray-800 dark:text-gray-200'}`}>{p.label}</p>
                      <p className="text-[10px] text-gray-400">{p.charLimit} chars</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Tone */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tone</h3>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-center ${tone === t.id
                      ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#F59E0B]/50'}`}>
                    <span>{t.emoji}</span>
                    <p className={`text-[11px] font-semibold ${tone === t.id ? 'text-[#F59E0B]' : 'text-gray-700 dark:text-gray-300'}`}>{t.label}</p>
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
              {loading ? 'Generating...' : `Generate ${selectedPlatform.label} Ads`}
            </Button>
          </div>

          {/* Right — Results */}
          <div className="lg:col-span-3 space-y-4">
            {loading && (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <Card key={i}>
                    <div className="animate-pulse space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-24" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && variations.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {selectedPlatform.emoji} {selectedPlatform.label} · <span className="text-[#F59E0B]">{selectedTone.label}</span> tone
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" icon={<Copy size={13} />} onClick={copyAll}>Copy All</Button>
                    <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={generate} loading={loading}>Regenerate</Button>
                  </div>
                </div>

                {variations.map((v, idx) => (
                  <Card key={idx}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">Variation {idx + 1}</span>
                      <button onClick={() => copyVariation(v, idx)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#F59E0B] transition-colors">
                        <Copy size={12} /> Copy all
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Headline */}
                      <div className="group">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Headline</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono ${v.headline.length > selectedPlatform.charLimit ? 'text-red-400' : 'text-gray-400'}`}>
                              {v.headline.length}/{selectedPlatform.charLimit}
                            </span>
                            <button onClick={() => { navigator.clipboard.writeText(v.headline); toast.success('Copied!'); }}
                              className="p-1 rounded text-gray-300 hover:text-[#F59E0B] opacity-0 group-hover:opacity-100 transition-all">
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                        <p className="text-base font-bold text-gray-900 dark:text-white leading-snug">{v.headline}</p>
                      </div>

                      {/* Primary Text */}
                      <div className="group">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primary Text</p>
                          <button onClick={() => { navigator.clipboard.writeText(v.primaryText); toast.success('Copied!'); }}
                            className="p-1 rounded text-gray-300 hover:text-[#F59E0B] opacity-0 group-hover:opacity-100 transition-all">
                            <Copy size={11} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{v.primaryText}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* CTA */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Call to Action</p>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F59E0B] text-white">
                            <p className="text-sm font-bold">{v.callToAction}</p>
                            <button onClick={() => { navigator.clipboard.writeText(v.callToAction); toast.success('Copied!'); }}>
                              <Copy size={12} className="opacity-70 hover:opacity-100" />
                            </button>
                          </div>
                        </div>
                        {/* Promo */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Promo Message</p>
                          <div className="flex items-start justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650]">
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{v.promoMessage}</p>
                          </div>
                        </div>
                      </div>

                      {v.discountText && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <Hash size={13} className="text-green-500 flex-shrink-0" />
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">{v.discountText}</p>
                          <button onClick={() => { navigator.clipboard.writeText(v.discountText); toast.success('Copied!'); }}
                            className="ml-auto"><Copy size={11} className="text-green-400" /></button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </>
            )}

            {!loading && variations.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Megaphone size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Your ad copy will appear here</p>
                <p className="text-sm mt-1">Fill in your campaign details and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
