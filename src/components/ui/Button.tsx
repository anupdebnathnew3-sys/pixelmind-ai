import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variants = {
  primary:   'bg-primary text-white shadow-sm active:scale-[0.98]',
  secondary: 'bg-[#EEF2FF] text-[#6366F1] hover:bg-[#E0E7FF] border border-[#C7D2FE]/60 dark:bg-[#6366F1]/15 dark:text-[#A5B4FC] dark:border-[#6366F1]/30 dark:hover:bg-[#6366F1]/25',
  outline:   'border-2 border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white',
  ghost:     'text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/15',
  danger:    'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200/50',
  success:   'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200/50',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3.5 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
};
