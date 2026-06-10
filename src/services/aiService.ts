import { useStore } from '../store/useStore';
import { useAdminStore } from '../store/useAdminStore';
import type { APIKey } from '../types';
import type { SystemApiKey } from '../store/useAdminStore';

const SYSTEM_PROVIDER_MAP: Record<string, string> = {
  OpenAI: 'openai', Gemini: 'gemini', Claude: 'claude', Groq: 'groq',
  Mistral: 'mistral', HuggingFace: 'huggingface', OpenRouter: 'openrouter', Ollama: 'ollama',
};

function systemKeyToAPIKey(k: SystemApiKey): APIKey {
  return {
    id: k.id,
    name: k.label,
    provider: SYSTEM_PROVIDER_MAP[k.provider] ?? k.provider.toLowerCase(),
    key: k.key,
    modelName: k.model || undefined,
    baseUrl: k.baseUrl || undefined,
    status: 'connected',
    isDefault: false,
    isEnabled: true,
  };
}

/**
 * Reads API keys from VITE_* environment variables baked in at build time.
 * This makes admin-configured keys available to ALL users on ALL devices,
 * since env vars are embedded in the JS bundle — not stored in localStorage.
 */
export function getEnvSystemKeys(): APIKey[] {
  const keys: APIKey[] = [];
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    keys.push({ id: 'env-openai', name: 'OpenAI (System)', provider: 'openai',
      key: import.meta.env.VITE_OPENAI_API_KEY,
      modelName: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o',
      status: 'connected', isDefault: keys.length === 0, isEnabled: true });
  }
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    keys.push({ id: 'env-gemini', name: 'Gemini (System)', provider: 'gemini',
      key: import.meta.env.VITE_GEMINI_API_KEY,
      modelName: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash',
      status: 'connected', isDefault: keys.length === 0, isEnabled: true });
  }
  if (import.meta.env.VITE_GROQ_API_KEY) {
    keys.push({ id: 'env-groq', name: 'Groq (System)', provider: 'groq',
      key: import.meta.env.VITE_GROQ_API_KEY,
      modelName: import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile',
      status: 'connected', isDefault: keys.length === 0, isEnabled: true });
  }
  if (import.meta.env.VITE_CLAUDE_API_KEY) {
    keys.push({ id: 'env-claude', name: 'Claude (System)', provider: 'claude',
      key: import.meta.env.VITE_CLAUDE_API_KEY,
      modelName: import.meta.env.VITE_CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
      status: 'connected', isDefault: keys.length === 0, isEnabled: true });
  }
  if (import.meta.env.VITE_OPENROUTER_API_KEY) {
    keys.push({ id: 'env-openrouter', name: 'OpenRouter (System)', provider: 'openrouter',
      key: import.meta.env.VITE_OPENROUTER_API_KEY,
      modelName: import.meta.env.VITE_OPENROUTER_MODEL || 'openai/gpt-4o',
      status: 'connected', isDefault: keys.length === 0, isEnabled: true });
  }
  if (import.meta.env.VITE_MISTRAL_API_KEY) {
    keys.push({ id: 'env-mistral', name: 'Mistral (System)', provider: 'mistral',
      key: import.meta.env.VITE_MISTRAL_API_KEY,
      modelName: import.meta.env.VITE_MISTRAL_MODEL || 'pixtral-12b-2409',
      status: 'connected', isDefault: keys.length === 0, isEnabled: true });
  }
  return keys;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  imageBase64?: string;
  imageMimeType?: string;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type || 'image/jpeg' });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize + compress an image before sending it to a vision API.
 *
 * Why: a raw 8 MP photo encodes to ~10 MB base64 which exceeds most API
 * request-body limits and causes silent failures or 413 errors.
 * Vision models need no more than 1024 px on any side to understand content.
 *
 * - Resizes to MAX_DIM × MAX_DIM maximum (maintains aspect ratio)
 * - PNGs stay PNG so transparent backgrounds are preserved
 * - JPEGs / WEBPs are re-encoded at 85% quality
 */
