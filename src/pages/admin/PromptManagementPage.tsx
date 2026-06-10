import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Card';
import { usePromptStore } from '../../store/usePromptStore';
import type { PromptTemplate } from '../../store/usePromptStore';
import {
  Plus, Edit3, Trash2, RefreshCw, MessageSquare, CheckCircle,
  XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const TOOL_IDS = [
  { value: 'metadata', label: 'AI Metadata Generator' },
  { value: 'image-to-prompt', label: 'Image to Prompt Generator' },
  { value: 'content-writer', label: 'AI Content Writer' },
  { value: 'slogan-generator', label: 'AI Slogan Generator' },
  { value: 'social-content', label: 'Social Media Content Generator' },
];

interface TemplateFormData {
  toolId: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isDefault: boolean;
  isEnabled: boolean;
}

const emptyForm = (): TemplateFormData => ({
  toolId: 'metadata',
  name: '',
  description: '',
  systemPrompt: '',
  userPromptTemplate: '',
  isDefault: false,
  isEnabled: true,
});

export const PromptManagementPage: React.FC = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate, resetToDefault } = usePromptStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateFormData>(emptyForm());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTool, setFilterTool] = useState<string>('all');

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEditModal = (template: PromptTemplate) => {
    setEditingId(template.id);
    setForm({
      toolId: template.toolId,
      name: template.name,
      description: template.description,
      systemPrompt: template.systemPrompt,
      userPromptTemplate: template.userPromptTemplate,
      isDefault: template.isDefault,
      isEnabled: template.isEnabled,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.userPromptTemplate.trim()) {
      toast.error('Name and prompt template are required');
      return;
    }
    if (editingId) {
      updateTemplate(editingId, form);
      toast.success('Template updated!');
    } else {
      addTemplate({ ...form });
      toast.success('Template added!');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    toast.success('Template deleted');
  };

  const handleReset = (toolId: string) => {
    resetToDefault(toolId);
    toast.success('Template reset to default!');
  };

  const filteredTemplates = filterTool === 'all'
    ? templates
    : templates.filter(t => t.toolId === filterTool);

  const getToolLabel = (toolId: string) =>
    TOOL_IDS.find(t => t.value === toolId)?.label || toolId;

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage AI prompt templates for all tools
            </p>
          </div>
          <Button icon={<Plus size={16} />} onClick={openAddModal}>Add Template</Button>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterTool('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterTool === 'all' ? 'bg-[#6366F1] text-white' : 'bg-white dark:bg-[#191c40] text-gray-600 border border-gray-200 dark:border-gray-700 hover:border-[#6366F1]'}`}
          >
            All Tools
          </button>
          {TOOL_IDS.map(t => (
            <button
              key={t.value}
              onClick={() => setFilterTool(t.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterTool === t.value ? 'bg-[#6366F1] text-white' : 'bg-white dark:bg-[#191c40] text-gray-600 border border-gray-200 dark:border-gray-700 hover:border-[#6366F1]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Template List */}
        <div className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <Card className="text-center py-12">
              <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No templates found</p>
            </Card>
          ) : (
            filteredTemplates.map(template => (
              <Card key={template.id}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={18} className="text-[#6366F1]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-900 dark:text-white">{template.name}</p>
                      {template.isDefault && <Badge variant="info" size="sm">Default</Badge>}
                      <Badge variant={template.isEnabled ? 'success' : 'default'} size="sm">
                        {template.isEnabled ? <CheckCircle size={10} className="mr-1" /> : <XCircle size={10} className="mr-1" />}
                        {template.isEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Badge variant="default" size="sm">{getToolLabel(template.toolId)}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </p>

                    {/* Expandable preview */}
                    {expandedId === template.id && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">System Prompt</p>
                          <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#0d1030] p-3 rounded-xl whitespace-pre-wrap font-mono overflow-auto max-h-40">
                            {template.systemPrompt || '(none)'}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User Prompt Template</p>
                          <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#0d1030] p-3 rounded-xl whitespace-pre-wrap font-mono overflow-auto max-h-60">
                            {template.userPromptTemplate}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] transition-colors"
                      title={expandedId === template.id ? 'Collapse' : 'Preview'}
                    >
                      {expandedId === template.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <Toggle
                      checked={template.isEnabled}
                      onChange={(v) => { updateTemplate(template.id, { isEnabled: v }); }}
                      size="sm"
                    />
                    <button
                      onClick={() => openEditModal(template)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    {template.isDefault && (
                      <button
                        onClick={() => handleReset(template.toolId)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        title="Reset to default"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    {!template.isDefault && (
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Prompt Template' : 'Add Prompt Template'}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Tool</label>
                <select
                  value={form.toolId}
                  onChange={(e) => setForm(f => ({ ...f, toolId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1030] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                >
                  {TOOL_IDS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Template Name"
                placeholder="e.g., Enhanced Metadata Prompt"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <Input
              label="Description"
              placeholder="What does this template do?"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                System Prompt
              </label>
              <Textarea
                value={form.systemPrompt}
                onChange={(e) => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
                rows={5}
                placeholder="System instructions for the AI model..."
                className="font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                User Prompt Template
                <span className="text-xs text-gray-400 font-normal ml-2">
                  Use {'{{variable}}'} placeholders
                </span>
              </label>
              <Textarea
                value={form.userPromptTemplate}
                onChange={(e) => setForm(f => ({ ...f, userPromptTemplate: e.target.value }))}
                rows={10}
                placeholder="Your prompt template with {{variable}} placeholders..."
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Available variables depend on the tool. See existing templates for reference.
              </p>
            </div>
            <div className="flex gap-6">
              <Toggle
                checked={form.isEnabled}
                onChange={(v) => setForm(f => ({ ...f, isEnabled: v }))}
                label="Enabled"
              />
              <Toggle
                checked={form.isDefault}
                onChange={(v) => setForm(f => ({ ...f, isDefault: v }))}
                label="Set as Default"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button fullWidth onClick={handleSave}>{editingId ? 'Update Template' : 'Add Template'}</Button>
              <Button fullWidth variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
