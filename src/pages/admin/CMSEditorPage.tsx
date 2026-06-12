import React, { useState, useCallback, useMemo } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAdminStore } from '../../store/useAdminStore';
import { CMS_DEFAULTS, CMS_PAGES, CMSField } from '../../config/cmsConfig';
import {
  Type, Save, RotateCcw, Search, ChevronDown, ChevronRight,
  Check, Globe, ExternalLink, Download, Upload, RefreshCw, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Field editor ─────────────────────────────────────────────────────────────

interface FieldEditorProps {
  field: CMSField;
  value: string;
  defaultValue: string;
  onChange: (key: string, val: string) => void;
  isDirty: boolean;
}

function FieldEditor({ field, value, defaultValue, onChange, isDirty }: FieldEditorProps) {
  const display = value !== '' ? value : defaultValue;
  const inputCls =
    'w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-[#0d1030] text-sm text-gray-900 dark:text-white ' +
    'placeholder:text-gray-400 focus:ring-2 outline-none transition-all resize-none ' +
    (isDirty
      ? 'border-[#6366F1] focus:ring-[#6366F1]/20'
      : 'border-gray-200 dark:border-[#232650] focus:border-[#6366F1] focus:ring-[#6366F1]/15');

  return (
    <div className="group">
      <div className="flex items-start justify-between mb-1.5 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{field.label}</label>
          {isDirty && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#6366F1]/10 text-[#6366F1] dark:text-[#A5B4FC] text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] dark:bg-[#A5B4FC]" />
              Modified
            </span>
          )}
        </div>
        <code className="text-[9px] font-mono text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-[#191c40] px-1.5 py-0.5 rounded flex-shrink-0">
          {field.key}
        </code>
      </div>
      {field.hint && (
        <p className="text-[11px] text-gray-400 mb-1.5 flex items-center gap-1">
          <Info size={10} className="flex-shrink-0" />
          {field.hint}
        </p>
      )}
      {field.type === 'textarea' ? (
        <textarea
          className={inputCls}
          rows={3}
          value={display}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={defaultValue}
        />
      ) : (
        <input
          type="text"
          className={inputCls}
          value={display}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={defaultValue}
        />
      )}
    </div>
  );
}

// ─── Section panel ────────────────────────────────────────────────────────────

interface SectionPanelProps {
  title: string;
  fields: CMSField[];
  draft: Record<string, string>;
  saved: Record<string, string>;
  homeMap: Record<string, string>;
  dirtyKeys: Set<string>;
  onChange: (key: string, val: string) => void;
}

