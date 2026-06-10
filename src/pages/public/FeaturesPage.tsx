import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import {
  MessageSquare, Calendar, Zap, Shield,
  BarChart3, Sparkles, ArrowRight, Check,
  Hash, Wand2, FileText, ChevronRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Hash size={26} />,
    title: 'AI Metadata Generator',
    description: 'Generate SEO-optimized titles, descriptions, and keywords for stock photos — tailored to each marketplace\'s exact requirements.',
    highlights: ['7 Marketplace Formats', 'Batch up to 150 Images', 'Custom Keyword Styles', 'CSV / JSON / TXT Export'],
    color: '#6366F1',
    glowRgb: '99,102,241',
    href: '/tools/metadata',
    badge: 'Core Tool',
  },
  {
    icon: <Wand2 size={26} />,
    title: 'Image to Prompt Generator',
    description: 'Reverse-engineer your images into platform-optimized AI art prompts for Midjourney, DALL·E, Flux, Stable Diffusion, and more.',
    highlights: ['8 AI Platforms', 'Platform-specific Syntax', '5 Prompt Styles', 'One-click Copy'],
    color: '#7C3AED',
    glowRgb: '124,58,237',
    href: '/tools/image-to-prompt',
    badge: 'Most Popular',
  },
  {
    icon: <FileText size={22} />,
    title: 'AI Content Writer',
    description: 'Write blog posts, social media content, product descriptions, and more with advanced AI — with tone, style, and format control.',
    highlights: ['Multiple Content Types', 'Tone & Style Control', 'SEO Optimized', 'Real-time Generation'],
    color: '#059669',
    glowRgb: '5,150,105',
    href: '/tools/content-writer',
    badge: null,
  },
  {
    icon: <MessageSquare size={22} />,
    title: 'AI Slogan Generator',
    description: 'Create powerful brand slogans with AI. Choose from professional, creative, luxury, marketing, modern, and minimalist styles.',
    highlights: ['6 Slogan Styles', 'Industry-specific', 'Length Control', 'Bulk Generation'],
    color: '#D97706',
    glowRgb: '217,119,6',
    href: '/tools/slogan-generator',
    badge: null,
  },
  {
    icon: <Calendar size={22} />,
    title: 'Event Calendar',
    description: 'Plan your content around global holidays and events. Covers Bangladesh, USA, UK, Canada, Australia, India and more.',
    highlights: ['Multi-country Holidays', 'Content Planning', 'Holiday Countdown', 'Category Filters'],
    color: '#DC2626',
    glowRgb: '220,38,38',
    href: '/tools/event-calendar',
    badge: null,
  },
  {
    icon: <Zap size={22} />,
    title: 'Multi-Provider AI',
    description: 'Connect your own API keys from OpenAI, Claude, Gemini, Groq, OpenRouter, HuggingFace, or any OpenAI-compatible endpoint.',
    highlights: ['7 AI Providers', 'Priority Fallback', 'Personal API Keys', 'Connection Testing'],
    color: '#0EA5E9',
    glowRgb: '14,165,233',
    href: '/dashboard/ai-settings',
    badge: null,
  },
  {
    icon: <Shield size={22} />,
    title: 'Admin Panel',
    description: 'Full admin dashboard with user management, prompt templates, credit management, subscription tracking, and global settings.',
    highlights: ['User Management', 'Prompt Templates', 'Credit Control', 'System Settings'],
    color: '#6B21A8',
    glowRgb: '107,33,168',
    href: '/admin',
    badge: null,
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Age Calculator',
    description: 'Calculate exact age in years, months, days, hours, minutes, and seconds — with zodiac sign, next birthday countdown, and a live ticker.',
    highlights: ['Live Second Counter', 'Zodiac Sign', 'Birthday Countdown', 'Full Age Breakdown'],
    color: '#BE185D',
    glowRgb: '190,24,93',
    href: '/tools/age-calculator',
    badge: null,
  },
];

const STATS = [
  { value: '8+', label: 'AI Tools' },
  { value: '7', label: 'AI Providers' },
  { value: '50K+', label: 'Active Users' },
  { value: '5M+', label: 'Outputs Generated' },
];

