import React, { useRef, useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';

export const AboutSection: React.FC = () => {
  const { aboutSection } = useAdminStore();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!aboutSection?.animationsEnabled) {
      setEntered(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    // If already in viewport on mount, animate immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setTimeout(() => setEntered(true), 80);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setEntered(true); },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    // Safety fallback — never stay invisible
    const fallback = setTimeout(() => setEntered(true), 1200);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [aboutSection?.animationsEnabled]);

  if (!aboutSection?.visible) return null;

  const { profileImageUrl, founderBadge, creatorBadge, name, title, biography, expertiseItems, animationsEnabled } = aboutSection;

  const anim = (delay = 0): React.CSSProperties =>
    animationsEnabled
      ? { transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }
      : {};

  const baseClass = (extra = '') =>
    `${animationsEnabled ? (entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5') : ''} ${extra}`;

  return (
    <section
      id="about-creator"
      ref={sectionRef}
      className="py-24 bg-[#F8F9FF] dark:bg-[#131635] relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-[#6366F1]/6 dark:bg-[#6366F1]/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/8 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section header — always visible, animate translate only */}
        <div className={`text-center mb-16 ${baseClass()}`} style={anim(0)}>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/15 border border-[#A5B4FC]/30 dark:border-[#6366F1]/20">
            About the Creator
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Meet the{' '}
            <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
              Visionary
            </span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-[#A1A1AA] max-w-2xl mx-auto">
            The mind behind PixelMind AI — blending artistic vision with technical precision.
          </p>
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Profile image */}
          <div
            className={`flex flex-col items-center lg:items-start ${animationsEnabled ? (entered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6') : ''}`}
            style={anim(100)}
          >
            <div className="relative group">
              {/* Glow ring */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A78BFA] opacity-60 blur-sm group-hover:opacity-90 transition-opacity duration-500" />

              {/* Profile image */}
              <div className="relative w-72 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-white/20 dark:border-[#6366F1]/30 shadow-2xl">
                <img
                  src={profileImageUrl}
                  alt={name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=6366f1&color=fff&bold=true`;
                  }}
                />
                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1030]/60 via-transparent to-transparent" />
              </div>

              {/* Founder badge */}
              <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-[#6366F1]/40 border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {founderBadge}
              </div>
            </div>

            {/* Creator badge below image */}
            <div className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0d1030] border border-gray-200 dark:border-[#232650] shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-black">A</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {creatorBadge}
              </span>
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Right — Info + expertise */}
          <div
            className={`${animationsEnabled ? (entered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6') : ''}`}
            style={anim(200)}
          >
            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
              {name}
            </h3>
            <p className="text-base font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent mb-6">
              {title}
            </p>
            <p className="text-gray-600 dark:text-[#A1A1AA] leading-relaxed mb-8 text-base">
              {biography}
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-[#6366F1]/30 via-[#8B5CF6]/20 to-transparent mb-8" />

            {/* Expertise grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {expertiseItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`group p-4 rounded-2xl bg-white dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650] hover:border-[#6366F1]/40 dark:hover:border-[#6366F1]/40 hover:shadow-lg hover:shadow-[#6366F1]/5 transition-all duration-300 ${animationsEnabled ? (entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4') : ''}`}
                  style={anim(300 + idx * 80)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] dark:from-[#6366F1]/20 dark:to-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-[#71717A] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
