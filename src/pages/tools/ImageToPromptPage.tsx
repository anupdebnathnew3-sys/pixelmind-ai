import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { useGuestStore } from '../../store/useGuestStore';
import { usePromptStore, buildImageToPromptPrompt } from '../../store/usePromptStore';
import { callAI, imageToBase64ForAI } from '../../services/aiService';
import {
  Upload, Copy, RefreshCw, Zap, X, AlertCircle, Trash2,
  Image as ImageIcon, ZoomIn, Clipboard,
  Plus, RotateCcw, Check, Wand2, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';

// ─── Prompt Styles ─────────────────────────────────────────────────────────────

const PROMPT_STYLES = [
  {
    id: 'simple',
    label: 'Simple',
    icon: '✦',
    desc: 'Short & clean',
    color: '#10B981',
    instruction: 'Generate a SHORT, CLEAN prompt of 1-2 sentences MAXIMUM. Focus ONLY on the main subject. Keep it minimal and direct. No technical photography terms. No platform syntax unless specified.',
  },
  {
    id: 'detailed',
    label: 'Detailed',
    icon: '◈',
    desc: 'Rich & descriptive',
    color: '#6366F1',
    instruction: 'Generate a DETAILED descriptive prompt. Include: subject details, lighting conditions, color palette, composition, environment, textures, mood. Write 3-5 rich descriptive sentences.',
  },
  {
    id: 'creative',
    label: 'Creative',
    icon: '✦',
    desc: 'Artistic & imaginative',
    color: '#8B5CF6',
    instruction: 'Generate a CREATIVE, ARTISTIC prompt. Use imaginative and evocative language. Include storytelling elements, unique visual metaphors, cinematic atmosphere, and artistic style references. Make it visually striking and unconventional.',
  },
  {
    id: 'commercial',
    label: 'Commercial',
    icon: '◉',
    desc: 'Stock-optimized',
    color: '#F59E0B',
    instruction: 'Generate a COMMERCIAL STOCK PHOTOGRAPHY prompt. Focus on professional composition, commercial appeal, marketable subject framing, clean execution, and stock-ready aesthetics. Include lighting quality and professional photography terms suitable for stock marketplaces.',
  },
  {
    id: 'ultra',
    label: 'Ultra Detail',
    icon: '⬡',
    desc: 'Maximum detail',
    color: '#EF4444',
    instruction: 'Generate an ULTRA-DETAILED technical photography prompt. Include: camera angle and position, lens focal length and characteristics, aperture and depth of field, precise lighting setup (type, direction, quality, color temperature), shadow detail, texture specifics, background depth, composition technique, time of day, atmospheric conditions, post-processing style, and overall photographic mood. Use professional photography and cinematography terminology throughout.',
  },
];

// ─── Platforms ─────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'none',       label: 'None',             icon: '🚫', desc: 'No specific platform',   hint: 'General image description without platform-specific formatting' },
  { id: 'midjourney', label: 'Midjourney',        icon: '🎨', desc: 'Discord bot',             hint: '/imagine prompt: with --ar flag' },
  { id: 'flux',       label: 'Flux',              icon: '⚡', desc: 'High quality diffusion',  hint: 'Natural language with style, lighting & mood' },
  { id: 'ideogram',   label: 'Ideogram',          icon: '💡', desc: 'Text + image AI',         hint: 'Optimized for text-in-image workflows' },
  { id: 'dalle',      label: 'DALL·E 3',          icon: '🤖', desc: 'OpenAI',                  hint: 'Descriptive natural language for DALL·E 3' },
  { id: 'firefly',    label: 'Firefly',           icon: '🔥', desc: 'Adobe Creative',          hint: 'Adobe Stock photography style' },
  { id: 'sd',         label: 'Stable Diffusion',  icon: '🌀', desc: 'Open source',             hint: 'Tag-based with quality modifiers' },
];

