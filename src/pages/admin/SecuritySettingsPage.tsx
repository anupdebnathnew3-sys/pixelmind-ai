import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { useAdminStore } from '../../store/useAdminStore';
import { Shield, Lock, Activity, Key, Globe, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function Toggle({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#232650] last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ml-4 ${value ? 'bg-[#6366F1]' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${active ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-[#232650] text-gray-500'}`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {label}
    </div>
  );
}

export const SecuritySettingsPage: React.FC = () => {
  const { securitySettings, updateSecuritySettings } = useAdminStore();
  const s = securitySettings;

  const patch = (updates: Partial<typeof s>) => {
    updateSecuritySettings(updates);
    toast.success('Security setting updated');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure platform security policies and protections</p>
        </div>

        {/* Security overview */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#6366F1]" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Security Overview</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <StatusBadge active={s.httpsEnforced} label="HTTPS Enforced" />
            <StatusBadge active={s.csrfProtection} label="CSRF Protection" />
            <StatusBadge active={s.xssProtection} label="XSS Protection" />
            <StatusBadge active={s.apiKeyMasking} label="API Key Masking" />
            <StatusBadge active={s.activityLoggingEnabled} label="Activity Logging" />
            <StatusBadge active={s.ipWhitelistEnabled} label="IP Whitelist" />
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Authentication */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Lock size={15} className="text-[#6366F1]" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Authentication</h3>
            </div>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Session Timeout: {s.sessionTimeoutMinutes} minutes
                </label>
                <input
                  type="range" min={30} max={10080} step={30} value={s.sessionTimeoutMinutes}
                  onChange={e => patch({ sessionTimeoutMinutes: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>30 min</span><span>7 days</span></div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Max Login Attempts: {s.maxLoginAttempts}
                </label>
                <input
                  type="range" min={3} max={20} value={s.maxLoginAttempts}
                  onChange={e => patch({ maxLoginAttempts: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Min Password Length: {s.passwordMinLength}
                </label>
                <input
                  type="range" min={6} max={32} value={s.passwordMinLength}
                  onChange={e => patch({ passwordMinLength: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
            <Toggle
              label="Require Special Characters"
              description="Passwords must include !@#$% etc."
              value={s.requireSpecialChar}
              onChange={v => patch({ requireSpecialChar: v })}
            />
          </Card>

          {/* API & Monitoring */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Key size={15} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">API Security</h3>
              </div>
              <Toggle
                label="API Key Masking"
                description="Mask keys in UI as •••••XXXXX"
                value={s.apiKeyMasking}
                onChange={v => patch({ apiKeyMasking: v })}
              />
              <div className="pt-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Rate Limit: {s.rateLimitPerMinute} req/min
                </label>
                <input
                  type="range" min={10} max={300} step={10} value={s.rateLimitPerMinute}
                  onChange={e => patch({ rateLimitPerMinute: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={15} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Monitoring</h3>
              </div>
              <Toggle
                label="Activity Logging"
                description="Log admin and user actions"
                value={s.activityLoggingEnabled}
                onChange={v => patch({ activityLoggingEnabled: v })}
              />
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={15} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Network</h3>
              </div>
              <Toggle
                label="IP Whitelist"
                description="Restrict admin access to specific IPs"
                value={s.ipWhitelistEnabled}
                onChange={v => patch({ ipWhitelistEnabled: v })}
              />
              {s.ipWhitelistEnabled && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Allowed IPs (comma-separated)</label>
                  <textarea
                    value={s.allowedIPs}
                    onChange={e => patch({ allowedIPs: e.target.value })}
                    rows={3}
                    placeholder="192.168.1.1, 10.0.0.1"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] text-sm outline-none focus:border-[#6366F1] text-gray-700 dark:text-gray-300"
                  />
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Protection status */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-emerald-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Built-in Protections</h3>
            <span className="text-xs text-gray-400">These protections are always active</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'HTTPS Enforcement', desc: 'All connections encrypted in transit' },
              { label: 'CSRF Protection', desc: 'Cross-site request forgery prevention' },
              { label: 'XSS Protection', desc: 'Cross-site scripting defense active' },
              { label: 'SQL Injection Protection', desc: 'Database query sanitization' },
              { label: 'Input Sanitization', desc: 'All user inputs validated and cleaned' },
              { label: 'Secure Session Handling', desc: 'JWT-based auth with expiration' },
              { label: 'Encrypted API Keys', desc: 'Keys masked and stored securely' },
              { label: 'Payment Verification', desc: 'Transaction IDs verified before activation' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
