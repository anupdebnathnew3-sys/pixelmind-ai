import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { useAdminStore } from '../../store/useAdminStore';
import { callAI, extractJSON } from '../../services/aiService';
import {
  Type, Copy, RefreshCw, AlertCircle, ExternalLink,
  ChevronDown, ChevronUp, Sun, Moon, Sparkles,
  PenTool, Layers, Globe, Rocket, Smartphone,
  Palette, Share2, Play, Image, FileText, Monitor, CreditCard, ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FontSlot {
  font: string;
  role: string;
  compatibilityScore: number;
  reason: string;
  isSelected: boolean;
}

interface Approach {
  name: string;
  tagline: string;
  pairings: FontSlot[];
  explanation: string;
  suitableFor: string[];
}

interface FontAnalysis {
  classification: string;
  personality: string[];
  weight: string;
  readability: string;
  designCharacteristics: string;
}

interface AIResult {
  fontAnalysis: FontAnalysis;
  purpose: string;
  approaches: Approach[];
}

type FontCategory = 'sans-serif' | 'serif' | 'display' | 'script' | 'luxury' | 'modern' | 'creative' | 'vintage';
interface BuiltInFont { name: string; category: FontCategory; }

// ── Design Purposes ───────────────────────────────────────────────────────────

const DESIGN_PURPOSES = [
  { id: 'logo',           label: 'Logo Design',        icon: PenTool    },
  { id: 'brand',          label: 'Brand Identity',     icon: Layers     },
  { id: 'website',        label: 'Website Design',     icon: Globe      },
  { id: 'landing-page',   label: 'Landing Page',       icon: Rocket     },
  { id: 'mobile-app',     label: 'Mobile App UI',      icon: Smartphone },
  { id: 'graphic-design', label: 'Graphic Design',     icon: Palette    },
  { id: 'social-media',   label: 'Social Media',       icon: Share2     },
  { id: 'youtube',        label: 'YouTube Thumbnail',  icon: Play       },
  { id: 'poster',         label: 'Poster Design',      icon: Image      },
  { id: 'flyer',          label: 'Flyer Design',       icon: FileText   },
  { id: 'presentation',   label: 'Presentation',       icon: Monitor    },
  { id: 'business-card',  label: 'Business Card',      icon: CreditCard },
  { id: 'ecommerce',      label: 'E-commerce',         icon: ShoppingBag},
] as const;

type DesignPurposeId = typeof DESIGN_PURPOSES[number]['id'];

const PURPOSE_COLOR: Record<DesignPurposeId, string> = {
  'logo':           '#7C3AED',
  'brand':          '#EC4899',
  'website':        '#0EA5E9',
  'landing-page':   '#0284C7',
  'mobile-app':     '#10B981',
  'graphic-design': '#F97316',
  'social-media':   '#EF4444',
  'youtube':        '#DC2626',
  'poster':         '#F59E0B',
  'flyer':          '#84CC16',
  'presentation':   '#6366F1',
  'business-card':  '#14B8A6',
  'ecommerce':      '#8B5CF6',
};

const APPROACH_COLORS = ['#0EA5E9', '#7C3AED', '#10B981'];

// ── Font Library ──────────────────────────────────────────────────────────────

const BUILT_IN_FONTS: BuiltInFont[] = [
  { name: 'Inter',              category: 'sans-serif' },
  { name: 'Poppins',            category: 'sans-serif' },
  { name: 'Montserrat',         category: 'sans-serif' },
  { name: 'Roboto',             category: 'sans-serif' },
  { name: 'Lato',               category: 'sans-serif' },
  { name: 'Nunito',             category: 'sans-serif' },
  { name: 'DM Sans',            category: 'sans-serif' },
  { name: 'Open Sans',          category: 'sans-serif' },
  { name: 'Playfair Display',   category: 'serif'      },
  { name: 'Merriweather',       category: 'serif'      },
  { name: 'Lora',               category: 'serif'      },
  { name: 'Cormorant Garamond', category: 'serif'      },
  { name: 'EB Garamond',        category: 'serif'      },
  { name: 'Libre Baskerville',  category: 'serif'      },
  { name: 'Bebas Neue',         category: 'display'    },
  { name: 'Oswald',             category: 'display'    },
  { name: 'Anton',              category: 'display'    },
  { name: 'Abril Fatface',      category: 'display'    },
  { name: 'Raleway',            category: 'display'    },
  { name: 'Dancing Script',     category: 'script'     },
  { name: 'Sacramento',         category: 'script'     },
  { name: 'Great Vibes',        category: 'script'     },
  { name: 'Allura',             category: 'script'     },
  { name: 'Alex Brush',         category: 'script'     },
  { name: 'Cormorant',          category: 'luxury'     },
  { name: 'Bodoni Moda',        category: 'luxury'     },
  { name: 'DM Serif Display',   category: 'luxury'     },
  { name: 'Josefin Sans',       category: 'luxury'     },
  { name: 'Space Grotesk',      category: 'modern'     },
  { name: 'Outfit',             category: 'modern'     },
  { name: 'Syne',               category: 'modern'     },
  { name: 'Figtree',            category: 'modern'     },
  { name: 'Plus Jakarta Sans',  category: 'modern'     },
  { name: 'Righteous',          category: 'creative'   },
  { name: 'Permanent Marker',   category: 'creative'   },
  { name: 'Fredoka One',        category: 'creative'   },
  { name: 'Pacifico',           category: 'creative'   },
  { name: 'Spectral',           category: 'vintage'    },
  { name: 'Crimson Pro',        category: 'vintage'    },
  { name: 'Josefin Slab',       category: 'vintage'    },
  { name: 'Old Standard TT',    category: 'vintage'    },
];

const FONT_CATEGORIES: { id: FontCategory | 'all'; label: string }[] = [
  { id: 'all',        label: 'All'        },
  { id: 'sans-serif', label: 'Sans Serif' },
  { id: 'serif',      label: 'Serif'      },
  { id: 'display',    label: 'Display'    },
  { id: 'script',     label: 'Script'     },
  { id: 'luxury',     label: 'Luxury'     },
  { id: 'modern',     label: 'Modern'     },
  { id: 'creative',   label: 'Creative'   },
  { id: 'vintage',    label: 'Vintage'    },
];

// ── Purpose-specific Live Preview ─────────────────────────────────────────────

type PreviewType = 'logo' | 'website' | 'mobile' | 'print' | 'social' | 'presentation' | 'bizcard';

const PREVIEW_TYPE: Record<DesignPurposeId, PreviewType> = {
  'logo':           'logo',
  'brand':          'logo',
  'website':        'website',
  'landing-page':   'website',
  'mobile-app':     'mobile',
  'graphic-design': 'print',
  'social-media':   'social',
  'youtube':        'social',
  'poster':         'print',
  'flyer':          'print',
  'presentation':   'presentation',
  'business-card':  'bizcard',
  'ecommerce':      'website',
};

interface PreviewProps {
  purposeId: DesignPurposeId;
  pairings: FontSlot[];
  theme: 'light' | 'dark';
  accentColor: string;
}

function PurposePreview({ purposeId, pairings, theme, accentColor }: PreviewProps) {
  const dark = theme === 'dark';
  const bg   = dark ? '#0f172a' : '#ffffff';
  const P    = dark ? '#f1f5f9' : '#0f172a';
  const S    = dark ? '#cbd5e1' : '#334155';
  const M    = dark ? '#64748b' : '#94a3b8';
  const Div  = dark ? '#1e293b' : '#f1f5f9';
  const cls  = 'rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 h-full';

  const fSel = `"${pairings[0]?.font ?? ''}", sans-serif`;
  const f1   = `"${pairings[1]?.font ?? ''}", sans-serif`;
  const f2   = `"${pairings[2]?.font ?? ''}", sans-serif`;
  const pType = PREVIEW_TYPE[purposeId];

  if (pType === 'logo') {
    return (
      <div className={cls} style={{ background: bg }}>
        <div style={{ padding: '22px 18px', textAlign: 'center' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${accentColor}20`, border: `1.5px solid ${accentColor}40`, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: accentColor, fontSize: 18, fontFamily: fSel, fontWeight: 700 }}>A</span>
          </div>
          <p style={{ fontFamily: fSel, color: P, fontSize: 20, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 3 }}>
            {pairings[0]?.font?.split(' ')[0] ?? 'Brand'}
          </p>
          <p style={{ fontFamily: f1, color: M, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
            Design Studio
          </p>
          <div style={{ height: 1, background: Div, margin: '0 auto', width: 48, marginBottom: 12 }} />
          <p style={{ fontFamily: f2, color: S, fontSize: 11, fontStyle: 'italic', lineHeight: 1.6 }}>
            Creating identities that<br />leave a lasting impression.
          </p>
        </div>
        <div style={{ padding: '0 14px 12px', display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {pairings.map((p, i) => (
            <span key={i} style={{ fontFamily: `"${p.font}", sans-serif`, fontSize: 8.5, color: M, background: Div, padding: '2px 6px', borderRadius: 20 }}>{p.font}</span>
          ))}
        </div>
      </div>
    );
  }

  if (pType === 'website') {
    return (
      <div className={cls} style={{ background: bg }}>
        <div style={{ background: dark ? '#1e293b' : '#f8fafc', borderBottom: `1px solid ${Div}`, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: fSel, color: P, fontSize: 12, fontWeight: 700 }}>YourBrand</span>
          <span style={{ marginLeft: 'auto', fontFamily: f2, color: M, fontSize: 8.5 }}>Home · Features · Pricing</span>
        </div>
        <div style={{ padding: '14px 12px' }}>
          <p style={{ fontFamily: fSel, color: M, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>New Platform</p>
          <p style={{ fontFamily: f1, color: P, fontSize: 18, fontWeight: 700, lineHeight: 1.2, marginBottom: 7 }}>Grow Faster<br />With AI</p>
          <p style={{ fontFamily: f2, color: S, fontSize: 10, lineHeight: 1.6, marginBottom: 10 }}>Professional tools designed for modern teams. Start free today.</p>
          <div style={{ display: 'inline-flex', background: accentColor, color: '#fff', borderRadius: 7, padding: '4px 12px' }}>
            <span style={{ fontFamily: f2, fontSize: 9.5, fontWeight: 600 }}>Get Started →</span>
          </div>
        </div>
        <div style={{ padding: '0 12px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {pairings.map((p, i) => (
            <span key={i} style={{ fontFamily: `"${p.font}", sans-serif`, fontSize: 8.5, color: M, background: Div, padding: '2px 6px', borderRadius: 20 }}>{p.font}</span>
          ))}
        </div>
      </div>
    );
  }

  if (pType === 'mobile') {
    return (
      <div className={cls} style={{ background: bg }}>
        <div style={{ padding: '10px 12px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 12, fontFamily: fSel, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontFamily: fSel, color: P, fontSize: 12, fontWeight: 700 }}>AppName</span>
        </div>
        <div style={{ padding: '6px 12px' }}>
          <p style={{ fontFamily: f1, color: P, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Good Morning</p>
          <p style={{ fontFamily: f2, color: M, fontSize: 10, marginBottom: 10 }}>Here's your daily summary</p>
          <div style={{ background: Div, borderRadius: 10, padding: '8px 10px', marginBottom: 6 }}>
            <p style={{ fontFamily: f1, color: P, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>Dashboard</p>
            <p style={{ fontFamily: f2, color: M, fontSize: 9.5, lineHeight: 1.5 }}>12 tasks · 3 meetings · 5 updates</p>
          </div>
          <div style={{ background: accentColor, borderRadius: 10, padding: '7px 10px' }}>
            <p style={{ fontFamily: f2, color: '#fff', fontSize: 9.5, fontWeight: 600 }}>View all updates →</p>
          </div>
        </div>
        <div style={{ padding: '4px 12px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {pairings.map((p, i) => (
            <span key={i} style={{ fontFamily: `"${p.font}", sans-serif`, fontSize: 8.5, color: M, background: Div, padding: '2px 6px', borderRadius: 20 }}>{p.font}</span>
          ))}
        </div>
      </div>
    );
  }

  if (pType === 'print') {
    const isDark = purposeId === 'poster' || purposeId === 'graphic-design';
    const pBg = isDark ? (dark ? '#0c0c18' : '#0f172a') : bg;
    const pP  = isDark ? '#ffffff' : P;
    const pM  = isDark ? '#ffffff60' : M;
    return (
      <div className={cls} style={{ background: pBg }}>
        <div style={{ padding: '14px 12px 10px' }}>
          <p style={{ fontFamily: fSel, color: pM, fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 3 }}>
            {purposeId === 'flyer' ? 'Event Announcement' : 'Design Studio'}
          </p>
          <p style={{ fontFamily: f1, color: pP, fontSize: purposeId === 'poster' ? 32 : 22, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 8 }}>
            {purposeId === 'flyer' ? 'SPECIAL\nEVENT' : 'THINK\nBOLD.'}
          </p>
          <div style={{ height: 2, background: accentColor, width: 24, marginBottom: 8 }} />
          <p style={{ fontFamily: fSel, color: pP, fontSize: 11, fontWeight: 600, marginBottom: 4, opacity: 0.9 }}>
            {purposeId === 'flyer' ? 'Saturday, June 28' : 'Visual Communication'}
          </p>
          <p style={{ fontFamily: f2, color: pM, fontSize: 9.5, lineHeight: 1.6 }}>
            {purposeId === 'flyer' ? 'Venue Name · 7:00 PM\nAll tickets online.' : 'Posters · Ads · Branding\nSocial · Print'}
          </p>
        </div>
        <div style={{ padding: '0 12px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {pairings.map((p, i) => (
            <span key={i} style={{ fontFamily: `"${p.font}", sans-serif`, fontSize: 8.5, color: pM, background: '#ffffff15', padding: '2px 6px', borderRadius: 20 }}>{p.font}</span>
          ))}
        </div>
      </div>
    );
  }

  if (pType === 'social') {
    const isYT = purposeId === 'youtube';
    return (
      <div className={cls} style={{ background: isYT ? '#0f172a' : bg }}>
        <div style={{ background: isYT ? '#1e1e2e' : Div, padding: '12px', minHeight: isYT ? 90 : 'auto' }}>
          {isYT ? (
            <>
              <p style={{ fontFamily: f1, color: '#ffffff', fontSize: 18, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, marginBottom: 4 }}>WATCH THIS</p>
              <p style={{ fontFamily: fSel, color: '#ffcc00', fontSize: 11, fontWeight: 700 }}>BEFORE IT'S TOO LATE</p>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: accentColor }} />
                <span style={{ fontFamily: fSel, color: P, fontSize: 10, fontWeight: 600 }}>@yourbrand</span>
              </div>
              <p style={{ fontFamily: f1, color: P, fontSize: 16, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>New drop is here 🔥</p>
              <p style={{ fontFamily: f2, color: S, fontSize: 10, lineHeight: 1.5 }}>Link in bio to shop the full collection. Limited stock available.</p>
            </>
          )}
        </div>
        <div style={{ padding: '8px 12px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {pairings.map((p, i) => (
            <span key={i} style={{ fontFamily: `"${p.font}", sans-serif`, fontSize: 8.5, color: M, background: Div, padding: '2px 6px', borderRadius: 20 }}>{p.font}</span>
          ))}
        </div>
      </div>
    );
  }

  if (pType === 'presentation') {
    return (
      <div className={cls} style={{ background: dark ? '#0c1224' : '#0f172a' }}>
        <div style={{ padding: '14px 14px 6px' }}>
          <div style={{ width: 30, height: 3, background: accentColor, borderRadius: 2, marginBottom: 10 }} />
          <p style={{ fontFamily: fSel, color: '#ffffff50', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 5 }}>Slide 01</p>
          <p style={{ fontFamily: f1, color: '#ffffff', fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 7 }}>The Future<br />of Design</p>
          <p style={{ fontFamily: f2, color: '#ffffff70', fontSize: 10, lineHeight: 1.6 }}>How typography shapes brand perception and drives business results.</p>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${accentColor}30`, border: `1px solid ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: accentColor, fontSize: 8, fontFamily: fSel, fontWeight: 700 }}>JD</span>
            </div>
            <span style={{ fontFamily: f2, color: '#ffffff50', fontSize: 9 }}>John Doe · Lead Designer</span>
          </div>
        </div>
        <div style={{ padding: '6px 14px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {pairings.map((p, i) => (
            <span key={i} style={{ fontFamily: `"${p.font}", sans-serif`, fontSize: 8.5, color: '#ffffff40', background: '#ffffff10', padding: '2px 6px', borderRadius: 20 }}>{p.font}</span>
          ))}
        </div>
      </div>
    );
  }

  // Business Card
  return (
    <div className={cls} style={{ background: bg }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }} />
      <div style={{ padding: '16px 14px' }}>
        <p style={{ fontFamily: fSel, color: P, fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 3 }}>
          {pairings[0]?.font?.split(' ')[0] ?? 'Your'} Studio
        </p>
        <p style={{ fontFamily: f1, color: accentColor, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
          Creative Director
        </p>
        <div style={{ height: 1, background: Div, marginBottom: 10 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontFamily: f2, color: M, fontSize: 9.5 }}>hello@yourstudio.com</p>
          <p style={{ fontFamily: f2, color: M, fontSize: 9.5 }}>+1 (555) 123-4567</p>
          <p style={{ fontFamily: f2, color: M, fontSize: 9.5 }}>www.yourstudio.com</p>
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {pairings.map((p, i) => (
            <span key={i} style={{ fontFamily: `"${p.font}", sans-serif`, fontSize: 8.5, color: M, background: Div, padding: '2px 6px', borderRadius: 20 }}>{p.font}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export const FontPairingPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits }  = useStore();
  const { getTemplate }    = usePromptStore();
  const { cmsContent }     = useAdminStore();

  const [mainFont, setMainFont]                 = useState('');
  const [customFont, setCustomFont]             = useState('');
  const [activeCategory, setActiveCategory]     = useState<FontCategory | 'all'>('all');
  const [designPurpose, setDesignPurpose]       = useState<DesignPurposeId | ''>('');
  const [result, setResult]                     = useState<AIResult | null>(null);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');
  const [fontPanelOpen, setFontPanelOpen]       = useState(true);
  const [purposePanelOpen, setPurposePanelOpen] = useState(true);
  const [previewTheme, setPreviewTheme]         = useState<'light' | 'dark'>('light');

  const showGoogleLinks = cmsContent['fp_google_links'] !== 'false';
  const showCustomInput = cmsContent['fp_custom_input'] !== 'false';
  const maxApproaches   = Math.min(3, Math.max(1, parseInt(cmsContent['fp_max_results'] ?? '3', 10)));

  const adminFonts: BuiltInFont[] = (() => {
    try {
      const raw = cmsContent['fp_custom_fonts'];
      if (!raw) return [];
      return (JSON.parse(raw) as { name: string; category: FontCategory; enabled: boolean }[])
        .filter(f => f.enabled)
        .map(f => ({ name: f.name, category: f.category }));
    } catch { return []; }
  })();

  const allFonts          = [...BUILT_IN_FONTS, ...adminFonts];
  const visibleFonts      = activeCategory === 'all' ? allFonts : allFonts.filter(f => f.category === activeCategory);
  const selectedFont      = customFont.trim() || mainFont;
  const selectedPurposeObj = DESIGN_PURPOSES.find(p => p.id === designPurpose);
  const accentColor       = designPurpose ? PURPOSE_COLOR[designPurpose] : '#0EA5E9';

  // Load Google Fonts for all results
  useEffect(() => {
    if (!result) return;
    const toLoad = new Set<string>([selectedFont]);
    result.approaches.forEach(a => a.pairings.forEach(p => p.font && toLoad.add(p.font)));
    const families = [...toLoad].filter(Boolean)
      .map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}`)
      .join('&');
    let link = document.getElementById('gfonts-pairing') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id  = 'gfonts-pairing';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }, [result, selectedFont]);

  const generate = async () => {
    if (!selectedFont)  { setError('Please select or type a font first'); return; }
    if (!designPurpose) { setError('Please select a design purpose'); return; }
    setError('');
    setLoading(true);
    setResult(null);

    const template      = getTemplate('font-pairing');
    const defaultSystem = `You are a world-class typographer and brand designer. Return ONLY valid JSON — no markdown, no code fences.`;
    const purposeLabel  = selectedPurposeObj?.label ?? designPurpose;

    const scriptNote = (designPurpose === 'social-media' || designPurpose === 'youtube')
      ? 'Prioritize bold, high-impact condensed or display fonts for Font #2 and Font #3 — they must be readable at small sizes on mobile.'
      : '';

    const prompt = `You are a professional typographer specializing in "${purposeLabel}" design.

The user has selected "${selectedFont}" as their primary font for "${purposeLabel}".

STEP 1 — Analyze "${selectedFont}":
- Exact classification (Geometric Sans-Serif / Humanist Serif / etc.)
- Visual personality (3–5 specific descriptors)
- Visual weight range
- Readability (screen vs print)
- Key design characteristics

STEP 2 — Generate ${maxApproaches} DISTINCT font combinations for "${purposeLabel}":

Rules:
- Font #1 in each pairings array is ALWAYS "${selectedFont}" (isSelected: true, compatibilityScore: 100)
- Font #2 and Font #3 are real Google Fonts recommended specifically for "${purposeLabel}"
- Each of the ${maxApproaches} combinations must have a different typographic approach / style
- Font #2 and Font #3 must differ across combinations — never repeat the same font pair
- Compatibility scores for Font #2 and #3: realistic integers 75–97
- Tailor recommendations SPECIFICALLY to "${purposeLabel}" context
${scriptNote}

Return ONLY valid JSON (no markdown, no code fences):
{
  "fontAnalysis": {
    "classification": "string",
    "personality": ["string"],
    "weight": "string",
    "readability": "string",
    "designCharacteristics": "string"
  },
  "purpose": "${purposeLabel}",
  "approaches": [
    {
      "name": "Approach Name (e.g. Classic Contrast)",
      "tagline": "One-line style description",
      "pairings": [
        { "font": "${selectedFont}", "role": "Primary / Brand", "compatibilityScore": 100, "reason": "User's selected font.", "isSelected": true },
        { "font": "Font Name", "role": "Role description", "compatibilityScore": 92, "reason": "Why it pairs well for ${purposeLabel}.", "isSelected": false },
        { "font": "Font Name", "role": "Role description", "compatibilityScore": 87, "reason": "Why it pairs well for ${purposeLabel}.", "isSelected": false }
      ],
      "explanation": "Why all 3 fonts work together for ${purposeLabel}.",
      "suitableFor": ["specific use case 1", "specific use case 2"]
    }
  ]
}`;

    try {
      const response = await callAI({ prompt, systemPrompt: template?.systemPrompt ?? defaultSystem, maxTokens: 2500 });
      const json     = extractJSON(response.text);
      const raw      = JSON.parse(json) as Record<string, unknown>;
      if (!raw.approaches || !raw.fontAnalysis) throw new Error('Invalid AI response structure');

      const fa = (raw.fontAnalysis ?? {}) as Record<string, unknown>;
      const parsed: AIResult = {
        fontAnalysis: {
          classification:      String(fa.classification      ?? 'Unknown'),
          personality:         Array.isArray(fa.personality) ? (fa.personality as string[]) : [],
          weight:              String(fa.weight              ?? 'Regular'),
          readability:         String(fa.readability         ?? ''),
          designCharacteristics: String(fa.designCharacteristics ?? ''),
        },
        purpose: String(raw.purpose ?? purposeLabel),
        approaches: (Array.isArray(raw.approaches) ? raw.approaches : [])
          .slice(0, maxApproaches)
          .map((a: Record<string, unknown>) => ({
            name:        String(a.name        ?? 'Font Pairing'),
            tagline:     String(a.tagline     ?? ''),
            pairings: (Array.isArray(a.pairings) ? a.pairings : [])
              .slice(0, 3)
              .map((p: Record<string, unknown>) => ({
                font:               String(p.font     ?? ''),
                role:               String(p.role     ?? ''),
                compatibilityScore: typeof p.compatibilityScore === 'number' ? p.compatibilityScore : parseInt(String(p.compatibilityScore ?? '80'), 10) || 80,
                reason:             String(p.reason   ?? ''),
                isSelected:         Boolean(p.isSelected),
              })),
            explanation: String(a.explanation ?? ''),
            suitableFor: Array.isArray(a.suitableFor) ? (a.suitableFor as string[]) : [],
          })),
      };
      if (!parsed.approaches.length) throw new Error('No approaches returned');
      setResult(parsed);
      deductCredits(1);
      toast.success(`${parsed.approaches.length} font pairings for "${selectedFont}"!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg.includes('JSON') || msg.includes('Unexpected') ? 'AI response was cut off — please try again.' : msg);
      toast.error('Generation failed');
    }
    setLoading(false);
  };

  const copyApproach = (a: Approach) => {
    const lines = [
      `=== ${a.name} ===`,
      `Style: ${a.tagline}`,
      '',
      ...a.pairings.map((p, i) => `Font ${i + 1}: ${p.font} (${p.role}) — ${p.compatibilityScore}%`),
      '',
      a.explanation,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    toast.success('Combination copied!');
  };

  const googleFontsUrl = (font: string) =>
    `https://fonts.google.com/specimen/${font.trim().replace(/\s+/g, '+')}`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="flex flex-col lg:flex-row gap-6 min-h-full">

        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <div className="lg:w-64 xl:w-72 flex-shrink-0 space-y-4">

          {/* Brand header */}
          <div
            className="rounded-2xl p-4 text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, boxShadow: `0 8px 24px ${accentColor}30` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                {selectedPurposeObj
                  ? React.createElement(selectedPurposeObj.icon, { size: 18, className: 'text-white' })
                  : <Type size={18} className="text-white" />
                }
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">AI Font Pairing</p>
                <p className="text-white/70 text-[11px] leading-tight mt-0.5">
                  {selectedFont && designPurpose
                    ? `"${selectedFont}" for ${selectedPurposeObj?.label}`
                    : 'Select font + purpose → generate'}
                </p>
              </div>
            </div>
          </div>

          <InlineApiKeySetup />

          {/* Step 1 — Font */}
          <Card padding="none">
            <button
              onClick={() => setFontPanelOpen(v => !v)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#0d1030]/50 rounded-t-2xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[9px] font-black" style={{ backgroundColor: accentColor }}>1</div>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {selectedFont
                    ? <span><span className="text-gray-400 font-normal">Font: </span><span style={{ fontFamily: `"${selectedFont}", sans-serif` }}>{selectedFont}</span></span>
                    : 'Select Your Font'}
                </span>
              </div>
              {fontPanelOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            {fontPanelOpen && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filter by Style</p>
                  <div className="flex flex-wrap gap-1">
                    {FONT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                          activeCategory === cat.id
                            ? 'text-white'
                            : 'bg-gray-100 dark:bg-[#191c40] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#232650]'
                        }`}
                        style={activeCategory === cat.id ? { backgroundColor: accentColor } : undefined}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto pr-1 space-y-2.5">
                  {activeCategory === 'all' ? (
                    FONT_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                      const fontsInCat = allFonts.filter(f => f.category === cat.id);
                      if (!fontsInCat.length) return null;
                      return (
                        <div key={cat.id}>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 sticky top-0 bg-white dark:bg-[#191c40] py-0.5">{cat.label}</p>
                          <div className="flex flex-wrap gap-1">
                            {fontsInCat.map(font => (
                              <button
                                key={font.name}
                                onClick={() => { setMainFont(font.name); setCustomFont(''); setError(''); }}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                                  mainFont === font.name && !customFont ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                                style={mainFont === font.name && !customFont ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
                              >
                                {font.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {visibleFonts.map(font => (
                        <button
                          key={font.name}
                          onClick={() => { setMainFont(font.name); setCustomFont(''); setError(''); }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                            mainFont === font.name && !customFont ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                          style={mainFont === font.name && !customFont ? { backgroundColor: accentColor, borderColor: accentColor } : undefined}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {showCustomInput && (
                  <>
                    <div className="h-px bg-gray-100 dark:bg-[#232650]" />
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">Or type any Google Font</label>
                      <input
                        type="text"
                        placeholder="e.g., Cormorant Garamond…"
                        value={customFont}
                        onChange={e => { setCustomFont(e.target.value); setMainFont(''); setError(''); }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>

          {/* Step 2 — Design Purpose */}
          <Card padding="none">
            <button
              onClick={() => setPurposePanelOpen(v => !v)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#0d1030]/50 rounded-t-2xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[9px] font-black" style={{ backgroundColor: accentColor }}>2</div>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {designPurpose
                    ? <span><span className="text-gray-400 font-normal">For: </span>{selectedPurposeObj?.label}</span>
                    : 'Design Purpose'}
                </span>
              </div>
              {purposePanelOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            {purposePanelOpen && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-1.5">
                  {DESIGN_PURPOSES.map(p => {
                    const Icon = p.icon;
                    const pColor = PURPOSE_COLOR[p.id];
                    const isSelected = designPurpose === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setDesignPurpose(p.id); setError(''); }}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all ${
                          isSelected ? 'text-white shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#232650]'
                        }`}
                        style={isSelected ? { backgroundColor: pColor, borderColor: pColor } : undefined}
                      >
                        <Icon
                          size={12}
                          className="flex-shrink-0"
                          style={!isSelected ? { color: pColor } : undefined}
                        />
                        <span className="text-[10px] font-semibold leading-tight">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                {error.includes('No API') && (
                  <Link to="/ai-settings" className="text-xs text-blue-500 underline mt-1 block">Configure API Keys →</Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, boxShadow: `0 4px 14px ${accentColor}30` }}
              >
                <Type size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Font Pairing Assistant</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {result
                    ? `${result.approaches.length} combinations for "${selectedFont}" · ${result.purpose}`
                    : 'Select a font + design purpose to generate tailored pairings'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {result && (
                <button
                  onClick={() => setPreviewTheme(t => t === 'light' ? 'dark' : 'light')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-[#191c40] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#232650] transition-colors border border-gray-200 dark:border-[#232650]"
                >
                  {previewTheme === 'light' ? <><Moon size={12} /> Dark</> : <><Sun size={12} /> Light</>}
                </button>
              )}
              {result && (
                <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} loading={loading} onClick={generate}>Regenerate</Button>
              )}
              <Button
                size="sm"
                loading={loading}
                onClick={generate}
                disabled={!selectedFont || !designPurpose}
                icon={<Sparkles size={13} />}
              >
                {loading ? 'Analyzing…' : 'Generate Pairings'}
              </Button>
            </div>
          </div>

          {/* Font analysis strip */}
          {result && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-[#232650]">
              <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }} />
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-[#191c40]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}15` }}>
                  {selectedPurposeObj && React.createElement(selectedPurposeObj.icon, { size: 16, style: { color: accentColor } })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <p className="font-bold text-gray-900 dark:text-white text-base" style={{ fontFamily: `"${selectedFont}", sans-serif` }}>{selectedFont}</p>
                    <p className="text-xs text-gray-400">{result.fontAnalysis.classification}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white" style={{ backgroundColor: accentColor }}>
                      {result.purpose}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {result.fontAnalysis.personality.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>{t}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{result.fontAnalysis.designCharacteristics}</p>
                </div>
                <p className="text-[10px] text-gray-400 hidden sm:block flex-shrink-0 max-w-[120px] text-right leading-relaxed">{result.fontAnalysis.readability}</p>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              <div className="h-20 rounded-2xl bg-white dark:bg-[#191c40] border border-gray-100 dark:border-[#232650] animate-pulse" />
              {[0, 1, 2].slice(0, maxApproaches).map(i => (
                <div key={i} className="rounded-2xl border border-gray-100 dark:border-[#232650] bg-white dark:bg-[#191c40] overflow-hidden animate-pulse">
                  <div style={{ height: 3, backgroundColor: APPROACH_COLORS[i] }} />
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-4 space-y-3">
                      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                      {[1, 2, 3].map(j => <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    </div>
                    <div className="lg:w-60 p-4">
                      <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-xl min-h-[180px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="space-y-4">
              {result.approaches.map((approach, ai) => {
                const cardColor = APPROACH_COLORS[ai] ?? accentColor;
                return (
                  <div key={ai} className="rounded-2xl border border-gray-100 dark:border-[#232650] bg-white dark:bg-[#191c40] overflow-hidden shadow-sm">
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${cardColor}, ${cardColor}80)` }} />

                    {/* Approach header */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-[#232650]">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ backgroundColor: cardColor }}>
                        {String(ai + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{approach.name}</p>
                        <p className="text-[10px] text-gray-400">{approach.tagline}</p>
                      </div>
                      {approach.suitableFor.length > 0 && (
                        <div className="hidden sm:flex gap-1 flex-wrap justify-end">
                          {approach.suitableFor.slice(0, 2).map(s => (
                            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${cardColor}15`, color: cardColor }}>{s}</span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => copyApproach(approach)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors flex-shrink-0"
                        style={{ borderColor: `${cardColor}40`, color: cardColor, backgroundColor: `${cardColor}08` }}
                      >
                        <Copy size={10} /> Copy
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col lg:flex-row">

                      {/* Font slots */}
                      <div className="flex-1 p-4 space-y-2 min-w-0">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Font Triplet for {result.purpose}</p>
                        {approach.pairings.map((slot, si) => (
                          <div
                            key={si}
                            className={slot.isSelected
                              ? 'rounded-xl p-3 border-2 transition-colors'
                              : 'rounded-xl p-3 border border-gray-100 dark:border-[#232650] bg-gray-50 dark:bg-[#0d1030] transition-colors'
                            }
                            style={slot.isSelected
                              ? { borderColor: `${cardColor}30`, backgroundColor: `${cardColor}06` }
                              : undefined
                            }
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 text-white" style={{ backgroundColor: cardColor }}>
                                {si + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white" style={{ fontFamily: `"${slot.font}", sans-serif` }}>
                                    {slot.font || '—'}
                                  </p>
                                  {slot.isSelected && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-white" style={{ backgroundColor: cardColor }}>
                                      Your Font
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-400 mb-1.5">{slot.role}</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${slot.compatibilityScore}%`, backgroundColor: cardColor }} />
                                  </div>
                                  <span className="text-[10px] font-bold flex-shrink-0" style={{ color: cardColor }}>{slot.compatibilityScore}%</span>
                                  {showGoogleLinks && !slot.isSelected && (
                                    <a href={googleFontsUrl(slot.font)} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5">
                                      <ExternalLink size={10} />
                                    </a>
                                  )}
                                  <button onClick={() => { navigator.clipboard.writeText(slot.font); toast.success(`${slot.font} copied!`); }} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5">
                                    <Copy size={10} />
                                  </button>
                                </div>
                                {slot.reason && !slot.isSelected && (
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5">{slot.reason}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {approach.explanation && (
                          <div className="flex items-stretch gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#0d1030] mt-1">
                            <div className="w-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: cardColor }} />
                            <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed italic">{approach.explanation}</p>
                          </div>
                        )}
                      </div>

                      {/* Live preview */}
                      <div className="lg:w-60 xl:w-64 flex-shrink-0 p-4 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-[#232650]">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          {selectedPurposeObj?.label ?? 'Design'} Preview
                        </p>
                        <div className="flex-1 min-h-[200px]">
                          {designPurpose && (
                            <PurposePreview
                              purposeId={designPurpose as DesignPurposeId}
                              pairings={approach.pairings}
                              theme={previewTheme}
                              accentColor={cardColor}
                            />
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && !result && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${accentColor}15` }}>
                <Type size={34} style={{ color: accentColor, opacity: 0.6 }} />
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300 text-lg mb-2">Select a Font + Design Purpose</p>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mb-8">
                The AI tailors font pairings specifically to each design context — Logo Design fonts differ from Social Media or Poster fonts.
              </p>
              <div className="flex flex-wrap gap-2 max-w-lg mx-auto justify-center">
                {DESIGN_PURPOSES.map(p => {
                  const Icon = p.icon;
                  const pColor = PURPOSE_COLOR[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setDesignPurpose(p.id); setError(''); setPurposePanelOpen(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all hover:scale-105"
                      style={{ borderColor: `${pColor}40`, color: pColor, backgroundColor: `${pColor}08` }}
                    >
                      <Icon size={11} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-6">Logo fonts ≠ Poster fonts ≠ Social Media fonts — purpose shapes everything</p>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};