export function imageToBase64ForAI(file: File): Promise<{ base64: string; mimeType: string }> {
  const MAX_DIM = 1024;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      URL.revokeObjectURL(url);

      if (w > MAX_DIM || h > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas unavailable')); return; }

      ctx.drawImage(img, 0, 0, w, h);

      // Keep PNG for transparent-background images; JPEG for everything else
      const mime   = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const base64 = canvas.toDataURL(mime, 0.85).split(',')[1];
      resolve({ base64, mimeType: mime });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Cannot load image for processing: ${file.name}`));
    };

    img.src = url;
  });
}

export function extractJSON(text: string): string {
  // Strip markdown code fences first (```json ... ``` or ``` ... ```)
  const stripped = text.replace(/```(?:json)?\s*\n?/gi, '').replace(/```\s*/g, '');

  // Use bracket-counting to find the first complete JSON object.
  // This avoids the greedy-regex problem where extra {} after the JSON
  // object cause JSON.parse to fail.
  const start = stripped.indexOf('{');
  if (start === -1) return text;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return stripped.slice(start, i + 1);
    }
  }

  // Fallback: return everything from the first { onwards
  return stripped.slice(start);
}

// ─── Vision capability detection ─────────────────────────────────────────────
// Model name fragments that indicate vision support.
const VISION_MODEL_FRAGMENTS = [
  'gpt-4o', 'gpt-4.1', 'gpt-4-turbo', 'gpt-4-vision',
  'gemini',
  'claude',
  'llama-4',
  'pixtral',
  'llava', 'bakllava', 'llava-llama3', 'moondream', 'minicpm', 'qwen2-vl', 'qwen-vl',
];

export function isVisionCapable(provider: string, modelName?: string): boolean {
  if (!modelName) {
    return ['openai', 'gemini', 'claude', 'openrouter'].includes(provider);
  }
  const lower = modelName.toLowerCase();
  return VISION_MODEL_FRAGMENTS.some(f => lower.includes(f));
}

// ─── Provider Implementations ─────────────────────────────────────────────────

async function callOpenAI(apiKey: APIKey, req: AIRequest): Promise<string> {
  const model = apiKey.modelName || 'gpt-4o';
  const baseUrl = apiKey.baseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1';

  const content: unknown[] = [];
  if (req.imageBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${req.imageMimeType || 'image/jpeg'};base64,${req.imageBase64}`, detail: 'high' },
    });
  }
  content.push({ type: 'text', text: req.prompt });

  const messages: unknown[] = [];
  if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
  messages.push({ role: 'user', content });

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: req.maxTokens || 1500, temperature: 0.7 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message || `OpenAI error ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callGemini(apiKey: APIKey, req: AIRequest): Promise<string> {
  const model = apiKey.modelName || 'gemini-1.5-pro';

  const parts: unknown[] = [];
  if (req.imageBase64) {
    parts.push({ inline_data: { mime_type: req.imageMimeType || 'image/jpeg', data: req.imageBase64 } });
  }
  parts.push({ text: req.prompt });

  const body: Record<string, unknown> = {
    contents: [{ parts }],
    generationConfig: { maxOutputTokens: req.maxTokens || 1500, temperature: 0.7 },
  };
  if (req.systemPrompt) {
    body.systemInstruction = { parts: [{ text: req.systemPrompt }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.key}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message || `Gemini error ${res.status}`);
  }
  const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
  return data.candidates[0].content.parts[0].text;
}

async function callClaude(apiKey: APIKey, req: AIRequest): Promise<string> {
  const model = apiKey.modelName || 'claude-opus-4-8';

  const content: unknown[] = [];
  if (req.imageBase64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: req.imageMimeType || 'image/jpeg', data: req.imageBase64 },
    });
  }
  content.push({ type: 'text', text: req.prompt });

  const body: Record<string, unknown> = {
    model,
    max_tokens: req.maxTokens || 1500,
    messages: [{ role: 'user', content }],
  };
  if (req.systemPrompt) body.system = req.systemPrompt;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey.key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message || `Claude error ${res.status}`);
  }
  const data = await res.json() as { content: { text: string }[] };
  return data.content[0].text;
}

async function callGroq(apiKey: APIKey, req: AIRequest): Promise<string> {
  // Groq vision model for images, text model otherwise
  const model = apiKey.modelName || (req.imageBase64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile');

  const content: unknown[] = [];
  if (req.imageBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${req.imageMimeType || 'image/jpeg'};base64,${req.imageBase64}` },
    });
  }
  content.push({ type: 'text', text: req.prompt });

  const messages: unknown[] = [];
  if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
  messages.push({ role: 'user', content });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: req.maxTokens || 1500, temperature: 0.7 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message || `Groq error ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callOpenRouter(apiKey: APIKey, req: AIRequest): Promise<string> {
  const model = apiKey.modelName || 'openai/gpt-4o';

  const content: unknown[] = [];
  if (req.imageBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${req.imageMimeType || 'image/jpeg'};base64,${req.imageBase64}` },
    });
  }
  content.push({ type: 'text', text: req.prompt });

  const messages: unknown[] = [];
  if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
  messages.push({ role: 'user', content });

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'PixelMind AI',
    },
    body: JSON.stringify({ model, messages, max_tokens: req.maxTokens || 1500 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message || `OpenRouter error ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callCustom(apiKey: APIKey, req: AIRequest): Promise<string> {
  // Treat custom APIs as OpenAI-compatible
  return callOpenAI(apiKey, req);
}

async function callHuggingFace(apiKey: APIKey, req: AIRequest): Promise<string> {
  const model = apiKey.modelName || 'meta-llama/Llama-3.1-70B-Instruct';
  const baseUrl = apiKey.baseUrl || `https://api-inference.huggingface.co/models/${model}/v1`;

  const messages: unknown[] = [];
  if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });
  messages.push({ role: 'user', content: req.prompt });

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: req.maxTokens || 1500 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `HuggingFace error ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callMistral(apiKey: APIKey, req: AIRequest): Promise<string> {
  const model = apiKey.modelName || 'mistral-large-latest';
  // Pixtral models (pixtral-large-latest, pixtral-12b-*) support vision via image_url
  const isPixtral = model.toLowerCase().includes('pixtral');

  const messages: unknown[] = [];
  if (req.systemPrompt) messages.push({ role: 'system', content: req.systemPrompt });

  let userContent: unknown;
  if (req.imageBase64 && isPixtral) {
    userContent = [
      {
        type: 'image_url',
        image_url: { url: `data:${req.imageMimeType || 'image/jpeg'};base64,${req.imageBase64}` },
      },
      { type: 'text', text: req.prompt },
    ];
  } else if (req.imageBase64 && !isPixtral) {
    userContent = `${req.prompt}\n\n[Switch to pixtral-large-latest in AI Settings to enable image analysis.]`;
  } else {
    userContent = req.prompt;
  }

  messages.push({ role: 'user', content: userContent });

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: req.maxTokens || 1500, temperature: 0.7 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; error?: { message?: string } };
    throw new Error(err.message || err.error?.message || `Mistral error ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function dispatchToProvider(apiKey: APIKey, req: AIRequest): Promise<string> {
  switch (apiKey.provider) {
    case 'openai': return callOpenAI(apiKey, req);
    case 'gemini': return callGemini(apiKey, req);
    case 'claude': return callClaude(apiKey, req);
    case 'groq': return callGroq(apiKey, req);
    case 'openrouter': return callOpenRouter(apiKey, req);
    case 'huggingface': return callHuggingFace(apiKey, req);
    case 'mistral': return callMistral(apiKey, req);
    case 'custom': return callCustom(apiKey, req);
    case 'ollama': {
      // Ollama is OpenAI-compatible, default base URL
      const ollamaKey = { ...apiKey, baseUrl: apiKey.baseUrl || 'http://localhost:11434/v1', key: apiKey.key || 'ollama' };
      return callOpenAI(ollamaKey, req);
    }
    default:
      throw new Error(`Unsupported provider: ${apiKey.provider}`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Main AI call. Tries API keys in priority order:
 * 1. Default key (isDefault = true)
 * 2. Connected keys
 * 3. Any enabled key
 * Falls back to next key if one fails.
 */
export async function callAI(req: AIRequest, specificKey?: APIKey): Promise<AIResponse> {
  if (specificKey) {
    const text = await dispatchToProvider(specificKey, req);
    return { text, provider: specificKey.provider, model: specificKey.modelName || specificKey.provider };
  }

  const { apiKeys, user, isAuthenticated, aiMode } = useStore.getState();
  const isPremium = isAuthenticated && (user?.plan === 'pro' || user?.plan === 'enterprise');
  let lastError: Error = new Error('No providers available');

  // ── Pro & Enterprise: always try platform API first ───────────────────────
  // aiMode='personal' is only honoured when the user has personal keys configured.
  // If no personal key is set, we always fall back to system keys so premium
  // users are never blocked by a stale aiMode preference.
  if (isPremium) {
    const { systemApiKeys } = useAdminStore.getState();
    const storeKeys = systemApiKeys.filter(k => k.status === 'active').map(systemKeyToAPIKey);
    // Env keys are baked into the bundle at build time — available on all devices
    const activeSystemKeys = storeKeys.length > 0 ? storeKeys : getEnvSystemKeys();
    const enabledPersonalKeys = apiKeys.filter(k => k.isEnabled);

    // If the user explicitly chose personal mode AND has personal keys, use those
    if (aiMode === 'personal' && enabledPersonalKeys.length > 0) {
      const sorted = [...enabledPersonalKeys].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (b.status === 'connected' ? 1 : 0) - (a.status === 'connected' ? 1 : 0);
      });
      for (const key of sorted) {
        try {
          const text = await dispatchToProvider(key, req);
          useStore.getState().updateApiKey(key.id, { status: 'connected', lastTested: new Date().toISOString() });
          return { text, provider: key.provider, model: key.modelName || key.provider };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`[AI][Personal] Provider "${key.provider}" failed:`, lastError.message);
        }
      }
      throw lastError;
    }

    // Otherwise (system mode, or personal mode with no personal keys) → system keys
    if (activeSystemKeys.length === 0) {
      throw new Error(
        'No platform API keys are configured. Ask your admin to add API keys in the Admin Panel → API Management.'
      );
    }

    for (const key of activeSystemKeys) {
      try {
        const text = await dispatchToProvider(key, req);
        return { text, provider: key.provider, model: key.modelName || key.provider };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[AI][Platform] Provider "${key.provider}" failed:`, lastError.message);
      }
    }

    throw lastError;
  }

  // ── Guests (not logged in): system keys first, personal keys as fallback ──
  if (!isAuthenticated) {
    const { systemApiKeys } = useAdminStore.getState();
    const storeKeys = systemApiKeys.filter(k => k.status === 'active').map(systemKeyToAPIKey);
    const activeSystemKeys = storeKeys.length > 0 ? storeKeys : getEnvSystemKeys();

    if (activeSystemKeys.length > 0) {
      for (const key of activeSystemKeys) {
        try {
          const text = await dispatchToProvider(key, req);
          return { text, provider: key.provider, model: key.modelName || key.provider };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`[AI][Guest/Platform] Provider "${key.provider}" failed:`, lastError.message);
        }
      }
      // All system keys failed — try personal keys before giving up
    }

    const guestPersonal = apiKeys.filter(k => k.isEnabled);
    if (guestPersonal.length > 0) {
      for (const key of guestPersonal) {
        try {
          const text = await dispatchToProvider(key, req);
          return { text, provider: key.provider, model: key.modelName || key.provider };
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }
      throw lastError;
    }

    throw new Error(
      'No API keys available. Add your own API key on this page to continue, or sign up for a free account.'
    );
  }

  // ── Free plan (logged in): personal API key required ──────────────────────
  const enabled = apiKeys.filter(k => k.isEnabled);

  if (enabled.length === 0) {
    throw new Error(
      'The free plan requires your own API key. Add one in AI Settings, or upgrade to Pro/Enterprise for automatic access.'
    );
  }

  const sorted = [...enabled].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return (b.status === 'connected' ? 1 : 0) - (a.status === 'connected' ? 1 : 0);
  });

  for (const key of sorted) {
    try {
      const text = await dispatchToProvider(key, req);
      useStore.getState().updateApiKey(key.id, { status: 'connected', lastTested: new Date().toISOString() });
      return { text, provider: key.provider, model: key.modelName || key.provider };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI] Provider "${key.provider}" failed:`, lastError.message);
    }
  }

  throw lastError;
}

/**
 * Test a specific API key with a minimal request.
 */
export async function testApiKey(apiKey: APIKey): Promise<{ success: boolean; message: string }> {
  try {
    await dispatchToProvider(apiKey, { prompt: 'Reply with the single word: OK', maxTokens: 10 });
    return { success: true, message: 'Connection successful!' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message };
  }
}
