import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminStore, AdminUser } from '../../store/useAdminStore';
import { Search, UserPlus, Edit3, Trash2, Ban, CheckCircle, Download, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

type UserForm = Omit<AdminUser, 'id'>;

const BLANK: UserForm = {
  name: '', email: '', plan: 'free', credits: 500,
  status: 'active', role: 'user', joined: new Date().toISOString().slice(0, 10),
  lastActive: 'Just now', totalUsage: 0,
};

const exportCSV = (users: AdminUser[]) => {
  const headers = ['Name', 'Email', 'Plan', 'Credits', 'Status', 'Role', 'Joined', 'Total Usage'];
  const rows = users.map(u => [u.name, u.email, u.plan, u.credits, u.status, u.role, u.joined, u.totalUsage]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
  URL.revokeObjectURL(url);
};

export const UserManagementPage: React.FC = () => {
  const { adminUsers, addAdminUser, updateAdminUser, deleteAdminUser } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<UserForm>(BLANK);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = adminUsers.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || u.plan === filter || u.status === filter;
    return matchSearch && matchFilter;
  });

  const openAdd = () => { setForm(BLANK); setModal('add'); };
  const openEdit = (u: AdminUser) => { setForm({ ...u }); setEditId(u.id); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
    if (modal === 'add') {
      addAdminUser(form);
      toast.success('User added successfully');
    } else if (editId) {
      updateAdminUser(editId, form);
      toast.success('User updated successfully');
    }
    closeModal();
  };

  const handleToggleSuspend = (id: string, current: 'active' | 'suspended') => {
    const next = current === 'suspended' ? 'active' : 'suspended';
    updateAdminUser(id, { status: next });
    toast.success(`User ${next === 'suspended' ? 'suspended' : 'reactivated'}`);
  };

  const handleDelete = (id: string) => {
    deleteAdminUser(id);
    toast.success('User deleted');
  };

  const setF = (patch: Partial<UserForm>) => setForm(f => ({ ...f, ...patch }));

  const fieldCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#191c40] text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20';

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{adminUsers.length} total users</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => { exportCSV(adminUsers); toast.success('CSV downloaded'); }}>Export CSV</Button>
            <Button size="sm" icon={<UserPlus size={14} />} onClick={openAdd}>Add User</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users',  value: adminUsers.length,                                    color: '#6366F1' },
            { label: 'Pro Users',    value: adminUsers.filter(u => u.plan === 'pro').length,       color: '#8B5CF6' },
            { label: 'Enterprise',   value: adminUsers.filter(u => u.plan === 'enterprise').length, color: '#F59E0B' },
            { label: 'Suspended',    value: adminUsers.filter(u => u.status === 'suspended').length, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#191c40] p-4 rounded-2xl border border-gray-100 dark:border-[#232650]">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-48">
            <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={15} />} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'free', 'pro', 'enterprise', 'active', 'suspended'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-[#6366F1] text-white' : 'bg-white dark:bg-[#191c40] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#6366F1]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EEF2FF] dark:bg-[#0d1030]">
                  {['User', 'Plan', 'Credits', 'Status', 'Role', 'Joined', 'Last Active', 'Usage', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6366F1] dark:text-[#A5B4FC]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {user.credits === 99999 ? '∞' : user.credits.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === 'active' ? 'success' : 'warning'} size="sm">{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'purple' : 'default'} size="sm">{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.joined).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.lastActive}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.totalUsage.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] transition-colors" title="Edit">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleToggleSuspend(user.id, user.status)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title={user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}>
                          {user.status === 'suspended' ? <CheckCircle size={13} /> : <Ban size={13} />}
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#191c40] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#232650] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{modal === 'add' ? 'Add New User' : 'Edit User'}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
                <input className={fieldCls} value={form.name} onChange={e => setF({ name: e.target.value })} placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                <input type="email" className={fieldCls} value={form.email} onChange={e => setF({ email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Plan</label>
                <select className={fieldCls} value={form.plan} onChange={e => setF({ plan: e.target.value as AdminUser['plan'] })}>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Credits</label>
                <input type="number" className={fieldCls} value={form.credits} onChange={e => setF({ credits: Number(e.target.value) })} min="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
                <select className={fieldCls} value={form.status} onChange={e => setF({ status: e.target.value as AdminUser['status'] })}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Role</label>
                <select className={fieldCls} value={form.role} onChange={e => setF({ role: e.target.value as AdminUser['role'] })}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button icon={<Save size={14} />} onClick={handleSave}>{modal === 'add' ? 'Create User' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
