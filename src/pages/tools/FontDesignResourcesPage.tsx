import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { usePromptStore } from '../../store/usePromptStore';
import { useAdminStore } from '../../store/useAdminStore';
import { callAI, extractJSON } from '../../services/aiService';
import {
  Palette, PenTool, Layers, Globe, Rocket, Share2, Play,
  FileText, CreditCard, Monitor, Smartphone, ShoppingBag, Image,
  Copy, RefreshCw, AlertCircle, ExternalLink, Sun, Moon,
  Type, Sparkles, ChevronDown, ChevronUp, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { InlineApiKeySetup } from '../../components/ui/InlineApiKeySetup';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FontSlot {
  role: string;
  font: string;
  weight: string;
  note: string;
  isSelected?: boolean;
}

interface Pairing {
  approach: string;
  tagline: string;
  fonts: FontSlot[];
  rationale: string;
  pairingScore: number;
  harmonyScore: number;
}

interface FontAnalysis {
  classification: string;
  personality: string[];
  visualWeight: string;
  bestFor: string;
  characteristics: string;
}

interface AIResult {
  fontAnalysis: FontAnalysis;
  pairings: Pairing[];
}

type ProjectId =
  | 'graphic-design' | 'logo' | 'brand' | 'website' | 'landing-page'
  | 'social-media' | 'youtube' | 'poster' | 'flyer' | 'business-card'
  | 'presentation' | 'mobile-app' | 'ecommerce';

type FontCategory = 'sans-serif' | 'serif' | 'display' | 'script' | 'luxury' | 'modern' | 'creative' | 'vintage';

// ── Static data ───────────────────────────────────────────────────────────────

interface ProjectType { id: ProjectId; label: string; icon: React.ElementType; desc: string; }

const PROJECT_TYPES: ProjectType[] = [
  { id: 'graphic-design',  label: 'Graphic Design',     icon: Palette,     desc: 'Illustrations & visual artwork' },
  { id: 'logo',            label: 'Logo Design',         icon: PenTool,     desc: 'Brand marks & wordmarks' },
  { id: 'brand',           label: 'Branding',            icon: Layers,      desc: 'Complete brand identity' },
  { id: 'website',         label: 'Website Design',      icon: Globe,       desc: 'Corporate, portfolio, blog' },
  { id: 'landing-page',    label: 'Landing Pages',       icon: Rocket,      desc: 'High-converting pages' },
  { id: 'social-media',    label: 'Social Media',        icon: Share2,      desc: 'Posts, stories, reels' },
  { id: 'youtube',         label: 'YouTube Thumbnails',  icon: Play,        desc: 'Click-worthy thumbnails' },
  { id: 'poster',          label: 'Posters',             icon: Image,       desc: 'Event, movie, product posters' },
  { id: 'flyer',           label: 'Flyers',              icon: FileText,    desc: 'Promotional print materials' },
  { id: 'business-card',   label: 'Business Cards',      icon: CreditCard,  desc: 'Professional identity cards' },
  { id: 'presentation',    label: 'Presentations',       icon: Monitor,     desc: 'Slides, decks, pitches' },
  { id: 'mobile-app',      label: 'Mobile App UI',       icon: Smartphone,  desc: 'App interfaces & screens' },
  { id: 'ecommerce',       label: 'E-commerce',          icon: ShoppingBag, desc: 'Online store & products' },
];

// Font roles per project — the AI fills these with the selected font + its pairings
const PROJECT_FONT_ROLES: Record<ProjectId, string[]> = {
  'graphic-design': ['Primary Display', 'Secondary Heading', 'Body Text', 'Accent'],
  'logo':           ['Brand Wordmark', 'Tagline', 'Supporting Text'],
  'brand':          ['Brand Name', 'Tagline', 'Body Copy', 'UI Caption'],
  'website':        ['Brand / Nav', 'Page Heading H1', 'Body Text', 'UI Caption'],
  'landing-page':   ['Hero Headline', 'Subheadline', 'Body Paragraph', 'CTA / Button'],
  'social-media':   ['Main Headline', 'Subheading', 'Caption / Handle'],
  'youtube':        ['Thumbnail Title', 'Subtitle Text', 'Channel Tag'],
  'poster':         ['Display Title', 'Secondary Line', 'Body Info', 'Footer / Date'],
  'flyer':          ['Event Headline', 'Subheadline', 'Details / Body', 'Call to Action'],
  'business-card':  ['Name / Brand', 'Job Title', 'Contact Info'],
  'presentation':   ['Slide Title', 'Subtitle', 'Body Content', 'Footnote'],
  'mobile-app':     ['App Brand', 'Screen Title', 'Body / UI', 'Caption'],
  'ecommerce':      ['Store Brand', 'Product Name', 'Description', 'Price / CTA'],
};

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

interface BuiltInFont { name: string; category: FontCategory; }

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
  { name: 'Pacifico',           category: 'script'     },
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
  { name: 'Bebas Neue',         category: 'creative'   },
  { name: 'Spectral',           category: 'vintage'    },
  { name: 'Crimson Pro',        category: 'vintage'    },
  { name: 'Old Standard TT',    category: 'vintage'    },
];

