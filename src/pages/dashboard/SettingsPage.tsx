import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import {
  User, Bell, Shield, Palette, Globe, Trash2,
  Check, Moon, Sun, Lock, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'account' | 'notifications' | 'appearance' | 'security' | 'privacy';

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }> = ({ checked, onChange, label, desc }) => (
  <div className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      {desc && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>}
    </div>
    <label className="flex-shrink-0 relative cursor-pointer">
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-[#6366F1]' : 'bg-gray-200 dark:bg-gray-700'}`} />
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </label>
  </div>
);

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'account', label: 'Account', icon: <User size={15} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
  { id: 'security', label: 'Security', icon: <Shield size={15} /> },
  { id: 'privacy', label: 'Privacy', icon: <Globe size={15} /> },
];

export const SettingsPage: React.FC = () => {
  const { user, setUser, theme, setTheme } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('account');

  // Account state
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [displayEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  // Notification state
  const [notifs, setNotifs] = useState({
    emailMarketing: false,
    emailUpdates: true,
    emailAlerts: true,
    pushGenerations: true,
    pushCredits: true,
    pushSystem: false,
  });

  // Security state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  // Privacy state
  const [privacy, setPrivacy] = useState({
    analytics: true,
    crashReports: true,
    personalization: true,
    showActivity: false,
  });

  const saveAccount = () => {
    if (!displayName.trim()) { toast.error('Name is required'); return; }
    if (user) setUser({ ...user, name: displayName.trim() });
    toast.success('Account settings saved!');
  };

  const saveNotifications = () => toast.success('Notification preferences saved!');
  const savePrivacy = () => toast.success('Privacy settings saved!');

  const changePassword = () => {
    if (!currentPw) { toast.error('Enter your current password'); return; }
    if (newPw.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    toast.success('Password updated successfully!');
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and application settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Personal Information</h3>
              <div className="space-y-4">
                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  icon={<User size={15} />}
                  placeholder="Your name"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Email Address</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <span className="text-gray-400"><User size={15} /></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{displayEmail}</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full font-medium">Verified</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email changes require identity verification. Contact support.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none">
                      <option value="en">English</option>
                      <option value="bn">Bengali</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="es">Spanish</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none">
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="Asia/Dhaka">Dhaka (GMT+6)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">London (GMT+0)</option>
                      <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                      <option value="Australia/Sydney">Sydney (GMT+11)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800">
                <Button onClick={saveAccount} icon={<Check size={15} />}>Save Changes</Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Plan & Billing</h3>
              <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Current Plan</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{user.plan} plan · {user.credits.toLocaleString()} credits remaining</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => window.location.href = '/billing'}>Manage Plan</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Invoices & Receipts</p>
                  <p className="text-xs text-gray-500 mt-0.5">Download past invoices</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => window.location.href = '/billing'}>View Billing</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Email Notifications</h3>
              <Toggle checked={notifs.emailAlerts} onChange={v => setNotifs(n => ({ ...n, emailAlerts: v }))} label="Security Alerts" desc="Get notified about account login and security events" />
              <Toggle checked={notifs.emailUpdates} onChange={v => setNotifs(n => ({ ...n, emailUpdates: v }))} label="Product Updates" desc="New features, improvements, and announcements" />
              <Toggle checked={notifs.emailMarketing} onChange={v => setNotifs(n => ({ ...n, emailMarketing: v }))} label="Marketing Emails" desc="Tips, tutorials, and promotional offers" />
            </Card>
            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">In-App Notifications</h3>
              <Toggle checked={notifs.pushGenerations} onChange={v => setNotifs(n => ({ ...n, pushGenerations: v }))} label="Generation Complete" desc="When AI finishes processing your requests" />
              <Toggle checked={notifs.pushCredits} onChange={v => setNotifs(n => ({ ...n, pushCredits: v }))} label="Credit Alerts" desc="When credits are running low (below 20%)" />
              <Toggle checked={notifs.pushSystem} onChange={v => setNotifs(n => ({ ...n, pushSystem: v }))} label="System Messages" desc="Maintenance windows and system updates" />
            </Card>
            <Button onClick={saveNotifications} icon={<Check size={15} />}>Save Preferences</Button>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'light', label: 'Light Mode', icon: <Sun size={22} />, desc: 'Clean white interface' },
                  { id: 'dark', label: 'Dark Mode', icon: <Moon size={22} />, desc: 'Easy on the eyes' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as 'light' | 'dark')}
                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center ${
                      theme === t.id
                        ? 'border-[#6366F1] bg-[#EEF2FF] dark:bg-[#6366F1]/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#6366F1]/50'
                    }`}
                  >
                    <span className={theme === t.id ? 'text-[#6366F1]' : 'text-gray-400'}>{t.icon}</span>
                    <p className={`text-sm font-bold ${theme === t.id ? 'text-[#6366F1]' : 'text-gray-700 dark:text-gray-300'}`}>{t.label}</p>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                    {theme === t.id && <span className="text-[10px] px-2 py-0.5 bg-[#6366F1] text-white rounded-full font-semibold">Active</span>}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Font Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'small', label: 'Small', sample: 'Aa', size: '12px' }, { id: 'medium', label: 'Medium', sample: 'Aa', size: '14px' }, { id: 'large', label: 'Large', sample: 'Aa', size: '16px' }].map(f => (
                  <button key={f.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#6366F1] transition-colors">
                    <span className="font-bold text-gray-700 dark:text-gray-300" style={{ fontSize: f.size }}>{f.sample}</span>
                    <span className="text-xs text-gray-500">{f.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Sidebar</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Compact Sidebar</p>
                  <p className="text-xs text-gray-500 mt-0.5">Show icons only when collapsed</p>
                </div>
                <span className="text-xs text-gray-400">Controlled via the collapse button in sidebar</span>
              </div>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Change Password</h3>
              <div className="space-y-3">
                <Input
                  label="Current Password"
                  type={showPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  icon={<Lock size={15} />}
                  iconRight={<button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>}
                  placeholder="Current password"
                />
                <Input
                  label="New Password"
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  icon={<Lock size={15} />}
                  placeholder="Minimum 8 characters"
                />
                {newPw && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {Array(4).fill(0).map((_, i) => {
                        const score = [newPw.length >= 8, /[A-Z]/.test(newPw), /[0-9]/.test(newPw), /[^A-Za-z0-9]/.test(newPw)].filter(Boolean).length;
                        return <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? ['bg-red-500','bg-amber-500','bg-blue-500','bg-emerald-500'][score-1] : 'bg-gray-200 dark:bg-gray-700'}`} />;
                      })}
                    </div>
                    <p className="text-xs text-gray-400">Use uppercase, numbers, and symbols for a stronger password</p>
                  </div>
                )}
                <Input
                  label="Confirm New Password"
                  type={showPw ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  icon={<Lock size={15} />}
                  placeholder="Repeat new password"
                />
              </div>
              <div className="mt-4">
                <Button onClick={changePassword} icon={<Check size={15} />}>Update Password</Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Enable 2FA</p>
                  <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
                </div>
                <label className="relative cursor-pointer">
                  <input type="checkbox" className="sr-only" checked={twoFA} onChange={e => { setTwoFA(e.target.checked); toast.success(e.target.checked ? '2FA setup initiated' : '2FA disabled'); }} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${twoFA ? 'bg-[#6366F1]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFA ? 'translate-x-5' : ''}`} />
                </label>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Active Sessions</h3>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                    <p className="text-xs text-gray-500 mt-0.5">Browser • This device • Active now</p>
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold">Active</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Data & Privacy</h3>
              <Toggle checked={privacy.analytics} onChange={v => setPrivacy(p => ({ ...p, analytics: v }))} label="Usage Analytics" desc="Help improve the platform by sharing anonymous usage data" />
              <Toggle checked={privacy.crashReports} onChange={v => setPrivacy(p => ({ ...p, crashReports: v }))} label="Crash Reports" desc="Automatically send error reports to help fix bugs" />
              <Toggle checked={privacy.personalization} onChange={v => setPrivacy(p => ({ ...p, personalization: v }))} label="Personalization" desc="Allow AI models to personalize results based on your history" />
              <Toggle checked={privacy.showActivity} onChange={v => setPrivacy(p => ({ ...p, showActivity: v }))} label="Show Activity Status" desc="Let team members see when you're active" />
            </Card>
            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Data Management</h3>
              <div className="space-y-2">
                <button onClick={() => toast.success('Data export requested. You will receive an email within 24 hours.')} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Export My Data</p>
                    <p className="text-xs text-gray-500 mt-0.5">Download all your account data and history</p>
                  </div>
                  <span className="text-xs text-[#6366F1] font-semibold">Request →</span>
                </button>
              </div>
            </Card>
            <Button onClick={savePrivacy} icon={<Check size={15} />}>Save Privacy Settings</Button>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900/30">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Irreversible and destructive actions</p>
                </div>
              </div>
              <button onClick={() => toast.error('Account deletion requires email confirmation. Feature coming soon.')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-medium transition-colors">
                <Trash2 size={15} /> Delete Account
              </button>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
