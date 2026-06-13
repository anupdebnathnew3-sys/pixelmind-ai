import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Card';
import { useStore } from '../../store/useStore';
import { useGuestStore } from '../../store/useGuestStore';
import { usePromptStore, buildMetadataPrompt } from '../../store/usePromptStore';
import { callAI, imageToBase64ForAI, extractJSON } from '../../services/aiService';
import {
  Upload, Image, Download, RefreshCw, Settings, ChevronDown,
  ChevronUp, Trash2, Copy, X, AlertCircle, Type, AlignLeft, Hash, Zap,
  ZoomIn, Maximize2, Plus, RotateCcw, Sparkles, FileDown, Layers,
  Star, User, Archive, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';
import { useAdminStore } from '../../store/useAdminStore';
import { triggerDownload, buildZIPPackage } from '../../services/metadataEmbedService';
import type { ZIPItem } from '../../services/metadataEmbedService';

const MARKETPLACES = [
  { id: 'Adobe Stock', icon: '🅐', color: '#FF0000' },
  { id: 'Shutterstock', icon: '🔴', color: '#EE2A24' },
  { id: 'Freepik', icon: '🟦', color: '#1273EB' },
  { id: 'iStock', icon: '📷', color: '#000000' },
  { id: 'Dreamstime', icon: '💎', color: '#2B5F9E' },
  { id: 'Depositphotos', icon: '📦', color: '#1C5493' },
  { id: 'Vecteezy', icon: '🎨', color: '#45B649' },
];

const CATEGORIES = [
  'Animals', 'Buildings and Architecture', 'Business', 'Drinks', 'The Environment',
  'States of Mind', 'Food', 'Graphic Resources', 'Hobbies and Leisure', 'Industry',
  'Landscapes', 'Lifestyle', 'People', 'Plants and Flowers', 'Culture and Religion',
  'Science', 'Social Issues', 'Sports', 'Technology', 'Transport', 'Travel',
];

interface MetadataSettings {
  titleLength: number;
  descLength: number;
  keywordCount: number;
  keywordStyle: 'single' | 'double' | 'mixed';
  pngBackground: boolean;
  whiteBackground: boolean;
  keywordPriority: boolean;
  batchSize: 1 | 2 | 3 | 4 | 5;
  titlePrefix: string;
  titleSuffix: string;
  titleAffixEnabled: boolean;
  forceCategory: string;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  processingField?: 'title' | 'description' | 'keywords' | 'all';
  errorMsg?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  category?: string;
  commercialIntent?: string;
  metadataScore?: number;
  titleScore?: number;
  descScore?: number;
  keywordsScore?: number;
  rating?: number;       // 1–5 star rating per image
  userAuthor?: string;   // per-image author override
  userCopyright?: string; // per-image copyright override
}

interface ParsedMetadata {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  commercialIntent: string;
  metadataScore: number;    // overall_score
  titleScore: number;
  descScore: number;
  keywordsScore: number;
}

function enforceKeywordStyle(keywords: string[], style: 'single' | 'double' | 'mixed', count: number): string[] {
  const cleaned = keywords.map(k => k.toLowerCase().trim().replace(/[^\w\s]/g, '').trim()).filter(Boolean);

  if (style === 'single') {
    const singles: string[] = [];
    for (const kw of cleaned) {
      const words = kw.split(/\s+/);
      for (const w of words) {
        if (w.length > 1 && !singles.includes(w)) singles.push(w);
      }
    }
    return singles.slice(0, count);
  }

  if (style === 'double') {
    const doubles: string[] = [];
    const singles = cleaned.flatMap(k => k.split(/\s+/)).filter(w => w.length > 1);
    for (const kw of cleaned) {
      const words = kw.split(/\s+/);
      if (words.length === 2 && !doubles.includes(kw)) doubles.push(kw);
    }
    for (let i = 0; i < singles.length - 1 && doubles.length < count; i += 2) {
      const pair = `${singles[i]} ${singles[i + 1]}`;
      if (!doubles.includes(pair)) doubles.push(pair);
    }
    return doubles.slice(0, count);
  }

  return cleaned.slice(0, count);
}

function applyKeywordPriority(title: string, keywords: string[], style: 'single' | 'double' | 'mixed', count: number): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'is', 'are', 'was', 'were']);
  const titleWords = title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));

  let titleKeywords: string[] = [];
  if (style === 'double') {
    for (let i = 0; i < titleWords.length - 1 && titleKeywords.length < 10; i++) {
      const pair = `${titleWords[i]} ${titleWords[i + 1]}`;
      if (!titleKeywords.includes(pair)) titleKeywords.push(pair);
    }
  } else {
    titleKeywords = [...new Set(titleWords)].slice(0, 10);
  }

  const remaining = keywords.filter(k => !titleKeywords.some(tk => k.includes(tk) || tk.includes(k)));
  return [...titleKeywords, ...remaining].slice(0, count);
}

