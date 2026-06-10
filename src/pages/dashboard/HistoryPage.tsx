import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { Clock, Image, FileText, MessageSquare, Zap, ArrowRight, Search, Filter } from 'lucide-react';

const TOOL_LINKS = [
  { icon: <Image size={18} />, label: 'AI Metadata Generator', path: '/tools/metadata', color: '#6366F1', bg: 'bg-[#EEF2FF] dark:bg-[#6366F1]/15' },
  { icon: <Zap size={18} />, label: 'Image to Prompt', path: '/tools/image-to-prompt', color: '#7C3AED', bg: 'bg-[#F3F0FF] dark:bg-[#7C3AED]/15' },
  { icon: <FileText size={18} />, label: 'AI Content Writer', path: '/tools/content-writer', color: '#059669', bg: 'bg-[#ECFDF5] dark:bg-[#059669]/15' },
  { icon: <MessageSquare size={18} />, label: 'Slogan Generator', path: '/tools/slogan-generator', color: '#D97706', bg: 'bg-[#FFF7ED] dark:bg-[#D97706]/15' },
];

export const HistoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generation History</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              All your AI-generated outputs in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#232650] text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232650] transition-colors">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#131635] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
          />
        </div>

        {/* Empty state */}
        <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#232650] flex items-center gap-2">
            <Clock size={15} className="text-[#6366F1]" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</span>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">0 items</span>
          </div>

          <div className="py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#EEF2FF] dark:bg-[#6366F1]/15 flex items-center justify-center mx-auto mb-5">
              <Clock size={36} className="text-[#6366F1]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No generations yet</h3>
            <p className="text-gray-500 dark:text-[#A1A1AA] text-sm max-w-sm mx-auto leading-relaxed mb-8">
              Your AI-generated prompts, metadata, and content will appear here automatically after your first generation.
            </p>

            {/* Tool quick links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              {TOOL_LINKS.map(tool => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-[#232650] hover:border-[#6366F1]/40 hover:shadow-md transition-all duration-200 group"
                >
                  <div className={`w-9 h-9 rounded-xl ${tool.bg} flex items-center justify-center group-hover:scale-110 transition-transform`} style={{ color: tool.color }}>
                    {tool.icon}
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">{tool.label}</span>
                </Link>
              ))}
            </div>

            <Link
              to="/tools/metadata"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors shadow-sm shadow-[#6366F1]/30"
            >
              <Zap size={14} />
              Generate Something
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
