import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, AlertTriangle, Clock, CheckCircle, Settings, Save } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import toast from 'react-hot-toast';

const HISTORY = [
  { date: '2026-05-20', start: '02:00 UTC', duration: '45 min', reason: 'Database migration', status: 'completed' },
  { date: '2026-04-15', start: '03:00 UTC', duration: '2 hours', reason: 'Server upgrade', status: 'completed' },
  { date: '2026-03-08', start: '01:00 UTC', duration: '30 min', reason: 'Security patches', status: 'completed' },
];

export const MaintenancePage: React.FC = () => {
  const {
    maintenanceMode, setMaintenanceMode,
    maintenanceMessage, setMaintenanceMessage,
    scheduledMaintenance, setScheduledMaintenance,
  } = useAdminStore();

  const [localMessage, setLocalMessage] = useState(maintenanceMessage);
  const [scheduled, setScheduled] = useState(scheduledMaintenance?.start ?? '');
  const [duration, setDuration] = useState(String(scheduledMaintenance?.duration ?? 60));
  const [allowAdmin, setAllowAdmin] = useState(true);

  const handleToggle = () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    toast.success(next
      ? 'Maintenance mode ACTIVATED — non-admin users see maintenance page'
      : 'Maintenance mode deactivated — platform is live',
      { duration: 5000 }
    );
  };

  const saveMessage = () => {
    setMaintenanceMessage(localMessage);
    toast.success('Maintenance message saved');
  };

  const scheduleMaintenance = () => {
    if (!scheduled) { toast.error('Select a start date and time'); return; }
    setScheduledMaintenance({ start: scheduled, duration: Number(duration) });
    toast.success(`Maintenance scheduled for ${new Date(scheduled).toLocaleString()} · ${duration} min`);
  };

  const clearSchedule = () => {
    setScheduledMaintenance(null);
    setScheduled('');
    toast.success('Schedule cleared');
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Mode</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Control platform access during maintenance windows</p>
          </div>
          <Badge variant={maintenanceMode ? 'error' : 'success'} size="sm">
            {maintenanceMode ? '🔴 MAINTENANCE ACTIVE' : '🟢 Platform Live'}
          </Badge>
        </div>

        {/* Status Banner */}
        {maintenanceMode && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border-2 border-amber-300 dark:border-amber-700 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">Maintenance Mode is Active</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                All non-admin users are being redirected to the maintenance page. Admin accounts still have full access.
              </p>
            </div>
          </div>
        )}

        {scheduledMaintenance && !maintenanceMode && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 flex items-start gap-3">
            <Clock size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-blue-800 dark:text-blue-300">Maintenance Scheduled</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                {new Date(scheduledMaintenance.start).toLocaleString()} · {scheduledMaintenance.duration} minutes
              </p>
            </div>
            <button onClick={clearSchedule} className="text-xs text-blue-500 hover:underline">Clear</button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Toggle Control */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Maintenance Toggle</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Instantly enable or disable maintenance mode</p>
              </div>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 mb-4 ${maintenanceMode ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : 'bg-gray-50 dark:bg-gray-800 border-transparent'}`}>
              <div>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Maintenance Mode
                  {maintenanceMode && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300 rounded-full font-semibold animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {maintenanceMode ? 'Non-admin users see maintenance page' : 'Platform is accessible to all users'}
                </p>
              </div>
              <button onClick={handleToggle}
                className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none ${maintenanceMode ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
              <Settings size={14} className="text-gray-400" />
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={allowAdmin} onChange={e => setAllowAdmin(e.target.checked)} className="rounded" />
                Admin accounts bypass maintenance mode
              </label>
            </div>

            <Button
              fullWidth
              variant={maintenanceMode ? 'danger' : 'primary'}
              icon={maintenanceMode ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              onClick={handleToggle}
            >
              {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
            </Button>
          </Card>

          {/* Message & Schedule */}
          <div className="space-y-4">
            <Card>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Maintenance Message</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">This message is shown to users during maintenance.</p>
              <textarea
                value={localMessage}
                onChange={e => setLocalMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 resize-none"
              />
              <Button size="sm" className="mt-3" icon={<Save size={13} />} onClick={saveMessage}>Save Message</Button>
            </Card>

            <Card>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock size={16} className="text-[#6366F1]" /> Schedule Maintenance
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Start Date & Time</label>
                  <input type="datetime-local" value={scheduled} onChange={e => setScheduled(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Estimated Duration (minutes)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min="15" step="15"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20" />
                </div>
                <Button size="sm" icon={<Clock size={13} />} onClick={scheduleMaintenance} disabled={!scheduled}>
                  Schedule Maintenance
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* History */}
        <Card className="mt-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Maintenance History</h3>
          <div className="space-y-3">
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{h.reason}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{h.date} · {h.start} · {h.duration}</p>
                </div>
                <Badge variant="success" size="sm">{h.status}</Badge>
              </div>
            ))}
            {scheduledMaintenance && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Upcoming: Scheduled maintenance</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(scheduledMaintenance.start).toLocaleString()} · {scheduledMaintenance.duration} min</p>
                </div>
                <Badge variant="warning" size="sm">scheduled</Badge>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