function parseMetadataResponse(text: string, settings: MetadataSettings): ParsedMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: Partial<ParsedMetadata> & Record<string, any> = {};

  // ── Attempt 1: proper JSON parse ──────────────────────────────────────────
  try {
    const raw = extractJSON(text);
    // Remove trailing commas before ] or } which some models emit
    const cleaned = raw.replace(/,\s*([\]}])/g, '$1');
    parsed = JSON.parse(cleaned);
  } catch {
    // ── Attempt 2: field-by-field regex ─────────────────────────────────────
    const titleMatch = text.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const descMatch  = text.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const catMatch   = text.match(/"category"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (titleMatch) parsed.title = titleMatch[1];
    if (descMatch)  parsed.description = descMatch[1];
    if (catMatch)   parsed.category = catMatch[1];

    // Multi-line keywords array: capture everything between [ and the closing ]
    const kwMatch = text.match(/"keywords"\s*:\s*\[([\s\S]*?)\]/);
    if (kwMatch) {
      parsed.keywords = kwMatch[1]
        .split(',')
        .map(k => k.trim().replace(/^["'\s]+|["'\s]+$/g, ''))
        .filter(Boolean);
    }
  }

  // ── Guard: throw if the response had nothing useful ───────────────────────
  if (!parsed.title && !parsed.description && (!parsed.keywords || parsed.keywords.length === 0)) {
    throw new Error(
      'AI returned an unreadable response. Make sure your API key supports vision and that the model can process images.'
    );
  }

  const title       = (parsed.title || '').substring(0, settings.titleLength);
  const description = (parsed.description || '').substring(0, settings.descLength);
  let keywords = enforceKeywordStyle(parsed.keywords || [], settings.keywordStyle, settings.keywordCount);
  if (settings.keywordPriority && title) {
    keywords = applyKeywordPriority(title, keywords, settings.keywordStyle, settings.keywordCount);
  }

  return {
    title,
    description,
    keywords,
    category: parsed.category || '',
    commercialIntent: parsed.commercialIntent || '',
    metadataScore: typeof parsed.overall_score === 'number' ? parsed.overall_score
      : typeof parsed.metadataScore === 'number' ? parsed.metadataScore : 0,
    titleScore: typeof parsed.title_score === 'number' ? parsed.title_score : 0,
    descScore: typeof parsed.description_score === 'number' ? parsed.description_score : 0,
    keywordsScore: typeof parsed.keywords_score === 'number' ? parsed.keywords_score : 0,
  };
}

async function generateField(
  img: ImageFile,
  field: 'title' | 'description' | 'keywords' | 'all',
  settings: MetadataSettings,
  marketplace: string,
  getTemplate: (id: string) => import('../../store/usePromptStore').PromptTemplate | undefined
): Promise<Partial<ImageFile>> {
  const template = getTemplate('metadata');
  if (!template) throw new Error('Metadata prompt template not found');

  // Compress + resize to ≤ 1024 px before sending — avoids API payload limits
  const { base64, mimeType } = await imageToBase64ForAI(img.file);

  // Build a field-specific prompt when regenerating a single field
  let fieldInstruction = '';
  if (field !== 'all') {
    const currentData = {
      title: `Current title: "${img.title || ''}"`,
      description: `Current description: "${img.description || ''}"`,
      keywords: `Current keywords: "${(img.keywords || []).join(', ')}"`,
    };
    if (field === 'title') {
      fieldInstruction = `\n\nIMPORTANT: Only regenerate the TITLE. Keep everything else the same.\n${currentData.description}\n${currentData.keywords}`;
    } else if (field === 'description') {
      fieldInstruction = `\n\nIMPORTANT: Only regenerate the DESCRIPTION. Keep everything else the same.\n${currentData.title}\n${currentData.keywords}`;
    } else if (field === 'keywords') {
      fieldInstruction = `\n\nIMPORTANT: Only regenerate the KEYWORDS. Keep everything else the same.\n${currentData.title}\n${currentData.description}`;
    }
  }

  const builtPrompt = buildMetadataPrompt(template, {
    marketplace,
    titleLength: settings.titleLength,
    descLength: settings.descLength,
    keywordCount: settings.keywordCount,
    keywordStyle: settings.keywordStyle,
    keywordPriority: settings.keywordPriority,
    pngBackground: settings.pngBackground,
    whiteBackground: settings.whiteBackground,
  });

  // Prepend filename so the AI knows which unique image it is analyzing
  const imageContext = `Image file: ${img.file.name} (${(img.file.size / 1024).toFixed(0)} KB)\n\n`;

  // Constrain category to predefined list
  const categoryInstruction = settings.forceCategory
    ? `\n\nCATEGORY: You MUST set the "category" field to exactly "${settings.forceCategory}". Do not use any other value.`
    : `\n\nCATEGORY: The "category" field MUST be exactly one of these options (copy the spelling exactly, no variations): ${CATEGORIES.join(', ')}.`;

  const prompt = imageContext + builtPrompt + fieldInstruction + categoryInstruction;

  const systemPrompt =
    template.systemPrompt +
    '\nCRITICAL: Respond with ONLY raw JSON — absolutely no markdown, no code fences, no backticks, no explanation text.';

  const response = await callAI({
    prompt,
    systemPrompt,
    imageBase64: base64,
    imageMimeType: mimeType,
    maxTokens: field === 'all' ? 1500 : 800,
  });

  const metadata = parseMetadataResponse(response.text, settings);

  if (field === 'title') return { status: 'done', title: metadata.title, titleScore: metadata.titleScore || undefined };
  if (field === 'description') return { status: 'done', description: metadata.description, descScore: metadata.descScore || undefined };
  if (field === 'keywords') return { status: 'done', keywords: metadata.keywords, keywordsScore: metadata.keywordsScore || undefined };
  return {
    status: 'done' as const,
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    category: metadata.category,
    commercialIntent: metadata.commercialIntent,
    metadataScore: metadata.metadataScore,
    titleScore: metadata.titleScore,
    descScore: metadata.descScore,
    keywordsScore: metadata.keywordsScore,
  };
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

const SETTINGS_STORAGE_KEY = 'pixelmind_meta_settings_v1';

const DEFAULT_SETTINGS: MetadataSettings = {
  titleLength: 120,
  descLength: 150,
  keywordCount: 40,
  keywordStyle: 'single',
  pngBackground: false,
  whiteBackground: false,
  keywordPriority: true,
  batchSize: 1,
  titlePrefix: '',
  titleSuffix: '',
  titleAffixEnabled: false,
  forceCategory: '',
};

function loadPersistedSettings(): {
  settings: MetadataSettings;
  marketplace: string;
  author: string;
  copyright: string;
} {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { settings: DEFAULT_SETTINGS, marketplace: 'Adobe Stock', author: '', copyright: '' };
    const parsed = JSON.parse(raw);
    return {
      settings:  { ...DEFAULT_SETTINGS, ...(parsed.settings  ?? {}) },
      marketplace: parsed.marketplace ?? 'Adobe Stock',
      author:      parsed.author      ?? '',
      copyright:   parsed.copyright   ?? '',
    };
  } catch {
    return { settings: DEFAULT_SETTINGS, marketplace: 'Adobe Stock', author: '', copyright: '' };
  }
}

interface MetadataGeneratorPageProps {
  guestAllowed?: boolean;
}

export const MetadataGeneratorPage: React.FC<MetadataGeneratorPageProps> = ({ guestAllowed = false }) => {
  const { deductCredits, isAuthenticated } = useStore();
  const { deductGuestCredit, incrementGenerations, guestCredits } = useGuestStore();
  const guestGenCount = useRef(0);
  const { getTemplate } = usePromptStore();
  const { cmsContent } = useAdminStore();
  const embedEnabled   = (cmsContent['meta_embed_enabled']   ?? 'true') === 'true';
  const embedCopyright = cmsContent['meta_embed_copyright'] ?? '';
  const embedCreator   = cmsContent['meta_embed_creator']   ?? '';
  const metadataCache = useRef<Map<string, Partial<ImageFile>>>(new Map());
  const getCacheKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;
  const _persisted = useRef(loadPersistedSettings());
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState(_persisted.current.marketplace);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [categoryDropOpen, setCategoryDropOpen] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [globalAuthor, setGlobalAuthor] = useState(_persisted.current.author);
  const [globalCopyright, setGlobalCopyright] = useState(_persisted.current.copyright);
  const exportRef = useRef<HTMLDivElement>(null);
  const categoryDropRef = useRef<HTMLDivElement>(null);
  const wasGenerating = useRef(false);
  const [settings, setSettings] = useState<MetadataSettings>(_persisted.current.settings);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
      if (categoryDropRef.current && !categoryDropRef.current.contains(e.target as Node)) {
        setCategoryDropOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-save all sidebar settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
        settings,
        marketplace: selectedMarketplace,
        author:      globalAuthor,
        copyright:   globalCopyright,
      }));
    } catch { /* storage unavailable — ignore */ }
  }, [settings, selectedMarketplace, globalAuthor, globalCopyright]);

  // Show export modal when generation finishes and at least one file is done
  useEffect(() => {
    if (wasGenerating.current && !isGenerating) {
      const done = images.filter(i => i.status === 'done').length;
      if (done > 0) setShowExportModal(true);
    }
    wasGenerating.current = isGenerating;
  }, [isGenerating, images]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: ImageFile[] = acceptedFiles.slice(0, 150).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));
    setImages(prev => [...prev, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxFiles: 150,
  });

  const replaceImage = (imgId: string) => {
    setImages(prev => prev.filter(i => i.id !== imgId));
    open();
  };

  const processImage = async (img: ImageFile, field: 'title' | 'description' | 'keywords' | 'all') => {
    if (!isAuthenticated && guestCredits <= 0) {
      toast.error('No guest credits remaining. Create a free account for 1,000 credits.');
      return;
    }
    setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'processing', processingField: field, errorMsg: undefined } : i));
    try {
      const result = await generateField(img, field, settings, selectedMarketplace, getTemplate);
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, ...result, rating: i.rating ?? 5 } : i));
      if (isAuthenticated) {
        deductCredits(1);
      } else {
        deductGuestCredit(); incrementGenerations();
        guestGenCount.current += 1;
        if (guestGenCount.current % 3 === 0) {
          toast('Sign in to save your results and get 1,000 free credits →', { icon: '👋', duration: 4000 });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'error', errorMsg: msg } : i));
      toast.error(`${img.file.name}: ${msg}`);
    }
  };

  const generateAll = async () => {
    if (!isAuthenticated && guestCredits <= 0) {
      toast.error('No guest credits remaining. Create a free account for 1,000 credits.');
      return;
    }
    const pending = images.filter(img => img.status !== 'done');
    if (pending.length === 0) { toast.error('No images to process'); return; }
    setIsGenerating(true);

    let success = 0;
    let cached = 0;
    let fail = 0;

    // Apply cached results instantly (no API call, no credit deduction)
    const uncached: ImageFile[] = [];
    for (const img of pending) {
      const hit = metadataCache.current.get(getCacheKey(img.file));
      if (hit) {
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, ...hit, status: 'done' } : i));
        cached++;
        success++;
      } else {
        uncached.push(img);
      }
    }
    if (cached > 0) toast.success(`${cached} image${cached !== 1 ? 's' : ''} loaded from cache instantly!`, { duration: 2500 });

    for (let i = 0; i < uncached.length; i += settings.batchSize) {
      const chunk = uncached.slice(i, i + settings.batchSize);

      setImages(prev =>
        prev.map(img =>
          chunk.some(c => c.id === img.id)
            ? { ...img, status: 'processing', processingField: 'all', errorMsg: undefined }
            : img
        )
      );

      const results = await Promise.allSettled(
        chunk.map(img =>
          generateField(img, 'all', settings, selectedMarketplace, getTemplate)
        )
      );

      results.forEach((result, idx) => {
        const img = chunk[idx];
        if (result.status === 'fulfilled') {
          setImages(prev => prev.map(i => i.id === img.id ? { ...i, ...result.value, rating: i.rating ?? 5 } : i));
          metadataCache.current.set(getCacheKey(img.file), result.value);
          if (isAuthenticated) {
            deductCredits(1);
          } else {
            deductGuestCredit(); incrementGenerations();
            guestGenCount.current += 1;
            if (guestGenCount.current % 3 === 0) {
              toast('Sign in to save your results and get 1,000 free credits →', { icon: '👋', duration: 4000 });
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
    if (success > 0 && uncached.length > 0) toast.success(`Generated metadata for ${success - cached} image${(success - cached) !== 1 ? 's' : ''}!`);
    if (fail > 0) toast.error(`${fail} image${fail !== 1 ? 's' : ''} failed — check AI Settings for API key`);
  };

  const applyAffixes = (title: string) => {
    if (!settings.titleAffixEnabled) return title;
    const parts = [settings.titlePrefix.trim(), title.trim(), settings.titleSuffix.trim()].filter(Boolean);
    return parts.join(' ');
  };

  const getEffectiveAuthor = (img: ImageFile): string =>
    (img.userAuthor !== undefined ? img.userAuthor : globalAuthor) || embedCreator || '';

  const getEffectiveCopyright = (img: ImageFile): string =>
    (img.userCopyright !== undefined ? img.userCopyright : globalCopyright) || embedCopyright || '';

  const buildEmbedMeta = (img: ImageFile) => ({
    title:       applyAffixes(img.title || ''),
    description: img.description || '',
    keywords:    img.keywords || [],
    copyright:   getEffectiveCopyright(img) || undefined,
    creator:     getEffectiveAuthor(img) || undefined,
    rating:      img.rating,
  });

  const sanitizeFilename = (title: string, originalName: string): string => {
    const ext = originalName.match(/\.[^.]+$/)?.[0] ?? '';
    const cleaned = title
      .trim()
      .replace(/[/\\:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 150);
    return (cleaned || originalName.replace(/\.[^.]+$/, '')) + ext;
  };

  const buildCSVContent = (rows: ImageFile[], nameMap?: Map<string, string>): string => {
    const headers = ['File Name', 'Title', 'Description', 'Keywords', 'Author Name', 'Copyright', 'Rating'];
    const dataRows = rows.map(img => {
      const outName = nameMap?.get(img.id) ?? sanitizeFilename(applyAffixes(img.title || ''), img.file.name);
      return [
        `"${outName.replace(/"/g, '""')}"`,
        `"${applyAffixes(img.title || '').replace(/"/g, '""')}"`,
        `"${(img.description || '').replace(/"/g, '""')}"`,
        `"${(img.keywords || []).join(', ')}"`,
        `"${getEffectiveAuthor(img).replace(/"/g, '""')}"`,
        `"${getEffectiveCopyright(img).replace(/"/g, '""')}"`,
        `"${(img.rating ?? 5)}/5"`,
      ];
    });
    return [headers.join(','), ...dataRows.map(r => r.join(','))].join('\n');
  };

  const exportCSV = () => {
    const done = images.filter(i => i.status === 'done');
    if (!done.length) { toast.error('No data to export'); return; }
    const csv = buildCSVContent(done); // no nameMap → uses sanitized title filenames
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Metadata.csv'; a.click();
    toast.success('CSV exported!');
  };

  const exportJSON = () => {
    const done = images.filter(i => i.status === 'done');
    if (!done.length) { toast.error('No data to export'); return; }
    const data = done.map(img => ({ fileName: img.file.name, title: applyAffixes(img.title || ''), description: img.description, keywords: img.keywords, category: img.category, commercialIntent: img.commercialIntent, metadataScore: img.metadataScore }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'metadata-export.json'; a.click();
    toast.success('JSON exported!');
  };


  const downloadAllAsZIP = async () => {
    if (!embedEnabled) { toast.error('Metadata embedding is disabled by admin'); return; }
    const done = images.filter(i => i.status === 'done');
    if (!done.length) { toast.error('No completed images to package'); return; }
    setZipLoading(true);
    const tid = toast.loading(`Preparing ZIP for ${done.length} image${done.length !== 1 ? 's' : ''}…`);
    try {
      // Build deduplicated title-based filenames
      const usedNames = new Set<string>();
      const nameMap = new Map<string, string>(); // img.id → outputFilename
      for (const img of done) {
        const base = sanitizeFilename(applyAffixes(img.title || ''), img.file.name);
        const ext  = base.match(/\.[^.]+$/)?.[0] ?? '';
        const stem = base.slice(0, base.length - ext.length);
        let candidate = base;
        let counter = 1;
        while (usedNames.has(candidate.toLowerCase())) {
          candidate = `${stem} (${counter})${ext}`;
          counter++;
        }
        usedNames.add(candidate.toLowerCase());
        nameMap.set(img.id, candidate);
      }

      const items: ZIPItem[] = done.map(img => ({
        imageFile:      img.file,
        meta:           buildEmbedMeta(img),
        outputFilename: nameMap.get(img.id)!,
      }));

      const csvContent = '﻿' + buildCSVContent(done, nameMap);

      const zipBlob = await buildZIPPackage(items, csvContent, (d, t) => {
        toast.loading(`Embedding ${d + 1}/${t}: ${nameMap.get(done[d]?.id ?? '') ?? ''}…`, { id: tid });
      });

      toast.dismiss(tid);
      triggerDownload(zipBlob, 'Processed_Images.zip');
      toast.success(`ZIP ready — ${done.length} image${done.length !== 1 ? 's' : ''} + Metadata.csv`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err instanceof Error ? err.message : 'ZIP generation failed');
    } finally {
      setZipLoading(false);
    }
  };

  const doneCount = images.filter(i => i.status === 'done').length;
  const totalCount = images.length;

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="flex flex-col lg:flex-row gap-6 min-h-full">

        {/* ── Settings Sidebar ── */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          {/* Gradient header card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-4 text-white shadow-lg shadow-[#6366F1]/25">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Generation Settings</p>
                <p className="text-white/70 text-[11px] leading-tight mt-0.5">
                  {selectedMarketplace} · {settings.keywordStyle.charAt(0).toUpperCase() + settings.keywordStyle.slice(1)} words
                </p>
              </div>
            </div>
          </div>
          <InlineApiKeySetup />
          <Card padding="none">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#0d1030]/50 rounded-t-2xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-[#6366F1]" />
                <span className="font-semibold text-gray-900 dark:text-white">Metadata Settings</span>
              </div>
              {settingsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {settingsOpen && (
              <div className="px-4 pb-4 space-y-5">
                {/* Title Length */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Title Length</label>
                    <span className="text-xs font-bold text-[#6366F1]">{settings.titleLength} chars</span>
                  </div>
                  <input type="range" min={20} max={200} value={settings.titleLength}
                    onChange={e => setSettings(s => ({ ...s, titleLength: Number(e.target.value) }))} className="w-full" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>20</span><span>200</span></div>
                </div>

                {/* Description Length */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Description Length</label>
                    <span className="text-xs font-bold text-[#6366F1]">{settings.descLength} chars</span>
                  </div>
                  <input type="range" min={50} max={250} value={settings.descLength}
                    onChange={e => setSettings(s => ({ ...s, descLength: Number(e.target.value) }))} className="w-full" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>50</span><span>250</span></div>
                </div>

                {/* Keyword Count */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Keyword Count</label>
                    <span className="text-xs font-bold text-[#6366F1]">{settings.keywordCount}</span>
                  </div>
                  <input type="range" min={5} max={50} value={settings.keywordCount}
                    onChange={e => setSettings(s => ({ ...s, keywordCount: Number(e.target.value) }))} className="w-full" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>5</span><span>50</span></div>
                </div>

                {/* Keyword Style */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">Keyword Style</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['single', 'double', 'mixed'] as const).map(style => (
                      <button key={style} onClick={() => setSettings(s => ({ ...s, keywordStyle: style }))}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-colors ${settings.keywordStyle === style ? 'bg-[#6366F1] text-white' : 'bg-gray-100 dark:bg-[#0d1030] text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                        {style}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {settings.keywordStyle === 'single' && 'Single words: business, meeting, office'}
                    {settings.keywordStyle === 'double' && 'Two-word phrases: business meeting, office team'}
                    {settings.keywordStyle === 'mixed' && 'Mix of single and two-word phrases'}
                  </p>
                </div>

                {/* Batch Size */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Processing Batch Size</label>
                    <span className="text-xs font-bold text-[#6366F1]">{settings.batchSize} image{settings.batchSize > 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {([1, 2, 3, 4, 5] as const).map(n => (
                      <button
                        key={n}
                        onClick={() => setSettings(s => ({ ...s, batchSize: n }))}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${settings.batchSize === n ? 'bg-[#6366F1] text-white shadow-sm' : 'bg-gray-100 dark:bg-[#0d1030] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {settings.batchSize === 1 && 'Safest — sequential, lowest API load'}
                    {settings.batchSize === 2 && '2 images processed simultaneously'}
                    {settings.batchSize === 3 && '3 images processed simultaneously'}
                    {settings.batchSize === 4 && '4 images processed simultaneously'}
                    {settings.batchSize === 5 && 'Fastest — 5 simultaneous, highest throughput'}
                  </p>
                </div>

                <div className="h-px bg-gray-100 dark:bg-[#0d1030]" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Title Keyword Priority</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#6366F1] dark:bg-[#6366F1]/20 dark:text-[#A5B4FC]">Always On</span>
                  </div>
                  <Toggle checked={settings.pngBackground} onChange={v => setSettings(s => ({ ...s, pngBackground: v }))} label="Transparent Background" />
                  <Toggle checked={settings.whiteBackground} onChange={v => setSettings(s => ({ ...s, whiteBackground: v }))} label="White Background" />
                  {(settings.pngBackground || settings.whiteBackground) && (
                    <p className="text-[10px] text-gray-400 bg-[#EEF2FF] dark:bg-[#6366F1]/10 p-2 rounded-lg">
                      {settings.pngBackground
                        ? 'AI optimized for transparent PNG images'
                        : 'AI optimized for white background images'}
                    </p>
                  )}
                </div>
                {settings.keywordPriority && (
                  <p className="text-[10px] text-gray-400 bg-[#EEF2FF] dark:bg-[#6366F1]/10 p-2 rounded-lg">
                    First 10 keywords always extracted from the generated title words.
                  </p>
                )}

                <div className="h-px bg-gray-100 dark:bg-[#0d1030]" />

                {/* Title Prefix / Suffix */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-xs font-semibold text-gray-600 dark:text-gray-400">Title Prefix / Suffix</span>
                    <Toggle
                      checked={settings.titleAffixEnabled}
                      onChange={v => setSettings(s => ({ ...s, titleAffixEnabled: v }))}
                      label=""
                    />
                  </div>

                  {settings.titleAffixEnabled && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Prefix — added before title</label>
                        <input
                          type="text"
                          placeholder='e.g. HD Stock:'
                          value={settings.titlePrefix}
                          onChange={e => setSettings(s => ({ ...s, titlePrefix: e.target.value }))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-gray-800 dark:text-gray-200 outline-none focus:border-[#6366F1] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Suffix — added after title</label>
                        <input
                          type="text"
                          placeholder='e.g. | Royalty Free'
                          value={settings.titleSuffix}
                          onChange={e => setSettings(s => ({ ...s, titleSuffix: e.target.value }))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-gray-800 dark:text-gray-200 outline-none focus:border-[#6366F1] transition-colors"
                        />
                      </div>
                      {settings.titleAffixEnabled && (settings.titlePrefix.trim() || settings.titleSuffix.trim()) && (
                        <div className="bg-[#EEF2FF] dark:bg-[#6366F1]/10 rounded-lg p-2.5">
                          <p className="text-[9px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Preview</p>
                          <p className="text-[10px] text-[#6366F1] dark:text-[#A5B4FC] leading-snug break-words">
                            {[settings.titlePrefix.trim(), 'AI Generated Title', settings.titleSuffix.trim()].filter(Boolean).join(' ')}
                          </p>
                        </div>
                      )}
                      {!settings.titlePrefix.trim() && !settings.titleSuffix.trim() && (
                        <p className="text-[10px] text-gray-400">Add text to auto-prepend or append to every generated title.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-100 dark:bg-[#0d1030]" />

                {/* Author & Copyright — global defaults */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <User size={11} className="text-[#6366F1]" /> Author &amp; Copyright
                  </label>
                  <input
                    type="text"
                    placeholder="Author name…"
                    value={globalAuthor}
                    onChange={e => setGlobalAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-gray-800 dark:text-gray-200 outline-none focus:border-[#6366F1] transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="© 2026 Your Name…"
                    value={globalCopyright}
                    onChange={e => setGlobalCopyright(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#0d1030] text-gray-800 dark:text-gray-200 outline-none focus:border-[#6366F1] transition-colors"
                  />
                  {(globalAuthor || globalCopyright) && (
                    <p className="text-[10px] text-[#6366F1] dark:text-[#A5B4FC] bg-[#EEF2FF] dark:bg-[#6366F1]/10 px-2 py-1.5 rounded-lg">
                      Embedded into all images — override per-image below
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Guest credit display in tool sidebar */}
          {!isAuthenticated && (
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs ${
              guestCredits <= 0
                ? 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-700/30 text-red-600 dark:text-red-400'
                : guestCredits <= 10
                  ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-700/30 text-amber-600 dark:text-amber-400'
                  : 'bg-[#EEF2FF] dark:bg-[#6366F1]/10 border-[#A5B4FC]/30 dark:border-[#6366F1]/20 text-[#6366F1] dark:text-[#A5B4FC]'
            }`}>
              <div className="flex items-center gap-1.5 font-semibold">
                <Zap size={12} />
                <span>{guestCredits} guest credits left</span>
              </div>
              <div className="w-16 h-1.5 bg-current/20 rounded-full overflow-hidden">
                <div className="h-full bg-current rounded-full" style={{ width: `${Math.max(0, (guestCredits / 50) * 100)}%` }} />
              </div>
            </div>
          )}


          {totalCount > 0 && (
            <Card padding="sm">
              <div className="space-y-2">
                {[
                  { label: 'Total', value: totalCount, color: 'text-gray-900 dark:text-white' },
                  { label: 'Generated', value: doneCount, color: 'text-green-600' },
                  { label: 'Pending', value: images.filter(i => i.status === 'pending').length, color: 'text-amber-500' },
                  { label: 'Errors', value: images.filter(i => i.status === 'error').length, color: 'text-red-500' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={`font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
                <div className="h-1.5 bg-gray-100 dark:bg-[#0d1030] rounded-full mt-2">
                  <div className="h-full bg-[#6366F1] rounded-full transition-all" style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }} />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-[#6366F1]/30 flex-shrink-0">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Metadata Generator</h1>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm text-gray-500 dark:text-gray-400">AI metadata for</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6366F1] text-white">
                    {selectedMarketplace}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8B5CF6]/15 text-[#8B5CF6] dark:bg-[#8B5CF6]/20 dark:text-[#C4B5FD] border border-[#8B5CF6]/30">
                    {settings.keywordStyle.charAt(0).toUpperCase() + settings.keywordStyle.slice(1)} words
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Embed All → ZIP (single download for all images) */}
              {doneCount > 0 && embedEnabled && (
                <Button
                  size="sm"
                  loading={zipLoading}
                  icon={zipLoading ? <Layers size={13} /> : <Archive size={13} />}
                  onClick={downloadAllAsZIP}
                >
                  {zipLoading ? 'Building ZIP…' : `Embed All & Download ZIP (${doneCount})`}
                </Button>
              )}

              {/* Export dropdown */}
              {doneCount > 0 && (
                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setExportOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
                  >
                    <Download size={14} />
                    Export
                    <ChevronDown size={12} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {exportOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] rounded-2xl shadow-2xl overflow-hidden min-w-[200px] py-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">{doneCount} file{doneCount !== 1 ? 's' : ''} ready</p>
                      {([
                        { fmt: 'CSV',  desc: 'Spreadsheet-ready', color: '#10B981', bg: '#10B98118', action: exportCSV },
                        { fmt: 'XLSX', desc: 'Excel format',       color: '#3B82F6', bg: '#3B82F618', action: () => { toast.success('XLSX coming soon!'); setExportOpen(false); } },
                        { fmt: 'JSON', desc: 'Structured data',    color: '#8B5CF6', bg: '#8B5CF618', action: exportJSON },
                      ] as const).map(({ fmt, desc, color, bg, action }) => (
                        <button key={fmt} onClick={() => { action(); setExportOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#0d1030]/60 transition-colors group">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: bg, color }}>
                            {fmt}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{fmt}</p>
                            <p className="text-[10px] text-gray-400">{desc}</p>
                          </div>
                          <Download size={11} className="text-gray-300 group-hover:text-[#6366F1] transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Generate All */}
              <Button
                size="sm"
                loading={isGenerating}
                onClick={generateAll}
                disabled={images.filter(i => i.status !== 'done').length === 0 || (!isAuthenticated && guestCredits <= 0)}
                icon={<Zap size={13} />}
              >
                {isGenerating
                  ? 'Generating...'
                  : `Generate All${images.filter(i => i.status !== 'done').length > 0 ? ` (${images.filter(i => i.status !== 'done').length})` : ''}`}
              </Button>

              {/* Clear All */}
              {totalCount > 0 && (
                <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => setImages([])} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* ── Marketplace Selection (above upload) ── */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Select Marketplace</p>
            <div className="flex flex-wrap gap-2">
              {MARKETPLACES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMarketplace(m.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${selectedMarketplace === m.id
                    ? 'border-[#6366F1] bg-[#6366F1] text-white shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#6366F1] hover:text-[#6366F1] bg-white dark:bg-[#191c40]'
                    }`}
                >
                  <span className="text-base">{m.icon}</span>
                  {m.id}
                </button>
              ))}
            </div>
          </Card>

          {/* ── Upload Zone — full when empty, compact after upload ── */}
          {images.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                ? 'border-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/10 scale-[1.01]'
                : 'border-gray-200 dark:border-[#232650] hover:border-[#6366F1] hover:bg-[#EEF2FF]/50 dark:hover:bg-[#6366F1]/5'
                }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragActive ? 'bg-[#6366F1]' : 'bg-[#EEF2FF] dark:bg-[#6366F1]/20'
                }`}>
                  <Upload size={24} className={isDragActive ? 'text-white' : 'text-[#6366F1]'} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {isDragActive ? 'Drop images here!' : 'Drop images or click to upload'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, JPEG, PNG, WEBP • Up to 150 images</p>
                </div>
                <Button size="sm" variant="secondary">Browse Files</Button>
              </div>
            </div>
          ) : (
            /* Compact "images loaded" bar */
            <div className="bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <input {...getInputProps()} />
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                  <Image size={16} className="text-[#6366F1]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    {totalCount} image{totalCount !== 1 ? 's' : ''} loaded
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                    {images.filter(i => i.status === 'pending').length > 0
                      ? `${images.filter(i => i.status === 'pending').length} pending generation`
                      : doneCount > 0 ? `${doneCount} processed` : 'Processing…'}
                  </p>
                </div>
              </div>
              <button
                onClick={open}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC] bg-[#EEF2FF] dark:bg-[#6366F1]/15 rounded-lg hover:bg-[#6366F1] hover:text-white dark:hover:bg-[#6366F1] dark:hover:text-white transition-colors border border-[#A5B4FC]/40 dark:border-[#6366F1]/25 flex-shrink-0"
              >
                <Plus size={12} /> Add More
              </button>
            </div>
          )}

          {/* ── Thumbnail Preview Grid (pending files only) ── */}
          {images.filter(i => i.status === 'pending').length > 0 && (
            <div className="bg-white dark:bg-[#191c40] border border-gray-100 dark:border-[#232650] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#6366F1] flex items-center justify-center">
                    <Image size={12} className="text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {images.filter(i => i.status === 'pending').length} file{images.filter(i => i.status === 'pending').length !== 1 ? 's' : ''} queued
                  </span>
                  <span className="text-xs text-gray-400">ready to generate</span>
                </div>
                <button
                  onClick={() => setImages(prev => prev.filter(i => i.status !== 'pending'))}
                  className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                >
                  Clear pending
                </button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                {images.filter(i => i.status === 'pending').map(img => (
                  <div key={img.id} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0d1030] border border-gray-200 dark:border-[#232650] group-hover:border-[#A5B4FC] transition-colors">
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                      title="Remove"
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                    >
                      <X size={8} />
                    </button>
                    {/* Replace button */}
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

          {/* ── Results — large-preview cards (non-pending only) ── */}
          {images.filter(i => i.status !== 'pending').length > 0 && (
            <div className="space-y-4">
              {images.filter(i => i.status !== 'pending').map(img => {
                const isProcessing = img.status === 'processing';
                const isDone = img.status === 'done';
                const isError = img.status === 'error';
                const isPending = img.status === 'pending';
                const showTitle = isProcessing && (img.processingField === 'title' || img.processingField === 'all');
                const showDesc  = isProcessing && (img.processingField === 'description' || img.processingField === 'all');
                const showKw    = isProcessing && (img.processingField === 'keywords' || img.processingField === 'all');

                return (
                  <div key={img.id} className="bg-white dark:bg-[#191c40] border border-gray-100 dark:border-[#232650] rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex flex-col md:flex-row">

                      {/* ══════════════════════════════════════
                          LEFT — LARGE IMAGE PREVIEW (40%)
                          ══════════════════════════════════════ */}
                      <div className="relative md:w-[42%] flex-shrink-0 bg-gray-100 dark:bg-[#0d1030] min-h-[280px] md:min-h-[340px] group">

                        {/* Main image — object-contain so full image is visible */}
                        <img
                          src={img.preview}
                          alt={img.file.name}
                          className="absolute inset-0 w-full h-full object-contain p-3"
                        />

                        {/* Hover zoom overlay */}
                        <div
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center cursor-zoom-in"
                          onClick={() => setLightboxSrc(img.preview)}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 dark:bg-[#191c40]/95 rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg border border-white/20">
                            <ZoomIn size={16} className="text-[#6366F1]" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Click to expand</span>
                          </div>
                        </div>

                        {/* Status badge — top left */}
                        <div className="absolute top-3 left-3">
                          {isProcessing && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full shadow-sm">
                              <span className="w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                              Processing…
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[10px] font-semibold text-green-700 bg-green-100 border border-green-300 px-2.5 py-1 rounded-full shadow-sm">✓ Done</span>
                          )}
                          {isError && (
                            <span className="text-[10px] font-semibold text-red-600 bg-red-100 border border-red-300 px-2.5 py-1 rounded-full shadow-sm">✗ Error</span>
                          )}
                          {isPending && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-white/90 dark:bg-[#191c40]/90 border border-gray-200 dark:border-[#232650] px-2.5 py-1 rounded-full shadow-sm">Pending</span>
                          )}
                        </div>

                        {/* File info — bottom gradient overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8">
                          <p className="text-white text-xs font-semibold truncate drop-shadow">{img.file.name}</p>
                          <p className="text-white/70 text-[10px] mt-0.5">{(img.file.size / 1024).toFixed(0)} KB</p>
                        </div>

                        {/* Expand icon button */}
                        <button
                          onClick={() => setLightboxSrc(img.preview)}
                          className="absolute bottom-3 right-3 w-7 h-7 bg-white/90 dark:bg-[#191c40]/90 rounded-lg flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                          title="Expand image"
                        >
                          <Maximize2 size={13} className="text-gray-700 dark:text-gray-300" />
                        </button>
                      </div>

                      {/* ══════════════════════════════════════
                          RIGHT — METADATA PANEL (60%)
                          ══════════════════════════════════════ */}
                      <div className="flex-1 flex flex-col divide-y divide-gray-100 dark:divide-[#232650] min-w-0">

                        {/* ── Action bar ── */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/70 dark:bg-[#0d1030]/40">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                              {selectedMarketplace}
                            </span>
                            {isDone && img.metadataScore !== undefined && img.metadataScore > 0 && (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                img.metadataScore >= 80
                                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/25 dark:text-green-400 dark:border-green-800'
                                  : img.metadataScore >= 50
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/25 dark:text-amber-400 dark:border-amber-800'
                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/25 dark:text-red-400 dark:border-red-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${img.metadataScore >= 80 ? 'bg-green-500' : img.metadataScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                Score {img.metadataScore}/100
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isPending && (
                              <button onClick={() => processImage(img, 'all')}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-colors shadow-sm">
                                <Zap size={11} /> Generate
                              </button>
                            )}
                            {(isDone || isError) && (
                              <>
                                <button title="Regenerate Title" onClick={() => processImage(img, 'title')} disabled={isProcessing}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40">
                                  <Type size={13} />
                                </button>
                                <button title="Regenerate Description" onClick={() => processImage(img, 'description')} disabled={isProcessing}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-40">
                                  <AlignLeft size={13} />
                                </button>
                                <button title="Regenerate Keywords" onClick={() => processImage(img, 'keywords')} disabled={isProcessing}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-40">
                                  <Hash size={13} />
                                </button>
                                <button title="Regenerate All" onClick={() => processImage(img, 'all')} disabled={isProcessing}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors disabled:opacity-40">
                                  <RefreshCw size={13} />
                                </button>
                                <div className="w-px h-4 bg-gray-200 dark:bg-[#232650] mx-0.5" />
                                {isDone && (
                                  <button title="Copy all metadata" onClick={() => { navigator.clipboard.writeText(`Title: ${applyAffixes(img.title || '')}\n\nDescription: ${img.description}\n\nKeywords: ${(img.keywords || []).join(', ')}${img.category ? `\n\nCategory: ${img.category}` : ''}`); toast.success('All metadata copied!'); }}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors">
                                    <Copy size={13} />
                                  </button>
                                )}
                              </>
                            )}
                            <div className="w-px h-4 bg-gray-200 dark:bg-[#232650] mx-0.5" />
                            <button title="Replace image" onClick={() => replaceImage(img.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <RotateCcw size={13} />
                            </button>
                            <button title="Remove image" onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <X size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Error state */}
                        {isError && !img.title && (
                          <div className="flex items-start gap-2 px-4 py-3 text-red-500 text-xs bg-red-50/50 dark:bg-red-900/10">
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                            <span>{img.errorMsg || 'Generation failed — check AI Settings and your API key.'}</span>
                          </div>
                        )}

                        {/* ── TITLE section ── */}
                        <div className="px-4 py-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-1.5">
                              <Type size={10} /> Title
                              {isDone && img.titleScore !== undefined && img.titleScore > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${img.titleScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : img.titleScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{img.titleScore}</span>
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              {isDone && (
                                <div className="relative" ref={categoryDropOpen === img.id ? categoryDropRef : null}>
                                  <button
                                    onClick={() => setCategoryDropOpen(categoryDropOpen === img.id ? null : img.id)}
                                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] dark:text-[#A5B4FC] font-medium border border-[#A5B4FC]/30 cursor-pointer max-w-[140px] hover:bg-[#6366F1]/20 transition-colors"
                                  >
                                    <span className="truncate max-w-[110px]">{img.category || '— Category —'}</span>
                                    <ChevronDown size={9} className={`flex-shrink-0 transition-transform ${categoryDropOpen === img.id ? 'rotate-180' : ''}`} />
                                  </button>
                                  {categoryDropOpen === img.id && (
                                    <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-[#1e2147] border border-gray-200 dark:border-[#2e3270] rounded-xl shadow-2xl overflow-hidden">
                                      <div className="max-h-52 overflow-y-auto py-1">
                                        <button
                                          onClick={() => { setImages(prev => prev.map(i => i.id === img.id ? { ...i, category: '' } : i)); setCategoryDropOpen(null); }}
                                          className="w-full text-left px-3 py-1.5 text-[11px] text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-[#232650] transition-colors"
                                        >
                                          — Clear category —
                                        </button>
                                        {CATEGORIES.map(cat => (
                                          <button
                                            key={cat}
                                            onClick={() => { setImages(prev => prev.map(i => i.id === img.id ? { ...i, category: cat } : i)); setCategoryDropOpen(null); }}
                                            className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors ${img.category === cat ? 'bg-[#6366F1] text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-[#EEF2FF] dark:hover:bg-[#232650]'}`}
                                          >
                                            {cat}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {img.title && (
                                <button onClick={() => { navigator.clipboard.writeText(applyAffixes(img.title || '')); toast.success('Title copied!'); }}
                                  className="text-[10px] text-gray-400 hover:text-[#6366F1] flex items-center gap-1 transition-colors font-medium">
                                  <Copy size={9} /> Copy
                                </button>
                              )}
                            </div>
                          </div>
                          {showTitle ? (
                            <div className="space-y-1.5 animate-pulse">
                              <div className="h-3 bg-gray-200 dark:bg-[#232650] rounded-full w-full" />
                              <div className="h-3 bg-gray-200 dark:bg-[#232650] rounded-full w-4/5" />
                            </div>
                          ) : img.title ? (
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{applyAffixes(img.title)}</p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Not generated yet — click Generate</p>
                          )}
                        </div>

                        {/* ── DESCRIPTION section ── */}
                        <div className="px-4 py-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500 flex items-center gap-1.5">
                              <AlignLeft size={10} /> Description
                              {isDone && img.descScore !== undefined && img.descScore > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${img.descScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : img.descScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{img.descScore}</span>
                              )}
                            </span>
                            {img.description && (
                              <button onClick={() => { navigator.clipboard.writeText(img.description || ''); toast.success('Description copied!'); }}
                                className="text-[10px] text-gray-400 hover:text-[#6366F1] flex items-center gap-1 transition-colors font-medium">
                                <Copy size={9} /> Copy
                              </button>
                            )}
                          </div>
                          {showDesc ? (
                            <div className="space-y-1.5 animate-pulse">
                              <div className="h-2.5 bg-gray-200 dark:bg-[#232650] rounded-full w-full" />
                              <div className="h-2.5 bg-gray-200 dark:bg-[#232650] rounded-full w-5/6" />
                              <div className="h-2.5 bg-gray-200 dark:bg-[#232650] rounded-full w-3/4" />
                            </div>
                          ) : img.description ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{img.description}</p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Not generated yet</p>
                          )}
                        </div>

                        {/* ── KEYWORDS section ── */}
                        <div className="px-4 py-3.5 space-y-2.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 flex items-center gap-1.5">
                              <Hash size={10} /> Keywords
                              {img.keywords?.length ? (
                                <span className="text-gray-400 font-normal normal-case tracking-normal ml-0.5">
                                  ({img.keywords.length})
                                </span>
                              ) : null}
                              {isDone && img.keywordsScore !== undefined && img.keywordsScore > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${img.keywordsScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : img.keywordsScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{img.keywordsScore}</span>
                              )}
                            </span>
                            {img.keywords?.length ? (
                              <button onClick={() => { navigator.clipboard.writeText((img.keywords || []).join(', ')); toast.success(`${img.keywords?.length} keywords copied!`); }}
                                className="text-[10px] text-gray-400 hover:text-[#6366F1] flex items-center gap-1 transition-colors font-medium">
                                <Copy size={9} /> Copy all
                              </button>
                            ) : null}
                          </div>
                          {showKw ? (
                            <div className="flex flex-wrap gap-1.5 animate-pulse">
                              {Array(12).fill(0).map((_, i) => (
                                <span key={i} className="h-5 rounded-full bg-gray-200 dark:bg-[#232650] inline-block"
                                  style={{ width: `${36 + (i % 4) * 14}px` }} />
                              ))}
                            </div>
                          ) : img.keywords?.length ? (
                            <div className="flex flex-wrap gap-1.5">
                              {img.keywords.map(kw => (
                                <button
                                  key={kw}
                                  onClick={() => { navigator.clipboard.writeText(kw); toast.success(`"${kw}" copied!`); }}
                                  title={`Click to copy "${kw}"`}
                                  className="text-[11px] px-2.5 py-0.5 bg-[#EEF2FF] dark:bg-[#6366F1]/15 text-[#6366F1] dark:text-[#A5B4FC] rounded-full border border-[#A5B4FC]/30 dark:border-[#6366F1]/30 font-medium hover:bg-[#6366F1] hover:text-white dark:hover:bg-[#6366F1] dark:hover:text-white transition-colors cursor-pointer"
                                >
                                  {kw}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Not generated yet</p>
                          )}
                        </div>

                        {/* ── METADATA CONFIG BAR (rating / author / copyright) ── */}
                        {isDone && embedEnabled && (
                          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-[#EEF2FF]/40 dark:from-[#0d1030]/60 dark:to-[#6366F1]/5 border-t border-gray-100 dark:border-[#232650] space-y-2.5">

                            {/* Rating stars + Author + Copyright */}
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <div className="flex items-center gap-0.5 shrink-0" title="Star rating — defaults to 5★">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    onClick={() => setImages(prev => prev.map(i =>
                                      i.id === img.id ? { ...i, rating: i.rating === star && star !== 5 ? 5 : star } : i
                                    ))}
                                    className={`p-0.5 transition-colors ${(img.rating ?? 5) >= star ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'} hover:text-amber-400`}
                                  >
                                    <Star size={13} fill={(img.rating ?? 5) >= star ? 'currentColor' : 'none'} />
                                  </button>
                                ))}
                                <span className="ml-0.5 text-[10px] text-amber-500 font-semibold">{img.rating ?? 5}★</span>
                              </div>

                              <input
                                type="text"
                                placeholder={embedCreator || 'Author name…'}
                                value={img.userAuthor !== undefined ? img.userAuthor : globalAuthor}
                                onChange={e => setImages(prev => prev.map(i =>
                                  i.id === img.id ? { ...i, userAuthor: e.target.value } : i
                                ))}
                                className="flex-1 min-w-[90px] px-2 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] text-gray-700 dark:text-gray-300 outline-none focus:border-[#6366F1] transition-colors"
                              />

                              <input
                                type="text"
                                placeholder={embedCopyright || '© Copyright…'}
                                value={img.userCopyright !== undefined ? img.userCopyright : globalCopyright}
                                onChange={e => setImages(prev => prev.map(i =>
                                  i.id === img.id ? { ...i, userCopyright: e.target.value } : i
                                ))}
                                className="flex-1 min-w-[100px] px-2 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] text-gray-700 dark:text-gray-300 outline-none focus:border-[#6366F1] transition-colors"
                              />
                            </div>

                            {/* Status row — format, size, keywords, verification check */}
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span className="px-1.5 py-0.5 rounded-md font-bold bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A5B4FC] uppercase tracking-wide">
                                {img.file.name.split('.').pop()?.toUpperCase()}
                              </span>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{(img.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                              <span className="text-gray-300 dark:text-gray-600">·</span>
                              <span>{img.keywords?.length || 0} keywords</span>
                              <span className="text-gray-300 dark:text-gray-600">·</span>
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                                <CheckCircle2 size={10} />
                                Ready — XMP · IPTC · EXIF
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

{images.length === 0 && (
            <div className="text-center py-20 text-gray-400 dark:text-gray-600">
              <div className="w-20 h-20 bg-[#EEF2FF] dark:bg-[#6366F1]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Image size={36} className="text-[#6366F1] opacity-60" />
              </div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">No images uploaded yet</p>
              <p className="text-sm mt-1">Select a marketplace above, then drop your images</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Export Complete Modal ── */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* gradient top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899]" />

            <div className="bg-white dark:bg-[#191c40] p-8">
              {/* close */}
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#232650] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#2d3270] transition-colors"
              >
                <X size={14} className="text-gray-500 dark:text-gray-400" />
              </button>

              {/* icon + heading */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#6366F1]/30">
                  <Download size={28} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generation Complete!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                  <span className="font-semibold text-[#6366F1]">{doneCount} file{doneCount !== 1 ? 's' : ''}</span> ready — choose a format to export
                </p>
              </div>

              {/* Primary action: ZIP with embedded images */}
              {embedEnabled && (
                <button
                  onClick={() => { setShowExportModal(false); downloadAllAsZIP(); }}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-[#6366F1]/40 bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] dark:from-[#6366F1]/15 dark:to-[#8B5CF6]/10 hover:shadow-lg hover:scale-[1.01] transition-all group mb-3"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
                    <Archive size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-base font-bold text-gray-900 dark:text-white">Embed All &amp; Download ZIP</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {doneCount} image{doneCount !== 1 ? 's' : ''} (title-renamed) + Metadata.csv · XMP · IPTC · EXIF
                    </p>
                  </div>
                  <FileDown size={16} className="opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0 text-[#6366F1]" />
                </button>
              )}

              {/* Metadata-only exports */}
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Metadata only (no images)</p>
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { fmt: 'CSV',  label: 'Spreadsheet', color: '#10B981', bg: 'from-emerald-50 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-700/40', action: exportCSV },
                  { fmt: 'XLSX', label: 'Excel Format', color: '#3B82F6', bg: 'from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10',             border: 'border-blue-200 dark:border-blue-700/40',    action: () => toast.success('XLSX coming soon!') },
                  { fmt: 'JSON', label: 'Structured',   color: '#8B5CF6', bg: 'from-violet-50 to-violet-50 dark:from-violet-900/20 dark:to-violet-900/10',     border: 'border-violet-200 dark:border-violet-700/40', action: exportJSON },
                ] as const).map(({ fmt, label, color, bg, border, action }) => (
                  <button
                    key={fmt}
                    onClick={() => { action(); setShowExportModal(false); }}
                    className={`group flex items-center gap-2.5 px-3 py-3 rounded-xl border bg-gradient-to-br ${bg} ${border} hover:shadow-md hover:scale-[1.02] transition-all`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-sm" style={{ background: color }}>
                      {fmt}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{fmt}</p>
                      <p className="text-[10px] text-gray-400">{label}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full mt-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Close — I'll export later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox Modal ── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxSrc}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-3 -right-3 w-9 h-9 bg-white dark:bg-[#191c40] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border border-gray-200 dark:border-[#232650]"
            >
              <X size={16} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <p className="absolute bottom-4 text-white/50 text-xs">Click anywhere to close</p>
        </div>
      )}
    </DashboardLayout>
  );
};
