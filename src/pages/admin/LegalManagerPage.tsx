import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminStore, LegalSection } from '../../store/useAdminStore';
import { FileText, Shield, Plus, Trash2, Edit3, Check, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'terms' | 'privacy';

interface SectionEditorProps {
  section: LegalSection;
  onUpdate: (id: string, patch: Partial<LegalSection>) => void;
  onDelete: (id: string) => void;
}

function SectionEditor({ section, onUpdate, onDelete }: SectionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [body, setBody] = useState(section.body);

  const handleSave = () => {
    onUpdate(section.id, { title, body });
    setEditing(false);
    toast.success('Section updated');
  };

  const handleCancel = () => {
    setTitle(section.title);
    setBody(section.body);
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 dark:border-[#232650] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#191c40]">
        {editing ? (
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1 text-sm font-semibold bg-transparent border-b border-[#6366F1] outline-none text-gray-900 dark:text-white mr-4"
            autoFocus
          />
        ) : (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{section.title}</h4>
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={handleSave} className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                <Check size={12} />
              </button>
              <button onClick={handleCancel} className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors">
                <X size={12} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-[#232650] hover:text-[#6366F1] transition-colors">
                <Edit3 size={12} />
              </button>
              <button onClick={() => { if (confirm('Delete this section?')) onDelete(section.id); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 text-sm bg-white dark:bg-[#131635] text-gray-700 dark:text-gray-300 resize-y outline-none focus:ring-2 focus:ring-[#6366F1]/30"
        />
      ) : (
        <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line line-clamp-3">
          {section.body}
        </div>
      )}
    </div>
  );
}

export const LegalManagerPage: React.FC = () => {
  const { legalContent, updateLegalContent, updateLegalSection, addLegalSection, removeLegalSection } = useAdminStore();
  const [tab, setTab] = useState<Tab>('terms');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const content = tab === 'terms'
    ? { title: legalContent.termsTitle, lastUpdated: legalContent.termsLastUpdated, version: legalContent.termsVersion, enabled: legalContent.termsEnabled, sections: legalContent.termsSections }
    : { title: legalContent.privacyTitle, lastUpdated: legalContent.privacyLastUpdated, version: legalContent.privacyVersion, enabled: legalContent.privacyEnabled, sections: legalContent.privacySections };

  const prefix = tab === 'terms' ? 'terms' : 'privacy';

  const handleMetaPatch = (patch: Partial<typeof legalContent>) => {
    updateLegalContent(patch);
    toast.success('Saved');
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    addLegalSection(tab, { title: newSectionTitle, body: 'Enter section content here...' });
    setNewSectionTitle('');
    setAdding(false);
    toast.success('Section added');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Legal Content Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Edit Terms & Conditions and Privacy Policy content</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-[#191c40] w-fit">
          {[
            { id: 'terms' as Tab, label: 'Terms & Conditions', icon: <FileText size={14} /> },
            { id: 'privacy' as Tab, label: 'Privacy Policy', icon: <Shield size={14} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-white dark:bg-[#131635] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Meta settings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Document Settings</h3>
            <button
              onClick={() => handleMetaPatch({ [`${prefix}Enabled`]: !content.enabled } as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                content.enabled
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-[#232650] border-gray-200 dark:border-gray-700 text-gray-500'
              }`}
            >
              {content.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
              {content.enabled ? 'Published' : 'Hidden'}
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Page Title"
              value={content.title}
              onChange={e => updateLegalContent({ [`${prefix}Title`]: e.target.value } as any)}
            />
            <Input
              label="Version"
              value={content.version}
              onChange={e => updateLegalContent({ [`${prefix}Version`]: e.target.value } as any)}
            />
            <Input
              label="Last Updated"
              type="date"
              value={content.lastUpdated}
              onChange={e => updateLegalContent({ [`${prefix}LastUpdated`]: e.target.value } as any)}
            />
          </div>
        </Card>

        {/* Sections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">{content.sections.length} Sections</h3>
            <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => setAdding(true)}>
              Add Section
            </Button>
          </div>

          {adding && (
            <Card padding="sm">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Section title (e.g., '17. New Policy Section')"
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSection()}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] text-sm outline-none focus:border-[#6366F1]"
                  autoFocus
                />
                <Button size="sm" onClick={handleAddSection}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          <div className="space-y-2">
            {content.sections.map(sec => (
              <SectionEditor
                key={sec.id}
                section={sec}
                onUpdate={(id, patch) => updateLegalSection(tab, id, patch)}
                onDelete={(id) => removeLegalSection(tab, id)}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
