import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdminStore } from '../../store/useAdminStore';
import {
  Users, CreditCard, Zap, BarChart3, TrendingUp, AlertTriangle,
  CheckCircle, Settings, MessageSquare, FileText, ChevronRight,
  Palette, Shield, Scale, Navigation, Globe, Tag,
  DollarSign, Wallet, Lock, Bot, User, Image, Search, X,
  Home, Mail, PanelTop, Wrench, ImagePlus, Hash, Database,
  BellRing, Megaphone, Mic2, Type, Video
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4200, users: 320 },
  { month: 'Feb', revenue: 5800, users: 445 },
  { month: 'Mar', revenue: 7200, users: 580 },
  { month: 'Apr', revenue: 6100, users: 510 },
  { month: 'May', revenue: 8900, users: 720 },
  { month: 'Jun', revenue: 10200, users: 890 },
  { month: 'Jul', revenue: 9800, users: 850 },
  { month: 'Aug', revenue: 12400, users: 1100 },
  { month: 'Sep', revenue: 14200, users: 1280 },
  { month: 'Oct', revenue: 13800, users: 1220 },
  { month: 'Nov', revenue: 16500, users: 1480 },
  { month: 'Dec', revenue: 18200, users: 1650 },
];

interface AdminPage { label: string; desc: string; path: string; icon: React.ReactNode; badge?: string; }
interface AdminSection { id: string; title: string; desc: string; color: string; icon: React.ReactNode; pages: AdminPage[]; }

