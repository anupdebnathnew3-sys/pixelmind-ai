import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/useStore';
import { useAdminStore } from '../../store/useAdminStore';
import {
  LayoutDashboard, Wrench, Image, FileText, Calendar, Clock,
  Settings, CreditCard, User, LogOut, ChevronLeft,
  ChevronRight, Zap, MessageSquare, Hash, ImagePlus, ChevronDown,
  Shield, Bot, BarChart3, Globe, Calculator, Tag, Wallet, DollarSign,
  Lock, Navigation, Palette, Scale, Bell
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
  {
    id: 'tools', label: 'Tools', icon: <Wrench size={18} />, path: '/tools',
    children: [
      { id: 'metadata', label: 'AI Metadata Generator', icon: <Image size={16} />, path: '/tools/metadata', badge: 'Core' },
      { id: 'img2prompt', label: 'Image To Prompt', icon: <ImagePlus size={16} />, path: '/tools/image-to-prompt' },
      { id: 'content', label: 'AI Content Writer', icon: <FileText size={16} />, path: '/tools/content-writer' },
{ id: 'scheduler', label: 'Social Media', icon: <Globe size={16} />, path: '/tools/social-scheduler' },
      { id: 'wordcount', label: 'Word Counter', icon: <Hash size={16} />, path: '/tools/word-counter' },
      { id: 'slogan', label: 'Slogan Generator', icon: <MessageSquare size={16} />, path: '/tools/slogan-generator' },
      { id: 'age-calc', label: 'Age Calculator', icon: <Calculator size={16} />, path: '/tools/age-calculator' },
    ]
  },
  { id: 'calendar', label: 'Event Calendar', icon: <Calendar size={18} />, path: '/tools/event-calendar' },
  { id: 'history', label: 'History', icon: <Clock size={18} />, path: '/history' },
  { id: 'ai-settings', label: 'AI Settings', icon: <Bot size={18} />, path: '/ai-settings' },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={18} />, path: '/billing' },
  { id: 'profile', label: 'Profile', icon: <User size={18} />, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
];

