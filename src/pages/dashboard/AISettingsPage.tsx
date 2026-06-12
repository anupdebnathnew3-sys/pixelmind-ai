import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Modal } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { testApiKey, isVisionCapable } from '../../services/aiService';
import { generateId } from '../../utils/cn';
import type { APIKey } from '../../types';
import {
  Plus, Zap, Trash2, Edit3, CheckCircle, XCircle, RefreshCw,
  Eye, EyeOff, Star, AlertTriangle, Crown, Key, Shield,
  Cpu, Settings2, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Provider / Model Data ────────────────────────────────────────────────────

const AI_PROVIDERS = [
  { value: 'openai',      label: 'OpenAI' },
  { value: 'gemini',      label: 'Google Gemini' },
  { value: 'claude',      label: 'Anthropic Claude' },
  { value: 'groq',        label: 'Groq' },
  { value: 'openrouter',  label: 'OpenRouter (Multi-model)' },
  { value: 'mistral',     label: 'Mistral AI' },
  { value: 'ollama',      label: 'Ollama (Local)' },
  { value: 'huggingface', label: 'HuggingFace' },
  { value: 'custom',      label: 'Custom API (OpenAI-compatible)' },
];

const PROVIDER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  openai:      { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'OpenAI' },
  gemini:      { bg: 'bg-blue-100 dark:bg-blue-900/30',       text: 'text-blue-700 dark:text-blue-400',       label: 'Google Gemini' },
  claude:      { bg: 'bg-orange-100 dark:bg-orange-900/30',   text: 'text-orange-700 dark:text-orange-400',   label: 'Anthropic Claude' },
  groq:        { bg: 'bg-purple-100 dark:bg-purple-900/30',   text: 'text-purple-700 dark:text-purple-400',   label: 'Groq' },
  openrouter:  { bg: 'bg-gray-100 dark:bg-gray-800',          text: 'text-gray-700 dark:text-gray-300',       label: 'OpenRouter' },
  mistral:     { bg: 'bg-indigo-100 dark:bg-indigo-900/30',   text: 'text-indigo-700 dark:text-indigo-400',   label: 'Mistral AI' },
  ollama:      { bg: 'bg-teal-100 dark:bg-teal-900/30',       text: 'text-teal-700 dark:text-teal-400',       label: 'Ollama (Local)' },
  huggingface: { bg: 'bg-yellow-100 dark:bg-yellow-900/30',   text: 'text-yellow-700 dark:text-yellow-400',   label: 'HuggingFace' },
  custom:      { bg: 'bg-gray-100 dark:bg-gray-800',          text: 'text-gray-600 dark:text-gray-400',       label: 'Custom API' },
};