export const FeaturesPage: React.FC = () => {
  const heroFeatures = FEATURES.slice(0, 2);
  const gridFeatures = FEATURES.slice(2);

  return (
    <div className="min-h-screen bg-[#080C20]">
      <PublicNavbar />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full bg-[#6366F1]/12 blur-[130px]" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-[#7C3AED]/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #A5B4FC 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 mb-6">
            <Sparkles size={12} className="text-[#A5B4FC]" />
            <span className="text-xs font-semibold text-[#A5B4FC] uppercase tracking-widest">Complete Feature Set</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-extrabold leading-[1.08] tracking-tight text-white mb-6">
            Everything You Need to{' '}
            <span
              style={{
                background: 'linear-gradient(110deg, #A5B4FC 0%, #C084FC 40%, #818CF8 70%, #E879F9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Scale Your Workflow
            </span>
          </h1>

          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed mb-10">
            PixelMind AI brings together the most powerful AI tools for content creators, stock photographers, and digital marketers — in one workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link
              to="/register"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-base transition-all shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 hover:-translate-y-0.5"
            >
              <Zap size={17} />
              Start Free — No Card Required
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/6 hover:bg-white/10 text-white font-semibold text-base border border-white/12 hover:border-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5"
            >
              View Pricing
              <ChevronRight size={16} className="text-[#A5B4FC]" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="inline-flex flex-wrap justify-center gap-8 px-8 py-4 rounded-2xl bg-white/4 border border-white/8 backdrop-blur-sm">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-[#6B7280] font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HERO FEATURE CARDS ───────────────────────────────────────── */}
      <section className="pb-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
          {heroFeatures.map(feat => (
            <Link
              key={feat.title}
              to={feat.href}
              className="group relative rounded-3xl p-8 bg-[#0E1236] border border-[#1C2151] hover:border-opacity-60 transition-all duration-300 overflow-hidden flex flex-col"
              style={{ '--hover-border': feat.color } as React.CSSProperties}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${feat.color}80`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
            >
              {/* Top glow line */}
              <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${feat.color}B0, transparent)` }} />
              {/* Radial hover glow */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse 80% 50% at 10% 0%, rgba(${feat.glowRgb},0.12), transparent)` }}
              />

              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${feat.color}, ${feat.color}CC)`, boxShadow: `0 8px 24px rgba(${feat.glowRgb},0.35)` }}
                  >
                    {feat.icon}
                  </div>
                  {feat.badge && (
                    <span
                      className="text-[10px] font-bold px-3 py-1 rounded-full text-white tracking-wide uppercase"
                      style={{ backgroundColor: feat.color }}
                    >
                      {feat.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-7">{feat.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-8">
                  {feat.highlights.map(h => (
                    <div key={h} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `rgba(${feat.glowRgb},0.20)`, border: `1px solid rgba(${feat.glowRgb},0.30)` }}
                      >
                        <Check size={9} style={{ color: feat.color }} />
                      </div>
                      <span className="text-xs text-[#9CA3AF]">{h}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-auto flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
                  style={{ color: feat.color }}
                >
                  Try it free <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── SECONDARY FEATURE GRID ───────────────────────────────────── */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gridFeatures.map(feat => (
            <Link
              key={feat.title}
              to={feat.href}
              className="group relative rounded-2xl p-6 bg-[#0E1236] border border-[#1C2151] transition-all duration-300 overflow-hidden flex flex-col"
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${feat.color}60`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
            >
              {/* Top glow line */}
              <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to right, transparent, ${feat.color}80, transparent)` }} />
              {/* Radial hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse 100% 60% at 0% 0%, rgba(${feat.glowRgb},0.09), transparent 70%)` }}
              />

              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: feat.color, boxShadow: `0 4px 16px rgba(${feat.glowRgb},0.35)` }}
                  >
                    {feat.icon}
                  </div>
                  {feat.badge && (
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white tracking-wide uppercase"
                      style={{ backgroundColor: feat.color }}
                    >
                      {feat.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-5 flex-1">{feat.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {feat.highlights.map(h => (
                    <span
                      key={h}
                      className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                      style={{ background: `rgba(${feat.glowRgb},0.12)`, color: feat.color, border: `1px solid rgba(${feat.glowRgb},0.20)` }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <div
                  className="flex items-center gap-1.5 mt-5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: feat.color }}
                >
                  Explore <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl p-12 bg-[#0E1236] border border-[#1C2151] overflow-hidden">
            {/* Glow blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#6366F1]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#8B5CF6]/10 blur-3xl pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/60 to-transparent" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4338CA] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#6366F1]/35">
                <Zap size={24} className="text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-[#6B7280] text-lg mb-8 leading-relaxed">
                Join 50,000+ creators. Start with 50 free guest credits — no account required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/tools/image-to-prompt"
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-base transition-all shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 hover:-translate-y-0.5"
                >
                  <Wand2 size={17} />
                  Start for Free
                </Link>
                <Link
                  to="/pricing"
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/6 hover:bg-white/10 text-white font-semibold text-base border border-white/12 hover:border-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5"
                >
                  See Pricing
                  <ChevronRight size={16} className="text-[#A5B4FC]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