const adminSections: AdminSection[] = [
  {
    id: 'website', title: 'Website Management', desc: 'Edit every public-facing page',
    color: '#6366F1', icon: <Globe size={18} />,
    pages: [
      { label: 'Homepage',          desc: 'Hero, stats, features, CTA sections',    path: '/admin/homepage',        icon: <Home size={14} /> },
      { label: 'About Page',        desc: 'Profile, bio, expertise and social links',path: '/admin/about',           icon: <User size={14} /> },
      { label: 'Contact Page',      desc: 'Contact info, form and map settings',     path: '/admin/contact-manager', icon: <Mail size={14} /> },
      { label: 'Pricing Page',      desc: 'Plans, prices, credits and badges',       path: '/admin/pricing',         icon: <DollarSign size={14} /> },
      { label: 'Terms & Conditions',desc: 'Full legal terms page content',           path: '/admin/terms',           icon: <Scale size={14} /> },
      { label: 'Privacy Policy',    desc: 'Privacy policy page content',             path: '/admin/privacy',         icon: <Shield size={14} /> },
      { label: 'Footer',            desc: 'Footer text, links and social icons',     path: '/admin/footer',          icon: <PanelTop size={14} /> },
    ],
  },
  {
    id: 'tools', title: 'Tool Management', desc: 'Configure each AI tool individually',
    color: '#F59E0B', icon: <Wrench size={18} />,
    pages: [
      { label: 'Image to Prompt',  desc: 'Platforms, styles, credits and UI text',  path: '/admin/tool/image-to-prompt', icon: <ImagePlus size={14} /> },
      { label: 'AI Metadata',      desc: 'Output settings, credits and templates',  path: '/admin/tool/metadata',        icon: <Image size={14} /> },
      { label: 'Content Writer',   desc: 'Tone, format, credits and prompts',       path: '/admin/tool/content-writer',  icon: <FileText size={14} /> },
      { label: 'Slogan Generator', desc: 'Style options, credits and templates',    path: '/admin/tool/slogan',          icon: <MessageSquare size={14} /> },
      { label: 'Social Scheduler', desc: 'Platform integrations and posting rules', path: '/admin/tool/social',          icon: <Globe size={14} /> },
      { label: 'Word Counter',     desc: 'Display options and feature toggles',     path: '/admin/tool/word-counter',    icon: <Hash size={14} /> },
      { label: 'Color Palette',    desc: 'Palette count, credits, dark preview',     path: '/admin/tool/color-palette',   icon: <Palette size={14} /> },
      { label: 'Brand Voice',      desc: 'Slogan count, hooks, tone options',        path: '/admin/tool/brand-voice',     icon: <Mic2 size={14} /> },
      { label: 'Font Pairing',     desc: 'Pairing sets, score display, Google links',path: '/admin/tool/font-pairing',    icon: <Type size={14} /> },
      { label: 'Ad Copywriter',    desc: 'Platform management, variation count',     path: '/admin/tool/ad-copy',         icon: <Megaphone size={14} /> },
      { label: 'Sales Script',     desc: 'Video lengths, platform versions',         path: '/admin/tool/sales-script',    icon: <Video size={14} /> },
    ],
  },
  {
    id: 'users', title: 'User Management', desc: 'Users, guests, subscriptions and credits',
    color: '#10B981', icon: <Users size={18} />,
    pages: [
      { label: 'All Users',       desc: 'View, edit, suspend or delete accounts',   path: '/admin/users',         icon: <Users size={14} /> },
      { label: 'Guest Management',desc: 'Guest credit limits and signup prompts',    path: '/admin/guest-alerts',  icon: <User size={14} /> },
      { label: 'Subscriptions',   desc: 'Active, expired and renewal plans',        path: '/admin/subscriptions', icon: <CreditCard size={14} /> },
      { label: 'Credits',         desc: 'Credit balances and deduction rules',      path: '/admin/credits',       icon: <Zap size={14} /> },
    ],
  },
  {
    id: 'billing', title: 'Payment & Billing', desc: 'Methods, transactions and billing settings',
    color: '#8B5CF6', icon: <CreditCard size={18} />,
    pages: [
      { label: 'Payment Methods', desc: 'bKash, Nagad, Stripe, PayPal and more',   path: '/admin/payment-gateway', icon: <CreditCard size={14} /> },
      { label: 'Transactions',    desc: 'Successful, failed and pending payments',  path: '/admin/billing-manager', icon: <Wallet size={14} /> },
      { label: 'Billing Settings',desc: 'Discounts, promo codes, taxes, currency', path: '/admin/discounts',       icon: <Tag size={14} /> },
      { label: 'Pricing Plans',   desc: 'Monthly, yearly plans and features',      path: '/admin/pricing',         icon: <DollarSign size={14} /> },
      { label: 'Feature Access',  desc: 'Which plans unlock which features',       path: '/admin/feature-access',  icon: <Lock size={14} /> },
    ],
  },
  {
    id: 'design', title: 'Theme & Design', desc: 'Colors, navigation, banners and CMS',
    color: '#EC4899', icon: <Palette size={18} />,
    pages: [
      { label: 'Theme Manager',  desc: 'Brand colors, dark/light mode palette',    path: '/admin/theme',      icon: <Palette size={14} /> },
      { label: 'Navigation Bar', desc: 'Logo, menu items, sticky header, colors',  path: '/admin/navigation', icon: <Navigation size={14} /> },
      { label: 'CMS Editor',     desc: 'Edit all page text and copy site-wide',    path: '/admin/cms',        icon: <Globe size={14} />, badge: 'New' },
      { label: 'Banner Manager', desc: 'Promo banners, popups, announcement bars', path: '/admin/banners',    icon: <Megaphone size={14} /> },
    ],
  },
  {
    id: 'system', title: 'System & Settings', desc: 'Media, credits, APIs, security and SEO',
    color: '#64748B', icon: <Settings size={18} />,
    pages: [
      { label: 'Media Library',    desc: 'Images, icons, logos and uploads',          path: '/admin/media',          icon: <Database size={14} /> },
      { label: 'Credits System',   desc: 'Free/pro/max credits and cost-per-tool',    path: '/admin/credits-system', icon: <Zap size={14} /> },
      { label: 'API Management',   desc: 'OpenAI, Gemini, Claude API keys',           path: '/admin/apis',           icon: <Bot size={14} /> },
      { label: 'Security Center',  desc: 'Login rules, rate limiting, audit logs',    path: '/admin/security',       icon: <Shield size={14} /> },
      { label: 'Notifications',    desc: 'Emails, popups, guest prompts, alerts',     path: '/admin/notifications',  icon: <BellRing size={14} /> },
      { label: 'SEO Settings',     desc: 'Meta tags, OG images, sitemaps',            path: '/admin/seo',            icon: <Search size={14} /> },
      { label: 'Global Settings',  desc: 'Site name, registration, tools on/off',     path: '/admin/settings',       icon: <Settings size={14} /> },
      { label: 'Maintenance Mode', desc: 'Take site offline with custom message',     path: '/admin/maintenance',    icon: <AlertTriangle size={14} /> },
    ],
  },
];

// Flatten all pages for search
const allSearchablePages = adminSections.flatMap(s =>
  s.pages.map(p => ({ ...p, sectionTitle: s.title, sectionColor: s.color }))
);

