import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdminStore } from '../../store/useAdminStore';
import {
  Users, CreditCard, Zap, BarChart3, TrendingUp, AlertTriangle,
  CheckCircle, Settings, MessageSquare, FileText, ChevronRight
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

const adminLinks = [
  { label: 'User Management',   path: '/admin/users',         icon: <Users size={18} />,       color: '#6366F1' },
  { label: 'Subscriptions',     path: '/admin/subscriptions', icon: <CreditCard size={18} />,  color: '#8B5CF6' },
  { label: 'API Management',    path: '/admin/apis',          icon: <Zap size={18} />,         color: '#F59E0B' },
  { label: 'Prompt Management', path: '/admin/prompts',       icon: <MessageSquare size={18} />, color: '#EF4444' },
  { label: 'Credit Management', path: '/admin/credits',       icon: <BarChart3 size={18} />,   color: '#10B981' },
  { label: 'Content Management',path: '/admin/content',       icon: <FileText size={18} />,    color: '#3B82F6' },
  { label: 'Global Settings',   path: '/admin/settings',      icon: <Settings size={18} />,    color: '#6B7280' },
  { label: 'Maintenance Mode',  path: '/admin/maintenance',   icon: <AlertTriangle size={18} />, color: '#F59E0B' },
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
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users"     value={totalUsers.toLocaleString()}    change="All registered users"   changeType="increase" icon={<Users size={20} />}      color="#6366F1" />
        <StatCard title="Active Subs"     value={activeSubs.toLocaleString()}    change="Paying subscribers"     changeType="increase" icon={<CreditCard size={20} />} color="#8B5CF6" />
        <StatCard title="Monthly Revenue" value={`$${monthlyRevenue}`}           change="From active plans"      changeType="increase" icon={<TrendingUp size={20} />} color="#F59E0B" />
        <StatCard title="Suspended"       value={suspendedUsers.toLocaleString()} change="Suspended accounts"   changeType={suspendedUsers > 0 ? 'decrease' : 'neutral'} icon={<Zap size={20} />} color="#EF4444" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
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

        {/* Plan Distribution */}
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

      {/* Quick Admin Links */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Admin Controls</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {adminLinks.map(link => (
            <Link key={link.path} to={link.path}>
              <div className="group flex items-center gap-3 p-4 bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] hover:border-[#A5B4FC] dark:hover:border-[#6366F1] transition-all hover:shadow-md">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: link.color }}>
                  {link.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{link.label}</span>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#6366F1] ml-auto" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Users */}
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
