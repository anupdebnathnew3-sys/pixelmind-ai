import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdminStore } from '../../store/useAdminStore';
import {
  Users, CreditCard, Zap, BarChart3, TrendingUp, AlertTriangle,
  CheckCircle, Settings, MessageSquare, FileText, ChevronRight,
  Palette, Shield, Scale, Bell, Navigation, Globe, Tag,
  DollarSign, Wallet, Lock, Bot, User, Image
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

interface AdminPage {
  label: string;
  desc: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface AdminSection {
  title: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  pages: AdminPage[];
}

const adminSections: AdminSection[] = [
  {
    title: 'Users & Access',
    desc: 'Manage registered users, credits, and subscriptions',
    color: '#6366F1',
    bg: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/15 dark:to-indigo-900/5',
    border: 'border-indigo-100 dark:border-indigo-800/30',
    icon: <Users size={18} />,
    pages: [
      { label: 'User Management',   desc: 'View, edit, suspend or delete users',          path: '/admin/users',         icon: <User size={15} /> },
      { label: 'Credit Management', desc: 'Adjust and monitor user credit balances',       path: '/admin/credits',       icon: <Zap size={15} /> },
      { label: 'Subscriptions',     desc: 'Browse and manage active subscriptions',        path: '/admin/subscriptions', icon: <CreditCard size={15} /> },
    ],
  },
  {
    title: 'Billing & Plans',
    desc: 'Configure pricing, discounts, payment and feature gating',
    color: '#8B5CF6',
    bg: 'from-violet-50 to-violet-50 dark:from-violet-900/15 dark:to-violet-900/5',
    border: 'border-violet-100 dark:border-violet-800/30',
    icon: <CreditCard size={18} />,
    pages: [
      { label: 'Pricing Manager',  desc: 'Set and update plan prices',                   path: '/admin/pricing',          icon: <DollarSign size={15} /> },
      { label: 'Discounts',        desc: 'Create promo codes and discount rules',         path: '/admin/discounts',        icon: <Tag size={15} /> },
      { label: 'Billing Manager',  desc: 'Review billing history and invoices',           path: '/admin/billing-manager',  icon: <Wallet size={15} /> },
      { label: 'Payment Gateway',  desc: 'Configure payment providers and keys',          path: '/admin/payment-gateway',  icon: <CreditCard size={15} /> },
      { label: 'Feature Access',   desc: 'Control which plans unlock which features',     path: '/admin/feature-access',   icon: <Lock size={15} /> },
    ],
  },
  {
    title: 'AI & Platform',
    desc: 'Manage API keys, models and AI prompt templates',
    color: '#F59E0B',
    bg: 'from-amber-50 to-amber-50 dark:from-amber-900/15 dark:to-amber-900/5',
    border: 'border-amber-100 dark:border-amber-800/30',
    icon: <Bot size={18} />,
    pages: [
      { label: 'API Management',    desc: 'Add and manage AI provider API keys',          path: '/admin/apis',    icon: <Zap size={15} /> },
      { label: 'Prompt Management', desc: 'Edit and fine-tune AI prompt templates',       path: '/admin/prompts', icon: <MessageSquare size={15} /> },
    ],
  },
  {
    title: 'Design & Content',
    desc: 'Control the visual theme, page text and site content',
    color: '#EC4899',
    bg: 'from-pink-50 to-pink-50 dark:from-pink-900/15 dark:to-pink-900/5',
    border: 'border-pink-100 dark:border-pink-800/30',
    icon: <Palette size={18} />,
    pages: [
      { label: 'CMS Editor',          desc: 'Edit all page text and copy site-wide',      path: '/admin/cms',         icon: <Globe size={15} />, badge: 'New' },
      { label: 'Theme Manager',       desc: 'Customize brand colors and UI theme',         path: '/admin/theme',       icon: <Palette size={15} /> },
      { label: 'Navigation Manager',  desc: 'Reorder and configure site navigation',       path: '/admin/navigation',  icon: <Navigation size={15} /> },
      { label: 'Content Management',  desc: 'Manage blog posts and marketing content',     path: '/admin/content',     icon: <FileText size={15} /> },
      { label: 'About Manager',       desc: 'Update your bio, photo and about page',       path: '/admin/about',       icon: <Image size={15} /> },
    ],
  },
  {
    title: 'Legal & Security',
    desc: 'Manage policies, access rules and guest alerts',
    color: '#EF4444',
    bg: 'from-red-50 to-red-50 dark:from-red-900/15 dark:to-red-900/5',
    border: 'border-red-100 dark:border-red-800/30',
    icon: <Shield size={18} />,
    pages: [
      { label: 'Legal Manager',      desc: 'Update terms of service and privacy policy',  path: '/admin/legal',        icon: <Scale size={15} /> },
      { label: 'Security Settings',  desc: 'Configure login rules and security options',  path: '/admin/security',     icon: <Shield size={15} /> },
      { label: 'Guest Alert Manager',desc: 'Set alerts and banners for guest visitors',   path: '/admin/guest-alerts', icon: <Bell size={15} /> },
    ],
  },
  {
    title: 'System',
    desc: 'Global settings and site maintenance controls',
    color: '#64748B',
    bg: 'from-slate-50 to-slate-50 dark:from-slate-800/20 dark:to-slate-800/10',
    border: 'border-slate-100 dark:border-slate-700/30',
    icon: <Settings size={18} />,
    pages: [
      { label: 'Global Settings',  desc: 'Site-wide configuration and preferences',      path: '/admin/settings',    icon: <Settings size={15} /> },
      { label: 'Maintenance Mode', desc: 'Take the site offline for maintenance',         path: '/admin/maintenance', icon: <AlertTriangle size={15} /> },
    ],
  },
];

export const AdminDashboardPage: React.FC = () => {
  const { adminUsers, adminSubscriptions } = useAdminStore();
  const navigate = useNavigate();

  const totalUsers = adminUsers.length;
  const activeSubs = adminSubscriptions.filter(s => s.status === 'active').length;
  const monthlyRevenue = adminSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);
  const suspendedUsers = adminUsers.filter(u => u.status === 'suspended').length;

  const freeCount = adminUsers.filter(u => u.plan === 'free').length;
  const proCount = adminUsers.filter(u => u.plan === 'pro').length;
  const enterpriseCount = adminUsers.filter(u => u.plan === 'enterprise').length;
  const total = totalUsers || 1;

  const planDistribution = [
    { name: 'Free',       value: Math.round((freeCount / total) * 100),       color: '#94a3b8' },
    { name: 'Pro',        value: Math.round((proCount / total) * 100),        color: '#6366F1' },
    { name: 'Enterprise', value: Math.round((enterpriseCount / total) * 100), color: '#8B5CF6' },
  ];

  const recentUsers = [...adminUsers].slice(-5).reverse();

  return (
    <DashboardLayout requireAdmin>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-[#6366F1] flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider">Admin Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platform-wide overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/settings">
            <Button variant="secondary" size="sm" icon={<Settings size={15} />}>Settings</Button>
          </Link>
          <Link to="/admin/maintenance">
            <Button size="sm" variant="outline" icon={<AlertTriangle size={15} />}>Maintenance</Button>
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users"     value={totalUsers.toLocaleString()}     change="All registered users"  changeType="increase" icon={<Users size={20} />}      color="#6366F1" />
        <StatCard title="Active Subs"     value={activeSubs.toLocaleString()}     change="Paying subscribers"    changeType="increase" icon={<CreditCard size={20} />} color="#8B5CF6" />
        <StatCard title="Monthly Revenue" value={`$${monthlyRevenue}`}            change="From active plans"     changeType="increase" icon={<TrendingUp size={20} />} color="#F59E0B" />
        <StatCard title="Suspended"       value={suspendedUsers.toLocaleString()} change="Suspended accounts"   changeType={suspendedUsers > 0 ? 'decrease' : 'neutral'} icon={<Zap size={20} />} color="#EF4444" />
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
                {planDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
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
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Admin Controls</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select any section below to manage and configure it</p>
        </div>

        <div className="space-y-6">
          {adminSections.map(section => (
            <div
              key={section.title}
              className={`rounded-2xl border bg-gradient-to-br ${section.bg} ${section.border} overflow-hidden`}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'inherit' }}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                  style={{ background: section.color }}
                >
                  {section.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{section.desc}</p>
                </div>
                <span
                  className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: `${section.color}18`, color: section.color }}
                >
                  {section.pages.length} {section.pages.length === 1 ? 'page' : 'pages'}
                </span>
              </div>

              {/* Page rows */}
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {section.pages.map((page, idx) => (
                  <div
                    key={page.path}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                  >
                    {/* Step number */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${section.color}15`, color: section.color }}
                    >
                      {idx + 1}
                    </div>

                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${section.color}12`, color: section.color }}
                    >
                      {page.icon}
                    </div>

                    {/* Label + desc */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{page.label}</p>
                        {page.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#6366F1] text-white uppercase tracking-wide">
                            {page.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{page.desc}</p>
                    </div>

                    {/* Edit button */}
                    <Link
                      to={page.path}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 border"
                      style={{
                        color: section.color,
                        borderColor: `${section.color}30`,
                        background: `${section.color}08`,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = section.color;
                        (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = `${section.color}08`;
                        (e.currentTarget as HTMLAnchorElement).style.color = section.color;
                      }}
                    >
                      Edit
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Users ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Users</h2>
          <Link to="/admin/users">
            <Button size="xs" variant="ghost">View All</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#232650]">
                {['User', 'Email', 'Plan', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                        {user.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.plan === 'enterprise' ? 'purple' : user.plan === 'pro' ? 'success' : 'default'} size="sm">
                      {user.plan}
                    </Badge>
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
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </DashboardLayout>
  );
};
