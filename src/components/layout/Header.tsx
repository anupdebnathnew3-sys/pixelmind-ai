import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/useStore';
import { timeAgo } from '../../utils/cn';
import {
  Search, Sun, Moon, Bell, ChevronDown, Zap, User, Settings,
  CreditCard, LogOut, Menu, Home, Check, CheckCheck, Shield
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user, theme, toggleTheme, sidebarCollapsed, toggleSidebar,
    notifications, credits, markNotificationRead, markAllNotificationsRead, logout
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifTypeColors = {
    info: 'text-blue-500 bg-blue-50',
    success: 'text-green-500 bg-green-50',
    warning: 'text-amber-500 bg-amber-50',
    error: 'text-red-500 bg-red-50',
  };

  return (
    <header className={cn(
      'fixed top-0 right-0 z-30 h-16',
      'bg-white/97 dark:bg-[#131635]/95 backdrop-blur-md',
      'border-b border-[#E2E8F0] dark:border-[#232650]',
      'shadow-[0_1px_4px_rgba(15,23,42,0.06)] dark:shadow-none',
      'flex items-center px-4 gap-3 transition-all duration-300',
      sidebarCollapsed ? 'left-16' : 'left-64'
    )}>
      {/* Menu Toggle (mobile) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-gray-500 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Home Link */}
      <Link
        to="/"
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 dark:text-gray-400 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
      >
        <Home size={15} />
        <span>Home</span>
      </Link>

      {/* Search */}
      <div className={cn(
        'flex-1 max-w-md relative',
        'transition-all duration-300',
        searchFocused && 'max-w-lg'
      )}>
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search tools, history..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={cn(
            'w-full pl-9 pr-4 py-2 rounded-xl border text-sm',
            'bg-[#F4F7FD] dark:bg-[#0d1030] text-slate-900 dark:text-gray-100',
            'border-[#DDE5F4] dark:border-[#232650]',
            'focus:border-[#6366F1] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#6366F1]/20',
            'placeholder:text-gray-400 transition-all duration-200'
          )}
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Credits */}
        <Link
          to="/billing"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 hover:bg-[#6366F1] dark:hover:bg-[#6366F1] group transition-colors"
        >
          <Zap size={14} className="text-[#6366F1] dark:text-[#A5B4FC] group-hover:text-white" />
          <span className="text-sm font-semibold text-[#6366F1] dark:text-[#A5B4FC] group-hover:text-white">
            {credits.toLocaleString()}
          </span>
          <span className="text-xs text-[#6366F1]/70 dark:text-[#A5B4FC]/70 group-hover:text-white/80 hidden md:block">
            credits
          </span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6366F1] rounded-full border-2 border-white dark:border-gray-950" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#191c40] rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#E2E8F0] dark:border-[#232650] overflow-hidden z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8EEF8] dark:border-[#232650]">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#6366F1] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                        'hover:bg-[#F4F7FD] dark:hover:bg-[#232650]',
                        !n.read && 'bg-[#EEF2FF]/50 dark:bg-[#6366F1]/10'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm',
                        notifTypeColors[n.type]
                      )}>
                        {n.type === 'success' && <Check size={14} />}
                        {n.type === 'info' && 'ℹ'}
                        {n.type === 'warning' && '⚠'}
                        {n.type === 'error' && '✕'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          n.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                        )}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 bg-[#6366F1] rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-[#F0F4FB] dark:hover:bg-[#232650] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-gray-400 capitalize mt-0.5">{user?.plan || 'free'} plan</p>
            </div>
            <ChevronDown size={13} className="text-gray-400 hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#191c40] rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#E2E8F0] dark:border-[#232650] overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-[#E8EEF8] dark:border-[#232650]">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-[#EEF2FF] text-[#6366F1] rounded-full font-medium capitalize">
                    {user?.plan} Plan
                  </span>
                  {user?.role === 'admin' && (
                    <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2">
                {[
                  { icon: <User size={14} />, label: 'Profile', path: '/profile' },
                  { icon: <Settings size={14} />, label: 'Settings', path: '/settings' },
                  { icon: <CreditCard size={14} />, label: 'Billing', path: '/billing' },
                  ...(user?.role === 'admin' ? [{ icon: <Shield size={14} />, label: 'Admin Panel', path: '/admin' }] : []),
                ].map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-gray-300 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] transition-colors"
                  >
                    <span className="text-gray-400">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-[#EEF1F9] dark:bg-[#0d1030] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
