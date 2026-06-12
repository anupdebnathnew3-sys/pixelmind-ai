import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Card';
import { useAdminStore } from '../../store/useAdminStore';
import { BellRing, Mail, User, Save, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export const NotificationsPage: React.FC = () => {
  const { guestAlertSettings, updateGuestAlertSettings, cmsContent, bulkUpdateCMSContent } = useAdminStore();
  const get = (k: string, fb = '') => cmsContent[k] ?? fb;

  const [guest, setGuest] = useState({ ...guestAlertSettings });

  const [emailNotifs, setEmailNotifs] = useState({
    notif_welcome_email_enabled: get('notif_welcome_email_enabled', 'true') === 'true',
    notif_welcome_email_subject: get('notif_welcome_email_subject', 'Welcome to PixelMind AI!'),
    notif_welcome_email_body: get('notif_welcome_email_body', 'Thank you for joining PixelMind AI. Your account is ready.'),
    notif_low_credits_enabled: get('notif_low_credits_enabled', 'true') === 'true',
    notif_low_credits_threshold: get('notif_low_credits_threshold', '50'),
    notif_low_credits_subject: get('notif_low_credits_subject', 'Your PixelMind AI credits are running low'),
    notif_sub_expiry_enabled: get('notif_sub_expiry_enabled', 'true') === 'true',
    notif_sub_expiry_days: get('notif_sub_expiry_days', '7'),
    notif_payment_confirm_enabled: get('notif_payment_confirm_enabled', 'true') === 'true',
    notif_payment_confirm_subject: get('notif_payment_confirm_subject', 'Payment confirmed — your plan is active'),
    notif_admin_email: get('notif_admin_email', 'imagify.pro@gmail.com'),
    notif_new_user_admin: get('notif_new_user_admin', 'true') === 'true',
    notif_payment_admin: get('notif_payment_admin', 'true') === 'true',
  });

  const saveGuest = () => {
    updateGuestAlertSettings(guest);
    toast.success('Guest alert settings saved');
  };

  const saveEmail = () => {
    const updates: Record<string, string> = {};
    (Object.keys(emailNotifs) as (keyof typeof emailNotifs)[]).forEach(k => {
      updates[k] = typeof emailNotifs[k] === 'boolean' ? (emailNotifs[k] ? 'true' : 'false') : emailNotifs[k];
    });
    bulkUpdateCMSContent(updates);
    toast.success('Notification settings saved');
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
          <BellRing size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Email alerts, popups and in-app notification settings</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Guest Alert */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Guest Signup Prompt</h2>
            </div>
            <div className="flex items-center gap-2">
              <Toggle checked={guest.enabled} onChange={v => setGuest(g => ({ ...g, enabled: v }))} label="Enabled" />
              <Button size="sm" icon={<Save size={14} />} onClick={saveGuest}>Save</Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Show After N Uses" type="number" value={String(guest.showAfterUses)} onChange={e => setGuest(g => ({ ...g, showAfterUses: Number(e.target.value) }))} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Position</label>
              <select value={guest.position} onChange={e => setGuest(g => ({ ...g, position: e.target.value as 'top' | 'bottom' }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] transition-colors">
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
              </select>
            </div>
            <Input label="Alert Title" value={guest.title} onChange={e => setGuest(g => ({ ...g, title: e.target.value }))} />
            <Input label="CTA Button Text" value={guest.ctaText} onChange={e => setGuest(g => ({ ...g, ctaText: e.target.value }))} />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Message</label>
              <textarea value={guest.message} onChange={e => setGuest(g => ({ ...g, message: e.target.value }))} rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-none transition-colors" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Show on low credits</p>
              <Toggle checked={guest.showOnLowCredits} onChange={v => setGuest(g => ({ ...g, showOnLowCredits: v }))} label="" />
            </div>
            {guest.showOnLowCredits && (
              <div className="w-40">
                <Input label="Credit threshold" type="number" value={String(guest.lowCreditThreshold)} onChange={e => setGuest(g => ({ ...g, lowCreditThreshold: Number(e.target.value) }))} />
              </div>
            )}
          </div>
        </Card>

        {/* Email Notifications */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#6366F1]" />
              <h2 className="font-bold text-gray-900 dark:text-white">Email Notifications</h2>
            </div>
            <Button size="sm" icon={<Save size={14} />} onClick={saveEmail}>Save</Button>
          </div>

          <div className="mb-4">
            <Input label="Admin Notification Email" value={emailNotifs.notif_admin_email}
              onChange={e => setEmailNotifs(n => ({ ...n, notif_admin_email: e.target.value }))} />
          </div>

          <div className="space-y-4">
            {[
              { key: 'notif_welcome_email_enabled', label: 'Welcome email on registration', subKey: 'notif_welcome_email_subject', subLabel: 'Subject' },
              { key: 'notif_low_credits_enabled', label: 'Low credits warning email', subKey: 'notif_low_credits_threshold', subLabel: 'Threshold (credits)' },
              { key: 'notif_sub_expiry_enabled', label: 'Subscription expiry reminder', subKey: 'notif_sub_expiry_days', subLabel: 'Days before expiry' },
              { key: 'notif_payment_confirm_enabled', label: 'Payment confirmation email', subKey: 'notif_payment_confirm_subject', subLabel: 'Subject' },
            ].map(item => {
              const enabled = emailNotifs[item.key as keyof typeof emailNotifs] as boolean;
              return (
                <div key={item.key} className="border border-gray-100 dark:border-[#232650] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#191c40]">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <Toggle checked={enabled}
                      onChange={v => setEmailNotifs(n => ({ ...n, [item.key]: v }))} label="" />
                  </div>
                  {enabled && (
                    <div className="px-4 py-3">
                      <Input label={item.subLabel}
                        value={emailNotifs[item.subKey as keyof typeof emailNotifs] as string}
                        onChange={e => setEmailNotifs(n => ({ ...n, [item.subKey]: e.target.value }))} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Admin Alerts */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Bell size={16} className="text-[#6366F1]" />
            <h2 className="font-bold text-gray-900 dark:text-white">Admin Alerts</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-[#232650] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">New user registration</p>
                <p className="text-xs text-gray-400">Send email to admin when a new user registers</p>
              </div>
              <Toggle checked={emailNotifs.notif_new_user_admin}
                onChange={v => setEmailNotifs(n => ({ ...n, notif_new_user_admin: v }))} label="" />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-[#232650] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">New payment received</p>
                <p className="text-xs text-gray-400">Send email to admin when a payment is confirmed</p>
              </div>
              <Toggle checked={emailNotifs.notif_payment_admin}
                onChange={v => setEmailNotifs(n => ({ ...n, notif_payment_admin: v }))} label="" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" icon={<Save size={14} />} onClick={saveEmail}>Save Admin Alerts</Button>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};
