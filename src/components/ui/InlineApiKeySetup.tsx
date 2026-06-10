import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAdminStore } from '../../store/useAdminStore';
import { testApiKey, getEnvSystemKeys } from '../../services/aiService';
import { generateId } from '../../utils/cn';
import { Key, Eye, EyeOff, CheckCircle, Loader2, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Provider + model catalogue ───────────────────────────────────────────────

// Only vision-capable models — this widget is used on image analysis tools
const PROVIDERS: { value: string; label: string; hint: string; models: { id: string; label: string }[] }[] = [
  {
    value: 'openai', label: 'OpenAI', hint: 'sk-proj-...  or  sk-...',
    models: [
      { id: 'gpt-4o',       label: 'GPT-4o'       },
      { id: 'gpt-4o-mini',  label: 'GPT-4o Mini'  },
      { id: 'gpt-4.1',      label: 'GPT-4.1'      },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    ],
  },
  {
    value: 'gemini', label: 'Google Gemini', hint: 'AIza...',
    models: [
      { id: 'gemini-2.0-flash',         label: 'Gemini 2.0 Flash'  },
      { id: 'gemini-2.5-flash-preview',  label: 'Gemini 2.5 Flash'  },
      { id: 'gemini-2.5-pro-preview',    label: 'Gemini 2.5 Pro'    },
      { id: 'gemini-1.5-flash',          label: 'Gemini 1.5 Flash'  },
      { id: 'gemini-1.5-pro',            label: 'Gemini 1.5 Pro'    },
    ],
  },
  {
    value: 'groq', label: 'Groq (free tier)', hint: 'gsk_...',
    models: [
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct',    label: 'Llama 4 Scout'    },
      { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick' },
    ],
  },
  {
    value: 'claude', label: 'Anthropic Claude', hint: 'sk-ant-...',
    models: [
      { id: 'claude-opus-4-8',           label: 'Claude Opus 4.8'   },
      { id: 'claude-sonnet-4-6',         label: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5'  },
      { id: 'claude-sonnet-3-7',         label: 'Claude Sonnet 3.7' },
      { id: 'claude-sonnet-3-5',         label: 'Claude Sonnet 3.5' },
      { id: 'claude-haiku-3-5',          label: 'Claude Haiku 3.5'  },
    ],
  },
  {
    value: 'openrouter', label: 'OpenRouter', hint: 'sk-or-...',
    models: [
      { id: 'openai/gpt-4o',                  label: 'GPT-4o (via OpenRouter)'       },
      { id: 'openai/gpt-4.1',                 label: 'GPT-4.1 (via OpenRouter)'      },
      { id: 'anthropic/claude-sonnet-4-6',    label: 'Claude Sonnet 4.6 (via OR)'    },
      { id: 'google/gemini-2.0-flash',        label: 'Gemini 2.0 Flash (via OR)'     },
      { id: 'google/gemini-2.5-pro-preview',  label: 'Gemini 2.5 Pro (via OR)'       },
      { id: 'meta-llama/llama-4-scout',       label: 'Llama 4 Scout (via OR)'        },
      { id: 'mistralai/pixtral-large-latest', label: 'Pixtral Large (via OR)'        },
    ],
  },
  {
    value: 'mistral', label: 'Mistral AI', hint: 'your Mistral key',
    models: [
      { id: 'pixtral-large-latest', label: 'Pixtral Large' },
      { id: 'pixtral-12b-2409',     label: 'Pixtral 12B'   },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const InlineApiKeySetup: React.FC = () => {
  const { apiKeys, addApiKey, isAuthenticated, user } = useStore();
  const { systemApiKeys } = useAdminStore();

  const [expanded, setExpanded]   = useState(false);
  const [provider, setProvider]   = useState('openai');
  const [modelId, setModelId]     = useState(PROVIDERS[0].models[0].id);
  const [apiKey, setApiKey]       = useState('');
  const [showKey, setShowKey]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [done, setDone]           = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isPremium = isAuthenticated && (user?.plan === 'pro' || user?.plan === 'enterprise');
  const hasPersonalKey = apiKeys.some(k => k.isEnabled);
  const hasSystemKeys = systemApiKeys.some(k => k.status === 'active') || getEnvSystemKeys().length > 0;

  // Hide when: premium (use system keys automatically), already has a personal key,
  // dismissed, or guest with system keys available (they can work fine without adding a key)
  if (isPremium || hasPersonalKey || dismissed || hasSystemKeys) return null;

  const current = PROVIDERS.find(p => p.value === provider)!;
  const currentModel = current.models.find(m => m.id === modelId) ?? current.models[0];

  const handleProviderChange = (v: string) => {
    const p = PROVIDERS.find(x => x.value === v)!;
    setProvider(v);
    setModelId(p.models[0].id);
    setApiKey('');
  };

  const handleSave = async () => {
    if (!apiKey.trim()) { toast.error('Enter your API key'); return; }
    setSaving(true);
    const newKey = {
      id: generateId(),
      name: `${current.label} Key`,
      provider,
      key: apiKey.trim(),
      modelName: currentModel.id,
      status: 'inactive' as const,
      isDefault: true,
      isEnabled: true,
    };
    addApiKey(newKey);
    const result = await testApiKey(newKey);
    setSaving(false);
    if (result.success) {
      useStore.getState().updateApiKey(newKey.id, {
        status: 'connected',
        lastTested: new Date().toISOString(),
        visionCapable: true,
        toolCompatible: true,
      });
      setDone(true);
      toast.success('API key connected!');
    } else {
      toast.error(`Failed: ${result.message}`);
    }
  };

  // ── Connected ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 mb-3">
        <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
        <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium flex-1">
          {current.label} · {currentModel.label} connected
        </span>
        <button onClick={() => setDismissed(true)} className="text-emerald-400 hover:text-emerald-600">
          <X size={13} />
        </button>
      </div>
    );
  }

  // ── Collapsed ─────────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] mb-3">
        <Key size={14} className="text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 min-w-0">No API key — tools won't work</p>
        <button onClick={() => setExpanded(true)} className="text-xs font-semibold text-[#6366F1] hover:underline whitespace-nowrap">
          Add key
        </button>
      </div>
    );
  }

  // ── Expanded ──────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] mb-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#232650]">
        <span className="text-sm font-semibold text-gray-800 dark:text-white">Add API key</span>
        <button onClick={() => setExpanded(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Provider */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Provider</label>
          <div className="relative">
            <select
              value={provider}
              onChange={e => handleProviderChange(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-gray-100 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none cursor-pointer"
            >
              {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Model</label>
          <div className="relative">
            <select
              value={modelId}
              onChange={e => setModelId(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-gray-100 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none cursor-pointer"
            >
              {current.models.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <p className="mt-1 text-[11px] text-gray-400 font-mono">{currentModel.id}</p>
        </div>

        {/* API key */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={current.hint}
              onKeyDown={e => { if (e.key === 'Enter' && apiKey.trim()) handleSave(); }}
              className="w-full px-3 py-2.5 pr-9 rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 font-mono focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
            />
            <button
              onClick={() => setShowKey(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !apiKey.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] disabled:opacity-50 transition-colors"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Connecting…</> : 'Save & connect'}
        </button>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400">
          Stored in your browser only.{' '}
          {!isAuthenticated
            ? <><Link to="/pricing" className="text-[#6366F1] hover:underline">Upgrade</Link> to skip this.</>
            : <Link to="/ai-settings" className="text-[#6366F1] hover:underline">Manage in AI Settings</Link>
          }
        </p>
      </div>
    </div>
  );
};
