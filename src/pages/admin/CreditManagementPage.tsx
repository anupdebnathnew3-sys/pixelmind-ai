import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminStore } from '../../store/useAdminStore';
import { Zap, Plus, Minus, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreditManagementPage: React.FC = () => {
  const { adminUsers, updateAdminUser } = useAdminStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAmount, setBulkAmount] = useState(500);
  const [addAmounts, setAddAmounts] = useState<Record<string, number>>({});

  const filtered = adminUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = adminUsers.reduce((sum, u) => sum + (u.credits === 99999 ? 0 : u.credits), 0);
  const zeroCredits = adminUsers.filter(u => u.credits === 0).length;

  const adjustCredits = (id: string, delta: number) => {
    const user = adminUsers.find(u => u.id === id);
    if (!user) return;
    const next = Math.max(0, user.credits + delta);
    updateAdminUser(id, { credits: next });
    toast.success(`${delta > 0 ? 'Added' : 'Removed'} ${Math.abs(delta)} credits`);
  };

  const resetCredits = (id: string) => {
    const user = adminUsers.find(u => u.id === id);
    if (!user) return;
    const alloc = user.plan === 'enterprise' ? 99999 : user.plan === 'pro' ? 5000 : 500;
    updateAdminUser(id, { credits: alloc });
    toast.success(`Credits reset to ${alloc === 99999 ? '∞' : alloc}`);
  };

  const bulkAdd = () => {
    if (selected.size === 0) { toast.error('Select users first'); return; }
    selected.forEach(id => {
      const user = adminUsers.find(u => u.id === id);
      if (user) updateAdminUser(id, { credits: user.credits + bulkAmount });
    });
    toast.success(`Added ${bulkAmount} credits to ${selected.size} user(s)`);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Allocate and manage user credits</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Credits',    value: totalCredits.toLocaleString(), color: '#6366F1' },
            { label: 'Total Users',      value: adminUsers.length,             color: '#8B5CF6' },
            { label: 'At Zero Credits',  value: zeroCredits,                   color: '#EF4444' },
            { label: 'Free Plan Users',  value: adminUsers.filter(u => u.plan === 'free').length, color: '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#191c40] p-4 rounded-2xl border border-gray-100 dark:border-[#232650]">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-[#EEF2FF] dark:bg-[#6366F1]/10 rounded-xl border border-[#A5B4FC]/30">
            <span className="text-sm font-medium text-[#6366F1]">{selected.size} user(s) selected</span>
            <div className="flex items-center gap-2">
              <input type="number" value={bulkAmount} onChange={e => setBulkAmount(Number(e.target.value))}
                className="w-24 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#191c40] text-gray-900 dark:text-white" />
              <Button size="sm" icon={<Plus size={13} />} onClick={bulkAdd}>Bulk Add Credits</Button>
            </div>
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:text-gray-700 ml-auto">Clear selection</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={15} />} />
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EEF2FF] dark:bg-[#0d1030]">
                  <th className="px-4 py-3 text-left w-8">
                    <input type="checkbox" className="rounded"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={e => setSelected(e.target.checked ? new Set(filtered.map(u => u.id)) : new Set())} />
                  </th>
                  {['User', 'Plan', 'Credits', 'Adjust Amount', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(user => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selected.has(user.id) ? 'bg-[#EEF2FF]/50 dark:bg-[#6366F1]/5' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded" checked={selected.has(user.id)} onChange={() => toggleSelect(user.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.plan === 'enterprise' ? 'purple' : user.plan === 'pro' ? 'success' : 'default'} size="sm">{user.plan}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-[#6366F1]" />
                        <span className={`text-sm font-bold ${user.credits === 0 ? 'text-red-500' : user.credits < 100 ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                          {user.credits === 99999 ? '∞' : user.credits.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input type="number" value={addAmounts[user.id] ?? 100}
                          onChange={e => setAddAmounts(a => ({ ...a, [user.id]: Number(e.target.value) }))}
                          className="w-20 px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#191c40] text-gray-900 dark:text-white" />
                        <button onClick={() => adjustCredits(user.id, addAmounts[user.id] ?? 100)}
                          className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors" title="Add">
                          <Plus size={11} />
                        </button>
                        <button onClick={() => adjustCredits(user.id, -(addAmounts[user.id] ?? 100))}
                          className="w-6 h-6 rounded-full bg-red-400 text-white flex items-center justify-center hover:bg-red-500 transition-colors" title="Deduct">
                          <Minus size={11} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => resetCredits(user.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors">
                        <RefreshCw size={10} /> Reset
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
