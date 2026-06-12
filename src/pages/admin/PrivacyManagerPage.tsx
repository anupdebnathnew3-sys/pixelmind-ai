import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Card';
import { useAdminStore, LegalSection } from '../../store/useAdminStore';
import { Shield, Plus, Trash2, Check, X, Edit3, Save } from 'lucide-react';
import toast from 'react-hot-toast';

function SectionRow({ section, onUpdate, onDelete }: {
  section: LegalSection;
  onUpdate: (id: string, patch: Partial<LegalSection>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [body, setBody] = useState(section.body);

  const save = () => { onUpdate(section.id, { title, body }); setEditing(false); toast.success('Section saved'); };
  const cancel = () => { setTitle(section.title); setBody(section.body); setEditing(false); };

  return (
    <div className="border border-gray-200 dark:border-[#232650] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#191c40]">
        {editing ? (
          <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
            className="flex-1 text-sm font-semibold bg-transparent border-b border-[#6366F1] outline-none text-gray-900 dark:text-white mr-4" />
        ) : (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{section.title}</h4>
        )}
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <button onClick={save} className="p-1.5 rounded-lg bg-emerald-500 text-white"><Check size={12} /></button>
              <button onClick={cancel} className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><X size={12} /></button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-gray-100 dark:hover:bg-[#232650]"><Edit3 size={12} /></button>
              <button onClick={() => onDelete(section.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12} /></button>
            </>
          )}
        </div>
      </div>
      {editing && (
        <div className="p-4">
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] resize-y transition-colors"
          />
        </div>
      )}
      {!editing && (
        <div className="px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{section.body}</p>
        </div>
      )}
    </div>
  );
}

export const PrivacyManagerPage: React.FC = () => {
  const { legalContent, updateLegalContent, updateLegalSection, addLegalSection, removeLegalSection } = useAdminStore();

  const [meta, setMeta] = useState({
    title: legalContent.privacyTitle,
    lastUpdated: legalContent.privacyLastUpdated,
    version: legalContent.privacyVersion,
  });

  const saveMeta = () => {
    updateLegalContent({ privacyTitle: meta.title, privacyLastUpdated: meta.lastUpdated, privacyVersion: meta.version });
    toast.success('Privacy meta saved');
  };

  const addSection = () => {
    addLegalSection('privacy', { title: `New Section ${legalContent.privacySections.length + 1}`, body: 'Section content goes here.' });
    toast.success('Section added');
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Edit your privacy policy content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Toggle checked={legalContent.privacyEnabled} onChange={v => updateLegalContent({ privacyEnabled: v })} label="Page visible" />
        </div>
      </div>

      <div className="space-y-6">

        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 dark:text-white">Page Settings</h2>
            <Button size="sm" icon={<Save size={14} />} onClick={saveMeta}>Save</Button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Page Title" value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} />
            <Input label="Last Updated Date" type="date" value={meta.lastUpdated} onChange={e => setMeta(m => ({ ...m, lastUpdated: e.target.value }))} />
            <Input label="Version" value={meta.version} onChange={e => setMeta(m => ({ ...m, version: e.target.value }))} placeholder="1.0" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Sections <span className="ml-2 text-xs font-normal text-gray-400">{legalContent.privacySections.length} total</span>
            </h2>
            <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={addSection}>Add Section</Button>
          </div>
          <div className="space-y-3">
            {legalContent.privacySections.map(section => (
              <SectionRow
                key={section.id}
                section={section}
                onUpdate={(id, patch) => updateLegalSection('privacy', id, patch)}
                onDelete={(id) => removeLegalSection('privacy', id)}
              />
            ))}
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};