const ASPECT_RATIOS = ['None', '1:1', '4:5', '3:2', '16:9', '9:16', 'Random'];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UploadedImage {
  id: string;
  url: string;
  file: File;
  status: 'pending' | 'generating' | 'done' | 'error';
  prompt?: string;
  usedPlatform?: string;
  usedRatio?: string;
  usedStyle?: string;
  errorMsg?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface ImageToPromptPageProps {
  guestAllowed?: boolean;
}

export const ImageToPromptPage: React.FC<ImageToPromptPageProps> = ({ guestAllowed = false }) => {
  const { deductCredits, isAuthenticated } = useStore();
  const { getTemplate } = usePromptStore();
  const { deductGuestCredit, incrementGenerations, guestCredits } = useGuestStore();
  const guestGenCount = useRef(0);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('none');
  const [aspectRatio, setAspectRatio] = useState('None');
  const [promptStyle, setPromptStyle] = useState('detailed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  // ── Clipboard paste ────────────────────────────────────────────────────────
  const addFiles = useCallback((files: File[]) => {
    const newImgs: UploadedImage[] = files
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(f),
        file: f,
        status: 'pending',
      }));
    if (newImgs.length > 0) {
      setImages(prev => [...prev, ...newImgs]);
      toast.success(`${newImgs.length} image${newImgs.length !== 1 ? 's' : ''} added`);
    }
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const ext = file.type.split('/')[1] || 'png';
            const named = new File([file], `pasted-image-${Date.now()}.${ext}`, { type: file.type });
            imageFiles.push(named);
          }
        }
      }
      if (imageFiles.length > 0) addFiles(imageFiles);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addFiles]);

  // ── Dropzone ───────────────────────────────────────────────────────────────
  const onDrop = useCallback((files: File[]) => addFiles(files), [addFiles]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getEffectiveRatio = (ratio: string) => {
    if (ratio === 'None') return '';
    if (ratio === 'Random') return ['1:1', '4:5', '16:9', '3:2'][Math.floor(Math.random() * 4)];
    return ratio;
  };

  const getEffectivePlatform = (platform: string) =>
    platform === 'none' ? 'general' : platform;

  const getStyleInstruction = (styleId: string) =>
    PROMPT_STYLES.find(s => s.id === styleId)?.instruction ?? '';

  const replaceImage = (imgId: string) => {
    setImages(prev => prev.filter(i => i.id !== imgId));
    open();
  };

  const downloadPrompt = (img: UploadedImage) => {
    if (!img.prompt) return;
    const blob = new Blob([img.prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${img.file.name.replace(/\.[^/.]+$/, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Prompt downloaded!');
  };

  // ── Generate all ───────────────────────────────────────────────────────────
  const generateAll = async () => {
    const pending = images.filter(i => i.status === 'pending');
    if (pending.length === 0) { toast.error('No images to process'); return; }

    if (!isAuthenticated && guestCredits <= 0) {
      toast.error('No guest credits remaining. Create a free account for 500 credits.');
      return;
    }

    const template = getTemplate('image-to-prompt');
    if (!template) { toast.error('Prompt template not found'); return; }

    const effectiveRatio = getEffectiveRatio(aspectRatio);
    const effectivePlatform = getEffectivePlatform(selectedPlatform);
    const styleInstruction = getStyleInstruction(promptStyle);
    setIsGenerating(true);

    setImages(prev =>
      prev.map(img => pending.some(p => p.id === img.id)
        ? { ...img, status: 'generating', prompt: undefined, errorMsg: undefined }
        : img
      )
    );

    const noRatioNote = !effectiveRatio ? '\nDo NOT include any aspect ratio or resolution parameters in the output.' : '';
    const systemSuffix = `\n\n${styleInstruction}\n\nReturn ONLY the prompt text — no markdown, no labels, no preamble.${noRatioNote}`;

    let success = 0, fail = 0;
    const CONCURRENCY = 3;

    for (let i = 0; i < pending.length; i += CONCURRENCY) {
      const chunk = pending.slice(i, i + CONCURRENCY);
      const settled = await Promise.allSettled(
        chunk.map(async img => {
          const builtPrompt = buildImageToPromptPrompt(template, {
            platform: effectivePlatform,
            aspectRatio: effectiveRatio,
          });
          const { base64, mimeType } = await imageToBase64ForAI(img.file);
          return callAI({
            prompt: builtPrompt,
            systemPrompt: template.systemPrompt + systemSuffix,
            imageBase64: base64,
            imageMimeType: mimeType,
            maxTokens: promptStyle === 'ultra' ? 1200 : promptStyle === 'simple' ? 400 : 800,
          });
        })
      );

      settled.forEach((result, idx) => {
        const img = chunk[idx];
        if (result.status === 'fulfilled') {
          setImages(prev => prev.map(i => i.id === img.id
            ? { ...i, status: 'done', prompt: result.value.text.trim(), usedPlatform: selectedPlatform, usedRatio: effectiveRatio, usedStyle: promptStyle }
            : i
          ));
          if (isAuthenticated) {
            deductCredits(1);
          } else {
            deductGuestCredit(); incrementGenerations();
            guestGenCount.current += 1;
            if (guestGenCount.current % 3 === 0) {
              toast('Sign in to save your prompts and get 500 free credits →', { icon: '👋', duration: 4000 });
            }
          }
          success++;
        } else {
          const msg = result.reason instanceof Error ? result.reason.message : 'Generation failed';
          setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'error', errorMsg: msg } : i));
          fail++;
        }
      });
    }

    setIsGenerating(false);
    if (success > 0) toast.success(`Generated ${success} prompt${success !== 1 ? 's' : ''}!`);
    if (fail > 0) toast.error(`${fail} failed — check AI Settings for a vision-capable model.`);
  };

  // ── Regenerate one ─────────────────────────────────────────────────────────
  const regenerateOne = async (imgId: string) => {
    if (!isAuthenticated && guestCredits <= 0) {
      toast.error('No guest credits remaining. Create a free account for 500 credits.');
      return;
    }
    const img = images.find(i => i.id === imgId);
    if (!img) return;
    const template = getTemplate('image-to-prompt');
    if (!template) return;

    const effectiveRatio = getEffectiveRatio(aspectRatio);
    const effectivePlatform = getEffectivePlatform(selectedPlatform);
    const styleInstruction = getStyleInstruction(promptStyle);

    setImages(prev => prev.map(i => i.id === imgId ? { ...i, status: 'generating', prompt: undefined, errorMsg: undefined } : i));

    const noRatioNote = !effectiveRatio ? '\nDo NOT include any aspect ratio or resolution parameters in the output.' : '';

    try {
      const builtPrompt = buildImageToPromptPrompt(template, { platform: effectivePlatform, aspectRatio: effectiveRatio });
      const { base64, mimeType } = await imageToBase64ForAI(img.file);
      const response = await callAI({
        prompt: builtPrompt,
        systemPrompt: template.systemPrompt + `\n\n${styleInstruction}\n\nReturn ONLY the prompt text — no markdown, no labels, no preamble.${noRatioNote}`,
        imageBase64: base64,
        imageMimeType: mimeType,
        maxTokens: promptStyle === 'ultra' ? 1200 : promptStyle === 'simple' ? 400 : 800,
      });
      setImages(prev => prev.map(i => i.id === imgId
        ? { ...i, status: 'done', prompt: response.text.trim(), usedPlatform: selectedPlatform, usedRatio: effectiveRatio, usedStyle: promptStyle }
        : i
      ));
      if (isAuthenticated) {
        deductCredits(1);
      } else {
        deductGuestCredit(); incrementGenerations();
        guestGenCount.current += 1;
        if (guestGenCount.current % 3 === 0) {
          toast('Sign in to save your prompts and get 500 free credits →', { icon: '👋', duration: 4000 });
        }
      }
      toast.success('Regenerated!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Regeneration failed';
      setImages(prev => prev.map(i => i.id === imgId ? { ...i, status: 'error', errorMsg: msg } : i));
      toast.error(msg);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentPlatform = PLATFORMS.find(p => p.id === selectedPlatform);
  const currentStyle = PROMPT_STYLES.find(s => s.id === promptStyle);
  const pendingImages = images.filter(i => i.status === 'pending');
  const processedImages = images.filter(i => i.status !== 'pending');
  const doneCount = images.filter(i => i.status === 'done').length;
  const totalCount = images.length;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout guestAllowed={guestAllowed}>

      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/20"
            onClick={() => setLightboxSrc(null)}
          >
            <X size={18} />
          </button>
          <img
            src={lightboxSrc}
            alt="Preview"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white/40 text-xs">Click anywhere to close</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 min-h-full">

        {/* ════════════════════════════════════════════════════
            LEFT SIDEBAR
            ════════════════════════════════════════════════════ */}
        <div className="lg:w-72 flex-shrink-0 space-y-3">
          <InlineApiKeySetup />

          {/* Generation Settings — always open, no toggle */}
          <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-200 dark:border-[#232650] overflow-hidden shadow-sm">

            {/* Gradient header */}
            <div className="relative px-4 py-4 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] overflow-hidden">
              <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute right-3 bottom-1 w-10 h-10 rounded-full bg-white/[0.07]" />
              <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Wand2 size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight">Generation Settings</p>
                  <p className="text-[10px] text-white/65 mt-0.5 truncate">
                    <span className="text-white/90 font-semibold">{currentStyle?.label}</span>
                    {' · '}
                    {selectedPlatform === 'none' ? 'All Platforms' : currentPlatform?.label}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-5">

              {/* ── Prompt Style — 2-column grid ─────────────── */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  Prompt Style
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PROMPT_STYLES.map((style, idx) => {
                    const isSelected = promptStyle === style.id;
                    const isLastOdd  = idx === PROMPT_STYLES.length - 1 && PROMPT_STYLES.length % 2 !== 0;
                    return isLastOdd ? (
                      /* Full-width row for the last solo item */
                      <button
                        key={style.id}
                        onClick={() => setPromptStyle(style.id)}
                        className={`col-span-2 flex items-center gap-3 px-3.5 py-3 rounded-2xl border-2 transition-all text-left ${
                          isSelected ? 'shadow-md' : 'border-gray-100 dark:border-[#232650] hover:border-gray-200 dark:hover:border-[#2f3260] bg-gray-50/50 dark:bg-[#0d1030]/40 hover:bg-gray-100/60 dark:hover:bg-[#0d1030]/60'
                        }`}
                        style={isSelected ? { borderColor: style.color, backgroundColor: style.color + '14' } : {}}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 transition-all"
                          style={{
                            backgroundColor: isSelected ? style.color : style.color + '20',
                            color: isSelected ? 'white' : style.color,
                            boxShadow: isSelected ? `0 4px 10px ${style.color}40` : 'none',
                          }}
                        >
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold leading-tight ${isSelected ? '' : 'text-gray-900 dark:text-white'}`}
                            style={{ color: isSelected ? style.color : undefined }}>
                            {style.label}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{style.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: style.color }}>
                            <Check size={9} className="text-white" />
                          </div>
                        )}
                      </button>
                    ) : (
                      /* Normal compact card */
                      <button
                        key={style.id}
                        onClick={() => setPromptStyle(style.id)}
                        className={`relative flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all text-center ${
                          isSelected ? 'shadow-md' : 'border-gray-100 dark:border-[#232650] hover:border-gray-200 dark:hover:border-[#2f3260] bg-gray-50/50 dark:bg-[#0d1030]/40 hover:bg-gray-100/60 dark:hover:bg-[#0d1030]/60'
                        }`}
                        style={isSelected ? { borderColor: style.color, backgroundColor: style.color + '14' } : {}}
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold transition-all"
                          style={{
                            backgroundColor: isSelected ? style.color : style.color + '20',
                            color: isSelected ? 'white' : style.color,
                            boxShadow: isSelected ? `0 4px 12px ${style.color}40` : 'none',
                          }}
                        >
                          {style.icon}
                        </div>
                        <div>
                          <p className={`text-[11px] font-bold leading-tight ${isSelected ? '' : 'text-gray-900 dark:text-white'}`}
                            style={{ color: isSelected ? style.color : undefined }}>
                            {style.label}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{style.desc}</p>
                        </div>
                        {isSelected && (
                          <div
                            className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#191c40]"
                            style={{ backgroundColor: style.color }}
                          >
                            <Check size={7} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-[#232650]" />

              {/* ── AI Platform ──────────────────────────────── */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  AI Platform
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border-2 transition-all ${
                        selectedPlatform === p.id
                          ? 'border-[#6366F1] bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/25'
                          : 'border-gray-100 dark:border-[#232650] hover:border-[#6366F1]/40 hover:bg-[#EEF2FF]/50 dark:hover:bg-[#6366F1]/8 bg-gray-50/50 dark:bg-[#0d1030]/40'
                      }`}
                    >
                      <span className="text-base flex-shrink-0 leading-none">{p.icon}</span>
                      <span className={`text-[11px] font-semibold truncate ${
                        selectedPlatform === p.id ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                      }`}>{p.label}</span>
                    </button>
                  ))}
                </div>
                {selectedPlatform !== 'none' && currentPlatform && (
                  <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                    {currentPlatform.hint}
                  </p>
                )}
              </div>

              {/* ── Aspect Ratio ─────────────────────────────── */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  Aspect Ratio
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ASPECT_RATIOS.map(r => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        aspectRatio === r
                          ? 'bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/30'
                          : 'bg-gray-100 dark:bg-[#0d1030] text-gray-600 dark:text-gray-400 hover:bg-[#EEF2FF] hover:text-[#6366F1] dark:hover:bg-[#6366F1]/10 dark:hover:text-[#A5B4FC] border border-gray-200 dark:border-[#232650]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {aspectRatio === 'None' && (
                  <p className="text-[10px] text-gray-400 mt-2">No ratio appended to prompts</p>
                )}
                {aspectRatio === 'Random' && (
                  <p className="text-[10px] text-[#6366F1] dark:text-[#A5B4FC] mt-2">A random ratio is picked each time</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Progress Stats ─────────────────────────────────── */}
          {totalCount > 0 && (
            <div className="bg-white dark:bg-[#191c40] rounded-2xl border border-gray-200 dark:border-[#232650] p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Progress</p>
              <div className="space-y-2">
                {[
                  { label: 'Total',     value: totalCount,                                       color: 'text-gray-900 dark:text-white' },
                  { label: 'Generated', value: doneCount,                                        color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Pending',   value: pendingImages.length,                             color: 'text-amber-500' },
                  { label: 'Errors',    value: images.filter(i => i.status === 'error').length,  color: 'text-red-500' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                    <span className={`font-bold tabular-nums ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-[#0d1030] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full transition-all duration-700"
                  style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-right tabular-nums">
                {totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}% complete
              </p>
            </div>
          )}

        </div>

        {/* ════════════════════════════════════════════════════
            MAIN CONTENT
            ════════════════════════════════════════════════════ */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* ── Page Header ─────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-[#6366F1]/25 flex-shrink-0">
                  <Wand2 size={16} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Image to Prompt Generator</h1>
              </div>
              <div className="flex items-center gap-2 ml-[3.25rem] flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400">AI prompts for</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] dark:text-[#A5B4FC] text-[11px] font-semibold border border-[#A5B4FC]/30 dark:border-[#6366F1]/25">
                  {currentPlatform?.icon} {selectedPlatform === 'none' ? 'All Platforms' : currentPlatform?.label}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border"
                  style={{ color: currentStyle?.color, backgroundColor: (currentStyle?.color ?? '#6366F1') + '15', borderColor: (currentStyle?.color ?? '#6366F1') + '35' }}
                >
                  {currentStyle?.icon} {currentStyle?.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {pendingImages.length > 0 && (
                <Button
                  size="sm"
                  loading={isGenerating}
                  onClick={generateAll}
                  icon={<Zap size={13} />}
                >
                  {isGenerating ? 'Generating…' : `Generate All (${pendingImages.length})`}
                </Button>
              )}
              {totalCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => setImages([])}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* ── Upload Zone ─────────────────────────────────────── */}
          {images.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/10 scale-[1.01]'
                  : 'border-gray-200 dark:border-[#232650] hover:border-[#6366F1] hover:bg-[#EEF2FF]/40 dark:hover:bg-[#6366F1]/5 bg-white dark:bg-[#191c40]'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isDragActive ? 'bg-[#6366F1] scale-110 shadow-lg shadow-[#6366F1]/30' : 'bg-[#EEF2FF] dark:bg-[#6366F1]/20'
                }`}>
                  <Upload size={26} className={isDragActive ? 'text-white' : 'text-[#6366F1]'} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {isDragActive ? 'Drop your images here!' : 'Drop images or click to upload'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG, WEBP — multiple images supported
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <Button size="sm" variant="secondary">Browse Files</Button>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <Clipboard size={12} />
                    <span>or press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#232650] rounded text-[10px] font-mono border border-gray-200 dark:border-[#2f3260]">Ctrl+V</kbd> to paste</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Compact "images loaded" bar ── */
            <div className="bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
              <input {...getInputProps()} />
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ImageIcon size={15} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {totalCount} image{totalCount !== 1 ? 's' : ''} loaded
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                    {pendingImages.length > 0
                      ? `${pendingImages.length} queued · ${currentStyle?.label} · ${selectedPlatform === 'none' ? 'No platform' : currentPlatform?.label}`
                      : `${doneCount} prompt${doneCount !== 1 ? 's' : ''} generated`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={open}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC] bg-[#EEF2FF] dark:bg-[#6366F1]/15 rounded-lg hover:bg-[#6366F1] hover:text-white dark:hover:bg-[#6366F1] dark:hover:text-white transition-colors border border-[#A5B4FC]/40 dark:border-[#6366F1]/25"
                >
                  <Plus size={12} /> Add More
                </button>
              </div>
            </div>
          )}

          {/* ── Pending thumbnail grid ───────────────────────────── */}
          {pendingImages.length > 0 && (
            <div className="bg-white dark:bg-[#191c40] border border-gray-100 dark:border-[#232650] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
                    <ImageIcon size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {pendingImages.length} file{pendingImages.length !== 1 ? 's' : ''} queued
                  </span>
                  <span className="text-xs text-gray-400">— ready to generate</span>
                </div>
                <button
                  onClick={() => setImages(prev => prev.filter(i => i.status !== 'pending'))}
                  className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                >
                  Clear pending
                </button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                {pendingImages.map(img => (
                  <div key={img.id} className="group relative">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-[#0d1030] border border-gray-200 dark:border-[#232650] group-hover:border-[#A5B4FC] transition-colors shadow-sm">
                      <img src={img.url} alt={img.file.name} className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                      title="Remove"
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                    >
                      <X size={8} />
                    </button>
                    <button
                      onClick={() => replaceImage(img.id)}
                      title="Replace"
                      className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-blue-600"
                    >
                      <RotateCcw size={7} />
                    </button>
                    <p className="text-[7px] text-gray-400 truncate mt-0.5 text-center leading-tight" title={img.file.name}>
                      {img.file.name.slice(0, 7)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Result cards ────────────────────────────────────── */}
          {processedImages.length > 0 && (
            <div className="space-y-4">
              {processedImages.map(img => {
                const isGen   = img.status === 'generating';
                const isDone  = img.status === 'done';
                const isError = img.status === 'error';
                const platform = PLATFORMS.find(p => p.id === (img.usedPlatform ?? selectedPlatform));
                const style   = PROMPT_STYLES.find(s => s.id === (img.usedStyle ?? promptStyle));

                return (
                  <div
                    key={img.id}
                    className="bg-white dark:bg-[#191c40] border border-gray-100 dark:border-[#232650] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col md:flex-row">

                      {/* ══ Left: image preview ══ */}
                      <div className="relative md:w-[38%] flex-shrink-0 bg-gray-100 dark:bg-[#0d1030] min-h-[260px] md:min-h-[320px] group rounded-3xl md:rounded-r-none overflow-hidden">

                        <img
                          src={img.url}
                          alt={img.file.name}
                          className="absolute inset-0 w-full h-full object-contain p-3"
                        />

                        {/* Hover zoom overlay */}
                        <div
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center cursor-zoom-in"
                          onClick={() => setLightboxSrc(img.url)}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 dark:bg-[#191c40]/95 rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg border border-white/20">
                            <ZoomIn size={14} className="text-[#6366F1]" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Click to expand</span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                          {isGen && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full shadow-sm">
                              <span className="w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                              Generating…
                            </span>
                          )}
                          {isDone && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full shadow-sm">
                              <Check size={9} /> Done
                            </span>
                          )}
                          {isError && (
                            <span className="text-[10px] font-semibold text-red-600 bg-red-100 border border-red-300 px-2.5 py-1 rounded-full shadow-sm">
                              ✗ Error
                            </span>
                          )}
                        </div>

                        {/* Action buttons on hover */}
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                            title="Remove"
                            className="w-7 h-7 rounded-xl bg-white/90 dark:bg-[#191c40]/90 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors shadow-md border border-white/20"
                          >
                            <X size={12} />
                          </button>
                          <button
                            onClick={() => replaceImage(img.id)}
                            title="Replace image"
                            className="w-7 h-7 rounded-xl bg-white/90 dark:bg-[#191c40]/90 hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center justify-center text-gray-500 hover:text-blue-500 transition-colors shadow-md border border-white/20"
                          >
                            <RotateCcw size={11} />
                          </button>
                        </div>

                        {/* File info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent p-3 pt-8">
                          <p className="text-white text-xs font-semibold truncate drop-shadow">{img.file.name}</p>
                          <p className="text-white/60 text-[10px]">{(img.file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>

                      {/* ══ Right: prompt content ══ */}
                      <div className="flex-1 flex flex-col min-w-0 p-5 gap-4">

                        {/* Tags row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] dark:text-[#A5B4FC] text-[11px] font-semibold border border-[#A5B4FC]/30 dark:border-[#6366F1]/25">
                            {platform?.icon}
                            {platform?.id === 'none' ? 'General' : platform?.label ?? 'General'}
                          </span>
                          {style && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border"
                              style={{ color: style.color, backgroundColor: style.color + '15', borderColor: style.color + '35' }}
                            >
                              {style.icon} {style.label}
                            </span>
                          )}
                          {img.usedRatio && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-[#232650] text-gray-600 dark:text-gray-400 text-[11px] font-semibold border border-gray-200 dark:border-[#2f3260]">
                              {img.usedRatio}
                            </span>
                          )}
                        </div>

                        {/* Prompt content area */}
                        {isGen ? (
                          <div className="flex-1 bg-gray-50 dark:bg-[#0d1030] rounded-2xl p-4 border border-gray-100 dark:border-[#232650]">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              <span className="text-[11px] font-semibold text-amber-500">Generating prompt…</span>
                            </div>
                            <div className="space-y-2 animate-pulse">
                              <div className="h-2.5 bg-gray-200 dark:bg-[#232650] rounded-full w-full" />
                              <div className="h-2.5 bg-gray-200 dark:bg-[#232650] rounded-full w-[92%]" />
                              <div className="h-2.5 bg-gray-200 dark:bg-[#232650] rounded-full w-[85%]" />
                              <div className="h-2.5 bg-gray-200 dark:bg-[#232650] rounded-full w-[78%]" />
                              <div className="h-2.5 bg-gray-200 dark:bg-[#232650] rounded-full w-[65%]" />
                            </div>
                          </div>
                        ) : isError ? (
                          <div className="flex-1 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/15 rounded-2xl border border-red-200 dark:border-red-800/40">
                            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertCircle size={15} className="text-red-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-0.5">Generation failed</p>
                              <p className="text-xs text-red-600 dark:text-red-500 leading-relaxed">{img.errorMsg}</p>
                            </div>
                          </div>
                        ) : isDone && img.prompt ? (
                          <div className="flex-1 relative group/prompt">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Generated Prompt</span>
                              <span className="text-[10px] text-gray-400">{img.prompt.split(' ').length} words · {img.prompt.length} chars</span>
                            </div>
                            <div className="relative bg-gray-50 dark:bg-[#0d1030] rounded-2xl p-4 border border-gray-200 dark:border-[#232650]">
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed break-words">
                                {img.prompt}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {isDone && (
                            <>
                              <button
                                onClick={() => { navigator.clipboard.writeText(img.prompt ?? ''); toast.success('Prompt copied!'); }}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-colors shadow-sm shadow-[#6366F1]/25"
                              >
                                <Copy size={12} /> Copy Prompt
                              </button>
                              <button
                                onClick={() => downloadPrompt(img)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#232650] text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-[#2f3270] transition-colors border border-gray-200 dark:border-[#2f3260]"
                              >
                                <Download size={12} /> Download
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => regenerateOne(img.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#232650] text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-[#EEF2FF] hover:text-[#6366F1] dark:hover:bg-[#6366F1]/15 dark:hover:text-[#A5B4FC] transition-colors border border-gray-200 dark:border-[#2f3260]"
                          >
                            <RefreshCw size={12} className={isGen ? 'animate-spin' : ''} /> Regenerate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Empty state ─────────────────────────────────────── */}
          {images.length === 0 && (
            <div className="text-center py-10">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                <Clipboard size={14} />
                <span>
                  Pro tip — press{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#232650] rounded text-xs font-mono border border-gray-200 dark:border-[#2f3260]">Ctrl+V</kbd>
                  {' '}anywhere on this page to instantly paste a copied image
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