const adminItems: NavItem[] = [
  { id: 'admin-dashboard', label: 'Admin Dashboard', icon: <BarChart3 size={18} />, path: '/admin' },
  { id: 'user-management', label: 'User Management', icon: <User size={18} />, path: '/admin/users' },
  { id: 'api-management', label: 'API Management', icon: <Zap size={18} />, path: '/admin/apis' },
  { id: 'prompt-management', label: 'Prompt Management', icon: <MessageSquare size={18} />, path: '/admin/prompts' },
  { id: 'credit-management', label: 'Credit Management', icon: <BarChart3 size={18} />, path: '/admin/credits' },
  {
    id: 'billing-group', label: 'Billing & Plans', icon: <CreditCard size={18} />, path: '/admin/billing-group',
    children: [
      { id: 'pricing-manager', label: 'Pricing Manager', icon: <DollarSign size={16} />, path: '/admin/pricing' },
      { id: 'discount-manager', label: 'Discounts', icon: <Tag size={16} />, path: '/admin/discounts' },
      { id: 'billing-manager', label: 'Billing Manager', icon: <Wallet size={16} />, path: '/admin/billing-manager' },
      { id: 'payment-gateway', label: 'Payment Gateway', icon: <CreditCard size={16} />, path: '/admin/payment-gateway' },
      { id: 'feature-access', label: 'Feature Access', icon: <Lock size={16} />, path: '/admin/feature-access' },
      { id: 'admin-subscriptions', label: 'Subscriptions', icon: <BarChart3 size={16} />, path: '/admin/subscriptions' },
    ],
  },
  {
    id: 'design-group', label: 'Design & Content', icon: <Palette size={18} />, path: '/admin/design-group',
    children: [
      { id: 'cms-editor', label: 'CMS Editor', icon: <Globe size={16} />, path: '/admin/cms', badge: 'New' },
      { id: 'navigation-manager', label: 'Navigation Manager', icon: <Navigation size={16} />, path: '/admin/navigation' },
      { id: 'theme-manager', label: 'Theme Manager', icon: <Palette size={16} />, path: '/admin/theme' },
      { id: 'content-management', label: 'Content Management', icon: <FileText size={16} />, path: '/admin/content' },
      { id: 'about-manager', label: 'About Me Manager', icon: <User size={16} />, path: '/admin/about' },
    ],
  },
  {
    id: 'legal-security-group', label: 'Legal & Security', icon: <Shield size={18} />, path: '/admin/legal-security-group',
    children: [
      { id: 'legal-manager', label: 'Legal Manager', icon: <Scale size={16} />, path: '/admin/legal' },
      { id: 'security-settings', label: 'Security Settings', icon: <Shield size={16} />, path: '/admin/security' },
      { id: 'guest-alerts', label: 'Guest Alert Manager', icon: <Bell size={16} />, path: '/admin/guest-alerts' },
    ],
  },
  { id: 'global-settings', label: 'Global Settings', icon: <Settings size={18} />, path: '/admin/settings' },
  { id: 'maintenance', label: 'Maintenance Mode', icon: <Shield size={18} />, path: '/admin/maintenance' },
];

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  level?: number;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, collapsed, level = 0 }) => {
  const location = useLocation();
  const { toggleSidebarCollapse } = useStore();
  const [expanded, setExpanded] = useState(() =>
    item.children?.some(c => location.pathname.startsWith(c.path)) || location.pathname === item.path
  );

  useEffect(() => {
    if (item.children?.some(c => location.pathname.startsWith(c.path))) {
      setExpanded(true);
    }
  }, [location.pathname, item.children]);

  const isActive = location.pathname === item.path ||
    (item.children && item.children.some(c => location.pathname === c.path));
  const isParentOfActive = item.children?.some(c => location.pathname.startsWith(c.path));

  if (item.children && collapsed) {
    return (
      <div>
        <button
          onClick={() => setExpanded(v => !v)}
          title={item.label}
          className={cn(
            'w-full flex items-center justify-center px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
            isParentOfActive || expanded
              ? 'bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/30'
              : 'text-slate-600 dark:text-gray-400 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] hover:text-slate-900 dark:hover:text-gray-200'
          )}
        >
          <span className={cn('flex-shrink-0', (isParentOfActive || expanded) ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:text-gray-400 dark:group-hover:text-gray-300')}>
            {item.icon}
          </span>
          <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            {item.label}
          </div>
        </button>
        {expanded && (
          <div className="mt-0.5 space-y-0.5">
            {item.children.map(child => (
              <Link
                key={child.id}
                to={child.path}
                title={child.label}
                className={cn(
                  'flex items-center justify-center p-2 rounded-xl transition-all duration-200 group relative',
                  location.pathname === child.path
                    ? 'bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/30'
                    : 'text-slate-400 dark:text-gray-500 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] hover:text-slate-700 dark:hover:text-gray-300'
                )}
              >
                <span className="flex-shrink-0">{child.icon}</span>
                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {child.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.children && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
            isParentOfActive
              ? 'bg-[#EEF2FF] text-[#6366F1] dark:bg-[#6366F1]/20 dark:text-[#A5B4FC]'
              : 'text-slate-600 dark:text-gray-400 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] hover:text-slate-900 dark:hover:text-gray-200'
          )}
        >
          <span className="flex items-center gap-3">
            <span className={cn(isParentOfActive ? 'text-[#6366F1] dark:text-[#A5B4FC]' : 'text-slate-400 group-hover:text-slate-600 dark:text-gray-400 dark:group-hover:text-gray-300')}>
              {item.icon}
            </span>
            {item.label}
          </span>
          <ChevronDown
            size={14}
            className={cn('transition-transform duration-200', expanded && 'rotate-180')}
          />
        </button>
        {expanded && (
          <div className="mt-1 ml-3 pl-3 border-l-2 border-[#A5B4FC]/30 space-y-0.5">
            {item.children.map(child => (
              <SidebarNavItem key={child.id} item={child} collapsed={false} level={1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
        isActive
          ? 'bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/30'
          : 'text-slate-600 dark:text-gray-400 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] hover:text-slate-900 dark:hover:text-gray-200',
        collapsed && 'justify-center px-2',
        level > 0 && 'text-xs py-2'
      )}
    >
      <span className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:text-gray-400 dark:group-hover:text-gray-300')}>
        {item.icon}
      </span>
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
          isActive ? 'bg-white/20 text-white' : 'bg-[#6366F1]/10 text-[#6366F1]'
        )}>
          {item.badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {item.label}
        </div>
      )}
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebarCollapse, user, logout } = useStore();
  const { tools: adminTools, siteSettings } = useAdminStore();
  const navigate = useNavigate();

  const disabledPaths = new Set(
    adminTools.filter(t => !t.enabled).map(t => `/tools/${t.id}`)
  );
  const filteredNavItems = navItems
    .filter(item => !disabledPaths.has(item.path))
    .map(item => {
      if (item.children) {
        return { ...item, children: item.children.filter(c => !disabledPaths.has(c.path)) };
      }
      return item;
    });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col',
        'bg-white dark:bg-[#131635]',
        'border-r border-[#DDE4F0] dark:border-[#232650]',
        'shadow-[4px_0_16px_rgba(15,23,42,0.08)] dark:shadow-none',
        'transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-[#E8EEF8] dark:border-[#232650] flex-shrink-0',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">{siteSettings?.sidebarBrand ?? 'PixelMind AI'}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {!sidebarCollapsed && (
          <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-2">Main</p>
        )}
        {filteredNavItems.map(item => (
          <SidebarNavItem key={item.id} item={item} collapsed={sidebarCollapsed} />
        ))}

        {user?.role === 'admin' && (
          <>
            {!sidebarCollapsed && (
              <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-wider mt-4 mb-2">Admin</p>
            )}
            {sidebarCollapsed && <div className="h-px bg-gray-200 dark:bg-[#2f3260] my-2" />}
            {adminItems.map(item => (
              <SidebarNavItem key={item.id} item={item} collapsed={sidebarCollapsed} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-[#E8EEF8] dark:border-[#232650] space-y-1 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!sidebarCollapsed && 'Logout'}
        </button>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebarCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 dark:text-gray-400 hover:bg-[#F0F4FB] dark:hover:bg-[#232650] transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : (
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <ChevronLeft size={16} />
              Collapse
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
