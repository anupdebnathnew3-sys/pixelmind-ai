import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { useAdminStore } from '../../store/useAdminStore';
import { Shield, Clock, ChevronRight } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { legalContent } = useAdminStore();
  const { privacyTitle, privacyLastUpdated, privacyVersion, privacySections, privacyEnabled } = legalContent;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!privacyEnabled) {
    return (
      <>
        <PublicNavbar />
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d1030]">
          <div className="text-center">
            <Shield size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy Not Available</h1>
            <p className="text-gray-500 dark:text-gray-400">The Privacy Policy is currently not published.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen bg-white dark:bg-[#0d1030]">

        {/* Hero */}
        <section className="relative pt-28 pb-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 right-1/3 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-6 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4">
              <Shield size={11} /> Legal
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              {privacyTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> Last updated: {new Date(privacyLastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#232650] text-xs font-medium">
                Version {privacyVersion}
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Sticky TOC */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Table of Contents</p>
                <nav className="space-y-0.5">
                  {privacySections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={() => setActiveSection(sec.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all group ${
                        activeSection === sec.id
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#191c40] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <ChevronRight size={12} className="flex-shrink-0 opacity-50 group-hover:opacity-100" />
                      <span className="leading-snug">{sec.title}</span>
                    </a>
                  ))}
                </nav>

                <div className="mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-[#131635] border border-gray-100 dark:border-[#232650]">
                  <p className="text-xs text-gray-400 mb-2">Privacy concerns?</p>
                  <Link to="/contact" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    Contact Us →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {privacySections.map((sec) => (
                  <section key={sec.id} id={sec.id} className="mb-10 scroll-mt-28">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-[#232650]">
                      {sec.title}
                    </h2>
                    <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {sec.body}
                    </div>
                  </section>
                ))}
              </div>

              {/* Footer nav */}
              <div className="mt-12 pt-8 border-t border-gray-100 dark:border-[#232650] flex flex-wrap items-center gap-4 text-sm">
                <Link to="/terms" className="text-[#6366F1] hover:underline font-medium">Terms & Conditions</Link>
                <Link to="/contact" className="text-[#6366F1] hover:underline font-medium">Contact Us</Link>
                <Link to="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">← Back to Home</Link>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
