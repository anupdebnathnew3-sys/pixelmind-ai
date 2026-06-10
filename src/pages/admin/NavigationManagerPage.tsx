import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminStore } from '../../store/useAdminStore';
import { Navigation, Eye, EyeOff, ChevronUp, ChevronDown, Save, RotateCcw, Palette, Layout, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const NavigationManagerPage: React.FC = () => {
  const { navSettings, updateNavSettings } = useAdminStore();
  const [localSettings, setLocalSettings] = useState({ ...navSettings });
  const [hasChanges, setHasChanges] = useState(false);

  const patchLocal = (patch: Partial<typeof navSettings>) => {
    setLocalSettings(s => ({ ...s, ...patch }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateNavSettings(localSettings);
    setHasChanges(false);
    toast.success('Navigation settings saved');
  };

  const moveItem = (id: string, dir: 'up' | 'down') => {
    const sorted = [...localSettings.items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(i => i.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === sorted.length - 1) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const newItems = [...sorted];
    [newItems[idx].order, newItems[swapIdx].order] = [newItems[swapIdx].order, newItems[idx].order];
    patchLocal({ items: newItems });
  };

  const toggleVisible = (id: string) => {
    const newItems = localSettings.items.map(i => i.id === id ? { ...i, visible: !i.visible } : i);
    patchLocal({ items: newItems });
  };

  const updateItemLabel = (id: string, label: string) => {
    const newItems = localSettings.items.map(i => i.id === id ? { ...i, label } : i);
    patchLocal({ items: newItems });
  };

  const sortedItems = [...localSettings.items].sort((a, b) => a.order - b.order);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Navigation Manager</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Customize the public navigation bar appearance and menu items</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />}
                onClick={() => { setLocalSettings({ ...navSettings }); setHasChanges(false); }}>
                Reset
              </Button>
            )}
            <Button size="sm" icon={<Save size={14} />} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Appearance */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Palette size={16} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Colors & Style</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Background Color', key: 'bgColor', value: localSettings.bgColor },
                  { label: 'Text Color', key: 'textColor', value: localSettings.textColor },
                  { label: 'Hover Text Color', key: 'hoverTextColor', value: localSettings.hoverTextColor },
                  { label: 'Active Item Color', key: 'activeColor', value: localSettings.activeColor },
                  { label: 'Border Color', key: 'borderColor', value: localSettings.borderColor },
                ].map(({ label, key, value }) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={e => patchLocal({ [key]: e.target.value } as any)}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={e => patchLocal({ [key]: e.target.value } as any)}
                        className="w-24 px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#191c40] text-gray-800 dark:text-gray-200 font-mono"
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                    Transparency: {localSettings.transparency}%
                  </label>
                  <input
                    type="range" min={0} max={100} value={localSettings.transparency}
                    onChange={e => patchLocal({ transparency: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Layout size={16} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Behavior</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Blur Effect (glassmorphism)', key: 'blurEffect', value: localSettings.blurEffect },
                  { label: 'Sticky Header', key: 'stickyHeader', value: localSettings.stickyHeader },
                ].map(({ label, key, value }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    <button
                      onClick={() => patchLocal({ [key]: !value } as any)}
                      className={`w-11 h-6 rounded-full transition-all relative ${value ? 'bg-[#6366F1]' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Link2 size={16} className="text-[#6366F1]" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Logo</h3>
              </div>
              <Input
                label="Custom Logo URL (leave empty for default icon)"
                placeholder="https://example.com/logo.png"
                value={localSettings.logoUrl}
                onChange={e => patchLocal({ logoUrl: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1.5">Logo should be square, min 64×64px. Leave empty to use the default Zap icon.</p>
            </Card>
          </div>

          {/* Menu Items */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Navigation size={16} className="text-[#6366F1]" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Menu Items</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Reorder items with arrows. Toggle visibility with the eye icon. Edit labels inline.</p>
            <div className="space-y-2">
              {sortedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    item.visible
                      ? 'border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40]'
                      : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#131635] opacity-60'
                  }`}
                >
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveItem(item.id, 'up')}
                      disabled={idx === 0}
                      className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-[#232650] disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp size={12} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => moveItem(item.id, 'down')}
                      disabled={idx === sortedItems.length - 1}
                      className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-[#232650] disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown size={12} className="text-gray-400" />
                    </button>
                  </div>

                  {/* Label editor */}
                  <input
                    type="text"
                    value={item.label}
                    onChange={e => updateItemLabel(item.id, e.target.value)}
                    className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 min-w-0"
                  />

                  {/* Path (read-only) */}
                  <span className="text-xs text-gray-400 font-mono flex-shrink-0 hidden sm:block">{item.path}</span>

                  {/* Toggle visibility */}
                  <button
                    onClick={() => toggleVisible(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${item.visible ? 'text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232650]'}`}
                    title={item.visible ? 'Hide' : 'Show'}
                  >
                    {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              {sortedItems.filter(i => i.visible).length} of {sortedItems.length} items visible
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
