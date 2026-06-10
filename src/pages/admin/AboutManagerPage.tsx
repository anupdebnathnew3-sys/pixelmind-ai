import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAdminStore, ExpertiseItem } from '../../store/useAdminStore';
import { Plus, Trash2, Eye, EyeOff, Save, Sparkles, GripVertical, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AboutManagerPage: React.FC = () => {
  const { aboutSection, updateAboutSection, addExpertiseItem, updateExpertiseItem, deleteExpertiseItem } = useAdminStore();

  const [form, setForm] = useState({ ...aboutSection });
  const [editingExpertise, setEditingExpertise] = useState<string | null>(null);
  const [expertiseDraft, setExpertiseDraft] = useState<Partial<ExpertiseItem>>({});
  const [newExpertise, setNewExpertise] = useState({ icon: '🎯', title: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSave = () => {
    updateAboutSection({
      visible: form.visible,
      animationsEnabled: form.animationsEnabled,
      profileImageUrl: form.profileImageUrl,
      founderBadge: form.founderBadge,
      creatorBadge: form.creatorBadge,
      name: form.name,
      title: form.title,
      biography: form.biography,
    });
    toast.success('About section saved!');
  };

  const handleAddExpertise = () => {
    if (!newExpertise.title.trim()) {
      toast.error('Title is required');
      return;
    }
    addExpertiseItem(newExpertise);
    setNewExpertise({ icon: '🎯', title: '', description: '' });
    setShowAddForm(false);
    toast.success('Expertise item added');
  };

  const handleSaveExpertise = (id: string) => {
    if (!expertiseDraft.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    updateExpertiseItem(id, expertiseDraft);
    setEditingExpertise(null);
    setExpertiseDraft({});
    toast.success('Item updated');
  };

  const handleDeleteExpertise = (id: string) => {
    deleteExpertiseItem(id);
    toast.success('Item deleted');
  };

  const startEdit = (item: ExpertiseItem) => {
    setEditingExpertise(item.id);
    setExpertiseDraft({ icon: item.icon, title: item.title, description: item.description });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">About Me Manager</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Control the About Me section on the homepage
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                updateAboutSection({ visible: !aboutSection.visible });
                setForm(f => ({ ...f, visible: !f.visible }));
                toast.success(aboutSection.visible ? 'Section hidden' : 'Section visible');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                form.visible
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-400 hover:bg-green-100'
                  : 'bg-gray-100 dark:bg-[#232650] border-gray-200 dark:border-[#2f3260] text-gray-500 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {form.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              {form.visible ? 'Visible' : 'Hidden'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors shadow-sm shadow-[#6366F1]/30"
            >
              <Save size={15} />
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* Visibility & Animations */}
          <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Display Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0d1030]/60 border border-gray-100 dark:border-[#2f3260] cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Show on Homepage</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Display the About section publicly</p>
                </div>
                <div
                  onClick={() => setForm(f => ({ ...f, visible: !f.visible }))}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.visible ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.visible ? 'translate-x-5' : ''}`} />
                </div>
              </label>
              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#0d1030]/60 border border-gray-100 dark:border-[#2f3260] cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Scroll Animations</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fade-in when section enters viewport</p>
                </div>
                <div
                  onClick={() => setForm(f => ({ ...f, animationsEnabled: !f.animationsEnabled }))}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.animationsEnabled ? 'bg-[#6366F1]' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.animationsEnabled ? 'translate-x-5' : ''}`} />
                </div>
              </label>
            </div>
          </div>

          {/* Profile Image */}
          <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Profile Image</h2>
            <div className="flex gap-6 items-start">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={form.profileImageUrl}
                  onChange={e => { setForm(f => ({ ...f, profileImageUrl: e.target.value })); setImageError(false); }}
                  placeholder="/founder.jpg or https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f3260] bg-gray-50 dark:bg-[#0d1030]/60 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  Use a relative path like <code className="bg-gray-100 dark:bg-[#232650] px-1 rounded">/founder.jpg</code> for local images in the <code className="bg-gray-100 dark:bg-[#232650] px-1 rounded">public/</code> folder.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-[#232650] bg-gray-100 dark:bg-[#0d1030]">
                  {imageError ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                      Image not found
                    </div>
                  ) : (
                    <img
                      src={form.profileImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover object-top"
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
                <p className="text-center text-xs text-gray-400 mt-1">Preview</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Badges</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Founder Badge Text</label>
                <input
                  type="text"
                  value={form.founderBadge}
                  onChange={e => setForm(f => ({ ...f, founderBadge: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f3260] bg-gray-50 dark:bg-[#0d1030]/60 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Creator Badge Text</label>
                <input
                  type="text"
                  value={form.creatorBadge}
                  onChange={e => setForm(f => ({ ...f, creatorBadge: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f3260] bg-gray-50 dark:bg-[#0d1030]/60 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f3260] bg-gray-50 dark:bg-[#0d1030]/60 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Professional Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f3260] bg-gray-50 dark:bg-[#0d1030]/60 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Biography</label>
                <textarea
                  value={form.biography}
                  onChange={e => setForm(f => ({ ...f, biography: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f3260] bg-gray-50 dark:bg-[#0d1030]/60 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.biography.length} characters</p>
              </div>
            </div>
          </div>

          {/* Expertise Items */}
          <div className="bg-white dark:bg-[#131635] rounded-2xl border border-gray-100 dark:border-[#232650] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Expertise Cards ({aboutSection.expertiseItems.length})
              </h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-colors"
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="mb-4 p-4 rounded-xl border border-[#6366F1]/30 dark:border-[#6366F1]/20 bg-[#EEF2FF]/50 dark:bg-[#6366F1]/5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Icon (emoji)</label>
                    <input
                      type="text"
                      value={newExpertise.icon}
                      onChange={e => setNewExpertise(n => ({ ...n, icon: e.target.value }))}
                      maxLength={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2f3260] bg-white dark:bg-[#0d1030] text-sm text-center focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={newExpertise.title}
                      onChange={e => setNewExpertise(n => ({ ...n, title: e.target.value }))}
                      placeholder="e.g. AI Prompt Engineering"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2f3260] bg-white dark:bg-[#0d1030] text-sm focus:outline-none focus:border-[#6366F1] text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newExpertise.description}
                    onChange={e => setNewExpertise(n => ({ ...n, description: e.target.value }))}
                    rows={2}
                    placeholder="Brief description of this expertise..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2f3260] bg-white dark:bg-[#0d1030] text-sm focus:outline-none focus:border-[#6366F1] text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-[#232650] transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAddExpertise} className="px-3 py-1.5 rounded-lg bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-colors">
                    Add Card
                  </button>
                </div>
              </div>
            )}

            {/* Expertise list */}
            <div className="space-y-3">
              {aboutSection.expertiseItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-100 dark:border-[#232650] overflow-hidden">
                  {editingExpertise === item.id ? (
                    <div className="p-4 bg-gray-50 dark:bg-[#0d1030]/60">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Icon</label>
                          <input
                            type="text"
                            value={expertiseDraft.icon ?? ''}
                            onChange={e => setExpertiseDraft(d => ({ ...d, icon: e.target.value }))}
                            maxLength={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2f3260] bg-white dark:bg-[#131635] text-sm text-center focus:outline-none focus:border-[#6366F1] text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={expertiseDraft.title ?? ''}
                            onChange={e => setExpertiseDraft(d => ({ ...d, title: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2f3260] bg-white dark:bg-[#131635] text-sm focus:outline-none focus:border-[#6366F1] text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                        <textarea
                          value={expertiseDraft.description ?? ''}
                          onChange={e => setExpertiseDraft(d => ({ ...d, description: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2f3260] bg-white dark:bg-[#131635] text-sm focus:outline-none focus:border-[#6366F1] text-gray-900 dark:text-white resize-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditingExpertise(null); setExpertiseDraft({}); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-[#232650] transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handleSaveExpertise(item.id)} className="px-3 py-1.5 rounded-lg bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-colors">
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#131635]">
                      <GripVertical size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#0d1030] border border-gray-100 dark:border-[#232650] flex items-center justify-center text-xl flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpertise(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {aboutSection.expertiseItems.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <Sparkles size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No expertise items. Add some above.</p>
                </div>
              )}
            </div>
          </div>

          {/* Save button (bottom) */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366F1] text-white text-sm font-bold hover:bg-[#4F46E5] transition-colors shadow-lg shadow-[#6366F1]/30"
            >
              <Save size={16} />
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
