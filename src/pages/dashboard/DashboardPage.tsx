import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Card';
import { useStore } from '../../store/useStore';
import { useAdminStore } from '../../store/useAdminStore';
import {
  Image, FileText, Globe, Zap, TrendingUp, Clock, Download,
  ArrowRight, Star, Hash, Calendar, Bot, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const usageData = [
  { day: 'Mon', generations: 12, credits: 48 },
  { day: 'Tue', generations: 28, credits: 112 },
  { day: 'Wed', generations: 19, credits: 76 },
  { day: 'Thu', generations: 45, credits: 180 },
  { day: 'Fri', generations: 38, credits: 152 },
  { day: 'Sat', generations: 22, credits: 88 },
  { day: 'Sun', generations: 31, credits: 124 },
];

const recentActivity = [
  { type: 'metadata', title: 'Generated metadata for 24 images', time: '2 min ago', icon: '🖼', color: '#6366F1' },
  { type: 'content', title: 'AI blog post: "10 Tips for Stock Photography"', time: '1 hour ago', icon: '📝', color: '#8B5CF6' },
  { type: 'prompt', title: 'Image-to-prompt for 3 Midjourney images', time: '3 hours ago', icon: '🎨', color: '#F59E0B' },
  { type: 'scheduler', title: 'Scheduled 5 posts to Instagram & X', time: '5 hours ago', icon: '📅', color: '#EF4444' },
  { type: 'export', title: 'Exported 150 metadata records as CSV', time: '1 day ago', icon: '📤', color: '#10B981' },
];

const ALL_QUICK_TOOLS = [
  { label: 'AI Metadata', path: '/tools/metadata', icon: <Image size={20} />, color: '#6366F1', desc: 'Generate for 100+ images' },
  { label: 'Image to Prompt', path: '/tools/image-to-prompt', icon: <Zap size={20} />, color: '#8B5CF6', desc: 'For Midjourney & more' },
  { label: 'Content Writer', path: '/tools/content-writer', icon: <FileText size={20} />, color: '#F59E0B', desc: 'Blogs, scripts & more' },
  { label: 'Word Counter', path: '/tools/word-counter', icon: <Hash size={20} />, color: '#10B981', desc: 'Real-time analysis' },
  { label: 'Event Calendar', path: '/tools/event-calendar', icon: <Calendar size={20} />, color: '#3B82F6', desc: 'Global holidays' },
];

export const DashboardPage: React.FC = () => {
  const { user, credits } = useStore();
  const { tools: adminTools } = useAdminStore();
  const enabledPathSet = new Set(adminTools.filter(t => t.enabled).map(t => `/tools/${t.id}`));
  const quickTools = ALL_QUICK_TOOLS.filter(t => enabledPathSet.has(t.path));
  const maxCredits = user?.plan === 'enterprise' ? 99999 : user?.plan === 'pro' ? 5000 : 500;

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your AI workspace today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/billing">
            <Badge variant={user?.plan === 'enterprise' ? 'purple' : user?.plan === 'pro' ? 'success' : 'default'} size="md">
              <Star size={12} />
              {user?.plan?.toUpperCase()} Plan
            </Badge>
          </Link>
          <Link to="/tools/metadata">
            <Button size="sm" icon={<Zap size={15} />}>New Generation</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Generations"
          value="2,847"
          change="12% this week"
          changeType="increase"
          icon={<Image size={20} />}
          color="#6366F1"
        />
        <StatCard
          title="Credits Used"
          value={`${(maxCredits - credits).toLocaleString()}`}
          change={`${credits} remaining`}
          changeType="neutral"
          icon={<Zap size={20} />}
          color="#8B5CF6"
        />
        <StatCard
          title="Exports"
          value="48"
          change="5 this week"
          changeType="increase"
          icon={<Download size={20} />}
          color="#F59E0B"
        />
        <StatCard
          title="Scheduled Posts"
          value="12"
          change="3 pending"
          changeType="neutral"
          icon={<Globe size={20} />}
          color="#EF4444"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Usage Chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Weekly Usage</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generations & credits consumed</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-[#6366F1] inline-block" /> Generations</span>
                <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-[#A5B4FC] inline-block" /> Credits</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A5B4FC" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#A5B4FC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="generations" stroke="#6366F1" strokeWidth={2} fill="url(#colorGen)" />
                <Area type="monotone" dataKey="credits" stroke="#A5B4FC" strokeWidth={2} fill="url(#colorCredit)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Credit & Plan */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Credit Balance</h3>
              <Link to="/billing" className="text-xs text-[#6366F1] hover:underline flex items-center gap-1">
                Upgrade <ChevronRight size={12} />
              </Link>
            </div>
            <div className="text-center py-4">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EEF2FF" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366F1" strokeWidth="3" strokeDasharray={`${(credits / maxCredits) * 100}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{credits}</span>
                  <span className="text-[10px] text-gray-400">credits</span>
                </div>
              </div>
              <Progress value={credits} max={maxCredits} label={`${credits} / ${maxCredits}`} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Resets on {new Date(new Date().setDate(1) as unknown as string).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link to="/billing">
              <Button variant="secondary" fullWidth size="sm" icon={<TrendingUp size={14} />}>
                Upgrade Plan
              </Button>
            </Link>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center">
                <Bot size={18} className="text-[#6366F1]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Active AI Model</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">System quota</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Provider</span>
                <span className="font-medium text-gray-900 dark:text-white">OpenAI</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Model</span>
                <span className="font-medium text-gray-900 dark:text-white">GPT-4o</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="text-green-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Active
                </span>
              </div>
            </div>
            <Link to="/ai-settings">
              <Button variant="ghost" fullWidth size="sm" className="mt-3">
                Change AI Settings
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Quick Access Tools</h2>
          <Link to="/tools" className="text-sm text-[#6366F1] hover:underline flex items-center gap-1">
            All Tools <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickTools.map(tool => (
            <Link key={tool.path} to={tool.path}>
              <div className="group p-4 bg-white dark:bg-[#191c40] rounded-2xl border border-gray-100 dark:border-[#232650] hover:border-[#A5B4FC] dark:hover:border-[#6366F1] transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-[#6366F1]/10 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: tool.color }}
                >
                  {tool.icon}
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{tool.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <Link to="/history" className="text-xs text-[#6366F1] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: activity.color + '20' }}
                >
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tool Usage Breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Tool Usage This Month</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'Metadata', uses: 142 },
              { name: 'Content', uses: 89 },
              { name: 'Img2Prompt', uses: 67 },
              { name: 'Scheduler', uses: 45 },
              { name: 'Word Count', uses: 38 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="uses" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {[
              { name: 'AI Metadata Generator', uses: 142, color: '#6366F1' },
              { name: 'AI Content Writer', uses: 89, color: '#8B5CF6' },
              { name: 'Image to Prompt', uses: 67, color: '#F59E0B' },
            ].map(tool => (
              <div key={tool.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tool.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{tool.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{tool.uses} uses</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
