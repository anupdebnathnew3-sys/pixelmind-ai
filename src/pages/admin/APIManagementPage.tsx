import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAdminStore, SystemApiKey } from '../../store/useAdminStore';
import { testApiKey } from '../../services/aiService';
import {
  Plus, Edit3, Trash2, CheckCircle, XCircle, Eye, EyeOff, X, Save,
  RefreshCw, ChevronDown, ChevronRight, Info, Crown, Key, Zap,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Model Catalog ─────────────────────────────────────────────────────────────

interface ModelEntry { id: string; label: string; vision: boolean; }

const MODEL_CATALOG: Record<string, { color: string; models: ModelEntry[] }> = {
  OpenAI: {
    color: '#10a37f',
    models: [
      { id: 'gpt-4o',              label: 'GPT-4o',            vision: true  },
      { id: 'gpt-4.1',             label: 'GPT-4.1',           vision: true  },
      { id: 'gpt-4o-mini',         label: 'GPT-4o Mini',       vision: true  },
      { id: 'gpt-4-turbo',         label: 'GPT-4 Turbo',       vision: true  },
      { id: 'o1',                  label: 'o1',                 vision: false },
      { id: 'o1-mini',             label: 'o1 Mini',            vision: false },
      { id: 'gpt-3.5-turbo',       label: 'GPT-3.5 Turbo',     vision: false },
    ],
  },
  Gemini: {
    color: '#4285f4',
    models: [
      { id: 'gemini-2.5-pro-preview-05-06',   label: 'Gemini 2.5 Pro',   vision: true },
      { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash', vision: true },
      { id: 'gemini-2.0-flash',               label: 'Gemini 2.0 Flash', vision: true },
      { id: 'gemini-1.5-pro',                 label: 'Gemini 1.5 Pro',   vision: true },
      { id: 'gemini-1.5-flash',               label: 'Gemini 1.5 Flash', vision: true },
    ],
  },
  Claude: {
    color: '#d97706',
    models: [
      { id: 'claude-opus-4-8',            label: 'Claude Opus 4',     vision: true },
      { id: 'claude-sonnet-4-6',          label: 'Claude Sonnet 4',   vision: true },
      { id: 'claude-haiku-4-5-20251001',  label: 'Claude Haiku 4',    vision: true },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', vision: true },
      { id: 'claude-3-5-haiku-20241022',  label: 'Claude 3.5 Haiku',  vision: true },
      { id: 'claude-3-opus-20240229',     label: 'Claude 3 Opus',     vision: true },
      { id: 'claude-3-sonnet-20240229',   label: 'Claude 3 Sonnet',   vision: true },
      { id: 'claude-3-haiku-20240307',    label: 'Claude 3 Haiku',    vision: true },
    ],
  },
  Groq: {
    color: '#f36b21',
    models: [
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct',     label: 'Llama 4 Scout',      vision: true  },
      { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick',   vision: true  },
      { id: 'llama-3.3-70b-versatile',                       label: 'Llama 3.3 70B',      vision: false },
      { id: 'llama-3.1-70b-versatile',                       label: 'Llama 3.1 70B',      vision: false },
      { id: 'llama-3.1-8b-instant',                          label: 'Llama 3.1 8B',       vision: false },
      { id: 'mixtral-8x7b-32768',                            label: 'Mixtral 8x7B',       vision: false },
      { id: 'gemma2-9b-it',                                  label: 'Gemma 2 9B',         vision: false },
    ],
  },
  Mistral: {
    color: '#7c3aed',
    models: [
      { id: 'pixtral-large-latest',  label: 'Pixtral Large',   vision: true  },
      { id: 'pixtral-12b-2409',      label: 'Pixtral 12B',     vision: true  },
      { id: 'mistral-large-latest',  label: 'Mistral Large',   vision: false },
      { id: 'mistral-medium-latest', label: 'Mistral Medium',  vision: false },
      { id: 'mistral-small-latest',  label: 'Mistral Small',   vision: false },
      { id: 'open-mistral-7b',       label: 'Mistral 7B',      vision: false },
    ],
  },
  OpenRouter: {
    color: '#6366F1',
    models: [
      { id: 'openai/gpt-4o',                      label: 'GPT-4o',              vision: true  },
      { id: 'openai/gpt-4.1',                     label: 'GPT-4.1',             vision: true  },
      { id: 'anthropic/claude-opus-4-8',          label: 'Claude Opus 4',       vision: true  },
      { id: 'anthropic/claude-3.5-sonnet',        label: 'Claude 3.5 Sonnet',   vision: true  },
      { id: 'google/gemini-2.0-flash-001',        label: 'Gemini 2.0 Flash',    vision: true  },
      { id: 'google/gemini-2.5-pro-preview',      label: 'Gemini 2.5 Pro',      vision: true  },
      { id: 'meta-llama/llama-4-scout',           label: 'Llama 4 Scout',       vision: true  },
      { id: 'meta-llama/llama-4-maverick',        label: 'Llama 4 Maverick',    vision: true  },
      { id: 'mistralai/pixtral-large-2411',       label: 'Pixtral Large',       vision: true  },
      { id: 'qwen/qwen-vl-plus',                  label: 'Qwen VL Plus',        vision: true  },
      { id: 'meta-llama/llama-3.3-70b-instruct',  label: 'Llama 3.3 70B',       vision: false },
    ],
  },
  HuggingFace: {
    color: '#FF9A00',
    models: [
      { id: 'meta-llama/Llama-3.2-11B-Vision-Instruct', label: 'Llama 3.2 Vision 11B', vision: true  },
      { id: 'meta-llama/Llama-3.2-90B-Vision-Instruct', label: 'Llama 3.2 Vision 90B', vision: true  },
      { id: 'meta-llama/Llama-3.1-70B-Instruct',        label: 'Llama 3.1 70B',        vision: false },
      { id: 'meta-llama/Llama-3.1-8B-Instruct',         label: 'Llama 3.1 8B',         vision: false },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3',        label: 'Mistral 7B',           vision: false },
      { id: 'Qwen/Qwen2.5-72B-Instruct',                 label: 'Qwen 2.5 72B',         vision: false },
    ],
  },
  Ollama: {
    color: '#374151',
    models: [
      { id: 'llava',        label: 'LLaVA',        vision: true  },
      { id: 'llava:13b',    label: 'LLaVA 13B',    vision: true  },
      { id: 'llava:34b',    label: 'LLaVA 34B',    vision: true  },
      { id: 'bakllava',     label: 'BakLLaVA',     vision: true  },
      { id: 'llava-llama3', label: 'LLaVA-Llama3', vision: true  },
      { id: 'moondream',    label: 'Moondream',    vision: true  },
      { id: 'minicpm-v',    label: 'MiniCPM-V',    vision: true  },
      { id: 'qwen2-vl',     label: 'Qwen2-VL',     vision: true  },
      { id: 'llama3.2',     label: 'Llama 3.2',    vision: false },
      { id: 'llama3.1',     label: 'Llama 3.1',    vision: false },
      { id: 'gemma2',       label: 'Gemma 2',      vision: false },
      { id: 'mistral',      label: 'Mistral',      vision: false },
      { id: 'phi3',         label: 'Phi-3',        vision: false },
    ],
  },
};

const PROVIDERS = Object.keys(MODEL_CATALOG);

const PROVIDER_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(MODEL_CATALOG).map(([p, v]) => [p, v.color])
);

type KeyForm = Omit<SystemApiKey, 'id' | 'usageToday' | 'addedAt'>;

const BLANK: KeyForm = {
  provider: 'OpenAI', label: '', key: '',
  model: 'gpt-4o', status: 'active', limitPerDay: 5000, baseUrl: '',
};

const fieldCls =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all';

const STATUS_CFG = {
  active:   { color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30', icon: <CheckCircle size={11} />, label: 'Active' },
  inactive: { color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',               icon: <XCircle size={11} />,    label: 'Inactive' },
  error:    { color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',                icon: <AlertTriangle size={11} />, label: 'Error' },
};

export const APIManagementPage: React.FC = () => {
  const { systemApiKeys, addSystemApiKey, updateSystemApiKey, deleteSystemApiKey } = useAdminStore();
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<KeyForm>(BLANK);
  const [editId, setEditId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [refOpen, setRefOpen] = useState<Record<string, boolean>>({});
  const [showRef, setShowRef] = useState(false);

  const totalUsage = systemApiKeys.reduce((s, k) => s + k.usageToday, 0);
  const activeKeys = systemApiKeys.filter(k => k.status === 'active').length;

  const setF = (patch: Partial<KeyForm>) => setForm(f => ({ ...f, ...patch }));

  const openAdd = () => {
    setForm(BLANK);
    setEditId(null);
    setModal('add');
  };
  const openEdit = (k: SystemApiKey) => {
    setForm({ provider: k.provider, label: k.label, key: k.key, model: k.model, status: k.status, limitPerDay: k.limitPerDay, baseUrl: k.baseUrl || '' });
    setEditId(k.id);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditId(null); };

  const handleProviderChange = (p: string) => {
    const firstModel = MODEL_CATALOG[p]?.models[0]?.id || '';
    setF({ provider: p, model: firstModel, baseUrl: p === 'Ollama' ? 'http://localhost:11434/v1' : '' });
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.key.trim()) { toast.error('Label and API key are required'); return; }
    if (modal === 'add') {
      addSystemApiKey({ ...form, usageToday: 0, addedAt: new Date().toISOString().slice(0, 10) });
      toast.success('System API key added');
    } else if (editId) {
      updateSystemApiKey(editId, form);
      toast.success('API key updated');
    }
    closeModal();
  };

  const handleTest = async (k: SystemApiKey) => {
    setTesting(k.id);
    const fakeKey = {
      id: k.id, name: k.label,
      provider: (k.provider === 'OpenAI' ? 'openai' : k.provider === 'Gemini' ? 'gemini' : k.provider === 'Claude' ? 'claude' : k.provider === 'Groq' ? 'groq' : k.provider === 'Mistral' ? 'mistral' : k.provider === 'HuggingFace' ? 'huggingface' : k.provider === 'OpenRouter' ? 'openrouter' : k.provider === 'Ollama' ? 'ollama' : k.provider.toLowerCase()),
      key: k.key, modelName: k.model || undefined, baseUrl: k.baseUrl || undefined,
      status: 'inactive' as const, isDefault: false, isEnabled: true,
    };
    const result = await testApiKey(fakeKey);
    if (result.success) {
      updateSystemApiKey(k.id, { status: 'active' });
      toast.success(`${k.label}: Connected!`);
    } else {
      updateSystemApiKey(k.id, { status: 'error' });
      toast.error(`${k.label}: ${result.message}`);
    }
    setTesting(null);
  };

  const handleToggle = (id: string, current: SystemApiKey['status']) => {
    const next = current === 'active' ? 'inactive' : 'active';
    updateSystemApiKey(id, { status: next });
    toast.success(`Key ${next}`);
  };

  const currentModels = MODEL_CATALOG[form.provider]?.models ?? [];
  const selectedModelVision = currentModels.find(m => m.id === form.model)?.vision;

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/20 flex-shrink-0">
              <Key size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Platform API Keys</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">System-level keys used by Pro & Enterprise subscribers</p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors shadow-sm shadow-[#6366F1]/25 flex-shrink-0"
          >
            <Plus size={15} /> Add API Key
          </button>
        </div>

        {/* ── How it works ── */}
        <div className="flex gap-3 p-4 rounded-2xl bg-[#EEF2FF] dark:bg-[#6366F1]/10 border border-[#A5B4FC]/40 dark:border-[#6366F1]/20">
          <Crown size={16} className="text-[#6366F1] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#4338CA] dark:text-[#A5B4FC] leading-relaxed">
            <span className="font-bold">Platform API:</span> When a Pro or Enterprise subscriber selects
            "Platform API" in their AI Settings, all their AI tool calls are routed through the active keys
            below. Keys are tried in order — if one fails or hits its daily limit, the next is used
            automatically. Free users always use their own personal keys.
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Keys',      value: systemApiKeys.length,                                   color: '#6366F1', bg: 'bg-[#EEF2FF] dark:bg-[#6366F1]/15' },
            { label: 'Active',          value: activeKeys,                                              color: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-900/15' },
            { label: 'Calls Today',     value: totalUsage.toLocaleString(),                             color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/15' },
            { label: 'Errors',          value: systemApiKeys.filter(k => k.status === 'error').length,  color: '#EF4444', bg: 'bg-red-50 dark:bg-red-900/15' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} p-4 rounded-2xl border border-transparent`}>
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Keys List ── */}
        {systemApiKeys.length === 0 ? (
          <div className="bg-white dark:bg-[#131635] rounded-2xl border border-dashed border-gray-200 dark:border-[#232650] py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 flex items-center justify-center mx-auto mb-4">
              <Key size={24} className="text-[#6366F1]" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-1.5">No system keys yet</p>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-5">
              Add API keys from any provider. Premium subscribers will use these keys automatically.
            </p>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors">
              <Plus size={15} /> Add First Key
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-[#232650] flex items-center gap-2">
              <Zap size={14} className="text-[#6366F1]" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Configured Keys</span>
              <span className="ml-auto text-xs text-gray-400">{activeKeys} active / {systemApiKeys.length} total</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-[#1a1e45]">
              {systemApiKeys.map(k => {
                const sc = STATUS_CFG[k.status] ?? STATUS_CFG.inactive;
                const provModels = MODEL_CATALOG[k.provider]?.models ?? [];
                const modelIsVision = provModels.find(m => m.id === k.model)?.vision;
                const isTesting = testing === k.id;
                const usagePct = Math.min((k.usageToday / k.limitPerDay) * 100, 100);

                return (
                  <div key={k.id} className="p-4 hover:bg-gray-50/60 dark:hover:bg-[#1a1e45]/40 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Provider badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-white text-sm"
                        style={{ backgroundColor: PROVIDER_COLORS[k.provider] || '#6366F1' }}
                      >
                        {k.provider[0]}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{k.label}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </span>
                          {modelIsVision === true && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              👁 Vision
                            </span>
                          )}
                          {modelIsVision === false && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                              📝 Text Only
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{k.provider} · {k.model || '—'}</p>

                        {/* Key display */}
                        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650] w-fit max-w-full">
                          <code className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                            {showKey[k.id] ? k.key : '••••••••••••••••••••'}
                          </code>
                          <button onClick={() => setShowKey(s => ({ ...s, [k.id]: !s[k.id] }))} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                            {showKey[k.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>

                        {/* Usage bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 max-w-[160px] h-1.5 bg-gray-100 dark:bg-[#232650] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${usagePct > 80 ? 'bg-red-500' : usagePct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {k.usageToday.toLocaleString()} / {k.limitPerDay.toLocaleString()} calls today
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleTest(k)}
                          disabled={isTesting}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all disabled:opacity-60"
                          title="Test connection"
                        >
                          {isTesting ? <RefreshCw size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                          {isTesting ? 'Testing' : 'Test'}
                        </button>
                        <button
                          onClick={() => handleToggle(k.id, k.status)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            k.status === 'active'
                              ? 'border-gray-200 dark:border-[#232650] text-gray-500 hover:border-amber-300 hover:text-amber-600'
                              : 'border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
                          }`}
                        >
                          {k.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => openEdit(k)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => { deleteSystemApiKey(k.id); toast.success('Key deleted'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Model Reference ── */}
        <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden shadow-sm">
          <button
            onClick={() => setShowRef(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#1a1e45]/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 flex items-center justify-center">
                <Info size={15} className="text-[#6366F1]" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-gray-900 dark:text-white">Model Reference</p>
                <p className="text-xs text-gray-400">All supported models by provider — 👁 Vision (can analyse images) · 📝 Text Only</p>
              </div>
            </div>
            {showRef ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          </button>

          {showRef && (
            <div className="border-t border-gray-100 dark:border-[#232650] p-5">
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {PROVIDERS.map(provider => {
                  const { color, models } = MODEL_CATALOG[provider];
                  const isOpen = refOpen[provider] ?? true;
                  const visionCount = models.filter(m => m.vision).length;
                  const textCount = models.length - visionCount;

                  return (
                    <div key={provider} className="border border-gray-100 dark:border-[#232650] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setRefOpen(s => ({ ...s, [provider]: !isOpen }))}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#0d1030] hover:bg-gray-100 dark:hover:bg-[#1a1e45]/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-extrabold"
                            style={{ backgroundColor: color }}>
                            {provider[0]}
                          </div>
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{provider}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full">👁 {visionCount}</span>
                          <span className="text-[10px] text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">📝 {textCount}</span>
                          {isOpen ? <ChevronDown size={13} className="text-gray-400 ml-1" /> : <ChevronRight size={13} className="text-gray-400 ml-1" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-gray-50 dark:divide-[#1a1e45]">
                          {models.map(m => (
                            <div key={m.id} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50/60 dark:hover:bg-[#1a1e45]/30 transition-colors">
                              <span className="text-xs">{m.vision ? '👁' : '📝'}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{m.label}</p>
                                <p className="text-[10px] text-gray-400 font-mono truncate">{m.id}</p>
                              </div>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                m.vision
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                              }`}>
                                {m.vision ? 'Vision' : 'Text'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#131635] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#232650] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                {modal === 'add' ? 'Add System API Key' : 'Edit API Key'}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232650] transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Provider */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Provider</label>
                <select className={fieldCls} value={form.provider} onChange={e => handleProviderChange(e.target.value)}>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Label / Name</label>
                <input className={fieldCls} value={form.label} onChange={e => setF({ label: e.target.value })} placeholder="e.g., Primary OpenAI Key" />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">API Key</label>
                <input className={fieldCls} value={form.key} onChange={e => setF({ key: e.target.value })} placeholder={form.provider === 'Gemini' ? 'AIza...' : 'sk-...'} type="password" />
              </div>

              {/* Model selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Model
                  <span className="ml-2 font-normal text-gray-400">· 👁 = supports image analysis</span>
                </label>
                {currentModels.length > 0 && (
                  <select
                    className={fieldCls}
                    value={currentModels.some(m => m.id === form.model) ? form.model : '_custom'}
                    onChange={e => { if (e.target.value !== '_custom') setF({ model: e.target.value }); }}
                  >
                    {currentModels.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.vision ? '👁 ' : '📝 '}{m.label} — {m.id}
                      </option>
                    ))}
                    <option value="_custom">✏️ Custom model name…</option>
                  </select>
                )}
                <input
                  className={`${fieldCls} mt-2`}
                  value={form.model}
                  onChange={e => setF({ model: e.target.value })}
                  placeholder="Enter exact model ID"
                />
                {/* Vision indicator */}
                {form.model && (
                  <div className={`flex items-center gap-2 mt-2 text-xs px-3 py-2 rounded-lg ${
                    selectedModelVision
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                  }`}>
                    {selectedModelVision
                      ? <><CheckCircle size={12} /> Vision capable — image tools will work with this model</>
                      : <><AlertTriangle size={12} /> Text only — image analysis tools require a vision model</>
                    }
                  </div>
                )}
              </div>

              {/* Base URL (Ollama / custom) */}
              {(form.provider === 'Ollama' || form.provider === 'OpenRouter') && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Base URL</label>
                  <input className={fieldCls} value={form.baseUrl || ''} onChange={e => setF({ baseUrl: e.target.value })}
                    placeholder={form.provider === 'Ollama' ? 'http://localhost:11434/v1' : 'https://openrouter.ai/api/v1'} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Daily limit */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Daily Call Limit</label>
                  <input type="number" className={fieldCls} value={form.limitPerDay} onChange={e => setF({ limitPerDay: Number(e.target.value) })} min={100} />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
                  <select className={fieldCls} value={form.status} onChange={e => setF({ status: e.target.value as SystemApiKey['status'] })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors">
                <Save size={14} /> {modal === 'add' ? 'Add Key' : 'Save Changes'}
              </button>
              <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232650] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
