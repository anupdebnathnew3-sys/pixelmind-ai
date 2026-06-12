import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge, Toggle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminStore, Announcement } from '../../store/useAdminStore';
import { Megaphone, Plus, Trash2, Edit3, Check, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_COLORS: Record<string, string> = {
  info: '#3B82F6', success: '#10B981', warning: '#F59E0B', error: '#EF4444'
};

function BannerRow({ ann, onUpdate, onDelete }: {
  ann: Announcement;
  onUpdate: (id: string, p: Partial<Announcement>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(ann.title);
  const [message, setMessage] = useState(ann.message);
  const [type, setType] = useState(ann.type);

  const save = () => { onUpdate(ann.id, { title, message, type }); setEditing(false); toast.success('Banner updated'); };
  const cancel = () => { setTitle(ann.title); setMessage(ann.message); setType(ann.type); setEditing(false); };

  return (
    <div className="border border-gray-200 dark:border-[#232650] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#191c40]">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[ann.type] }} />
        {editing ? (
          <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
            className="flex-1 text-sm font-semibold bg-transparent border-b border-[#6366F1] outline-none text-gray-900 dark:text-white" />
        ) : (
          <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{ann.title}</p>
        )}
        <Toggle checked={ann.active} onChange={v => onUpdate(ann.id, { active: v })} label="" />
        {editing ? (
          <>
            <button onClick={save} className="p-1.5 rounded-lg bg-emerald-500 text-white"><Check size={12} /></button>
            <button onClick={cancel} className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><X size={12} /></button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-gray-100 dark:hover:bg-[#232650]"><Edit3 size={12} /></button>
            <button onClick={() => onDelete(ann.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12} /></button>
          </>
        )}
      </div>
      {editing ? (
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Type</label>
            <div className="flex gap-2">
              {(['info', 'success', 'warning', 'error'] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border transition-all ${type === t ? 'text-white border-transparent' : 'border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400'}`}
                  style={type === t ? { background: TYPE_COLORS[t] } : {}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-none transition-colors"
          />
        </div>
      ) : (
        <div className="px-4 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">{ann.message}</p>
          <p className="text-[10px] text-gray-400 mt-1">{ann.createdAt}</p>
        </div>
      )}
    </div>
  );
}

export const BannerManagerPage: React.FC = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAdminStore();

  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<Announcement['type']>('info');

  const add = () => {
    if (!newTitle.trim()) { toast.error('Enter a title'); return; }
    addAnnouncement({ title: newTitle, message: newMessage, type: newType, active: true, createdAt: new Date().toISOString().split('T')[0] });
    setNewTitle(''); setNewMessage('');
    toast.success('Banner created');
  };

  const activeCount = announcements.filter(a => a.active).length;

  return (
    <DashboardLayout requireAdmin>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
            <Megaphone size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Banner Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Promo banners, announcements and alerts</p>
          </div>
        </div>
        <Badge variant="success">{activeCount} active</Badge>
      </div>

      {/* Create new */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={16} className="text-[#6366F1]" />
          <h2 className="font-bold text-gray-900 dark:text-white">Create New Banner</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-3">
          <Input label="Banner Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Pro Plan 30% Off!" />
          <div className="sm:col-span-2">
            <Input label="Message" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Limited time offer — upgrade now" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {(['info', 'success', 'warning', 'error'] as const).map(t => (
              <button key={t} onClick={() => setNewType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${newType === t ? 'text-white border-transparent' : 'border-gray-200 dark:border-[#232650] text-gray-600 dark:text-gray-400'}`}
                style={newType === t ? { background: TYPE_COLORS[t] } : {}}>
                {t}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Button size="sm" icon={<Save size={14} />} onClick={add}>Create Banner</Button>
          </div>
        </div>
      </Card>

      {/* All banners */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white">All Banners</h2>
          <span className="text-xs text-gray-400">{announcements.length} total</span>
        </div>
        <div className="space-y-3">
          {announcements.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">No banners yet. Create one above.</p>
          )}
          {announcements.map(ann => (
            <BannerRow key={ann.id} ann={ann} onUpdate={updateAnnouncement} onDelete={deleteAnnouncement} />
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};
