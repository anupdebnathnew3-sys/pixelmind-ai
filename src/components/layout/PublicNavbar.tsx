import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/useStore';
import { useAdminStore } from '../../store/useAdminStore';
import { useGuestStore, GUEST_INITIAL_CREDITS } from '../../store/useGuestStore';
import { Zap, Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/Button';

export const PublicNavbar: React.FC = () => {
  const { theme, toggleTheme, isAuthenticated } = useStore();
  const { siteSettings, navSettings } = useAdminStore();
  const { guestCredits, triggerModal } = useGuestStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLow = guestCredits <= 10;
  const isEmpty = guestCredits <= 0;

  const visibleItems = [...navSettings.items]
    .filter(i => i.visible)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const handleHashNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    const id = path.replace('/#', '');
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate({ pathname: '/', hash: `#${id}` });
    }
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.replaceState(null, '', '/');
    } else {
      navigate('/');
    }
  };

  const isItemActive = (path: string) => {
    if (path.startsWith('/#')) {
      const hashId = path.replace('/#', '');
      return location.pathname === '/' && location.hash === `#${hashId}`;
    }
    return location.pathname === path;
  };

  const renderNavLink = (item: typeof visibleItems[0], mobile = false) => {
    const isHash = item.path.startsWith('/#');
    const active = isItemActive(item.path);
    const baseClass = cn(
      'relative font-medium transition-all duration-200 group',
      mobile
        ? cn(
            'flex items-center px-4 py-3 rounded-xl text-sm',
            active
              ? 'text-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/15'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#232650]'
          )
        : cn(
            'px-3.5 py-2 rounded-xl text-sm',
            active
              ? 'text-[#6366F1] dark:text-[#A5B4FC]'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          )
    );

    const content = (
      <>
        {item.label}
        {!mobile && (
          <span className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-[#6366F1] transition-all duration-300',
            active ? 'w-4' : 'w-0 group-hover:w-4'
          )} />
        )}
      </>
    );

    if (isHash) {
      return <a key={item.id} href={item.path} onClick={(e) => handleHashNav(e, item.path)} className={baseClass}>{content}</a>;
    }
    if (item.path === '/') {
      return <a key={item.id} href="/" onClick={handleHomeClick} className={baseClass}>{content}</a>;
    }
    return <Link key={item.id} to={item.path} className={baseClass}>{content}</Link>;
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/95 dark:bg-[#0d1030]/95 backdrop-blur-xl border-b border-gray-100/80 dark:border-[#232650]/80 shadow-[0_2px_20px_rgba(15,23,42,0.06)] dark:shadow-none'
        : navSettings.blurEffect
          ? 'bg-white/60 dark:bg-[#0d1030]/60 backdrop-blur-md'
          : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <a href="/" onClick={handleHomeClick} className="flex items-center gap-2.5 flex-shrink-0 group">
            {navSettings.logoUrl ? (
              <img src={navSettings.logoUrl} alt="logo" className="w-8 h-8 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-[#6366F1]/20 group-hover:shadow-[#6366F1]/30 transition-shadow">
                <Zap size={17} className="text-white" />
              </div>
            )}
            <span className="font-extrabold text-gray-900 dark:text-white text-[15px] tracking-tight">
              {siteSettings?.navbarBrand ?? 'PixelMind Pro'}
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {visibleItems.map(item => renderNavLink(item))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">

            {/* Guest credit pill */}
            {!isAuthenticated && (
              <button
                onClick={() => triggerModal(isEmpty ? 'no-credits' : 'float')}
                className={cn(
                  'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
                  isEmpty
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 hover:bg-red-100'
                    : isLow
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                      : 'bg-[#EEF2FF] dark:bg-[#6366F1]/15 border-[#A5B4FC]/40 dark:border-[#6366F1]/25 text-[#6366F1] dark:text-[#A5B4FC] hover:bg-[#6366F1]/10'
                )}
                title="Guest credits"
              >
                <Zap size={12} />
                <span className="tabular-nums">{guestCredits}</span>
                <span className="text-[10px] font-normal opacity-70">credits</span>
                <div className="w-10 h-1 bg-current/20 rounded-full overflow-hidden ml-0.5">
                  <div className="h-full bg-current rounded-full transition-all" style={{ width: `${Math.max(0, (guestCredits / GUEST_INITIAL_CREDITS) * 100)}%` }} />
                </div>
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232650] hover:text-slate-800 dark:hover:text-white transition-all"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="shadow-lg shadow-[#6366F1]/20">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232650] transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/98 dark:bg-[#0d1030]/98 backdrop-blur-xl border-t border-gray-100 dark:border-[#232650] shadow-xl">
          <div className="px-4 py-3 space-y-0.5">
            {visibleItems.map(item => renderNavLink(item, true))}

            {/* Mobile credit indicator */}
            {!isAuthenticated && (
              <div className={cn(
                'flex items-center gap-2.5 px-4 py-3 rounded-xl mt-2',
                isEmpty ? 'bg-red-50 dark:bg-red-900/15'
                  : isLow ? 'bg-amber-50 dark:bg-amber-900/15'
                    : 'bg-[#EEF2FF] dark:bg-[#6366F1]/10'
              )}>
                <Zap size={14} className={isEmpty ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-[#6366F1]'} />
                <div className="flex-1">
                  <p className={cn('text-xs font-semibold', isEmpty ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-[#6366F1]')}>
                    {guestCredits} / {GUEST_INITIAL_CREDITS} guest credits
                  </p>
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', isEmpty ? 'bg-red-400' : isLow ? 'bg-amber-400' : 'bg-[#6366F1]')}
                      style={{ width: `${Math.max(0, (guestCredits / GUEST_INITIAL_CREDITS) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 pb-1 flex flex-col gap-2 border-t border-gray-100 dark:border-[#232650] mt-2">
              <Link to="/login" className="w-full">
                <Button variant="outline" fullWidth>Login</Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button fullWidth>Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
