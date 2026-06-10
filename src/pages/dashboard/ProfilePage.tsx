import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import {
  User, Mail, Calendar, Zap, Shield, Edit3, Check,
  X, Camera, Award, BarChart3, FileText, Image
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  enterprise: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free Plan',
  pro: 'Pro Plan',
  enterprise: 'Enterprise',
};

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useStore();
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [bioValue, setBioValue] = useState('AI enthusiast and content creator.');
  const [savedBio, setSavedBio] = useState('AI enthusiast and content creator.');

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const saveName = () => {
    if (!nameValue.trim()) { toast.error('Name cannot be empty'); return; }
    setUser({ ...user, name: nameValue.trim() });
    setEditingName(false);
    toast.success('Name updated!');
  };

  const saveBio = () => {
    setSavedBio(bioValue);
    setEditingBio(false);
    toast.success('Bio updated!');
  };

  const stats = [
    { label: 'Credits Remaining', value: user.credits.toLocaleString(), icon: <Zap size={18} />, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Tools Used', value: '8', icon: <BarChart3 size={18} />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Content Created', value: '142', icon: <FileText size={18} />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Images Processed', value: '2,847', icon: <Image size={18} />, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and account details</p>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#6366F1]/25">
                {initials}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-[#6366F1] hover:border-[#6366F1] transition-colors shadow-sm">
                <Camera size={13} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                      className="border border-[#6366F1] rounded-lg px-3 py-1.5 text-lg font-bold text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                      autoFocus
                    />
                    <button onClick={saveName} className="p-1.5 rounded-lg bg-[#6366F1] text-white hover:bg-[#4F46E5]"><Check size={14} /></button>
                    <button onClick={() => { setNameValue(user.name); setEditingName(false); }} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                    <button onClick={() => setEditingName(true)} className="p-1 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] transition-colors">
                      <Edit3 size={14} />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Mail size={13} />
                <span>{user.email}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                  {PLAN_LABELS[user.plan] || user.plan}
                </span>
                {user.role === 'admin' && (
                  <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1">
                    <Shield size={10} /> Admin
                  </span>
                )}
                {user.emailVerified && (
                  <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center gap-1">
                    <Check size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Bio</label>
              {!editingBio && (
                <button onClick={() => setEditingBio(true)} className="text-xs text-[#6366F1] hover:underline flex items-center gap-1">
                  <Edit3 size={12} /> Edit
                </button>
              )}
            </div>
            {editingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioValue}
                  onChange={e => setBioValue(e.target.value)}
                  rows={3}
                  className="w-full border border-[#6366F1] rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 resize-none"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveBio} icon={<Check size={14} />}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setBioValue(savedBio); setEditingBio(false); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">{savedBio}</p>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => (
            <Card key={s.label} padding="sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Account Details */}
        <Card>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Account Details</h3>
          <div className="space-y-3">
            {[
              { label: 'User ID', value: `#${user.id}` },
              { label: 'Role', value: user.role === 'admin' ? 'Administrator' : 'Standard User' },
              { label: 'Plan', value: PLAN_LABELS[user.plan] || user.plan },
              { label: 'Member Since', value: memberSince },
              { label: 'Email Verification', value: user.emailVerified ? 'Verified' : 'Pending' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{row.label}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={16} className="text-amber-500" /> Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: '🚀', title: 'Early Adopter', desc: 'Joined in the first year', unlocked: true },
              { emoji: '🎨', title: 'Creator', desc: 'Generated 100+ items', unlocked: true },
              { emoji: '⚡', title: 'Power User', desc: 'Used 5+ tools', unlocked: true },
              { emoji: '💎', title: 'Pro Creator', desc: 'Upgrade to Pro', unlocked: user.plan !== 'free' },
              { emoji: '🌍', title: 'Global Creator', desc: 'Process 1000+ images', unlocked: false },
              { emoji: '🏆', title: 'Champion', desc: 'Top 100 creator', unlocked: false },
            ].map(a => (
              <div key={a.title} className={`p-3 rounded-xl border transition-all ${a.unlocked ? 'border-[#6366F1]/20 bg-[#EEF2FF] dark:bg-[#6366F1]/10' : 'border-gray-100 dark:border-gray-800 opacity-40 grayscale'}`}>
                <div className="text-2xl mb-1.5">{a.emoji}</div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{a.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Links */}
        <Card padding="sm">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<Zap size={14} />} onClick={() => window.location.href = '/billing'}>Upgrade Plan</Button>
            <Button size="sm" variant="secondary" icon={<Calendar size={14} />} onClick={() => window.location.href = '/tools/event-calendar'}>Event Calendar</Button>
            <Button size="sm" variant="secondary" icon={<User size={14} />} onClick={() => window.location.href = '/settings'}>Account Settings</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
