import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glass = false,
  padding = 'md',
  onClick,
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border',
        glass
          ? 'bg-white/80 dark:bg-[#191c40]/80 backdrop-blur-sm border-white/50 dark:border-[#232650]/50'
          : 'bg-white dark:bg-[#191c40] border-[#E4EAF4] dark:border-[#232650]',
        'shadow-[0_2px_8px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.03)] dark:shadow-none',
        paddings[padding],
        hover && 'card-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = '#6366F1',
  className,
}) => {
  return (
    <Card className={cn('card-hover', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <p
              className={cn(
                'text-xs mt-1 flex items-center gap-1',
                changeType === 'increase' && 'text-green-500',
                changeType === 'decrease' && 'text-red-500',
                changeType === 'neutral' && 'text-gray-400'
              )}
            >
              {changeType === 'increase' && '↑'}
              {changeType === 'decrease' && '↓'}
              {change}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color + '20', color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variants = {
    default: 'bg-[#EEF2FF] text-[#6366F1] border border-[#A5B4FC]/30 dark:bg-[#6366F1]/15 dark:text-[#A5B4FC] dark:border-[#6366F1]/30',
    success: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    error: 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={cn(
          'relative w-full bg-white dark:bg-[#191c40] rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.14)] dark:shadow-2xl animate-fade-in',
          'border border-[#E2E8F0] dark:border-[#232650]',
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-[#E8EEF8] dark:border-[#232650]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-[#F0F4FB] dark:hover:bg-[#0d1030]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex gap-1 bg-[#EEF1F9] dark:bg-[#0d1030] rounded-xl p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === tab.id
              ? 'bg-white dark:bg-[#191c40] text-[#6366F1] shadow-sm'
              : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export const Divider: React.FC<{ className?: string; label?: string }> = ({
  className,
  label,
}) => {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#232650]" />
        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{label}</span>
        <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#232650]" />
      </div>
    );
  }
  return <div className={cn('h-px bg-[#E2E8F0] dark:bg-[#232650]', className)} />;
};

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  color,
  size = 'md',
  className,
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-[#EEF1F9] dark:bg-[#0d1030] rounded-full overflow-hidden',
          heights[size]
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', !color && 'progress-bar')}
          style={{ width: `${percent}%`, ...(color ? { backgroundColor: color } : {}) }}
        />
      </div>
    </div>
  );
};

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={cn(
          'absolute z-50 px-2.5 py-1.5 text-xs text-white bg-gray-900 dark:bg-[#0d1030] rounded-lg whitespace-nowrap',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none',
          positions[position]
        )}
      >
        {content}
      </div>
    </div>
  );
};

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}) => {
  const widths = { sm: 'w-8', md: 'w-11' };
  const heights = { sm: 'h-4', md: 'h-6' };
  const thumbSizes = { sm: 'w-3 h-3', md: 'w-4 h-4' };
  const thumbTranslates = { sm: 'translate-x-4', md: 'translate-x-5' };

  return (
    <label className={cn('flex items-center gap-2', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30',
          widths[size],
          heights[size],
          checked ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-[#232650]'
        )}
      >
        <span
          className={cn(
            'inline-block bg-white rounded-full shadow-sm transition-transform duration-200 absolute left-1',
            thumbSizes[size],
            checked ? thumbTranslates[size] : 'translate-x-0'
          )}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      )}
    </label>
  );
};
