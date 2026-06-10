import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  Clock, Download, User, Settings, CreditCard, Zap,
  BarChart3, FileText, Shield, Hammer
} from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  clock: <Clock size={48} />,
  download: <Download size={48} />,
  user: <User size={48} />,
  settings: <Settings size={48} />,
  'credit-card': <CreditCard size={48} />,
  zap: <Zap size={48} />,
  'bar-chart': <BarChart3 size={48} />,
  'file-text': <FileText size={48} />,
  shield: <Shield size={48} />,
};

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: string;
  admin?: boolean;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This page is coming soon.',
  icon = 'settings',
  admin = false,
}) => {
  return (
    <DashboardLayout requireAdmin={admin}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] mb-6">
            {ICONS[icon] || <Hammer size={48} />}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            This section is under active development and will be available soon.
            Core AI tools are fully functional — check the Tools section.
          </p>
          <div className="mt-6 px-4 py-2 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/10 text-sm text-[#6366F1] font-medium">
            Coming Soon
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
