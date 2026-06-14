import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { useAdminStore } from '../../store/useAdminStore';
import { HeroCanvas } from '../../components/ui/HeroCanvas';
import { AuroraCanvas } from '../../components/ui/AuroraCanvas';
import { OrbitCanvas } from '../../components/ui/OrbitCanvas';
import { StarfieldCanvas } from '../../components/ui/StarfieldCanvas';
import { NeonWaveCanvas } from '../../components/ui/NeonWaveCanvas';
import { GeometryCanvas } from '../../components/ui/GeometryCanvas';
import { FirefliesCanvas } from '../../components/ui/FirefliesCanvas';
import { DigitalRainCanvas } from '../../components/ui/DigitalRainCanvas';
import { PlasmaCanvas } from '../../components/ui/PlasmaCanvas';
import {
  Image as ImageIcon, Globe, Hash, ArrowRight,
  CheckCircle, Star, TrendingUp, Shield, Cpu, Users, Sparkles, Play,
  ChevronDown, ChevronUp, Upload, Wand2, Copy,
  BarChart3, Layers, Check, Zap,
  FileText, MessageSquare, Calendar, Calculator,
  Palette, Mic2, Type, Megaphone, Video
} from 'lucide-react';

// â”€â”€â”€ Animated Counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const AnimatedCounter: React.FC<{ end: number; suffix?: string; prefix?: string; duration?: number }> = ({
  end, suffix = '', prefix = '', duration = 2000
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// â”€â”€â”€ Demo Video Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=0&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

