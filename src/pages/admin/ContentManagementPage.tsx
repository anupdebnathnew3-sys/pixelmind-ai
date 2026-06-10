import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdminStore, Announcement } from '../../store/useAdminStore';
import { FileText, Plus, Edit3, Trash2, Eye, EyeOff, Megaphone, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

type AnnForm = { title: string; message: string; type: Announcement['type'] };
const BLANK_ANN: AnnForm = { title: '', message: '', type: 'info' };

const TYPE_COLORS: Record<Announcement['type'], string> = {
  info: 'border-l-blue-400',
  warning: 'border-l-amber-400',
  success: 'border-l-green-400',
  error: 'border-l-red-400',
};

const fieldCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#191c40] text-sm text-gray-900 dark:text-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20';

export const ContentManagementPage: React.FC = () => {
  const {
    announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    featuredTools, updateFeaturedTool,
  } = useAdminStore();

  const [tab, setTab] = useState<'announcements' | 'tools'>('announcements');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<AnnForm>(BLANK_ANN);
  const [editId, setEditId] = useState<string | null>(null);

  const openAdd = () => { setForm(BLANK_ANN); setModal('add'); };
  const openEdit = (a: Announcement) => { setForm({ title: a.title, message: a.message, type: a.type }); setEditId(a.id); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditId(null); };
  const setF = (patch: Partial<AnnForm>) => setForm(f => ({ ...f, ...patch }));

  const handleSave = () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message are required'); return; }
    if (modal === 'add') {
      addAnnouncement({ ...form, active: true, createdAt: new Date().toISOString().slice(0, 10) });
      toast.success('Announcement published');
    } else if (editId) {
      updateAnnouncement(editId, form);
      toast.success('Announcement updated');
    }
    closeModal();
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage announcements and featured content</p>
          </div>
          {tab === 'announcements' && (
            <Button icon={<Plus size={14} />} onClick={openAdd}>New Announcement</Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
          {([
            ['announcements', 'Announcements', <Megaphone size={14} />],
            ['tools', 'Featured Tools', <FileText size={14} />],
          ] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-white dark:bg-gray-900 text-[#6366F1] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Announcements Tab */}
        {tab === 'announcements' && (
          <div className="space-y-4">
            {announcements.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No announcements yet. Click "New Announcement" to create one.</div>
            )}
            {announcements.map(ann => (
              <Card key={ann.id} className={`border-l-4 ${TYPE_COLORS[ann.type]}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <Badge variant={ann.type === 'info' ? 'info' : ann.type === 'warning' ? 'warning' : ann.type === 'success' ? 'success' : 'error'} size="sm">{ann.type}</Badge>
                      <span className="text-xs text-gray-400">{ann.createdAt}</span>
                      {!ann.active && <Badge variant="default" size="sm">Hidden</Badge>}
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{ann.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ann.message}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { updateAnnouncement(ann.id, { active: !ann.active }); toast.success(ann.active ? 'Announcement hidden' : 'Announcement shown'); }}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] transition-colors" title={ann.active ? 'Hide' : 'Show'}>
                      {ann.active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => openEdit(ann)} className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Edit">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => { deleteAnnouncement(ann.id); toast.success('Deleted'); }} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Tools Tab */}
        {tab === 'tools' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Control which tools appear as featured on the homepage and tools overview page.</p>
            {featuredTools.map(tool => (
              <Card key={tool.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center">
                      <FileText size={16} className="text-[#6366F1]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{tool.name}</p>
                        {tool.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#6366F1]/10 text-[#6366F1] font-medium">{tool.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{tool.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={tool.active ? 'success' : 'default'} size="sm">{tool.active ? 'Visible' : 'Hidden'}</Badge>
                    <button
                      onClick={() => { updateFeaturedTool(tool.id, { active: !tool.active }); toast.success(`Tool ${!tool.active ? 'shown' : 'hidden'}`); }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${tool.active ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${tool.active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#191c40] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#232650] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{modal === 'add' ? 'New Announcement' : 'Edit Announcement'}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Type</label>
                <div className="flex gap-2">
                  {(['info', 'warning', 'success', 'error'] as const).map(t => (
                    <button key={t} onClick={() => setF({ type: t })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${form.type === t ? 'bg-[#6366F1] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Title</label>
                <input className={fieldCls} value={form.title} onChange={e => setF({ title: e.target.value })} placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Message</label>
                <textarea className={`${fieldCls} resize-none`} rows={3} value={form.message} onChange={e => setF({ message: e.target.value })} placeholder="Announcement message..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button icon={<Save size={14} />} onClick={handleSave}>{modal === 'add' ? 'Publish' : 'Save Changes'}</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
