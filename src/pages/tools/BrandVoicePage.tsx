import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { callAI, extractJSON } from '../../services/aiService';
import {
  Mic2, Copy, RefreshCw, AlertCircle, Zap, Star, Trash2,
  Plus, Download, ChevronDown, ChevronUp, Settings, FileText,
  Pencil, Check, X
} from 'lucide-react';
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

interface ListItem {
  id: string;
  text: string;
  starred: boolean;
}

interface Workspace {
  tagline: string;
  brandVoice: string;
  slogans: ListItem[];
  hooks: ListItem[];
  positioning: string;
  notes: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const empty = (): Workspace => ({
  tagline: '',
  brandVoice: '',
  slogans: [],
  hooks: [],
  positioning: '',
  notes: '',
});

/* ── Editable single-line ── */
function EditableText({
  value, onChange, placeholder, large = false,
}: { value: string; onChange: (v: string) => void; placeholder?: string; large?: boolean }) {
  return (
    <textarea
      rows={large ? 4 : 2}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-none bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed ${large ? 'text-sm' : 'text-base font-semibold'}`}
    />
  );
}

/* ── List section (slogans / hooks) ── */
function ListSection({
  label, items, onChange,
}: {
  label: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
}) {
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const star = (id: string) =>
    onChange(items.map(i => i.id === id ? { ...i, starred: !i.starred } : i));

  const remove = (id: string) => onChange(items.filter(i => i.id !== id));

  const startEdit = (item: ListItem) => { setEditingId(item.id); setEditText(item.text); };
  const saveEdit = (id: string) => {
    onChange(items.map(i => i.id === id ? { ...i, text: editText } : i));
    setEditingId(null);
  };

  const addNew = () => {
    if (!newText.trim()) return;
    onChange([...items, { id: uid(), text: newText.trim(), starred: false }]);
    setNewText('');
  };

  const starred = items.filter(i => i.starred);
  const rest = items.filter(i => !i.starred);
  const sorted = [...starred, ...rest];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        {starred.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            {starred.length} starred
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {sorted.map(item => (
          <div
            key={item.id}
            className={`group flex items-start gap-2 px-3 py-2.5 rounded-xl border transition-all ${
              item.starred
                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40'
                : 'bg-gray-50 dark:bg-[#0d1030] border-gray-100 dark:border-[#232650]'
            }`}
          >
            <button
              onClick={() => star(item.id)}
              className={`flex-shrink-0 mt-0.5 transition-colors ${item.starred ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'}`}
            >
              <Star size={13} fill={item.starred ? 'currentColor' : 'none'} />
            </button>

            {editingId === item.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  autoFocus
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                  className="flex-1 text-sm bg-transparent border-b border-[#8B5CF6] outline-none text-gray-800 dark:text-gray-200 pb-0.5"
                />
                <button onClick={() => saveEdit(item.id)} className="text-[#8B5CF6]"><Check size={13} /></button>
                <button onClick={() => setEditingId(null)} className="text-gray-400"><X size={13} /></button>
              </div>
            ) : (
              <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 leading-snug">{item.text}</p>
            )}

            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(item)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#232650]">
                <Pencil size={11} className="text-gray-400" />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(item.text); toast.success('Copied!'); }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#232650]"
              >
                <Copy size={11} className="text-gray-400" />
              </button>
              <button onClick={() => remove(item.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={11} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {/* Add new */}
        <div className="flex items-center gap-2 mt-2">
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNew()}
            placeholder="Write your own and press Enter…"
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-dashed border-gray-200 dark:border-[#232650] bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600 outline-none focus:border-[#8B5CF6] transition-colors"
          />
          <button
            onClick={addNew}
            disabled={!newText.trim()}
            className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 disabled:opacity-30 transition-colors"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-[#1e2148]">
        {icon && <span className="text-[#8B5CF6]">{icon}</span>}
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
      </div>
      {children}
    </Card>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [workspace, setWorkspace] = useState<Workspace>(empty());
  const hasContent = workspace.tagline || workspace.brandVoice || workspace.slogans.length > 0;

  const set = <K extends keyof Workspace>(key: K, val: Workspace[K]) =>
    setWorkspace(w => ({ ...w, [key]: val }));

  const generate = async () => {
    if (!brandName.trim()) { setError('Brand name is required'); return; }
    setError('');
    setLoading(true);

    const selectedTone = TONES.find(t => t.id === tone);
    const template = getTemplate('brand-voice');
    const prompt = `Brand voice package for:
Brand: ${brandName} | Industry: ${industry} | Tone: ${selectedTone?.label} (${selectedTone?.desc})
Personality: ${personality || 'not specified'} | Audience: ${audience || 'not specified'}

Return ONLY this JSON object — no markdown, no text before or after:
{"brandVoice":"2 sentences on voice and communication style","tagline":"under 8 words","slogans":["s1","s2","s3","s4"],"marketingHooks":["h1","h2","h3"],"positioningStatement":"For [audience], ${brandName} is the [category] that [benefit] because [reason]."}

All values must match the ${selectedTone?.label} tone. Keep each slogan under 10 words. Hooks must be punchy and scroll-stopping.`;

    try {
      const response = await callAI({
        prompt,
        systemPrompt: template?.systemPrompt ?? 'You are a world-class brand strategist. Return ONLY valid JSON — no markdown, no explanations, no extra text.',
        maxTokens: 2500,
      });
      const json = extractJSON(response.text);
      const parsed = JSON.parse(json) as {
        brandVoice: string; tagline: string; slogans: string[];
        marketingHooks: string[]; positioningStatement: string;
      };
      setWorkspace(w => ({
        ...w,
        tagline: parsed.tagline || '',
        brandVoice: parsed.brandVoice || '',
        slogans: parsed.slogans?.map(s => ({ id: uid(), text: s, starred: false })) ?? [],
        hooks: parsed.marketingHooks?.map(h => ({ id: uid(), text: h, starred: false })) ?? [],
        positioning: parsed.positioningStatement || '',
      }));
      deductCredits(1);
      toast.success('Brand voice generated!');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Generation failed';
      const msg = raw.toLowerCase().includes('json') || raw.toLowerCase().includes('unterminated')
        ? 'The AI response was cut off. Try again — it usually works on the second attempt.'
        : raw;
      setError(msg);
      toast.error('Generation failed');
    }
    setLoading(false);
  };

  const exportDoc = () => {
    const starred = (list: ListItem[]) => list.filter(i => i.starred);
    const all = (list: ListItem[]) => list;
    const fmt = (list: ListItem[]) =>
      (starred(list).length ? starred(list) : all(list)).map((i, n) => `${n + 1}. ${i.starred ? '★ ' : ''}${i.text}`).join('\n');

    const doc = [
      `BRAND VOICE DOCUMENT — ${brandName || 'My Brand'}`,
      `Industry: ${industry} | Tone: ${TONES.find(t => t.id === tone)?.label}`,
      `${'─'.repeat(50)}`,
      workspace.tagline && `TAGLINE\n"${workspace.tagline}"`,
      workspace.brandVoice && `\nBRAND VOICE\n${workspace.brandVoice}`,
      workspace.slogans.length && `\nSLOGAN VARIATIONS\n${fmt(workspace.slogans)}`,
      workspace.hooks.length && `\nMARKETING HOOKS\n${fmt(workspace.hooks)}`,
      workspace.positioning && `\nPOSITIONING STATEMENT\n${workspace.positioning}`,
      workspace.notes && `\nNOTES & IDEAS\n${workspace.notes}`,
    ].filter(Boolean).join('\n');

    const blob = new Blob([doc], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(brandName || 'brand-voice').replace(/\s+/g, '-').toLowerCase()}-brand-document.txt`;
    a.click();
    toast.success('Document downloaded!');
  };

  const copyAll = () => {
    const fmt = (list: ListItem[]) => list.map((i, n) => `${n + 1}. ${i.starred ? '★ ' : ''}${i.text}`).join('\n');
    const doc = [
      workspace.tagline && `TAGLINE\n"${workspace.tagline}"`,
      workspace.brandVoice && `\nBRAND VOICE\n${workspace.brandVoice}`,
      workspace.slogans.length && `\nSLOGANS\n${fmt(workspace.slogans)}`,
      workspace.hooks.length && `\nMARKETING HOOKS\n${fmt(workspace.hooks)}`,
      workspace.positioning && `\nPOSITIONING STATEMENT\n${workspace.positioning}`,
      workspace.notes && `\nNOTES\n${workspace.notes}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(doc);
    toast.success('All content copied!');
  };

  const selectedToneLabel = TONES.find(t => t.id === tone)?.label ?? 'Professional';

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="flex flex-col lg:flex-row gap-6 min-h-full">

        {/* ── Left Sidebar ── */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">

          <div className="rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] p-4 text-white shadow-lg shadow-[#8B5CF6]/25">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Mic2 size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Brand Voice Builder</p>
                <p className="text-white/70 text-xs mt-0.5">AI-powered strategy workspace</p>
              </div>
            </div>
          </div>

          <InlineApiKeySetup />

          <Card>
            <button
              onClick={() => setSettingsOpen(v => !v)}
              className="w-full flex items-center justify-between gap-2 text-left"
            >
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-[#8B5CF6]" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">Brand Details</span>
              </div>
              {settingsOpen
                ? <ChevronUp size={16} className="text-gray-400" />
                : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {settingsOpen && (
              <div className="mt-4 space-y-3">
                <Input
                  label="Brand Name *"
                  placeholder="e.g., Lumière Watch"
                  value={brandName}
                  onChange={e => { setBrandName(e.target.value); setError(''); }}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Industry</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm focus:border-[#8B5CF6] outline-none"
                  >
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>

                <Input
                  label="Brand Personality"
                  placeholder="e.g., Sophisticated, timeless"
                  value={personality}
                  onChange={e => setPersonality(e.target.value)}
                />

                <Input
                  label="Target Audience"
                  placeholder="e.g., Professionals aged 35–55"
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                />

                <div className="border-t border-gray-100 dark:border-[#1e2148] pt-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tone</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${
                          tone === t.id
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                            : 'border-gray-200 dark:border-[#232650] hover:border-[#8B5CF6]/50'
                        }`}
                      >
                        <span className="text-base">{t.emoji}</span>
                        <div>
                          <p className={`text-xs font-bold ${tone === t.id ? 'text-[#8B5CF6]' : 'text-gray-800 dark:text-gray-200'}`}>{t.label}</p>
                          <p className="text-[10px] text-gray-400">{t.desc}</p>
                        </div>
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

                <Button
                  className="w-full"
                  loading={loading}
                  onClick={generate}
                  icon={<Zap size={15} />}
                >
                  {loading ? 'Generating…' : hasContent ? 'Regenerate' : 'Generate Brand Voice'}
                </Button>
              </div>
            )}
          </Card>

          {/* Tips */}
          <div className="p-3 rounded-xl bg-[#8B5CF6]/8 border border-[#8B5CF6]/20 space-y-1.5">
            <p className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider">Tips</p>
            {[
              'Star ★ your favourite slogans to highlight them in the export',
              'Click any text to edit it directly',
              'Add your own slogans using the input at the bottom of each list',
              'Use Notes to capture raw ideas before organising',
            ].map((tip, i) => (
              <p key={i} className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">· {tip}</p>
            ))}
          </div>
        </div>

        {/* ── Right Workspace ── */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Header bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] shadow-md flex items-center justify-center flex-shrink-0">
                <Mic2 size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {brandName || 'Brand Voice'} Workspace
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                    {selectedToneLabel}
                  </span>
                  {industry && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-[#191c40] text-gray-500 dark:text-gray-400">
                      {industry}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {hasContent && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" icon={<Copy size={13} />} onClick={copyAll}>Copy All</Button>
                <Button size="sm" variant="ghost" icon={<Download size={13} />} onClick={exportDoc}>Export .txt</Button>
                <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={generate} loading={loading}>Regenerate</Button>
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <Card>
              <div className="animate-pulse space-y-3">
                {[90, 70, 100, 60, 85, 75].map((w, i) => (
                  <div key={i} className="h-3.5 bg-gray-200 dark:bg-[#232650] rounded-full" style={{ width: `${w}%` }} />
                ))}
              </div>
            </Card>
          )}

          {/* ── Tagline ── */}
          {(!loading) && (
            <div className="p-5 rounded-2xl border-2 border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/5 to-[#6366F1]/5 dark:from-[#8B5CF6]/10 dark:to-[#6366F1]/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">Primary Tagline</p>
              <textarea
                rows={2}
                value={workspace.tagline}
                onChange={e => set('tagline', e.target.value)}
                placeholder={hasContent ? '' : 'Your tagline will appear here after generation, or type one now…'}
                className="w-full resize-none bg-transparent outline-none text-xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 leading-snug"
              />
              {workspace.tagline && (
                <button
                  onClick={() => { navigator.clipboard.writeText(workspace.tagline); toast.success('Tagline copied!'); }}
                  className="mt-1 text-[11px] text-[#8B5CF6]/60 hover:text-[#8B5CF6] flex items-center gap-1 transition-colors"
                >
                  <Copy size={10} /> Copy tagline
                </button>
              )}
            </div>
          )}

          {/* ── Brand Voice ── */}
          {!loading && (
            <Section title="Brand Voice Description" icon={<Mic2 size={13} />}>
              <EditableText
                value={workspace.brandVoice}
                onChange={v => set('brandVoice', v)}
                placeholder="Describe how this brand speaks, feels, and connects with its audience. Type here or generate with AI above…"
                large
              />
            </Section>
          )}

          {/* ── Slogans ── */}
          {!loading && (
            <Section title="Slogan Variations" icon={<Star size={13} />}>
              <ListSection
                label={workspace.slogans.length ? `${workspace.slogans.length} slogans` : 'No slogans yet'}
                items={workspace.slogans}
                onChange={v => set('slogans', v)}
              />
            </Section>
          )}

          {/* ── Marketing Hooks ── */}
          {!loading && (
            <Section title="Marketing Hooks" icon={<Zap size={13} />}>
              <ListSection
                label={workspace.hooks.length ? `${workspace.hooks.length} hooks` : 'No hooks yet'}
                items={workspace.hooks}
                onChange={v => set('hooks', v)}
              />
            </Section>
          )}

          {/* ── Positioning Statement ── */}
          {!loading && (
            <Section title="Positioning Statement" icon={<FileText size={13} />}>
              <EditableText
                value={workspace.positioning}
                onChange={v => set('positioning', v)}
                placeholder='For [target audience], [Brand] is the [category] that [key benefit] because [reason to believe].'
                large
              />
            </Section>
          )}

          {/* ── Notes ── */}
          {!loading && (
            <Section title="Notes & Ideas" icon={<Pencil size={13} />}>
              <textarea
                rows={6}
                value={workspace.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder={`Capture raw thoughts, alternative directions, client feedback, competitor notes…\n\nThis is your free-form scratch pad.`}
                className="w-full resize-none bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed"
              />
            </Section>
          )}

          {/* Empty state hint */}
          {!loading && !hasContent && !workspace.notes && (
            <div className="text-center py-10 text-gray-400">
              <div className="w-16 h-16 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Mic2 size={28} className="text-[#8B5CF6]/40" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fill in your brand details and click Generate</p>
              <p className="text-xs mt-1 text-gray-400">Or type directly into any section above to start from scratch</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