const PAIRING_COLORS = ['#6366F1', '#0EA5E9', '#7C3AED'];

// ── Live Preview Panel ────────────────────────────────────────────────────────

interface PreviewProps { pairing: Pairing; projectType: ProjectId; theme: 'light' | 'dark'; }

function DesignPreviewPanel({ pairing, projectType, theme }: PreviewProps) {
  const dark = theme === 'dark';
  const bg   = dark ? '#0f172a' : '#ffffff';
  const P    = dark ? '#f1f5f9' : '#0f172a';
  const S    = dark ? '#cbd5e1' : '#334155';
  const M    = dark ? '#64748b' : '#94a3b8';
  const Div  = dark ? '#1e293b' : '#f1f5f9';
  const NavBg= dark ? '#1e293b' : '#f8fafc';

  const f0 = `"${pairing.fonts[0]?.font ?? ''}", sans-serif`;
  const f1 = `"${pairing.fonts[1]?.font ?? ''}", sans-serif`;
  const f2 = `"${pairing.fonts[2]?.font ?? ''}", sans-serif`;
  const f3 = pairing.fonts[3] ? `"${pairing.fonts[3].font}", sans-serif` : f1;

  const cls = 'rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/50';

  if (projectType === 'website' || projectType === 'landing-page') {
    return (
      <div className={cls} style={{ backgroundColor: bg }}>
        <div style={{ background: NavBg, borderBottom: `1px solid ${Div}`, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: f0, color: P, fontSize: 12, fontWeight: 700 }}>YourBrand</span>
          <span style={{ marginLeft: 'auto', fontFamily: f2, color: M, fontSize: 9 }}>About · Work · Contact</span>
        </div>
        <div style={{ padding: '16px 14px 14px' }}>
          <p style={{ fontFamily: f0, color: M, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>New Launch</p>
          <p style={{ fontFamily: f1, color: P, fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>Transform Your<br />Business Today</p>
          <p style={{ fontFamily: f2, color: S, fontSize: 11, lineHeight: 1.65, marginBottom: 12 }}>Professional solutions built for modern teams. Trusted by 10,000+ brands worldwide.</p>
          <div style={{ display: 'inline-flex', background: '#6366F1', color: '#fff', borderRadius: 8, padding: '5px 12px' }}>
            <span style={{ fontFamily: f2, fontSize: 10, fontWeight: 600 }}>Get Started →</span>
          </div>
        </div>
      </div>
    );
  }

  if (projectType === 'logo') {
    return (
      <div className={cls} style={{ background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
        <div style={{ textAlign: 'center', padding: '24px 20px' }}>
          <p style={{ fontFamily: f0, color: P, fontSize: 30, lineHeight: 1.1, marginBottom: 6 }}>YourBrand</p>
          <div style={{ height: 1, background: Div, margin: '10px auto', width: 60 }} />
          <p style={{ fontFamily: f1, color: M, fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Premium Studio · Est. 2024</p>
        </div>
      </div>
    );
  }

  if (projectType === 'brand') {
    return (
      <div className={cls} style={{ background: bg, padding: '16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <p style={{ fontFamily: f0, color: '#6366F1', fontSize: 46, fontWeight: 900, lineHeight: 1, width: 42, flexShrink: 0 }}>Y</p>
          <div>
            <p style={{ fontFamily: f0, color: P, fontSize: 17, fontWeight: 700 }}>YourBrand</p>
            <p style={{ fontFamily: f1, color: M, fontSize: 8.5, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Luxury Collection</p>
            <div style={{ height: 1, background: Div, margin: '8px 0' }} />
            <p style={{ fontFamily: f3, color: S, fontSize: 11, fontStyle: 'italic', lineHeight: 1.6 }}>Crafting excellence in every detail.</p>
            <p style={{ fontFamily: f2, color: M, fontSize: 10, lineHeight: 1.5, marginTop: 4 }}>Premium design for discerning brands.</p>
          </div>
        </div>
      </div>
    );
  }

  if (projectType === 'social-media') {
    return (
      <div className={cls} style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
        <div style={{ textAlign: 'center', padding: '20px 16px' }}>
          <p style={{ fontFamily: f0, color: '#fff', fontSize: 26, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase', marginBottom: 8 }}>5 Tips To<br />Grow Fast</p>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.3)', margin: '8px 0' }} />
          <p style={{ fontFamily: f1, color: 'rgba(255,255,255,0.8)', fontSize: 9.5, letterSpacing: '0.08em' }}>@yourbrand · Design Tips</p>
        </div>
      </div>
    );
  }

  if (projectType === 'youtube') {
    return (
      <div className={cls} style={{ background: dark ? '#1a1a2e' : '#0f0f0f', display: 'flex', alignItems: 'center', minHeight: 180 }}>
        <div style={{ padding: '16px 14px' }}>
          <p style={{ fontFamily: f0, color: '#fff', fontSize: 32, fontWeight: 900, lineHeight: 0.95, textTransform: 'uppercase', marginBottom: 10 }}>STOP<br />DOING<br />THIS!</p>
          <div style={{ display: 'inline-flex', background: '#FF0000', borderRadius: 4, padding: '3px 8px', marginBottom: 8 }}>
            <span style={{ fontFamily: f2, color: '#fff', fontSize: 9, fontWeight: 700 }}>▶ WATCH NOW</span>
          </div>
          <p style={{ fontFamily: f1, color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>Mistakes Every Designer Makes</p>
        </div>
      </div>
    );
  }

  if (projectType === 'poster' || projectType === 'flyer') {
    return (
      <div className={cls} style={{ background: bg, padding: '16px 14px' }}>
        <p style={{ fontFamily: f0, color: P, fontSize: 28, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.9, marginBottom: 10 }}>DESIGN<br />EXPO '24</p>
        <div style={{ height: 2, background: '#6366F1', width: 28, marginBottom: 10 }} />
        <p style={{ fontFamily: f1, color: S, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>International Design Festival</p>
        <p style={{ fontFamily: f2, color: M, fontSize: 10, lineHeight: 1.6 }}>15–18 November 2024<br />London Design Centre</p>
        <div style={{ marginTop: 10, background: '#6366F1', color: '#fff', borderRadius: 6, padding: '4px 10px', display: 'inline-block' }}>
          <span style={{ fontFamily: f2, fontSize: 9, fontWeight: 600 }}>Register Now</span>
        </div>
      </div>
    );
  }

  if (projectType === 'business-card') {
    return (
      <div className={cls} style={{ background: dark ? '#1e293b' : '#1a1a2e', padding: '20px 16px', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: f0, color: '#fff', fontSize: 16, fontWeight: 700 }}>Jane Cooper</p>
          <p style={{ fontFamily: f1, color: '#6366F1', fontSize: 10, letterSpacing: '0.08em', marginTop: 2 }}>Creative Director</p>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
          <p style={{ fontFamily: f2, color: 'rgba(255,255,255,0.5)', fontSize: 9, lineHeight: 1.7 }}>jane@yourstudio.com<br />+1 (555) 000-0000<br />www.yourstudio.com</p>
        </div>
      </div>
    );
  }

  if (projectType === 'presentation') {
    return (
      <div className={cls} style={{ background: bg, padding: '16px 14px' }}>
        <div style={{ background: dark ? '#1e293b' : '#f8fafc', borderRadius: 8, padding: '12px', marginBottom: 8 }}>
          <p style={{ fontFamily: f0, color: P, fontSize: 18, fontWeight: 800, lineHeight: 1.1, marginBottom: 4 }}>The Future of<br />Design Systems</p>
          <p style={{ fontFamily: f1, color: '#6366F1', fontSize: 10, fontWeight: 600 }}>Annual Design Summit 2024</p>
        </div>
        {['Scalable components', 'Token-based theming', 'Cross-team alignment'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#6366F1', flexShrink: 0 }} />
            <p style={{ fontFamily: f2, color: S, fontSize: 10 }}>{item}</p>
          </div>
        ))}
        <p style={{ fontFamily: f2, color: M, fontSize: 9, marginTop: 6, borderTop: `1px solid ${Div}`, paddingTop: 6 }}>Slide 4 / 18</p>
      </div>
    );
  }

  if (projectType === 'mobile-app') {
    return (
      <div className={cls} style={{ background: bg }}>
        <div style={{ background: NavBg, padding: '8px 14px', borderBottom: `1px solid ${Div}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: f0, color: P, fontSize: 13, fontWeight: 700 }}>Dashboard</span>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>J</span>
          </div>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontFamily: f1, color: P, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Good morning, Jane 👋</p>
          {[{ l: 'Total Revenue', v: '$12,480' }, { l: 'New Clients', v: '24' }].map(row => (
            <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${Div}` }}>
              <span style={{ fontFamily: f2, color: S, fontSize: 10 }}>{row.l}</span>
              <span style={{ fontFamily: f0, color: P, fontSize: 11, fontWeight: 700 }}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (projectType === 'graphic-design') {
    return (
      <div className={cls} style={{ background: dark ? '#0f172a' : '#fafafa', padding: '16px 14px' }}>
        <p style={{ fontFamily: f0, color: P, fontSize: 32, fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, marginBottom: 10 }}>BOLD<br />IDEAS</p>
        <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', marginBottom: 10 }} />
        <p style={{ fontFamily: f1, color: S, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Creative Direction 2024</p>
        <p style={{ fontFamily: f2, color: M, fontSize: 10, lineHeight: 1.6 }}>Where vision meets execution. Design that moves people and builds brands.</p>
      </div>
    );
  }

  // ecommerce
  return (
    <div className={cls} style={{ background: bg }}>
      <div style={{ background: Div, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${Div}` }}>
        <span style={{ fontFamily: f2, color: M, fontSize: 9 }}>Product Image</span>
      </div>
      <div style={{ padding: '10px 14px' }}>
        <p style={{ fontFamily: f1, color: P, fontSize: 14, fontWeight: 700, lineHeight: 1.2, marginBottom: 2 }}>Premium Canvas Bag</p>
        <p style={{ fontFamily: f3, color: M, fontSize: 10, fontStyle: 'italic', marginBottom: 8 }}>Handcrafted · Sustainable</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: f0, color: '#6366F1', fontSize: 16, fontWeight: 800 }}>$89.00</p>
          <div style={{ background: '#6366F1', color: '#fff', borderRadius: 8, padding: '4px 12px' }}>
            <span style={{ fontFamily: f2, fontSize: 10, fontWeight: 600 }}>Add to Cart</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export const FontDesignResourcesPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const { deductCredits }  = useStore();
  const { getTemplate }    = usePromptStore();
  const { cmsContent }     = useAdminStore();
  const { projectType: urlType } = useParams<{ projectType?: string }>();

  const [mainFont, setMainFont]             = useState('');
  const [customFont, setCustomFont]         = useState('');
  const [activeCategory, setActiveCategory] = useState<FontCategory | 'all'>('all');
  const [projectType, setProjectType]       = useState<ProjectId | ''>('');
  const [result, setResult]                 = useState<AIResult | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [fontPanelOpen, setFontPanelOpen]   = useState(true);
  const [previewTheme, setPreviewTheme]     = useState<'light' | 'dark'>('light');

  const maxRecs = Math.min(3, Math.max(1, parseInt(cmsContent['fdr_max_recs'] ?? '3', 10)));

  // Auto-select project type from URL
  useEffect(() => {
    if (urlType && PROJECT_TYPES.find(p => p.id === urlType)) {
      setProjectType(urlType as ProjectId);
      setResult(null);
      setError('');
    }
  }, [urlType]);

  const selectedFont = customFont.trim() || mainFont;

  // Load Google Fonts when results arrive
  useEffect(() => {
    if (!result) return;
    const toLoad = new Set<string>();
    toLoad.add(selectedFont);
    result.pairings.forEach(p => p.fonts.forEach(f => f.font && toLoad.add(f.font)));
    const families = [...toLoad].filter(Boolean).map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}`).join('&');
    let link = document.getElementById('gfonts-fdr') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id  = 'gfonts-fdr';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }, [result, selectedFont]);

  const allFonts     = BUILT_IN_FONTS;
  const visibleFonts = activeCategory === 'all' ? allFonts : allFonts.filter(f => f.category === activeCategory);

  const generate = async () => {
    if (!selectedFont) { setError('Please select or type a font'); return; }
    if (!projectType)  { setError('Please select a project type'); return; }
    setError('');
    setLoading(true);
    setResult(null);

    const template  = getTemplate('font-design-resources');
    const defaultSys = `You are a world-class typographer and brand designer. Return ONLY valid JSON — no markdown, no explanation.`;

    const pt    = PROJECT_TYPES.find(p => p.id === projectType)!;
    const roles = PROJECT_FONT_ROLES[projectType];

    const prompt = `You are a professional typographer and brand designer.

The user has selected "${selectedFont}" as their primary font for a "${pt.label}" design project.

STEP 1 — Analyze "${selectedFont}":
Classify it and describe its personality, visual weight, and design character.

STEP 2 — Generate ${maxRecs} distinctly different font pairing system${maxRecs > 1 ? 's' : ''} tailored to "${pt.label}".

Font roles for ${pt.label}: ${roles.join(', ')}

The FIRST font slot in every pairing must always be "${selectedFont}" assigned to "${roles[0]}" with isSelected: true.
All remaining fonts must be Google Fonts that pair beautifully with "${selectedFont}" for ${pt.label}.

${maxRecs > 1 ? `Each pairing must use a DIFFERENT typographic approach:
- Pairing 1: Classic Contrast (mix serif + sans-serif for strong visual contrast)
- Pairing 2: Harmonious Unity (similar style family, cohesive feel)
- Pairing 3: Bold & Minimal (striking display hierarchy, clean supporting fonts)` : ''}

Return ONLY valid JSON (no markdown, no code fences):
{
  "fontAnalysis": {
    "classification": "Bold Condensed Display",
    "personality": ["Industrial", "Modern", "Impactful"],
    "visualWeight": "Heavy",
    "bestFor": "Headlines, posters, event branding",
    "characteristics": "1-2 sentences about the font's visual character and emotional impact."
  },
  "pairings": [
    {
      "approach": "Classic Contrast",
      "tagline": "Industrial strength meets editorial refinement",
      "fonts": [
        { "role": "${roles[0]}", "font": "${selectedFont}", "weight": "400", "note": "Your chosen font — sets the visual tone", "isSelected": true }${roles.slice(1).map((r) => `,
        { "role": "${r}", "font": "Google Font Here", "weight": "600", "note": "Brief reason this font works here" }`).join('')}
      ],
      "rationale": "2 sentences explaining exactly why this pairing excels for ${pt.label}.",
      "pairingScore": 92,
      "harmonyScore": 88
    }
  ]
}

Rules:
- Always use "${selectedFont}" as fonts[0] with isSelected: true
- All other fonts must be real, available Google Fonts
- No two fonts in the same pairing should be the same
- pairingScore, harmonyScore: realistic integers 70–98
- Tailor the rationale specifically to ${pt.label} design context`;

    try {
      const response = await callAI({ prompt, systemPrompt: template?.systemPrompt ?? defaultSys, maxTokens: 2200 });
      const json     = extractJSON(response.text);
      const raw      = JSON.parse(json) as Record<string, unknown>;
      if (!raw.pairings || !raw.fontAnalysis) throw new Error('Invalid AI response structure');

      // Sanitize to prevent undefined fields from crashing the renderer
      const fa = (raw.fontAnalysis ?? {}) as Record<string, unknown>;
      const parsed: AIResult = {
        fontAnalysis: {
          classification: String(fa.classification ?? 'Unknown'),
          personality:    Array.isArray(fa.personality) ? (fa.personality as string[]) : [],
          visualWeight:   String(fa.visualWeight    ?? 'Regular'),
          bestFor:        String(fa.bestFor         ?? ''),
          characteristics: String(fa.characteristics ?? ''),
        },
        pairings: (Array.isArray(raw.pairings) ? raw.pairings : [])
          .slice(0, maxRecs)
          .map((p: Record<string, unknown>) => ({
            approach:     String(p.approach     ?? 'Font Pairing'),
            tagline:      String(p.tagline      ?? ''),
            fonts:        Array.isArray(p.fonts)
              ? (p.fonts as Record<string, unknown>[]).map(f => ({
                  role:       String(f.role       ?? ''),
                  font:       String(f.font       ?? ''),
                  weight:     String(f.weight     ?? '400'),
                  note:       String(f.note       ?? ''),
                  isSelected: Boolean(f.isSelected),
                }))
              : [],
            rationale:    String(p.rationale    ?? ''),
            pairingScore: typeof p.pairingScore === 'number' ? p.pairingScore : parseInt(String(p.pairingScore ?? '80'), 10) || 80,
            harmonyScore: typeof p.harmonyScore === 'number' ? p.harmonyScore : parseInt(String(p.harmonyScore ?? '80'), 10) || 80,
          })),
      };
      if (!parsed.pairings.length) throw new Error('No pairings returned');
      setResult(parsed);
      deductCredits(1);
      toast.success(`Font analysis complete — ${parsed.pairings.length} pairing${parsed.pairings.length > 1 ? 's' : ''} generated!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setError(msg.includes('JSON') || msg.includes('Unexpected') ? 'AI response was cut off — please try again.' : msg);
      toast.error('Generation failed');
    }
    setLoading(false);
  };

  const copyPairing = (p: Pairing) => {
    const lines = [
      `=== ${p.approach} ===`,
      p.tagline,
      '',
      ...p.fonts.map(f => `${f.role}: ${f.font} (${f.weight})`),
      '',
      `Why it works: ${p.rationale}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    toast.success('Pairing copied!');
  };

  const googleFontsUrl = (font: string) =>
    `https://fonts.google.com/specimen/${font.trim().replace(/\s+/g, '+')}`;

  const selectedProject = PROJECT_TYPES.find(p => p.id === projectType);

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="flex flex-col lg:flex-row gap-6 min-h-full">

        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <div className="lg:w-64 xl:w-72 flex-shrink-0 space-y-4">

          {/* Brand header */}
          <div className="rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] p-4 text-white shadow-lg shadow-[#6366F1]/25">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={17} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">AI Font Pairing</p>
                <p className="text-white/70 text-[11px] leading-tight mt-0.5">For designers — by project type</p>
              </div>
            </div>
          </div>

          <InlineApiKeySetup />

          {/* Step 1: Font selection */}
          <Card padding="none">
            <button
              onClick={() => setFontPanelOpen(v => !v)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#0d1030]/50 rounded-t-2xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">1</span>
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {selectedFont ? (
                    <span>
                      <span className="text-gray-400 font-normal">Font: </span>
                      <span style={{ fontFamily: `"${selectedFont}", sans-serif` }}>{selectedFont}</span>
                    </span>
                  ) : 'Select Your Font'}
                </span>
              </div>
              {fontPanelOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            {fontPanelOpen && (
              <div className="px-4 pb-4 space-y-3">
                {/* Category pills — all visible */}
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filter by Style</p>
                  <div className="flex flex-wrap gap-1">
                    {FONT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                          activeCategory === cat.id
                            ? 'bg-[#6366F1] text-white'
                            : 'bg-gray-100 dark:bg-[#191c40] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#232650]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grouped font chips */}
                <div className="max-h-52 overflow-y-auto pr-1 space-y-2.5">
                  {activeCategory === 'all' ? (
                    FONT_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                      const fontsInCat = allFonts.filter(f => f.category === cat.id);
                      if (!fontsInCat.length) return null;
                      return (
                        <div key={cat.id}>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 sticky top-0 bg-white dark:bg-[#191c40] py-0.5">
                            {cat.label}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {fontsInCat.map(font => (
                              <button
                                key={font.name}
                                onClick={() => { setMainFont(font.name); setCustomFont(''); setError(''); }}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                                  mainFont === font.name && !customFont
                                    ? 'bg-[#6366F1] border-[#6366F1] text-white'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#6366F1] hover:text-[#6366F1]'
                                }`}
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
                            mainFont === font.name && !customFont
                              ? 'bg-[#6366F1] border-[#6366F1] text-white'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#6366F1] hover:text-[#6366F1]'
                          }`}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-100 dark:bg-[#232650]" />
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                    Or type any font name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Bebas Neue, Futura…"
                    value={customFont}
                    onChange={e => { setCustomFont(e.target.value); setMainFont(''); setError(''); }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Step 2: Project type */}
          <Card padding="none">
            <div className="p-4 border-b border-gray-100 dark:border-[#232650]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">2</span>
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Select Project Type</span>
              </div>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {PROJECT_TYPES.map(pt => {
                const Icon   = pt.icon;
                const active = projectType === pt.id;
                return (
                  <button
                    key={pt.id}
                    onClick={() => { setProjectType(pt.id); setError(''); }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all ${
                      active
                        ? 'border-[#6366F1] bg-[#6366F1]/8 dark:bg-[#6366F1]/12'
                        : 'border-gray-100 dark:border-[#232650] hover:border-[#6366F1]/40 hover:bg-gray-50 dark:hover:bg-[#191c40]'
                    }`}
                  >
                    <Icon size={12} className={active ? 'text-[#6366F1] flex-shrink-0' : 'text-gray-400 flex-shrink-0'} />
                    <p className={`text-[10px] font-semibold leading-tight truncate ${active ? 'text-[#6366F1]' : 'text-gray-600 dark:text-gray-300'}`}>
                      {pt.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
              <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                {error.includes('No API') && (
                  <Link to="/ai-settings" className="text-xs text-[#6366F1] underline mt-1 block">Configure API Keys →</Link>
                )}
              </div>
            </div>
          )}

          {/* Analyze button (mobile — only shown on small screens) */}
          <div className="lg:hidden">
            <Button className="w-full" loading={loading} onClick={generate} disabled={!selectedFont || !projectType} icon={<Sparkles size={13} />}>
              {loading ? 'Analyzing…' : 'Analyze & Pair Fonts'}
            </Button>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-md shadow-[#6366F1]/30 flex-shrink-0">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Font Pairing for Designers</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {result && selectedProject && selectedFont
                    ? `Analyzing "${selectedFont}" for ${selectedProject.label} design`
                    : 'Select a font + project type → AI generates tailored font hierarchies'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {result && (
                <button
                  onClick={() => setPreviewTheme(t => t === 'light' ? 'dark' : 'light')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-[#191c40] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#232650] transition-colors border border-gray-200 dark:border-[#232650]"
                >
                  {previewTheme === 'light' ? <><Moon size={12} /> Dark Preview</> : <><Sun size={12} /> Light Preview</>}
                </button>
              )}
              {result && (
                <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} loading={loading} onClick={generate}>
                  Regenerate
                </Button>
              )}
              <Button size="sm" loading={loading} onClick={generate} disabled={!selectedFont || !projectType} icon={<Sparkles size={13} />}>
                {loading ? 'Analyzing…' : 'Analyze & Pair'}
              </Button>
            </div>
          </div>

          {/* Status bar */}
          {(selectedFont || projectType) && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#191c40] border border-gray-100 dark:border-[#232650] rounded-2xl flex-wrap">
              {selectedFont && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                    <Type size={13} className="text-[#6366F1]" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 leading-none">Your font</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: `"${selectedFont}", sans-serif` }}>
                      {selectedFont}
                    </p>
                  </div>
                  <a href={googleFontsUrl(selectedFont)} target="_blank" rel="noopener noreferrer"
                    className="p-1 rounded-lg text-gray-400 hover:text-[#6366F1] transition-colors">
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
              {selectedFont && projectType && <div className="w-px h-6 bg-gray-200 dark:bg-[#232650]" />}
              {selectedProject && (
                <div className="flex items-center gap-2">
                  <selectedProject.icon size={13} className="text-[#6366F1]" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{selectedProject.label}</p>
                </div>
              )}
              {selectedFont && selectedProject && (
                <p className="text-[10px] text-gray-400 ml-auto hidden sm:block">
                  Font roles: {PROJECT_FONT_ROLES[projectType as ProjectId]?.join(' · ')}
                </p>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              <div className="h-24 rounded-2xl border border-amber-200/40 dark:border-amber-800/20 bg-amber-50/50 dark:bg-amber-950/10 animate-pulse" />
              {[1, 2, 3].slice(0, maxRecs).map(i => (
                <div key={i} className="rounded-2xl border border-gray-100 dark:border-[#232650] bg-white dark:bg-[#191c40] overflow-hidden animate-pulse">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700" />
                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-[#232650]">
                    <div className="lg:w-52 p-4 space-y-2.5 flex-shrink-0">
                      <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    </div>
                    <div className="flex-1 p-4 space-y-2">
                      {[1, 2, 3, 4].map(j => <div key={j} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
                    </div>
                    <div className="lg:w-64 p-4">
                      <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-xl min-h-[180px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Results ───────────────────────────────────────────────────── */}
          {!loading && result && (
            <div className="space-y-4">

              {/* Font Analysis Card */}
              <div className="rounded-2xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/60 dark:bg-amber-950/15 overflow-hidden">
                <div style={{ height: 2, background: 'linear-gradient(90deg, #CA8A04, #F59E0B, #D97706)' }} />
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Star size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">AI Font Analysis</p>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 dark:text-white text-base" style={{ fontFamily: `"${selectedFont}", sans-serif` }}>
                          {selectedFont}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{result.fontAnalysis.classification}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                          {result.fontAnalysis.visualWeight}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2 mb-2">
                        {result.fontAnalysis.personality.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">{result.fontAnalysis.characteristics}</p>
                    </div>
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider">Best For</p>
                      <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 max-w-[120px] text-right leading-snug">{result.fontAnalysis.bestFor}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pairing Cards */}
              {result.pairings.map((pairing, idx) => {
                const accentColor = PAIRING_COLORS[idx % PAIRING_COLORS.length];
                return (
                  <div key={idx} className="rounded-2xl border border-gray-100 dark:border-[#232650] bg-white dark:bg-[#191c40] overflow-hidden shadow-sm">
                    <div style={{ height: 3, backgroundColor: accentColor }} />

                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-[#232650]">

                      {/* Column 1: Identity + Scores */}
                      <div className="lg:w-52 xl:w-56 flex-shrink-0 p-4 space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{pairing.approach}</p>
                          </div>
                          <p className="text-[11px] text-gray-400 italic leading-snug">{pairing.tagline}</p>
                        </div>

                        <div className="space-y-2">
                          {[
                            { label: 'Pairing Score',  value: pairing.pairingScore },
                            { label: 'Harmony Score',  value: pairing.harmonyScore },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <div className="flex justify-between mb-0.5">
                                <span className="text-[10px] text-gray-400">{label}</span>
                                <span className="text-[10px] font-bold" style={{ color: accentColor }}>{value}</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: accentColor }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-stretch gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#0d1030]">
                          <div className="w-0.5 rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: accentColor }} />
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">{pairing.rationale}</p>
                        </div>

                        <button
                          onClick={() => copyPairing(pairing)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors hover:opacity-80"
                          style={{ borderColor: `${accentColor}50`, color: accentColor, backgroundColor: `${accentColor}08` }}
                        >
                          <Copy size={11} /> Copy Pairing
                        </button>
                      </div>

                      {/* Column 2: Font Hierarchy */}
                      <div className="flex-1 p-4 space-y-2 min-w-0">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Font Hierarchy — {selectedProject?.label}
                        </p>
                        {pairing.fonts.map((slot, si) => (
                          <div
                            key={si}
                            className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                              slot.isSelected
                                ? 'bg-[#6366F1]/6 dark:bg-[#6366F1]/10 border border-[#6366F1]/20'
                                : 'bg-gray-50 dark:bg-[#0d1030]'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">{slot.role}</p>
                                {slot.isSelected && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#6366F1]/15 text-[#6366F1] font-bold uppercase tracking-wider">
                                    Your Font
                                  </span>
                                )}
                              </div>
                              <p
                                className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight"
                                style={{ fontFamily: `"${slot.font}", sans-serif` }}
                              >
                                {slot.font}
                              </p>
                              <p className="text-[10px] text-gray-400 leading-tight">{slot.weight} weight · {slot.note}</p>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                onClick={() => { navigator.clipboard.writeText(slot.font); toast.success(`${slot.font} copied!`); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Copy size={11} />
                              </button>
                              {!slot.isSelected && (
                                <a href={googleFontsUrl(slot.font)} target="_blank" rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Column 3: Live Preview */}
                      <div className="lg:w-64 xl:w-72 flex-shrink-0 p-4 flex flex-col gap-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Live Preview</p>
                        <div className="flex-1 min-h-[190px]">
                          <DesignPreviewPanel
                            pairing={pairing}
                            projectType={projectType as ProjectId}
                            theme={previewTheme}
                          />
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
              <div className="w-20 h-20 bg-[#6366F1]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={34} className="text-[#6366F1] opacity-60" />
              </div>
              <p className="font-semibold text-gray-600 dark:text-gray-400">Two steps to your perfect font system</p>
              <div className="flex items-center justify-center gap-3 mt-3 mb-8 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#191c40] border border-gray-100 dark:border-[#232650]">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-black">1</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Select or type your font</span>
                </div>
                <div className="text-gray-300 dark:text-gray-600 text-lg font-light">→</div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#191c40] border border-gray-100 dark:border-[#232650]">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-black">2</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Choose your project type</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">AI analyzes your font's personality and generates complete font hierarchies tailored to your project</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 max-w-2xl mx-auto">
                {PROJECT_TYPES.map(pt => {
                  const Icon = pt.icon;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => { setProjectType(pt.id); setError(''); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-gray-100 dark:border-[#232650] hover:border-[#6366F1]/40 hover:bg-[#6366F1]/5 transition-all group"
                    >
                      <Icon size={16} className="text-gray-400 group-hover:text-[#6366F1] transition-colors" />
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 group-hover:text-[#6366F1] text-center leading-tight transition-colors">
                        {pt.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