function SectionPanel({ title, fields, draft, saved, homeMap, dirtyKeys, onChange }: SectionPanelProps) {
  const [open, setOpen] = useState(true);
  const hasModified = fields.some(f => dirtyKeys.has(f.key));

  const resolveValue = (key: string) => {
    if (draft[key] !== undefined) return draft[key];
    if (saved[key]) return saved[key];
    if (homeMap[key]) return homeMap[key];
    return '';
  };

  return (
    <div className="border border-gray-200 dark:border-[#232650] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50/80 dark:bg-[#191c40] hover:bg-gray-100 dark:hover:bg-[#1e2148] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
          <span className="text-xs text-gray-400">({fields.length} field{fields.length !== 1 ? 's' : ''})</span>
        </div>
        {hasModified && (
          <span className="text-[10px] font-semibold text-[#6366F1] dark:text-[#A5B4FC] bg-[#6366F1]/10 px-2 py-0.5 rounded-full">
            Unsaved changes
          </span>
        )}
      </button>
      {open && (
        <div className="p-4 space-y-4 bg-white dark:bg-[#131635]">
          {fields.map(field => (
            <FieldEditor
              key={field.key}
              field={field}
              value={resolveValue(field.key)}
              defaultValue={CMS_DEFAULTS[field.key] ?? ''}
              onChange={onChange}
              isDirty={dirtyKeys.has(field.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// Bridges old homepageContent fields → CMS keys for display
function buildHomeMap(hc: import('../../store/useAdminStore').HomepageContent): Record<string, string> {
  return {
    'home.hero.badge':        hc.heroBadge,
    'home.hero.microlabel':   hc.heroMicroLabel,
    'home.hero.title1':       hc.heroTitleLine1,
    'home.hero.title2':       hc.heroTitleLine2,
    'home.hero.subtitle':     hc.heroSubtitle,
    'home.stats.label1':      hc.statsLabel1,
    'home.stats.label2':      hc.statsLabel2,
    'home.stats.label3':      hc.statsLabel3,
    'home.stats.label4':      hc.statsLabel4,
    'home.features.title':    hc.featuresTitle,
    'home.features.subtitle': hc.featuresSubtitle,
    'home.tools.title':       hc.toolsSectionTitle,
    'home.tools.subtitle':    hc.toolsSectionSubtitle,
    'home.cta.title':         hc.ctaTitle,
    'home.cta.subtitle':      hc.ctaSubtitle,
  };
}

export const CMSEditorPage: React.FC = () => {
  const { cmsContent, homepageContent, bulkUpdateCMSContent, updateHomepageContent } = useAdminStore();
  const homeMap = useMemo(() => buildHomeMap(homepageContent), [homepageContent]);

  const [selectedPageId, setSelectedPageId] = useState<string>(CMS_PAGES[0].id);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  const selectedPage = CMS_PAGES.find(p => p.id === selectedPageId)!;

  const dirtyKeys = useMemo(() => new Set(Object.keys(draft)), [draft]);
  const totalDirty = dirtyKeys.size;

  const handleChange = useCallback((key: string, val: string) => {
    setDraft(d => ({ ...d, [key]: val }));
  }, []);

  const handleSave = () => {
    if (totalDirty === 0) { toast('No changes to save'); return; }

    // Split: home.hero.* → updateHomepageContent; everything else → bulkUpdateCMSContent
    const homeMap: Record<string, string> = {
      'home.hero.badge':        'heroBadge',
      'home.hero.microlabel':   'heroMicroLabel',
      'home.hero.title1':       'heroTitleLine1',
      'home.hero.title2':       'heroTitleLine2',
      'home.hero.subtitle':     'heroSubtitle',
      'home.stats.label1':      'statsLabel1',
      'home.stats.label2':      'statsLabel2',
      'home.stats.label3':      'statsLabel3',
      'home.stats.label4':      'statsLabel4',
      'home.features.title':    'featuresTitle',
      'home.features.subtitle': 'featuresSubtitle',
      'home.tools.title':       'toolsSectionTitle',
      'home.tools.subtitle':    'toolsSectionSubtitle',
      'home.cta.title':         'ctaTitle',
      'home.cta.subtitle':      'ctaSubtitle',
    };

    const homePatch: Record<string, string> = {};
    const cmsPatch: Record<string, string> = {};

    for (const [key, val] of Object.entries(draft)) {
      if (homeMap[key]) homePatch[homeMap[key]] = val;
      else cmsPatch[key] = val;
    }

    if (Object.keys(homePatch).length > 0) {
      updateHomepageContent(homePatch as Parameters<typeof updateHomepageContent>[0]);
    }
    if (Object.keys(cmsPatch).length > 0) {
      bulkUpdateCMSContent(cmsPatch);
    }

    setDraft({});
    toast.success(`${totalDirty} change${totalDirty !== 1 ? 's' : ''} saved & synced live`);
  };

  const handleDiscard = () => {
    setDraft({});
    toast('Changes discarded');
  };

  const handleResetPage = () => {
    // Clear CMS overrides for all keys on this page
    const pageKeys = selectedPage.sections.flatMap(s => s.fields.map(f => f.key));
    const cleared: Record<string, string> = {};
    pageKeys.forEach(k => { cleared[k] = ''; });
    bulkUpdateCMSContent(cleared);
    setDraft({});
    toast.success(`"${selectedPage.label}" reset to defaults`);
  };

  const handleExport = () => {
    const allContent = { ...cmsContent };
    const json = JSON.stringify(allContent, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelmind-cms-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CMS content exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Record<string, string>;
        bulkUpdateCMSContent(data);
        toast.success(`Imported ${Object.keys(data).length} CMS entries`);
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter sections/fields by search
  const filteredSections = search.trim()
    ? selectedPage.sections
        .map(s => ({
          ...s,
          fields: s.fields.filter(
            f =>
              f.label.toLowerCase().includes(search.toLowerCase()) ||
              f.key.toLowerCase().includes(search.toLowerCase()) ||
              (CMS_DEFAULTS[f.key] ?? '').toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter(s => s.fields.length > 0)
    : selectedPage.sections;

  // Count modified keys across entire CMS
  const totalModified = Object.values(cmsContent).filter(v => v !== '').length + totalDirty;

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-[#6366F1]/25">
                <Type size={16} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CMS Editor</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Edit any page text, button label, or UI copy — changes sync live to all connected sites via Firestore.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {totalModified > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-[#6366F1]/10 dark:bg-[#6366F1]/20 text-[#6366F1] dark:text-[#A5B4FC] text-xs font-semibold">
                {totalModified} custom value{totalModified !== 1 ? 's' : ''} active
              </span>
            )}
            <label className="cursor-pointer">
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#232650] text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#191c40] transition-colors cursor-pointer">
                <Upload size={13} />
                Import JSON
              </div>
            </label>
            <Button variant="ghost" size="sm" icon={<Download size={13} />} onClick={handleExport}>
              Export JSON
            </Button>
            {totalDirty > 0 && (
              <>
                <Button variant="secondary" size="sm" icon={<RefreshCw size={13} />} onClick={handleDiscard}>
                  Discard ({totalDirty})
                </Button>
                <Button size="sm" icon={<Save size={13} />} onClick={handleSave}>
                  Save & Sync ({totalDirty})
                </Button>
              </>
            )}
            {totalDirty === 0 && (
              <Button size="sm" icon={<Save size={13} />} onClick={handleSave} disabled>
                All Saved
              </Button>
            )}
          </div>
        </div>

        {/* ── Sync status banner ───────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            Real-time sync active — saved changes appear instantly on Main Website, GitHub Version, and all connected sites via Firebase Firestore.
          </p>
        </div>

        <div className="flex gap-5">

          {/* ── Left: Page selector ───────────────────────────────────── */}
          <div className="w-56 flex-shrink-0">
            <div className="sticky top-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-2">
                Pages
              </p>
              {CMS_PAGES.map(page => {
                const pageKeys = page.sections.flatMap(s => s.fields.map(f => f.key));
                const pageModified = pageKeys.filter(k => dirtyKeys.has(k)).length;
                const pageSaved = pageKeys.filter(k => cmsContent[k] && cmsContent[k] !== '').length;
                const isActive = selectedPage.id === page.id;

                return (
                  <button
                    key={page.id}
                    onClick={() => { setSelectedPageId(page.id); setSearch(''); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/25'
                        : 'hover:bg-gray-100 dark:hover:bg-[#191c40] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base leading-none flex-shrink-0">{page.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                          {page.label}
                        </p>
                        {page.path && (
                          <p className={`text-[10px] truncate ${isActive ? 'text-white/65' : 'text-gray-400'}`}>
                            {page.path}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {pageModified > 0 && (
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isActive ? 'bg-white text-[#6366F1]' : 'bg-amber-500 text-white'}`}>
                          {pageModified}
                        </span>
                      )}
                      {pageModified === 0 && pageSaved > 0 && (
                        <Check size={12} className={isActive ? 'text-white/70' : 'text-emerald-500'} />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Reset page button */}
              <div className="pt-3 border-t border-gray-100 dark:border-[#232650]">
                <button
                  onClick={handleResetPage}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <RotateCcw size={12} />
                  Reset this page
                </button>
              </div>

              {/* Live preview link */}
              {selectedPage.path && (
                <a
                  href={selectedPage.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#6366F1] dark:text-[#A5B4FC] hover:bg-[#EEF2FF] dark:hover:bg-[#6366F1]/10 transition-colors"
                >
                  <ExternalLink size={12} />
                  Preview page
                </a>
              )}
            </div>
          </div>

          {/* ── Right: Editor ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Page header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedPage.icon}</span>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">{selectedPage.label}</h2>
                  <p className="text-xs text-gray-400">
                    {selectedPage.sections.reduce((acc, s) => acc + s.fields.length, 0)} fields across {selectedPage.sections.length} section{selectedPage.sections.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search fields…"
                  className="pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#232650] bg-white dark:bg-[#191c40] text-xs text-gray-900 dark:text-white w-52 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 outline-none"
                />
              </div>
            </div>

            {/* Sections */}
            {filteredSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Globe size={40} className="mb-3 opacity-30" />
                <p className="font-medium">No fields match your search</p>
              </div>
            ) : (
              filteredSections.map(section => (
                <SectionPanel
                  key={section.id}
                  title={section.title}
                  fields={section.fields}
                  draft={draft}
                  saved={cmsContent}
                  homeMap={homeMap}
                  dirtyKeys={dirtyKeys}
                  onChange={handleChange}
                />
              ))
            )}

            {/* Floating save bar when there are unsaved changes */}
            {totalDirty > 0 && (
              <div className="sticky bottom-4 flex items-center justify-between gap-3 px-5 py-3.5 bg-white dark:bg-[#191c40] border border-[#6366F1]/30 dark:border-[#6366F1]/40 rounded-2xl shadow-xl shadow-[#6366F1]/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {totalDirty} unsaved change{totalDirty !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    Saving will sync instantly to all connected sites
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleDiscard}>Discard</Button>
                  <Button size="sm" icon={<Save size={13} />} onClick={handleSave}>
                    Save & Sync
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