const VideoSection: React.FC = () => {
  const { demoVideo } = useAdminStore();
  if (!demoVideo.enabled) return null;

  return (
    <section className="py-20 bg-[#0d1030] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#6366F1] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[#8B5CF6] rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A5B4FC] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10">
            Product Demo
          </span>
          <h2 className="text-4xl font-extrabold text-white mb-4">{demoVideo.title}</h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">{demoVideo.description}</p>
        </div>
        {demoVideo.url ? (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video ring-1 ring-[#6366F1]/20">
            <iframe
              src={getEmbedUrl(demoVideo.url)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={demoVideo.title}
            />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center bg-[#131635] shadow-2xl">
            <div className="text-center px-6">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5 border border-white/20">
                <Play size={28} className="text-white ml-1" fill="white" />
              </div>
              <p className="text-white font-bold text-xl mb-2">Demo Video Coming Soon</p>
              <p className="text-[#71717A] text-sm">Admin can set a YouTube, Vimeo, or self-hosted video URL from the Admin Panel.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// â”€â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FAQS = [
  {
    q: 'Do I need to create an account to use the tools?',
    a: 'No â€” both AI Metadata Generator and Image to Prompt Generator are available in Guest Mode. You can generate immediately without signing up. Creating an account lets you save your history, access all tools, and get 1,000 free credits.',
  },
  {
    q: 'What AI platforms does Image to Prompt support?',
    a: 'We support Midjourney, DALLÂ·E 3, Flux, Stable Diffusion, Ideogram, Adobe Firefly, and a general mode that works for any platform.',
  },
  {
    q: 'Which stock marketplaces does the Metadata Generator support?',
    a: 'Adobe Stock, Shutterstock, Freepik, iStock, Dreamstime, Depositphotos, and Vecteezy â€” each with marketplace-specific formatting requirements.',
  },
  {
    q: 'Can I process multiple images at once?',
    a: 'Yes. Both tools support batch processing. Upload multiple images and generate all prompts or metadata in a single click. The metadata generator supports up to 5 images per batch.',
  },
  {
    q: 'What are Prompt Styles in the Image to Prompt tool?',
    a: 'Prompt Styles control how the AI describes your image. Simple gives you a short 1-2 sentence prompt; Detailed adds lighting, color and composition; Creative adds artistic storytelling; Commercial optimizes for stock photography; Ultra Detailed adds full technical photography specs.',
  },
  {
    q: 'How are credits used?',
    a: 'Each AI generation uses 1 credit. Free accounts receive 1,000 credits on signup. Credits never expire. Additional credit packs are available in the Billing section.',
  },
  {
    q: 'Can I use my own AI API key?',
    a: 'Yes. PixelMind Pro supports bring-your-own-key mode. Configure your OpenAI, Anthropic, or Google Gemini API key in AI Settings and all generations will use your personal key â€” no credits consumed.',
  },
  {
    q: 'Is my uploaded image data stored?',
    a: 'Images are processed in memory and never stored on our servers. They are sent directly to the configured AI model for analysis and discarded immediately after the response is received.',
  },
];

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-[#232650] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-[#191c40]/60 transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-[#6366F1] flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-[#232650] pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ HomePage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const HomePage: React.FC = () => {
  const location = useLocation();
  const { homepageContent, heroAnimationSettings } = useAdminStore();

  useEffect(() => {
    const hash = location.hash || window.location.hash;
    if (hash) {
      const id = hash.slice(1);
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1030]">
      <style>{`
        @keyframes metaBtnGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(165,180,252,0); }
          50%       { box-shadow: 0 0 0 9px rgba(165,180,252,0.22); }
        }
        @keyframes metaCursorFloat {
          0%, 8%   { transform: translateY(0px)    scale(1);    }
          40%      { transform: translateY(-76px)  scale(1);    }
          49%      { transform: translateY(-76px)  scale(0.72); }
          57%      { transform: translateY(-76px)  scale(1);    }
          85%      { transform: translateY(0px)    scale(1);    }
          100%     { transform: translateY(0px)    scale(1);    }
        }
        @keyframes metaClickRing {
          0%, 43%  { transform: translate(-50%,-50%) scale(0);   opacity: 0;   }
          49%      { transform: translate(-50%,-50%) scale(0.3); opacity: 1;   }
          72%      { transform: translate(-50%,-50%) scale(4.2); opacity: 0;   }
          100%     { transform: translate(-50%,-50%) scale(0);   opacity: 0;   }
        }
      `}</style>
      <PublicNavbar />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-[#0d1030]">
                {/* Atmospheric glow blobs — strictly in background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#4338CA]/25 blur-[140px] animate-blob" />
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/20 blur-[120px] animate-blob-2" />
          <div className="absolute -bottom-20 left-1/3 w-[550px] h-[400px] rounded-full bg-[#6366F1]/15 blur-[100px] animate-blob-3" />
        </div>
        {heroAnimationSettings.activeAnimation === 'particles'   && <HeroCanvas />}
        {heroAnimationSettings.activeAnimation === 'aurora'      && <AuroraCanvas />}
        {heroAnimationSettings.activeAnimation === 'orbit'       && <OrbitCanvas />}
        {heroAnimationSettings.activeAnimation === 'starfield'   && <StarfieldCanvas />}
        {heroAnimationSettings.activeAnimation === 'neonwave'    && <NeonWaveCanvas />}
        {heroAnimationSettings.activeAnimation === 'geometry'    && <GeometryCanvas />}
        {heroAnimationSettings.activeAnimation === 'fireflies'   && <FirefliesCanvas />}
        {heroAnimationSettings.activeAnimation === 'digitalrain' && <DigitalRainCanvas />}
        {heroAnimationSettings.activeAnimation === 'plasma'      && <PlasmaCanvas />}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 mb-8 backdrop-blur-sm">
            <Sparkles size={13} className="text-[#A5B4FC]" />
            <span className="text-xs font-semibold text-[#A5B4FC] tracking-wide">
              {homepageContent.heroBadge}
            </span>
          </div>

          {/* Hero headline */}
          <h1 className="mb-7">
            {/* Micro-label */}
            <span className="block text-[11px] sm:text-xs font-bold tracking-[0.28em] uppercase text-[#6366F1]/60 mb-4 select-none">
              {homepageContent.heroMicroLabel}
            </span>

            {/* Line 1 — white, lighter weight */}
            <span className="block text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.08] tracking-tight text-white/85">
              {homepageContent.heroTitleLine1}
            </span>

            {/* Line 2 — vivid gradient, heavier, slightly larger */}
            <span
              className="block text-5xl sm:text-6xl lg:text-[76px] font-black leading-[1.05] tracking-tight pb-2"
              style={{
                background: 'linear-gradient(110deg, #A5B4FC 0%, #C084FC 40%, #818CF8 70%, #E879F9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {homepageContent.heroTitleLine2}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#71717A] max-w-xl mx-auto mb-10 leading-relaxed">
            {homepageContent.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              to="/tools/image-to-prompt"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-base transition-all duration-150 shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 hover:-translate-y-0.5"
            >
              <Wand2 size={18} />
              Start Generating Free
            </Link>
            {/* Try Metadata Generator — animated cursor draws attention */}
            <div className="relative inline-flex">
              <Link
                to="/tools/metadata"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/8 hover:bg-white/15 text-white font-semibold text-base border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-150 hover:-translate-y-0.5"
                style={{ animation: 'metaBtnGlow 3.2s ease-in-out infinite' }}
              >
                <ImageIcon size={18} className="text-[#A5B4FC]" />
                Try Metadata Generator
              </Link>

              {/* Outer div: absolute position below the button, centred */}
              {/* Inner div: runs the float-up + click animation              */}
              <div
                className="absolute pointer-events-none select-none"
                style={{ bottom: '-74px', left: '50%', marginLeft: '-17px' }}
              >
                <div style={{ animation: 'metaCursorFloat 3.2s ease-in-out infinite' }}>
                  {/* Larger arrow cursor SVG */}
                  <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
                    <path
                      d="M3 3L3 29L10 22.5L14 33.5L18 31.5L14 21L22 21L3 3Z"
                      fill="white"
                      stroke="#6366F1"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* Click ripple — expands from the cursor tip */}
                  <div
                    className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-[#A5B4FC]"
                    style={{ animation: 'metaClickRing 3.2s ease-in-out infinite' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-[#71717A]">
            {[
              'No account needed',
              '1,000 free credits on signup',
              'No credit card required',
            ].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <Check size={14} className="text-green-500" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={22} className="text-[#52525B]" />
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TRUST / STATS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-16 bg-[#E8EDF8] dark:bg-[#131635] border-y border-gray-200 dark:border-[#232650]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { end: 2000000,  suffix: '+', label: homepageContent.statsLabel1, icon: <Wand2 size={20} className="text-[#6366F1]" /> },
              { end: 5000000,  suffix: '+', label: homepageContent.statsLabel2,  icon: <Hash size={20} className="text-[#8B5CF6]" /> },
              { end: 50000,    suffix: '+', label: homepageContent.statsLabel3,       icon: <Users size={20} className="text-[#10B981]" /> },
              { end: 12,       suffix: '+', label: homepageContent.statsLabel4,       icon: <Cpu size={20} className="text-[#F59E0B]" /> },
            ].map(({ end, suffix, label, icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-3">{icon}</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
                  <AnimatedCounter end={end} suffix={suffix} />
                </div>
                <p className="text-sm text-[#71717A] font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TOOLS â€” Try Free
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="tools" className="py-24 bg-white dark:bg-[#0d1030]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/15 border border-[#A5B4FC]/30 dark:border-[#6366F1]/20">
              AI Tools
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              {homepageContent.toolsSectionTitle}
            </h2>
            <p className="text-lg text-gray-500 dark:text-[#A1A1AA] max-w-xl mx-auto">
              {homepageContent.toolsSectionSubtitle}
            </p>
          </div>

          {/* Free credits callout */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 border border-[#A5B4FC]/40 dark:border-[#6366F1]/25">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#6366F1]/30">
                <Zap size={18} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#6366F1] dark:text-[#A5B4FC]">50 Free Guest Credits â€” No Signup Needed</p>
                <p className="text-xs text-[#6366F1]/70 dark:text-[#A5B4FC]/60 mt-0.5">Create a free account to get 1,000 credits Â· No credit card required</p>
              </div>
            </div>
          </div>

          {/* Featured tools — 2 column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Image to Prompt */}
            <div className="group relative bg-white dark:bg-[#191c40] border-2 border-[#A5B4FC]/30 dark:border-[#6366F1]/25 hover:border-[#6366F1] dark:hover:border-[#6366F1]/70 rounded-3xl p-8 flex flex-col gap-5 transition-all duration-200 hover:shadow-2xl hover:shadow-[#6366F1]/15 hover:-translate-y-1">
              <div className="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#6366F1] text-white">Most Popular</div>
              <div className="w-14 h-14 rounded-2xl bg-[#6366F1] flex items-center justify-center shadow-lg shadow-[#6366F1]/30">
                <Wand2 size={26} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Image to Prompt Generator</h3>
                <p className="text-sm text-gray-500 dark:text-[#A1A1AA] leading-relaxed">
                  Upload any image and get AI-crafted prompts optimized for Midjourney, DALL&middot;E 3, Flux, Stable Diffusion, Ideogram, and more.
                </p>
              </div>
              <ul className="space-y-2">
                {['5 Prompt Styles (Simple to Ultra Detailed)', 'Supports 8 AI platforms', 'Batch process up to 20 images', 'Clipboard paste (Ctrl+V)'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#A1A1AA]">
                    <CheckCircle size={13} className="text-[#6366F1] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/tools/image-to-prompt"
                className="mt-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-sm transition-all shadow-md shadow-[#6366F1]/25 hover:shadow-lg hover:shadow-[#6366F1]/35"
              >
                <Wand2 size={16} />
                Try Image to Prompt Free
                <ArrowRight size={15} />
              </Link>
              <p className="text-center text-[11px] text-gray-400 dark:text-[#52525B]">50 guest credits &middot; No login required</p>
            </div>

            {/* Metadata Generator */}
            <div className="group relative bg-white dark:bg-[#191c40] border-2 border-[#C4B5FD]/30 dark:border-[#8B5CF6]/25 hover:border-[#8B5CF6] dark:hover:border-[#8B5CF6]/70 rounded-3xl p-8 flex flex-col gap-5 transition-all duration-200 hover:shadow-2xl hover:shadow-[#8B5CF6]/15 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30">
                <Hash size={26} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Metadata Generator</h3>
                <p className="text-sm text-gray-500 dark:text-[#A1A1AA] leading-relaxed">
                  Generate SEO-perfect titles, descriptions, and keyword sets for 7 major stock marketplaces in seconds.
                </p>
              </div>
              <ul className="space-y-2">
                {['Adobe Stock, Shutterstock, Freepik & 4 more', 'Marketplace-specific keyword limits', 'Score-rated output quality', 'CSV export for bulk uploads'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#A1A1AA]">
                    <CheckCircle size={13} className="text-[#8B5CF6] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/tools/metadata"
                className="mt-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-sm transition-all shadow-md shadow-[#8B5CF6]/25 hover:shadow-lg hover:shadow-[#8B5CF6]/35"
              >
                <Hash size={16} />
                Try Metadata Generator Free
                <ArrowRight size={15} />
              </Link>
              <p className="text-center text-[11px] text-gray-400 dark:text-[#52525B]">50 guest credits &middot; No login required</p>
            </div>
          </div>

          {/* Additional tools — organized by category */}
          {[
            {
              emoji: '⚡', label: 'Core AI Tools',
              tools: [
                { icon: <FileText size={20} />, color: '#059669', title: 'AI Content Writer',  desc: 'Blog posts, product descriptions, and marketing copy with tone and style control.', path: '/tools/content-writer' },
                { icon: <MessageSquare size={20} />, color: '#EF4444', title: 'Slogan Generator', desc: 'Create catchy brand slogans in 6 styles for any industry with AI.', path: '/tools/slogan-generator' },
                { icon: <Hash size={20} />, color: '#F59E0B', title: 'Word Counter', desc: 'Count words, characters, sentences, and reading time in any text.', path: '/tools/word-counter' },
                { icon: <Calculator size={20} />, color: '#8B5CF6', title: 'Age Calculator', desc: 'Exact age breakdown with zodiac sign, birthday countdown, and live ticker.', path: '/tools/age-calculator' },
                { icon: <Calendar size={20} />, color: '#06B6D4', title: 'Event Calendar', desc: 'Global holidays and events for content planning across 10+ countries.', path: '/tools/event-calendar' },
              ],
            },
            {
              emoji: '🎨', label: 'Color & Branding',
              tools: [
                { icon: <Palette size={20} />, color: '#EC4899', title: 'AI Color Palette Generator', desc: 'Generate 3 professional brand color palettes from any concept or description.', path: '/tools/color-palette' },
                { icon: <Mic2 size={20} />, color: '#8B5CF6', title: 'Brand Voice & Slogans', desc: 'Create your brand voice, taglines, slogans, and marketing hooks with AI.', path: '/tools/brand-voice' },
              ],
            },
            {
              emoji: '✍️', label: 'Typography & Fonts',
              tools: [
                { icon: <Type size={20} />, color: '#0EA5E9', title: 'AI Font Pairing Assistant', desc: 'Discover perfect Google Font combinations for any design style with harmony scores.', path: '/tools/font-pairing' },
              ],
            },
            {
              emoji: '📣', label: 'Marketing & Copywriting',
              tools: [
                { icon: <Megaphone size={20} />, color: '#F59E0B', title: 'Social Media Ad Copywriter', desc: 'Generate high-converting ad copy for Facebook, Instagram, TikTok, and more.', path: '/tools/ad-copywriter' },
                { icon: <Video size={20} />, color: '#EC4899', title: 'Shorts & Reels Script Writer', desc: 'Write viral short-form video sales scripts for TikTok, Reels, and YouTube Shorts.', path: '/tools/sales-script' },
              ],
            },
          ].map(category => (
            <div key={category.label} className="mb-8">
              {/* Category label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">{category.emoji}</span>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{category.label}</h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-[#232650]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.tools.map(tool => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className="group flex flex-col gap-3 bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] hover:border-[#A5B4FC] dark:hover:border-[#6366F1]/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: tool.color }}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{tool.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-[#A1A1AA] leading-relaxed">{tool.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: tool.color }}>
                      Try free <ArrowRight size={12} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <p className="text-center text-sm text-gray-400 dark:text-[#52525B] mt-8">
            Enjoyed the tools?{' '}
            <Link to="/register" className="text-[#6366F1] hover:underline font-medium">Create a free account</Link>
            {' '}to get 1,000 credits and save your work.
          </p>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FEATURES
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-28 bg-[#080C20] relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-[#6366F1]/10 blur-[120px]" />
          <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/8 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #A5B4FC 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 mb-5">
              <Sparkles size={12} className="text-[#A5B4FC]" />
              <span className="text-xs font-semibold text-[#A5B4FC] uppercase tracking-widest">Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5">
              {homepageContent.featuresTitle}
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              {homepageContent.featuresSubtitle}
            </p>
          </div>

          {/* Bento Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Link
              to="/tools/image-to-prompt"
              className="group relative rounded-3xl p-8 bg-[#0E1236] border border-[#1C2151] hover:border-[#6366F1]/50 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/70 to-transparent" />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 10% 0%, rgba(99,102,241,0.13), transparent)' }} />
              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4338CA] flex items-center justify-center shadow-lg shadow-[#6366F1]/35">
                    <Wand2 size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#6366F1] text-white tracking-wide uppercase">Most Popular</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Image to Prompt Generator</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-7">
                  Upload any image and get AI-crafted prompts for Midjourney, DALL&middot;E 3, Flux, Stable Diffusion, and more &mdash; instantly.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    '8 AI platforms — Midjourney, DALL·E 3, Flux & more',
                    '5 prompt styles from Simple to Ultra Detailed',
                    'Batch process up to 20 images at once',
                    'Clipboard paste support (Ctrl+V)',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                      <div className="w-5 h-5 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-[#A5B4FC]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#A5B4FC] group-hover:gap-3 transition-all">
                  Try it free <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </Link>

            <Link
              to="/tools/metadata"
              className="group relative rounded-3xl p-8 bg-[#0E1236] border border-[#1C2151] hover:border-[#8B5CF6]/50 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/70 to-transparent" />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 10% 0%, rgba(139,92,246,0.13), transparent)' }} />
              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/35">
                    <Hash size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30 tracking-wide uppercase">SEO Ready</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Metadata Generator</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-7">
                  Generate SEO-perfect titles, descriptions, and keyword sets for 7 major stock marketplaces in seconds. No guesswork.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Adobe Stock, Shutterstock, Freepik & 4 more',
                    'Marketplace-specific keyword count limits',
                    'Quality score rating on every output',
                    'CSV export for bulk platform submission',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                      <div className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-[#C4B5FD]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#C4B5FD] group-hover:gap-3 transition-all">
                  Try it free <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </Link>
          </div>

          {/* Bento Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Layers size={18} />, color: '#F59E0B', glowRgb: '245,158,11', title: 'Prompt Styles', desc: '5 output levels from Simple to Ultra Detailed — tuned to your exact creative use case.', href: '/tools/image-to-prompt' },
              { icon: <Globe size={18} />, color: '#10B981', glowRgb: '16,185,129', title: 'Multi-Platform', desc: 'Platform-native syntax for every AI generator. No reformatting, no guesswork.', href: '/tools/image-to-prompt' },
              { icon: <Cpu size={18} />, color: '#EF4444', glowRgb: '239,68,68', title: 'Vision AI', desc: 'Powered by the latest multimodal models with deep, precise visual understanding.', href: '/tools/metadata' },
              { icon: <BarChart3 size={18} />, color: '#06B6D4', glowRgb: '6,182,212', title: 'Batch Workflow', desc: 'Process many images at once. Export CSV for instant stock platform submission.', href: '/tools/metadata' },
            ].map(feat => (
              <Link
                key={feat.title}
                to={feat.href}
                className="group relative rounded-2xl p-5 bg-[#0E1236] border border-[#1C2151] hover:border-[#2A3060] transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse 100% 60% at 0% 0%, rgba(${feat.glowRgb},0.10), transparent 70%)` }}
                />
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white"
                    style={{ backgroundColor: feat.color, boxShadow: `0 4px 14px rgba(${feat.glowRgb},0.35)` }}
                  >
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2">{feat.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{feat.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: feat.color }}>
                    Explore <ArrowRight size={11} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HOW IT WORKS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-24 bg-[#E8EDF8] dark:bg-[#131635]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/15 border border-[#A5B4FC]/30 dark:border-[#6366F1]/20">
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              From Image to Output in Seconds
            </h2>
            <p className="text-lg text-gray-500 dark:text-[#A1A1AA]">
              Four simple steps. No learning curve required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: <Upload size={24} />, color: '#6366F1', title: 'Upload Image', desc: 'Drop an image, paste from clipboard, or browse your files. Multiple images supported.' },
              { step: '02', icon: <Wand2 size={24} />, color: '#8B5CF6', title: 'Select Settings', desc: 'Choose your target AI platform, aspect ratio, and prompt style.' },
              { step: '03', icon: <Cpu size={24} />, color: '#10B981', title: 'AI Generation', desc: 'Our vision AI analyzes your image and generates perfectly formatted output in seconds.' },
              { step: '04', icon: <Copy size={24} />, color: '#F59E0B', title: 'Copy & Export', desc: 'Copy prompts or metadata instantly. Export all results as CSV for bulk workflows.' },
            ].map((item, idx) => (
              <div key={item.step} className="relative">
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t-2 border-dashed border-gray-300 dark:border-[#232650] z-0 -translate-x-1/2" />
                )}
                <div className="relative z-10 bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] rounded-2xl p-6 text-center hover:border-gray-300 dark:hover:border-[#2f3260] transition-colors">
                  <div className="text-xs font-black text-gray-300 dark:text-[#2f3260] mb-3 tracking-widest">{item.step}</div>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg"
                    style={{ backgroundColor: item.color, boxShadow: `0 8px 24px ${item.color}40` }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-[#A1A1AA] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TESTIMONIALS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-24 bg-[#E8EDF8] dark:bg-[#131635]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/15 border border-[#A5B4FC]/30 dark:border-[#6366F1]/20">
              Testimonials
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Creators Love PixelMind Pro
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah K.',
                role: 'Stock Photographer Â· Adobe Stock',
                avatar: 'SK',
                color: '#6366F1',
                stars: 5,
                text: "The metadata generator has completely transformed my stock workflow. I used to spend 20 minutes per image â€” now it's done in seconds, and the keywords are genuinely better than what I was writing manually.",
              },
              {
                name: 'Marcus T.',
                role: 'AI Art Creator Â· Midjourney',
                avatar: 'MT',
                color: '#8B5CF6',
                stars: 5,
                text: "Image to Prompt is insane. I upload a reference photo and get back a Midjourney prompt that actually recreates the vibe of the original image. The platform-specific formatting saves so much time.",
              },
              {
                name: 'Priya N.',
                role: 'Freelance Designer Â· Multiple Platforms',
                avatar: 'PN',
                color: '#10B981',
                stars: 5,
                text: "I use both tools daily. The batch processing is a game changer â€” I can process 20 images at once. The guest mode is great too, I could try everything before committing to an account.",
              },
            ].map(t => (
              <div key={t.name} className="bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] rounded-2xl p-6 flex flex-col gap-4 hover:border-gray-300 dark:hover:border-[#2f3260] transition-colors">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400" fill="#FBBF24" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-[#A1A1AA] leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-[#232650]">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-400 dark:text-[#71717A]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          VIDEO (admin-controlled)
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <VideoSection />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FAQ
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-24 bg-white dark:bg-[#0d1030]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/15 border border-[#A5B4FC]/30 dark:border-[#6366F1]/20">
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-500 dark:text-[#A1A1AA]">
              Everything you need to know before you start.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map(faq => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FINAL CTA
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-24 bg-[#0d1030] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-[#6366F1]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-[#8B5CF6]/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 mb-8">
            <Sparkles size={13} className="text-[#A5B4FC]" />
            <span className="text-xs font-semibold text-[#A5B4FC] tracking-wide">Get Started Today â€” It's Free</span>
          </div>

                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            {homepageContent.ctaTitle}
          </h2>

          <p className="text-lg text-[#A1A1AA] mb-10 max-w-2xl mx-auto leading-relaxed">
            {homepageContent.ctaSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              to="/register"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-base transition-all duration-150 shadow-xl shadow-[#6366F1]/40 hover:shadow-2xl hover:shadow-[#6366F1]/50 hover:-translate-y-0.5"
            >
              <Users size={18} />
              Create Free Account
            </Link>
            <Link
              to="/tools/image-to-prompt"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white/8 hover:bg-white/15 text-white font-semibold text-base border border-white/15 hover:border-white/25 transition-all duration-150 hover:-translate-y-0.5"
            >
              <Wand2 size={18} />
              Start Without Account
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#71717A]">
            {[
              { icon: <Shield size={13} className="text-[#A5B4FC]" />, text: 'Images never stored' },
              { icon: <CheckCircle size={13} className="text-green-400" />, text: '1,000 free credits on signup' },
              { icon: <TrendingUp size={13} className="text-[#A5B4FC]" />, text: 'New tools added regularly' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                {icon}
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