export const AdminDashboardPage: React.FC = () => {
  const { adminUsers, adminSubscriptions } = useAdminStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const totalUsers = adminUsers.length;
  const activeUsers = adminUsers.filter(u => u.status === 'active').length;
  const guestUsers = adminUsers.filter(u => u.plan === 'free').length;
  const premiumUsers = adminUsers.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length;
  const activeSubs = adminSubscriptions.filter(s => s.status === 'active').length;
  const monthlyRevenue = adminSubscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0);
  const suspendedUsers = adminUsers.filter(u => u.status === 'suspended').length;
  const recentUsers = [...adminUsers].slice(-5).reverse();

  const freeCount = adminUsers.filter(u => u.plan === 'free').length;
  const proCount = adminUsers.filter(u => u.plan === 'pro').length;
  const enterpriseCount = adminUsers.filter(u => u.plan === 'enterprise').length;
  const total = totalUsers || 1;
  const planDistribution = [
    { name: 'Free',       value: Math.round((freeCount / total) * 100),       color: '#94a3b8' },
    { name: 'Pro',        value: Math.round((proCount / total) * 100),        color: '#6366F1' },
    { name: 'Enterprise', value: Math.round((enterpriseCount / total) * 100), color: '#8B5CF6' },
  ];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allSearchablePages.filter(p =>
      p.label.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.sectionTitle.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  return (
    <DashboardLayout requireAdmin>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-[#6366F1] flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider">Admin Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">Platform-wide overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/settings"><Button variant="secondary" size="sm" icon={<Settings size={15} />}>Settings</Button></Link>
          <Link to="/admin/maintenance"><Button size="sm" variant="outline" icon={<AlertTriangle size={15} />}>Maintenance</Button></Link>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-8">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search admin pages… (e.g. pricing, homepage, users, SEO)"
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] rounded-2xl shadow-2xl overflow-hidden">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">{searchResults.length} results</p>
            {searchResults.map(r => (
              <button
                key={r.path}
                onClick={() => { navigate(r.path); setSearchQuery(''); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#232650] transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${r.sectionColor}18`, color: r.sectionColor }}>
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{r.label}</p>
                  <p className="text-xs text-gray-400 truncate">{r.sectionTitle} · {r.desc}</p>
                </div>
                <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
        {searchQuery && searchResults.length === 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-[#191c40] border border-gray-200 dark:border-[#232650] rounded-2xl shadow-xl px-4 py-4 text-center text-sm text-gray-400">
            No pages found for "{searchQuery}"
          </div>
        )}
      </div>

      {/* ── Stats (8 cards) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users"    value={totalUsers.toLocaleString()}   change="All registered"      changeType="increase" icon={<Users size={20} />}       color="#6366F1" />
        <StatCard title="Active Users"   value={activeUsers.toLocaleString()}  change="Currently active"    changeType="increase" icon={<CheckCircle size={20} />} color="#10B981" />
        <StatCard title="Guest Users"    value={guestUsers.toLocaleString()}   change="Free plan users"     changeType="neutral"  icon={<User size={20} />}        color="#64748B" />
        <StatCard title="Premium Users"  value={premiumUsers.toLocaleString()} change="Pro + Enterprise"    changeType="increase" icon={<Zap size={20} />}         color="#F59E0B" />
        <StatCard title="Active Subs"    value={activeSubs.toLocaleString()}   change="Paying subscribers"  changeType="increase" icon={<CreditCard size={20} />}  color="#8B5CF6" />
        <StatCard title="Revenue"        value={`$${monthlyRevenue}`}          change="Monthly from plans"  changeType="increase" icon={<TrendingUp size={20} />}  color="#EC4899" />
        <StatCard title="Suspended"      value={suspendedUsers.toLocaleString()} change="Banned accounts"  changeType={suspendedUsers > 0 ? 'decrease' : 'neutral'} icon={<AlertTriangle size={20} />} color="#EF4444" />
        <StatCard title="Credits Usage"  value="—"                             change="Track via credits"   changeType="neutral"  icon={<BarChart3 size={20} />}   color="#0EA5E9" />
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Revenue & User Growth</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Annual performance overview</p>
              </div>
              <Badge variant="success"><TrendingUp size={10} /> +12% Revenue</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A5B4FC" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#A5B4FC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fill="url(#colorRev)" name="Revenue ($)" />
                <Area type="monotone" dataKey="users" stroke="#A5B4FC" strokeWidth={2} fill="url(#colorUsers)" name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card>
          <h2 className="font-bold text-gray-900 dark:text-white mb-6">Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {planDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {planDistribution.map(p => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{p.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{p.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Admin Control Sections ── */}
      <div className="mb-10">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Admin Controls</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Click any section to manage and configure it</p>
        </div>
        <div className="space-y-4">
          {adminSections.map(section => (
            <div key={section.id} className="bg-white dark:bg-[#191c40] border border-gray-100 dark:border-[#232650] rounded-2xl overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-[#232650]">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: section.color }}>
                  {section.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</p>
                  <p className="text-xs text-gray-400">{section.desc}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${section.color}18`, color: section.color }}>
                  {section.pages.length} pages
                </span>
              </div>
              {/* Page grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-50 dark:divide-[#232650]">
                {section.pages.map(page => (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#232650]/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: `${section.color}12`, color: section.color }}>
                      {page.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{page.label}</p>
                        {page.badge && (
                          <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#6366F1] text-white uppercase">{page.badge}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate leading-tight">{page.desc}</p>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Users ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Registrations</h2>
          <Link to="/admin/users"><Button size="xs" variant="ghost">View All</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#232650]">
                {['User', 'Email', 'Plan', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{user.name[0]}</div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.plan === 'enterprise' ? 'purple' : user.plan === 'pro' ? 'success' : 'default'} size="sm">{user.plan}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.joined}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'active' ? 'success' : 'error'} size="sm">
                      {user.status === 'active' ? <CheckCircle size={10} /> : null} {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="xs" variant="ghost" onClick={() => navigate('/admin/users')}>Manage</Button>
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </DashboardLayout>
  );
};
