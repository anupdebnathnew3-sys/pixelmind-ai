import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, UserPlus } from 'lucide-react';
import { useGuestStore } from '../../store/useGuestStore';
import { useAdminStore } from '../../store/useAdminStore';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/cn';

export const GuestPromptBanner: React.FC = () => {
  const { isAuthenticated } = useStore();
  const { guestCredits, generations } = useGuestStore();
  const { guestAlertSettings } = useAdminStore();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const { enabled, showAfterUses, showOnLowCredits, lowCreditThreshold, title, message, ctaText, position } = guestAlertSettings;

  useEffect(() => {
    if (!enabled || isAuthenticated || dismissed) return;

    const shouldShow =
      generations >= showAfterUses ||
      (showOnLowCredits && guestCredits <= lowCreditThreshold && guestCredits > 0);

    if (shouldShow) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [enabled, isAuthenticated, dismissed, generations, showAfterUses, showOnLowCredits, guestCredits, lowCreditThreshold]);

  if (!visible || !enabled || isAuthenticated || dismissed) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-40 px-4 py-3 transition-all duration-500 ease-out',
        position === 'top' ? 'top-[68px]' : 'bottom-0',
        'animate-slide-in'
      )}
    >
      <div className={cn(
        'max-w-3xl mx-auto rounded-2xl p-4 shadow-2xl border flex items-center gap-4',
        'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] border-[#6366F1]/20',
        'text-white'
      )}>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <UserPlus size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">{title}</p>
          <p className="text-white/80 text-xs mt-0.5 leading-snug">{message}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/register"
            onClick={() => setDismissed(true)}
            className="px-4 py-2 rounded-xl bg-white text-[#6366F1] text-xs font-bold hover:bg-gray-50 transition-colors shadow-lg"
          >
            {ctaText}
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} className="text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
};
