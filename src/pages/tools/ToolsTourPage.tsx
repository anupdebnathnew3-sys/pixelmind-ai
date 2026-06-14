import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  Sparkles, Hash, Calculator, Palette, Type, Megaphone,
  Image, ImagePlus, FileText, MessageSquare, Calendar,
  Mic2, Video, ArrowRight, Zap
} from 'lucide-react';

interface Tool {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  bgDark: string;
  tools: Tool[];
}

const categories: Category[] = [
  {
    id: 'ai-content',
    label: 'AI Content & Metadata',
    icon: <Sparkles size={22} />,
    color: '#6366F1',
    bgLight: '#EEF2FF',
    bgDark: 'rgba(99,102,241,0.15)',
    tools: [
      { label: 'AI Metadata Generator', icon: <Image size={15} />,         path: '/tools/metadata',         badge: 'Core' },
      { label: 'Image To Prompt',       icon: <ImagePlus size={15} />,     path: '/tools/image-to-prompt' },
      { label: 'AI Content Writer',     icon: <FileText size={15} />,      path: '/tools/content-writer' },
      { label: 'Slogan Generator',      icon: <MessageSquare size={15} />, path: '/tools/slogan-generator' },
    ],
  },
  {
    id: 'text-tools',
    label: 'Text & Word Tools',
    icon: <Hash size={22} />,
    color: '#3B82F6',
    bgLight: '#EFF6FF',
    bgDark: 'rgba(59,130,246,0.15)',
    tools: [
      { label: 'Word Counter', icon: <Hash size={15} />, path: '/tools/word-counter' },
    ],
  },
  {
    id: 'calc-planning',
    label: 'Calculators & Planning',
    icon: <Calculator size={22} />,
    color: '#10B981',
    bgLight: '#ECFDF5',
    bgDark: 'rgba(16,185,129,0.15)',
    tools: [
      { label: 'Age Calculator', icon: <Calculator size={15} />, path: '/tools/age-calculator' },
      { label: 'Event Calendar', icon: <Calendar size={15} />,   path: '/tools/event-calendar' },
    ],
  },
  {
    id: 'branding',
    label: 'Color & Branding',
    icon: <Palette size={22} />,
    color: '#EC4899',
    bgLight: '#FDF2F8',
    bgDark: 'rgba(236,72,153,0.15)',
    tools: [
      { label: 'Color Palette Generator', icon: <Palette size={15} />, path: '/tools/color-palette', badge: 'New' },
      { label: 'Brand Voice & Slogans',   icon: <Mic2 size={15} />,   path: '/tools/brand-voice',   badge: 'New' },
    ],
  },
  {
    id: 'typography',
    label: 'Typography & Fonts',
    icon: <Type size={22} />,
    color: '#F59E0B',
    bgLight: '#FFFBEB',
    bgDark: 'rgba(245,158,11,0.15)',
    tools: [
      { label: 'Font Pairing Assistant', icon: <Type size={15} />, path: '/tools/font-pairing', badge: 'New' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing Tools',
    icon: <Megaphone size={22} />,
    color: '#EF4444',
    bgLight: '#FEF2F2',
    bgDark: 'rgba(239,68,68,0.15)',
    tools: [
      { label: 'Ad Copywriter',       icon: <Megaphone size={15} />, path: '/tools/ad-copywriter', badge: 'New' },
      { label: 'Reels Script Writer', icon: <Video size={15} />,     path: '/tools/sales-script',  badge: 'New' },
    ],
  },
];

export const ToolsTourPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = true }) => {
  const navigate = useNavigate();

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/25">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Tools</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Browse all available tools by category</p>
            </div>
          </div>
        </div>

        {/* Category grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="rounded-2xl border border-gray-100 dark:border-[#232650] bg-white dark:bg-[#131635] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{ background: `linear-gradient(135deg, ${cat.color}18 0%, ${cat.color}08 100%)` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cat.color, color: '#fff', boxShadow: `0 4px 12px ${cat.color}40` }}
                >
                  {cat.icon}
                </div>
                <h2 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{cat.label}</h2>
              </div>

              {/* Tool list */}
              <div className="px-3 py-2 space-y-0.5">
                {cat.tools.map(tool => (
                  <button
                    key={tool.path}
                    onClick={() => navigate(tool.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-gray-50 dark:hover:bg-[#191c40] transition-colors group"
                  >
                    <span className="flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-[#6366F1] transition-colors">
                      {tool.icon}
                    </span>
                    <span className="flex-1 font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">
                      {tool.label}
                    </span>
                    {tool.badge && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                        style={{
                          background: tool.badge === 'Core' ? '#6366F1' : '#10B981',
                          color: '#fff',
                        }}
                      >
                        {tool.badge}
                      </span>
                    )}
                    <ArrowRight size={13} className="flex-shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
              <div className="h-3" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
