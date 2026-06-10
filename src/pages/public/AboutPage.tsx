import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { useAdminStore } from '../../store/useAdminStore';
import { Zap, Globe, Shield, ArrowRight, Sparkles } from 'lucide-react';

const VALUES = [
  {
    icon: <Zap size={22} />,
    title: 'Powered by Best-in-Class AI',
    description: 'Integrated with OpenAI, Anthropic Claude, Google Gemini, Groq, and more — giving you access to the latest AI capabilities in one unified platform.',
    color: '#6366F1', bg: 'bg-[#EEF2FF] dark:bg-[#6366F1]/15',
  },
  {
    icon: <Globe size={22} />,
    title: 'Built for Global Creators',
    description: 'Tools designed to support creators worldwide — multi-language support, global marketplace integrations, and multi-country event data.',
    color: '#7C3AED', bg: 'bg-[#F3F0FF] dark:bg-[#7C3AED]/15',
  },
  {
    icon: <Shield size={22} />,
    title: 'Your Data, Your Keys',
    description: 'Your API keys never leave your browser. Nothing stored server-side. You keep full control of your AI costs, usage, and privacy.',
    color: '#059669', bg: 'bg-[#ECFDF5] dark:bg-[#059669]/15',
  },
];

export const AboutPage: React.FC = () => {
  const { aboutSection } = useAdminStore();

  const {
    profileImageUrl = '/founder.jpg',
    founderBadge = 'Founder & Creator',
    creatorBadge = 'Website Created By Anup Debnath',
    name = 'Anup Debnath',
    title = 'Professional AI Visual Artist & Stock Media Contributor',
    biography = '',
    expertiseItems = [],
  } = aboutSection ?? {};

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1030]">
      <PublicNavbar />

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-[#0d1030]">
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-[500px] h-[400px] rounded-full bg-[#4338CA]/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[#7C3AED]/15 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#6366F1]/20 border border-[#6366F1]/30 text-[#A5B4FC] text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            <Sparkles size={12} />
            About the Creator
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            Meet{' '}
            <span className="bg-gradient-to-r from-[#A5B4FC] via-[#C4B5FD] to-[#818CF8] bg-clip-text text-transparent">
              {name}
            </span>
          </h1>
          <p className="text-lg text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
            {title}
          </p>
        </div>
      </section>

      {/* ─── Profile Section ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-[#0d1030]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Left — Image */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative group">
                {/* Outer glow ring */}
                <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A78BFA] opacity-60 blur group-hover:opacity-90 transition-opacity duration-500" />

                {/* Image frame */}
                <div className="relative w-72 h-80 sm:w-[340px] sm:h-[420px] rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/10 dark:border-[#6366F1]/20">
                  <img
                    src={profileImageUrl}
                    alt={name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=500&background=6366f1&color=fff&bold=true`;
                    }}
                  />
                  {/* Gradient overlay at bottom of image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1030]/70 via-transparent to-transparent" />

                  {/* Name overlay at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-white font-extrabold text-lg leading-tight drop-shadow-lg">{name}</p>
                    <p className="text-[#C4B5FD] text-xs mt-0.5 drop-shadow">{title.split('&')[0].trim()}</p>
                  </div>
                </div>

                {/* Founder badge — top right */}
                <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-[#6366F1]/50 border border-white/20 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {founderBadge}
                </div>

                {/* Decorative corner dots */}
                <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/20 border-4 border-white dark:border-[#0d1030] z-10" />
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#F3F0FF] dark:bg-[#7C3AED]/20 border-4 border-white dark:border-[#0d1030] z-10" />
              </div>

              {/* Creator badge */}
              <div className="mt-7 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gray-50 dark:bg-[#131635] border border-gray-200 dark:border-[#232650] shadow-sm w-full max-w-[340px]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-sm font-black">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{creatorBadge}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">PixelMind AI Platform</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right — Bio + Expertise */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                {name}
              </h2>
              <p className="text-base font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent mb-6">
                {title}
              </p>

              {biography && (
                <p className="text-gray-600 dark:text-[#A1A1AA] leading-relaxed mb-8 text-[15px]">
                  {biography}
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-[#6366F1]/30 via-[#8B5CF6]/20 to-transparent mb-8" />

              {/* Expertise grid */}
              {expertiseItems.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Areas of Expertise</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {expertiseItems.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#131635] border border-gray-100 dark:border-[#232650] hover:border-[#6366F1]/40 hover:shadow-md hover:shadow-[#6366F1]/5 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] dark:from-[#6366F1]/20 dark:to-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-[#71717A] leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── What I Build ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#F8F9FF] dark:bg-[#131635] border-y border-gray-100 dark:border-[#232650]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/15 border border-[#A5B4FC]/30 dark:border-[#6366F1]/20">
              Platform Values
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Why I Built PixelMind AI
            </h2>
            <p className="text-lg text-gray-500 dark:text-[#A1A1AA] max-w-2xl mx-auto">
              To democratize AI for creators — making professional-grade tools accessible, affordable, and easy to use for everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white dark:bg-[#0d1030] rounded-2xl border border-gray-100 dark:border-[#232650] p-6 hover:shadow-lg hover:shadow-[#6366F1]/5 transition-all duration-300 hover:-translate-y-0.5">
                <div className={`w-11 h-11 rounded-2xl ${v.bg} flex items-center justify-center mb-4`} style={{ color: v.color }}>
                  {v.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-[#A1A1AA] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center bg-[#0d1030] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#6366F1]/15 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Try the Tools I Built
          </h2>
          <p className="text-[#A1A1AA] mb-8 text-lg leading-relaxed">
            Start generating AI prompts, metadata, and content — no account required. 50 free credits instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/tools/metadata"
              className="flex items-center gap-2 bg-[#6366F1] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#4F46E5] transition-colors shadow-xl shadow-[#6366F1]/30"
            >
              <Zap size={16} />
              Start Free Now
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white/8 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/15 hover:bg-white/15 transition-colors"
            >
              Create Account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
