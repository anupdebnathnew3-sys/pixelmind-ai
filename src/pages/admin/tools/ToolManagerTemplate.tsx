import React, { useState } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Card';
import { useAdminStore, ToolConfig } from '../../../store/useAdminStore';
import { Save, Settings, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ToolManagerTemplateProps {
  toolId: string;
  icon: React.ReactNode;
  color?: string;
  toolPath: string;
  children?: React.ReactNode;
}

export const ToolManagerTemplate: React.FC<ToolManagerTemplateProps> = ({
  toolId, icon, color = '#6366F1', toolPath, children
}) => {
  const { tools, updateTool } = useAdminStore();
  const tool = tools.find(t => t.id === toolId);

  const [local, setLocal] = useState<ToolConfig>(tool ?? {
    id: toolId, name: toolId, enabled: true, fontFamily: 'Noto Sans', fontSize: '14px'
  });

  if (!tool) return (
    <DashboardLayout requireAdmin>
      <div className="p-8 text-center text-gray-400">Tool "{toolId}" not found in store.</div>
    </DashboardLayout>
  );

  const save = () => {
    updateTool(toolId, { name: local.name, enabled: local.enabled, fontFamily: local.fontFamily, fontSize: local.fontSize });
    toast.success(`${local.name} settings saved`);
  };

  return (
    <DashboardLayout requireAdmin>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-white"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{local.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tool settings &amp; configuration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={toolPath} target="_blank">
            <Button size="sm" variant="secondary" icon={<ExternalLink size={13} />}>Preview Tool</Button>
          </Link>
          <Button size="sm" icon={<Save size={14} />} onClick={save}>Save Settings</Button>
        </div>
      </div>

      <div className="space-y-6">

        {/* Basic Config */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Settings size={16} style={{ color }} />
            <h2 className="font-bold text-gray-900 dark:text-white">Basic Configuration</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Input label="Tool Display Name" value={local.name} onChange={e => setLocal(l => ({ ...l, name: e.target.value }))} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Output Font Family</label>
              <select
                value={local.fontFamily}
                onChange={e => setLocal(l => ({ ...l, fontFamily: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] transition-colors"
              >
                {['Noto Sans', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Output Font Size</label>
              <select
                value={local.fontSize}
                onChange={e => setLocal(l => ({ ...l, fontSize: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] transition-colors"
              >
                {['12px', '13px', '14px', '15px', '16px', '18px'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#191c40] rounded-xl">
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color }} />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Tool Enabled</p>
                <p className="text-xs text-gray-400">When disabled, users see a "coming soon" message</p>
              </div>
            </div>
            <Toggle checked={local.enabled} onChange={v => setLocal(l => ({ ...l, enabled: v }))} label="" />
          </div>
        </Card>

        {/* Per-tool custom sections from children */}
        {children}

      </div>
    </DashboardLayout>
  );
};
