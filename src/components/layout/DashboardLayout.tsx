import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/useStore';
import { useGuestStore, GUEST_INITIAL_CREDITS } from '../../store/useGuestStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PublicNavbar } from './PublicNavbar';
import { Zap, X, UserPlus, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

// ─── Modal copy ───────────────────────────────────────────────────────────────

const MODAL_COPY = {
  float: {
    icon: <Sparkles size={20} className="text-[#6366F1]" />,
    iconBg: 'bg-[#EEF2FF] dark:bg-[#6366F1]/20',
    accentBar: 'from-[#6366F1] via-[#8B5CF6] to-[#A78BFA]',
    title: 'Save Your Generated Content',
    body: 'Create a free account to save your history, access all tools, and organize your projects.',
    cta: 'Create Free Account',
    sub: 'No credit card required • 500 free credits on signup',
    dismissLabel: 'Continue as Guest',
  },
  milestone: {
    icon: <Sparkles size={20} className="text-[#8B5CF6]" />,
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
    accentBar: 'from-[#8B5CF6] via-[#A78BFA] to-[#C4B5FD]',
    title: "You're Getting Great Results!",
    body: "You've generated several outputs. Create a free account to save everything, track history, and unlock premium features.",
    cta: "Create Free Account — It's Free",
    sub: 'No credit card required • 500 free credits on signup',
    dismissLabel: 'Continue as Guest',
  },
  exit: {
    icon: <ArrowRight size={20} className="text-[#6366F1]" />,
    iconBg: 'bg-[#EEF2FF] dark:bg-[#6366F1]/20',
    accentBar: 'from-[#6366F1] via-[#8B5CF6] to-[#A78BFA]',
    title: 'Before You Go…',
    body: 'Create a free account to keep access to your generated content and come back anytime.',
    cta: 'Stay & Create Account',
    sub: 'No credit card required • Free forever',
    dismissLabel: 'Leave without saving',
  },
  'no-credits': {
    icon: <AlertTriangle size={20} className="text-amber-500" />,
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    accentBar: 'from-amber-400 via-orange-400 to-rose-400',
    title: "You've Used All 50 Free Credits",
    body: "Create a free account to receive 500 credits instantly — 10× more than the guest allocation. No credit card required.",
    cta: 'Get 500 Free Credits →',
    sub: 'Upgrade to Premium for unlimited access',
    dismissLabel: 'Not now',
  },
};

// ─── GuestModal ───────────────────────────────────────────────────────────────

const GuestModal: React.FC = () => {
  const { showModal, modalType, closeModal, guestCredits } = useGuestStore();
  if (!showModal) return null;

  const copy = MODAL_COPY[modalType];
  const isNoCredits = modalType === 'no-credits';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={isNoCredits ? undefined : closeModal} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#191c40] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#232650] overflow-hidden animate-fade-in">
        <div className={`h-1 bg-gradient-to-r ${copy.accentBar}`} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl ${copy.iconBg} flex items-center justify-center`}>
              {copy.icon}
            </div>
            {!isNoCredits && (
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#232650] transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {isNoCredits && (
            <div className="mb-4 flex items-center gap-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/30 rounded-xl px-4 py-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Guest Credits</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{guestCredits}/{GUEST_INITIAL_CREDITS}</span>
                </div>
                <div className="h-1.5 bg-amber-200 dark:bg-amber-900/40 rounded-full">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${(guestCredits / GUEST_INITIAL_CREDITS) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{copy.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{copy.body}</p>

          <div className="space-y-2.5">
            <Link
              to="/register"
              onClick={closeModal}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-sm transition-colors shadow-sm shadow-[#6366F1]/25"
            >
              <UserPlus size={16} />
              {copy.cta}
            </Link>
            <button
              onClick={closeModal}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232650]/60 transition-colors"
            >
              {copy.dismissLabel}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-3">{copy.sub}</p>
        </div>
      </div>
    </div>
  );
};

// ─── GuestBanner ─────────────────────────────────────────────────────────────

const GuestBanner: React.FC = () => {
  const { bannerDismissed, dismissBanner, triggerModal, guestCredits } = useGuestStore();
  if (bannerDismissed) return null;

  const isLow = guestCredits <= 10;
  const isEmpty = guestCredits <= 0;

  return (
    <div className={cn(
      'sticky top-[64px] z-40 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm',
      isEmpty ? 'bg-gradient-to-r from-red-500 to-rose-600'
        : isLow ? 'bg-gradient-to-r from-amber-500 to-orange-500'
          : 'bg-[#6366F1]'
    )}>
      <div className="flex items-center gap-2.5 text-sm min-w-0">
        <Zap size={14} className="flex-shrink-0" />
        <span className="font-medium truncate">
          {isEmpty
            ? 'No credits remaining — create a free account to get 500 more'
            : isLow
              ? `Only ${guestCredits} guest credits left — sign up for 500 free credits`
              : `Guest Mode · ${guestCredits} free credits remaining`
          }
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Mini credit bar */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-20 h-1.5 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.max(0, (guestCredits / GUEST_INITIAL_CREDITS) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-white/80 tabular-nums">{guestCredits}</span>
        </div>
        <button
          onClick={() => triggerModal('float')}
          className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          Sign Up Free <ArrowRight size={12} />
        </button>
        <button
          onClick={dismissBanner}
          className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── GuestToolLayout ──────────────────────────────────────────────────────────

const GuestToolLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { triggerModal } = useGuestStore();

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Reserved for exit-intent on mobile
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [triggerModal]);

  return (
    <div className="min-h-screen bg-[#E8EDF8] dark:bg-[#0d1030]">
      <PublicNavbar />
      <GuestBanner />
      <GuestModal />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

// ─── DashboardLayout ──────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  guestAllowed?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  requireAdmin = false,
  guestAllowed = false,
}) => {
  const { isAuthenticated, user, sidebarCollapsed } = useStore();

  if (!isAuthenticated && guestAllowed) {
    return <GuestToolLayout>{children}</GuestToolLayout>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#E8EDF8] dark:bg-[#0d1030] font-['Inter','Noto_Sans',sans-serif]">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'transition-all duration-300 pt-16',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="p-6 min-h-[calc(100vh-64px)] animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

// ─── PublicLayout ─────────────────────────────────────────────────────────────

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1030] font-['Inter','Noto_Sans',sans-serif]">
      {children}
    </div>
  );
};
