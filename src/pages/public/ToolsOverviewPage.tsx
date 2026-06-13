import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import {
  Image, Calendar, Sparkles, Calculator, Tag,
  ArrowRight, Zap, Hash, Palette, Mic2, Type, Megaphone, Video,
  FileText
} from 'lucide-react';

interface Tool {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  badge: string;
  color: string;
  bg: string;
  darkBg: string;
  stats: string;
}

interface Category {
  id: string;
  label: string;
  emoji: string;
  description: string;
  tools: Tool[];
}

const CATEGORIES: Category[] = [
  {
    id: 'core',
    label: 'Core AI Tools',
    emoji: '⚡',
    description: 'Powerful AI tools for stock photographers and content creators',
    tools: [
      {
        icon: <Image size={28} />,
        title: 'AI Metadata Generator',
        description: 'Generate optimized titles, descriptions & keywords for stock photos across 7 major marketplaces. Batch up to 150 images at once.',
        path: '/tools/metadata',
        badge: 'Core',
        color: '#6366F1',
        bg: '#EEF2FF',
        darkBg: '#6366F1/15',
        stats: '150 images/batch',
      },
      {
        icon: <Sparkles size={28} />,
        title: 'Image to Prompt',
        description: 'Reverse-engineer any image into a platform-optimized AI art prompt for Midjourney, DALL·E, Flux, Stable Diffusion, and more.',
        path: '/tools/image-to-prompt',
        badge: 'AI Vision',
        color: '#7C3AED',
        bg: '#F3F0FF',
        darkBg: '#7C3AED/15',
        stats: '6 AI platforms',
      },
      {
        icon: <FileText size={28} />,
        title: 'AI Content Writer',
        description: 'Write blog posts, product descriptions, social media content, and marketing copy with advanced AI models.',
        path: '/tools/content-writer',
        badge: 'Writing',
        color: '#059669',
        bg: '#ECFDF5',
        darkBg: '#059669/15',
        stats: 'Multiple formats',
      },
      {
        icon: <Tag size={28} />,
        title: 'AI Slogan Generator',
        description: 'Create powerful brand slogans in 6 styles: Professional, Creative, Luxury, Marketing, Modern, and Minimalist.',
        path: '/tools/slogan-generator',
        badge: 'Branding',
        color: '#D97706',
        bg: '#FFFBEB',
        darkBg: '#D97706/15',
        stats: '6 styles',
      },
      {
        icon: <Hash size={28} />,
        title: 'Word Counter',
        description: 'Real-time word, character, sentence, and paragraph counter with reading time estimation and keyword density.',
        path: '/tools/word-counter',
        badge: 'Utility',
        color: '#0EA5E9',
        bg: '#E0F2FE',
        darkBg: '#0EA5E9/15',
        stats: 'Real-time analysis',
      },
      {
        icon: <Calendar size={28} />,
        title: 'Event Calendar',
        description: 'Plan content around global holidays. Supports Bangladesh, USA, UK, Canada, Australia, India and 10+ countries.',
        path: '/tools/event-calendar',
        badge: 'Planning',
        color: '#DC2626',
        bg: '#FEF2F2',
        darkBg: '#DC2626/15',
        stats: '10+ countries',
      },
      {
        icon: <Calculator size={28} />,
        title: 'Age Calculator',
        description: 'Calculate exact age with live second counter, zodiac sign, birthday countdown, and complete age breakdown.',
        path: '/tools/age-calculator',
        badge: 'Utility',
        color: '#BE185D',
        bg: '#FDF2F8',
        darkBg: '#BE185D/15',
        stats: 'Live ticker',
      },
    ],
  },
  {
    id: 'branding',
    label: 'Color & Branding',
    emoji: '🎨',
    description: 'Build a compelling brand identity with AI-powered color and messaging tools',
    tools: [
      {
        icon: <Palette size={28} />,
        title: 'AI Color Palette Generator',
        description: 'Describe your brand concept and instantly get 3 professional color palettes with HEX codes, brand mood, dark/light previews, and CSS export.',
        path: '/tools/color-palette',
        badge: 'New',
        color: '#EC4899',
        bg: '#FDF2F8',
        darkBg: '#EC4899/15',
        stats: '3 palettes + CSS export',
      },
      {
        icon: <Mic2 size={28} />,
        title: 'Brand Voice & Slogan Matcher',
        description: 'Generate your complete brand voice package — tagline, 5 slogan variations, 3 marketing hooks, and a brand positioning statement.',
        path: '/tools/brand-voice',
        badge: 'New',
        color: '#8B5CF6',
        bg: '#F3F0FF',
        darkBg: '#8B5CF6/15',
        stats: 'Full brand package',
      },
    ],
  },
  {
    id: 'typography',
    label: 'Typography & Fonts',
    emoji: '✍️',
    description: 'Find perfect font combinations for any design project',
    tools: [
      {
        icon: <Type size={28} />,
        title: 'AI Font Pairing Assistant',
        description: 'Select any Google Font and discover 3 perfect pairing sets — heading, subheading, and body — with pairing scores, design styles, and Google Fonts links.',
        path: '/tools/font-pairing',
        badge: 'New',
        color: '#0EA5E9',
        bg: '#E0F2FE',
        darkBg: '#0EA5E9/15',
        stats: '3 curated sets',
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Copywriting',
    emoji: '📣',
    description: 'Create high-converting marketing content for every channel',
    tools: [
      {
        icon: <Megaphone size={28} />,
        title: 'Social Media Ad Copywriter',
        description: 'Generate 3 high-converting ad copy variations for Facebook, Instagram, TikTok, LinkedIn, Pinterest, and Google Ads — with headline, body, CTA, and discount text.',
        path: '/tools/ad-copywriter',
        badge: 'New',
        color: '#F59E0B',
        bg: '#FFFBEB',
        darkBg: '#F59E0B/15',
        stats: '6 platforms · 3 variations',
      },
      {
        icon: <Video size={28} />,
        title: 'Shorts & Reels Script Writer',
        description: 'Write viral-ready sales scripts for TikTok, Instagram Reels, and YouTube Shorts in 30, 45, or 60 seconds — complete with hook, problem, CTA, and viral hook alternatives.',
        path: '/tools/sales-script',
        badge: 'New',
        color: '#EC4899',
        bg: '#FDF2F8',
        darkBg: '#EC4899/15',
        stats: '3 platforms · 30–60s',
      },
    ],
  },
];

const TOTAL_TOOLS = CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0);

export const ToolsOverviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1030]">
      <PublicNavbar />
      <div className="pt-20">

        {/* Hero */}
        <section className="py-16 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#EEF2FF] dark:bg-[#6366F1]/20 text-[#6366F1] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Zap size={14} /> {TOTAL_TOOLS} AI-Powered Tools
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
              A Complete AI Suite for<br />
              <span className="text-[#6366F1]">Creators & Marketers</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              From stock photography metadata to viral video scripts — everything you need to create, brand, and market. No account required to start.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#6366F1] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#5558E3] transition-colors"
              >
                Get Started Free <ArrowRight size={16} />
              </Link>
              <p className="text-sm text-gray-400 dark:text-gray-500">50 free guest credits · No signup needed</p>
            </div>
          </div>
        </section>

        {/* Category Sections */}
        <section className="pb-24 px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {CATEGORIES.map(category => (
              <div key={category.id}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.emoji}</span>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{category.label}</h2>
                    <span className="text-sm font-semibold text-gray-400 bg-gray-100 dark:bg-[#191c40] px-2.5 py-0.5 rounded-full">
                      {category.tools.length} tool{category.tools.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 -mt-4 mb-6">{category.description}</p>

                {/* Tools Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tools.map(tool => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="group bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 hover:border-transparent"
                      style={{ '--hover-shadow': `0 20px 40px ${tool.color}20` } as React.CSSProperties}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: tool.bg, color: tool.color }}
                        >
                          {tool.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Title + Badge */}
                          <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{tool.title}</h3>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                              style={{ backgroundColor: tool.bg, color: tool.color }}
                            >
                              {tool.badge}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tool.description}</p>

                          {/* Footer */}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] font-semibold" style={{ color: tool.color }}>
                              {tool.stats}
                            </span>
                            <span
                              className="text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: tool.color }}
                            >
                              Try free <ArrowRight size={11} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl p-10 text-white">
              <h2 className="text-3xl font-extrabold mb-3">All {TOTAL_TOOLS} Tools. One Account.</h2>
              <p className="text-white/75 mb-6">Sign up for free and get 1,000 credits monthly — no credit card required.</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-[#6366F1] font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Create Free Account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