const PROVIDER_MODELS: Record<string, { value: string; label: string; vision: boolean }[]> = {
  openai: [
    { value: 'gpt-4o',        label: 'GPT-4o',                   vision: true },
    { value: 'gpt-4.1',       label: 'GPT-4.1',                  vision: true },
    { value: 'gpt-4o-mini',   label: 'GPT-4o Mini',              vision: true },
    { value: 'gpt-4-turbo',   label: 'GPT-4 Turbo',              vision: true },
    { value: 'o1',            label: 'o1',                        vision: false },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (text only)',vision: false },
  ],
  gemini: [
    { value: 'gemini-2.5-pro-preview-05-06',   label: 'Gemini 2.5 Pro',   vision: true },
    { value: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash', vision: true },
    { value: 'gemini-2.0-flash',               label: 'Gemini 2.0 Flash', vision: true },
    { value: 'gemini-1.5-pro',                 label: 'Gemini 1.5 Pro',   vision: true },
    { value: 'gemini-1.5-flash',               label: 'Gemini 1.5 Flash', vision: true },
  ],
  claude: [
    { value: 'claude-opus-4-8',            label: 'Claude Opus 4',     vision: true },
    { value: 'claude-sonnet-4-6',          label: 'Claude Sonnet 4',   vision: true },
    { value: 'claude-haiku-4-5-20251001',  label: 'Claude Haiku 4',    vision: true },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', vision: true },
    { value: 'claude-3-opus-20240229',     label: 'Claude 3 Opus',     vision: true },
  ],
  groq: [
    { value: 'meta-llama/llama-4-scout-17b-16e-instruct',     label: 'Llama 4 Scout',              vision: true },
    { value: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick',           vision: true },
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (text only)',  vision: false },
    { value: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B (text only)',   vision: false },
    { value: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B (text only)',   vision: false },
  ],
  openrouter: [
    { value: 'openai/gpt-4o',                  label: 'GPT-4o',              vision: true },
    { value: 'anthropic/claude-3.5-sonnet',    label: 'Claude 3.5 Sonnet',   vision: true },
    { value: 'google/gemini-2.0-flash-001',    label: 'Gemini 2.0 Flash',    vision: true },
    { value: 'meta-llama/llama-4-scout',       label: 'Llama 4 Scout',       vision: true },
    { value: 'mistralai/pixtral-large-2411',   label: 'Pixtral Large',       vision: true },
    { value: 'qwen/qwen-vl-plus',              label: 'Qwen VL Plus',        vision: true },
    { value: 'openai/gpt-4.1',                 label: 'GPT-4.1',             vision: true },
  ],
  mistral: [
    { value: 'pixtral-large-latest', label: 'Pixtral Large',             vision: true },
    { value: 'pixtral-12b-2409',     label: 'Pixtral 12B',               vision: true },
    { value: 'mistral-large-latest', label: 'Mistral Large (text only)',  vision: false },
    { value: 'mistral-medium-latest',label: 'Mistral Medium (text only)', vision: false },
    { value: 'mistral-small-latest', label: 'Mistral Small (text only)',  vision: false },
  ],
  ollama: [
    { value: 'llava',        label: 'LLaVA',         vision: true },
    { value: 'llava:13b',    label: 'LLaVA 13B',     vision: true },
    { value: 'llava:34b',    label: 'LLaVA 34B',     vision: true },
    { value: 'bakllava',     label: 'BakLLaVA',      vision: true },
    { value: 'llava-llama3', label: 'LLaVA-Llama3',  vision: true },
    { value: 'moondream',    label: 'Moondream',     vision: true },
    { value: 'minicpm-v',    label: 'MiniCPM-V',     vision: true },
    { value: 'qwen2-vl',     label: 'Qwen2-VL',      vision: true },
    { value: 'llama3.2',     label: 'Llama 3.2 (text only)', vision: false },
    { value: 'llama3.1',     label: 'Llama 3.1 (text only)', vision: false },
    { value: 'mistral',      label: 'Mistral (text only)',   vision: false },
  ],
  huggingface: [
    { value: 'meta-llama/Llama-3.2-11B-Vision-Instruct', label: 'Llama 3.2 Vision 11B',      vision: true },
    { value: 'meta-llama/Llama-3.1-70B-Instruct',        label: 'Llama 3.1 70B (text only)', vision: false },
    { value: 'mistralai/Mistral-7B-Instruct-v0.3',       label: 'Mistral 7B (text only)',    vision: false },
  ],
  custom: [],
};

const PROVIDER_API_URLS: Record<string, { url: string; label: string }> = {
  openai:      { url: 'https://platform.openai.com/api-keys',           label: 'OpenAI Platform' },
  gemini:      { url: 'https://aistudio.google.com/app/apikey',         label: 'Google AI Studio' },
  claude:      { url: 'https://console.anthropic.com/account/keys',     label: 'Anthropic Console' },
  groq:        { url: 'https://console.groq.com/keys',                  label: 'Groq Console' },
  openrouter:  { url: 'https://openrouter.ai/keys',                     label: 'OpenRouter' },
  mistral:     { url: 'https://console.mistral.ai/api-keys/',           label: 'Mistral Console' },
  ollama:      { url: 'https://ollama.com/download',                    label: 'Download Ollama' },
  huggingface: { url: 'https://huggingface.co/settings/tokens',         label: 'HuggingFace Tokens' },
};

const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o', gemini: 'gemini-2.5-pro-preview-05-06', claude: 'claude-opus-4-8',
  groq: 'meta-llama/llama-4-maverick-17b-128e-instruct', openrouter: 'openai/gpt-4.1',
  mistral: 'pixtral-large-latest', ollama: 'llava',
  huggingface: 'meta-llama/Llama-3.2-11B-Vision-Instruct', custom: '',
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  connected: { color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: <CheckCircle size={11} />, label: 'Connected' },
  active:    { color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: <CheckCircle size={11} />, label: 'Active' },
  failed:    { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',                 icon: <XCircle size={11} />,    label: 'Failed' },
  rate_limited: { color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',      icon: <AlertTriangle size={11} />, label: 'Rate Limited' },
  inactive:  { color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',               icon: <XCircle size={11} />,    label: 'Not Tested' },
};

interface APIFormData {
  name: string; provider: string; key: string;
  baseUrl: string; modelName: string; providerType: string;
}

interface AISettingsPageProps { guestAllowed?: boolean; }

export const AISettingsPage: React.FC<AISettingsPageProps> = ({ guestAllowed = false }) => {
  const { apiKeys, addApiKey, updateApiKey, deleteApiKey, setDefaultApi, aiMode, setAiMode, user, isAuthenticated } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [form, setForm] = useState<APIFormData>({
    name: '', provider: 'openai', key: '', baseUrl: '', modelName: 'gpt-4o', providerType: '',
  });

  const isPremium = isAuthenticated && (user?.plan === 'pro' || user?.plan === 'enterprise');
  const isFree = isAuthenticated && !isPremium;
  const hasKeys = apiKeys.filter(k => k.isEnabled).length > 0;
  const connectedCount = apiKeys.filter(k => k.status === 'connected').length;

  const openAddModal = () => {
    setEditingKey(null);
    setForm({ name: 'OpenAI', provider: 'openai', key: '', baseUrl: '', modelName: 'gpt-4o', providerType: '' });
    setShowModal(true);
  };

  const openEditModal = (key: APIKey) => {
    setEditingKey(key);
    setForm({
      name: key.name, provider: key.provider, key: key.key,
      baseUrl: key.baseUrl || '', modelName: key.modelName || '', providerType: key.providerType || '',
    });
    setShowModal(true);
  };

  const handleProviderChange = (provider: string) => {
    const providerLabel = AI_PROVIDERS.find(p => p.value === provider)?.label || '';
    setForm(f => ({
      ...f, provider,
      name: f.name === '' || AI_PROVIDERS.some(p => p.label === f.name) ? providerLabel : f.name,
      modelName: DEFAULT_MODELS[provider] || '',
      baseUrl: provider === 'ollama' ? 'http://localhost:11434/v1' : '',
    }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.key.trim()) { toast.error('Name and API key are required'); return; }
    if (editingKey) {
      updateApiKey(editingKey.id, {
        name: form.name, provider: form.provider, key: form.key,
        baseUrl: form.baseUrl, modelName: form.modelName, providerType: form.providerType,
        status: 'inactive',
      });
      toast.success('API key updated!');
    } else {
      addApiKey({
        id: generateId(), name: form.name, provider: form.provider,
        key: form.key, baseUrl: form.baseUrl, modelName: form.modelName,
        providerType: form.providerType, status: 'inactive',
        isDefault: apiKeys.length === 0, isEnabled: true,
      });
      toast.success('API key added!');
    }
    setShowModal(false);
  };

  const handleTest = async (apiKey: APIKey) => {
    setTesting(apiKey.id);
    const toastId = toast.loading(`Testing ${apiKey.name}...`);
    const result = await testApiKey(apiKey);
    toast.dismiss(toastId);
    if (result.success) {
      updateApiKey(apiKey.id, {
        status: 'connected', lastTested: new Date().toISOString(),
        visionCapable: isVisionCapable(apiKey.provider, apiKey.modelName), toolCompatible: true,
      });
      toast.success(`${apiKey.name}: Connected successfully!`);
    } else {
      updateApiKey(apiKey.id, { status: 'failed', lastTested: new Date().toISOString() });
      toast.error(`${apiKey.name}: ${result.message}`);
    }
    setTesting(null);
  };

  const maskKey = (key: string) =>
    key.length <= 8 ? '••••••••' : key.slice(0, 6) + '•'.repeat(12) + key.slice(-4);

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/20 flex-shrink-0">
              <Settings2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">AI Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isAuthenticated ? 'Manage your AI providers and API keys' : 'Add your API key to power AI tools'}
              </p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors shadow-sm shadow-[#6366F1]/25 flex-shrink-0"
          >
            <Plus size={15} />
            Add Key
          </button>
        </div>

        {/* ── Plan-aware banner ───────────────────────────────── */}
        {isPremium ? (
          /* Premium: platform API is included */
          <div className="flex gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-700/30">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
              <span className="font-bold">Platform API Included</span> — you're on the{' '}
              <span className="font-bold capitalize">{user?.plan}</span> plan. AI tools work automatically with
              no personal key required. You can optionally add your own keys below and switch to them anytime.
            </div>
          </div>
        ) : isFree ? (
          /* Free plan: personal key required */
          <div className={`flex gap-3 p-4 rounded-2xl border ${
            !hasKeys
              ? 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-700/30'
              : 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-700/30'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              !hasKeys ? 'bg-red-100 dark:bg-red-900/40' : 'bg-amber-100 dark:bg-amber-900/40'
            }`}>
              <AlertTriangle size={14} className={!hasKeys ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} />
            </div>
            <div className={`text-sm leading-relaxed ${!hasKeys ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
              <span className="font-bold">Free plan — personal API key required.</span>{' '}
              {!hasKeys
                ? 'You have no active keys. AI tools will not work until you add your API key below.'
                : 'Your API key is active. AI tools use it for all generations.'
              }{' '}
              <Link to="/pricing" className="underline font-semibold hover:opacity-80">
                Upgrade to skip this →
              </Link>
            </div>
          </div>
        ) : (
          /* Guest: personal key required */
          <div className="flex gap-3 p-4 rounded-2xl bg-[#EEF2FF] dark:bg-[#6366F1]/10 border border-[#A5B4FC]/40 dark:border-[#6366F1]/20">
            <div className="w-8 h-8 rounded-xl bg-[#6366F1]/15 dark:bg-[#6366F1]/25 flex items-center justify-center flex-shrink-0">
              <Key size={14} className="text-[#6366F1]" />
            </div>
            <div className="text-sm text-[#4338CA] dark:text-[#A5B4FC] leading-relaxed">
              <span className="font-bold">Personal API key required</span> to use AI tools.
              Your key is stored only in your browser — never on our servers.{' '}
              <Link to="/register" className="underline font-semibold hover:opacity-80">
                Create an account →
              </Link>
            </div>
          </div>
        )}

        {/* ── API Source selector (premium users only) ────────── */}
        {isPremium && (
          <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Cpu size={15} className="text-[#6366F1]" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">API Source</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Choose which keys to use for AI tools — platform API is included in your plan
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Platform */}
              <button
                onClick={() => setAiMode('system')}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  aiMode !== 'personal'
                    ? 'border-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/12'
                    : 'border-gray-200 dark:border-[#232650] hover:border-[#A5B4FC] dark:hover:border-[#6366F1]/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${aiMode !== 'personal' ? 'bg-[#6366F1] text-white' : 'bg-gray-100 dark:bg-[#232650] text-gray-400'}`}>
                  <Zap size={17} />
                </div>
                <p className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">Platform API</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Managed infrastructure. Included in your plan.</p>
                {aiMode !== 'personal' && (
                  <p className="text-xs text-[#6366F1] font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle size={11} /> Active
                  </p>
                )}
              </button>
              {/* Personal */}
              <button
                onClick={() => setAiMode('personal')}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  aiMode === 'personal'
                    ? 'border-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/12'
                    : 'border-gray-200 dark:border-[#232650] hover:border-[#A5B4FC] dark:hover:border-[#6366F1]/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${aiMode === 'personal' ? 'bg-[#6366F1] text-white' : 'bg-gray-100 dark:bg-[#232650] text-gray-400'}`}>
                  <Key size={17} />
                </div>
                <p className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">Personal Keys</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Use your own API keys instead of the platform.</p>
                {aiMode === 'personal' && (
                  <p className="text-xs text-[#6366F1] font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle size={11} /> Active
                  </p>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Keys section ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {isPremium ? 'Personal API Keys' : 'Your API Key'}
              </h2>
              {isPremium && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] font-semibold">
                  Optional
                </span>
              )}
              {!isPremium && !hasKeys && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold">
                  Required
                </span>
              )}
              {apiKeys.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#232650] text-gray-500 dark:text-gray-400">
                  {apiKeys.length} key{apiKeys.length !== 1 ? 's' : ''} · {connectedCount} connected
                </span>
              )}
            </div>
          </div>

          {/* Security note */}
          {apiKeys.length === 0 && (
            <div className="flex gap-3 p-3 mb-3 rounded-xl bg-gray-50 dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650]">
              <Shield size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Stored in your browser only.</span>{' '}
                Keys go directly to the AI provider — never to our servers.
              </p>
            </div>
          )}

          {/* Empty state */}
          {apiKeys.length === 0 ? (
            <div className={`bg-white dark:bg-[#131635] rounded-2xl border border-dashed py-14 text-center shadow-sm ${
              !isPremium ? 'border-red-300 dark:border-red-700/50' : 'border-gray-200 dark:border-[#232650]'
            }`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                !isPremium ? 'bg-red-50 dark:bg-red-900/20' : 'bg-[#EEF2FF] dark:bg-[#6366F1]/15'
              }`}>
                <Key size={24} className={!isPremium ? 'text-red-500' : 'text-[#6366F1]'} />
              </div>
              <p className="font-bold text-gray-900 dark:text-white mb-1.5">
                {isPremium ? 'No personal keys added' : 'No API key — tools are locked'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 max-w-xs mx-auto">
                {isPremium
                  ? 'Platform API is active. Add personal keys to optionally use them instead.'
                  : 'Add your personal API key to unlock all AI tools. Any provider works — OpenAI, Gemini, Groq, and more.'}
              </p>
              <button
                onClick={openAddModal}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors shadow-sm ${
                  !isPremium
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                    : 'bg-[#6366F1] hover:bg-[#4F46E5] shadow-[#6366F1]/25'
                }`}
              >
                <Plus size={15} /> {isPremium ? 'Add optional key' : 'Add your API key'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map(key => {
                const pc = PROVIDER_COLORS[key.provider] ?? PROVIDER_COLORS.custom;
                const sc = STATUS_CONFIG[key.status] ?? STATUS_CONFIG.inactive;
                const isTesting = testing === key.id;
                const isVisible = showKeys[key.id];

                return (
                  <div
                    key={key.id}
                    className={`bg-white dark:bg-[#131635] rounded-2xl border transition-all shadow-sm ${
                      key.isDefault
                        ? 'border-[#6366F1]/50 dark:border-[#6366F1]/40 ring-2 ring-[#6366F1]/10 dark:ring-[#6366F1]/15'
                        : 'border-gray-100 dark:border-[#232650] hover:border-gray-200 dark:hover:border-[#2f3260]'
                    }`}
                  >
                    {/* Card body */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Provider initial badge */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-base ${pc.bg} ${pc.text}`}>
                          {key.provider[0].toUpperCase()}
                        </div>

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          {/* Name row */}
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-bold text-gray-900 dark:text-white text-sm">{key.name}</span>
                            {key.isDefault && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6366F1] text-white">
                                <Star size={9} /> Default
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.color}`}>
                              {sc.icon} {sc.label}
                            </span>
                            {!key.isEnabled && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                                Disabled
                              </span>
                            )}
                          </div>

                          {/* Provider + model */}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {pc.label}{key.modelName ? ` · ${key.modelName}` : ''}
                          </p>

                          {/* Capability badges */}
                          {key.status === 'connected' && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {key.visionCapable && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                  👁 Vision
                                </span>
                              )}
                              {key.toolCompatible && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                  ✓ Tool Ready
                                </span>
                              )}
                              {key.lastTested && (
                                <span className="text-[10px] text-gray-400">
                                  Tested {new Date(key.lastTested).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* API key display */}
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650]">
                        <Key size={12} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                        <code className="flex-1 text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                          {isVisible ? key.key : maskKey(key.key)}
                        </code>
                        <button
                          onClick={() => setShowKeys(s => ({ ...s, [key.id]: !s[key.id] }))}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                          title={isVisible ? 'Hide key' : 'Show key'}
                        >
                          {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-50 dark:border-[#232650] bg-gray-50/50 dark:bg-[#0d1030]/40 rounded-b-2xl flex-wrap">
                      {/* Test button — primary action */}
                      <button
                        onClick={() => handleTest(key)}
                        disabled={isTesting}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          key.status === 'connected'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/40 hover:bg-emerald-100'
                            : 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-sm shadow-[#6366F1]/20'
                        } disabled:opacity-60`}
                      >
                        {isTesting
                          ? <><RefreshCw size={11} className="animate-spin" /> Testing…</>
                          : <><RefreshCw size={11} /> Test Connection</>
                        }
                      </button>

                      {/* Set Default */}
                      {!key.isDefault && (
                        <button
                          onClick={() => { setDefaultApi(key.id); toast.success('Default key updated!'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-[#131635] border border-gray-200 dark:border-[#232650] hover:border-[#6366F1]/40 hover:text-[#6366F1] transition-all"
                        >
                          <Star size={11} /> Set Default
                        </button>
                      )}

                      {/* Enable/Disable toggle */}
                      <button
                        onClick={() => updateApiKey(key.id, { isEnabled: !key.isEnabled })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          key.isEnabled
                            ? 'bg-white dark:bg-[#131635] border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400 hover:border-amber-300 hover:text-amber-600'
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                        }`}
                      >
                        {key.isEnabled ? 'Enabled' : 'Disabled'}
                      </button>

                      {/* Get API Key link */}
                      {PROVIDER_API_URLS[key.provider] && (
                        <a
                          href={PROVIDER_API_URLS[key.provider].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-[#131635] border border-gray-200 dark:border-[#232650] hover:border-[#6366F1]/40 hover:text-[#6366F1] transition-all"
                        >
                          <ExternalLink size={11} /> Get API Key
                        </a>
                      )}

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(key)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/15 transition-colors"
                        title="Edit key"
                      >
                        <Edit3 size={14} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => { deleteApiKey(key.id); toast.success('Key deleted'); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete key"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Upgrade CTA (guests + free users) ───────────────── */}
        {!isPremium && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] dark:from-[#6366F1]/10 dark:to-[#8B5CF6]/10 border border-[#A5B4FC]/30 dark:border-[#6366F1]/20 text-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Crown size={20} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Skip the API key setup</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
              Upgrade to Pro or Enterprise and use our managed Platform API — all AI tools work instantly with no personal key needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {!isAuthenticated && (
                <Link to="/register">
                  <Button>Create Free Account</Button>
                </Link>
              )}
              <Link to="/pricing">
                <Button variant={isAuthenticated ? 'primary' : 'secondary'}>
                  {isAuthenticated ? 'Upgrade Plan' : 'View Pricing'}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Add / Edit Modal ────────────────────────────────── */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingKey ? 'Edit API Key' : 'Add New API Key'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Key Name"
              placeholder="e.g., My OpenAI Key"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <div>
              <Select
                label="Provider"
                options={AI_PROVIDERS}
                value={form.provider}
                onChange={e => handleProviderChange(e.target.value)}
              />
              {PROVIDER_API_URLS[form.provider] && (
                <a
                  href={PROVIDER_API_URLS[form.provider].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] hover:underline transition-colors"
                >
                  <ExternalLink size={11} />
                  Get API Key → {PROVIDER_API_URLS[form.provider].label}
                </a>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKeys['modal'] ? 'text' : 'password'}
                  placeholder={form.provider === 'gemini' ? 'AIza...' : form.provider === 'openai' ? 'sk-...' : 'Your API key'}
                  value={form.key}
                  onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-gray-900 dark:text-gray-100 text-sm pr-10 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                />
                <button
                  onClick={() => setShowKeys(s => ({ ...s, modal: !s.modal }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showKeys['modal'] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Model picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Model
                <span className="text-[10px] font-normal text-gray-400 bg-gray-100 dark:bg-[#232650] px-2 py-0.5 rounded-full">
                  👁 = supports image analysis
                </span>
              </label>
              {PROVIDER_MODELS[form.provider]?.length ? (
                <select
                  value={PROVIDER_MODELS[form.provider].some(m => m.value === form.modelName) ? form.modelName : '_custom'}
                  onChange={e => { if (e.target.value !== '_custom') setForm(f => ({ ...f, modelName: e.target.value })); }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-gray-900 dark:text-gray-100 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                >
                  {PROVIDER_MODELS[form.provider].map(m => (
                    <option key={m.value} value={m.value}>{m.vision ? '👁 ' : '📝 '}{m.label}</option>
                  ))}
                  <option value="_custom">✏️ Custom model name…</option>
                </select>
              ) : null}
              <input
                type="text"
                placeholder={DEFAULT_MODELS[form.provider] || 'Enter exact model name'}
                value={form.modelName}
                onChange={e => setForm(f => ({ ...f, modelName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-gray-900 dark:text-gray-100 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none placeholder:text-gray-400"
              />
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                isVisionCapable(form.provider, form.modelName)
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              }`}>
                {isVisionCapable(form.provider, form.modelName)
                  ? <><CheckCircle size={12} /> Vision capable — image tools will work</>
                  : <><AlertTriangle size={12} /> Text only — image tools require a vision model</>
                }
              </div>
            </div>

            {(form.provider === 'custom' || form.provider === 'ollama' || form.provider === 'openrouter') && (
              <Input
                label="Base URL"
                placeholder={form.provider === 'ollama' ? 'http://localhost:11434/v1' : 'https://api.example.com/v1'}
                value={form.baseUrl}
                onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
              />
            )}
            {form.provider === 'custom' && (
              <Input
                label="Provider Type"
                placeholder="openai-compatible"
                value={form.providerType}
                onChange={e => setForm(f => ({ ...f, providerType: e.target.value }))}
              />
            )}
            <div className="flex gap-3 pt-1">
              <Button fullWidth onClick={handleSave}>{editingKey ? 'Update Key' : 'Add Key'}</Button>
              <Button fullWidth variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
};
