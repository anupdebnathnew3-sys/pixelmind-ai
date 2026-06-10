import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Image, MessageSquare, Calendar, Sparkles, Calculator, Tag, ArrowRight, Zap } from 'lucide-react';

const TOOLS = [
  {
    icon: <Image size={32} />,
    title: 'AI Metadata Generator',
    description: 'Generate optimized titles, descriptions & keywords for stock photos across 7 major marketplaces. Batch up to 150 images at once.',
    path: '/tools/metadata',
    badge: 'Core Tool',
    color: '#6366F1',
    bg: '#EEF2FF',
    stats: '150 images/batch',
  },
  {
    icon: <Sparkles size={32} />,
    title: 'Image to Prompt',
    description: 'Reverse-engineer any image into a platform-optimized AI art prompt for Midjourney, DALL·E, Flux, Stable Diffusion, and more.',
    path: '/tools/image-to-prompt',
    badge: 'AI Vision',
    color: '#7C3AED',
    bg: '#F3F0FF',
    stats: '6 platforms',
  },
  {
    icon: <MessageSquare size={32} />,
    title: 'AI Content Writer',
    description: 'Write blog posts, product descriptions, social media content, and marketing copy with advanced AI models.',
    path: '/tools/content-writer',
    badge: 'Writing',
    color: '#059669',
    bg: '#ECFDF5',
    stats: 'Multiple content types',
  },
  {
    icon: <Tag size={32} />,
    title: 'AI Slogan Generator',
    description: 'Create powerful brand slogans in 6 styles: Professional, Creative, Luxury, Marketing, Modern, and Minimalist.',
    path: '/tools/slogan-generator',
    badge: 'Branding',
    color: '#D97706',
    bg: '#FFFBEB',
    stats: '6 styles',
  },
  {
    icon: <Calendar size={32} />,
    title: 'Event Calendar',
    description: 'Plan content around global holidays. Supports Bangladesh, USA, UK, Canada, Australia, India and 10+ countries.',
    path: '/tools/event-calendar',
    badge: 'Planning',
    color: '#DC2626',
    bg: '#FEF2F2',
    stats: '10+ countries',
  },
  {
    icon: <Calculator size={32} />,
    title: 'Age Calculator',
    description: 'Calculate exact age with live second counter, zodiac sign, birthday countdown, and complete age breakdown.',
    path: '/tools/age-calculator',
    badge: 'Utility',
    color: '#BE185D',
    bg: '#FDF2F8',
    stats: 'Live ticker',
  },
];

export const ToolsOverviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PublicNavbar />
      <div className="pt-20">
        {/* Hero */}
        <section className="py-16 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#EEF2FF] dark:bg-[#6366F1]/20 text-[#6366F1] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Zap size={14} /> All Tools
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-5">
              Powerful AI Tools <br />for <span className="text-[#6366F1]">Every Creator</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              A complete suite of AI-powered tools for content creators, stock photographers, and digital marketers.
            </p>
            <div className="mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 bg-[#6366F1] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#005C66] transition-colors">
                Try All Tools Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="pb-24 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map(tool => (
              <Link key={tool.title} to="/login"
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: tool.bg, color: tool.color }}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{tool.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: tool.bg, color: tool.color }}>{tool.badge}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{tool.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: tool.color }}>{tool.stats}</span>
                      <span className="text-xs text-[#6366F1] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Try it <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
