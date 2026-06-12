import React, { useState, useRef } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAdminStore } from '../../store/useAdminStore';
import { Database, Upload, Trash2, Copy, Image, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'icon' | 'logo';
  uploadedAt: string;
}

const DEFAULT_MEDIA: MediaItem[] = [
  { id: '1', name: 'founder.jpg', url: '/founder.jpg', type: 'image', uploadedAt: '2026-06-01' },
  { id: '2', name: 'logo.png', url: '/logo.png', type: 'logo', uploadedAt: '2026-01-01' },
];

export const MediaLibraryPage: React.FC = () => {
  const { cmsContent, updateCMSContent } = useAdminStore();

  const getMedia = (): MediaItem[] => {
    try { return JSON.parse(cmsContent['media_library'] || 'null') ?? DEFAULT_MEDIA; } catch { return DEFAULT_MEDIA; }
  };

  const [media, setMedia] = useState<MediaItem[]>(getMedia);
  const [filter, setFilter] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState<'image' | 'icon' | 'logo'>('image');
  const fileRef = useRef<HTMLInputElement>(null);

  const saveMedia = (items: MediaItem[]) => {
    setMedia(items);
    updateCMSContent('media_library', JSON.stringify(items));
  };

  const addByUrl = () => {
    if (!urlInput.trim()) { toast.error('Enter a URL'); return; }
    const item: MediaItem = {
      id: Date.now().toString(),
      name: nameInput || urlInput.split('/').pop() || 'file',
      url: urlInput.trim(),
      type: typeInput,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    saveMedia([...media, item]);
    setUrlInput(''); setNameInput('');
    toast.success('Media added');
  };

  const remove = (id: string) => {
    saveMedia(media.filter(m => m.id !== id));
    toast.success('Removed');
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => toast.success('URL copied'));
  };

  const filtered = media.filter(m =>
    m.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.type.includes(filter.toLowerCase())
  );

  return (
    <DashboardLayout requireAdmin>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md">
            <Database size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Media Library</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage images, icons and logos used across the site</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" icon={<Upload size={13} />} onClick={() => fileRef.current?.click()}>
          Upload File
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (file) toast('File upload requires server-side storage. Use the URL method below.');
        }} />
      </div>

      {/* Add by URL */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Image size={16} className="text-[#6366F1]" />
          <h2 className="font-bold text-gray-900 dark:text-white">Add Media by URL</h2>
        </div>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <Input label="Image / File URL" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://... or /public/image.png" />
          </div>
          <Input label="Display Name" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="my-image.png" />
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Type</label>
            <select value={typeInput} onChange={e => setTypeInput(e.target.value as typeof typeInput)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-900 dark:text-white outline-none focus:border-[#6366F1] transition-colors">
              <option value="image">Image</option>
              <option value="logo">Logo</option>
              <option value="icon">Icon</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" icon={<Upload size={14} />} onClick={addByUrl}>Add to Library</Button>
        </div>
      </Card>

      {/* Media grid */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search media..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-[#232650] rounded-xl bg-white dark:bg-[#0d1030] text-gray-800 dark:text-gray-200 outline-none focus:border-[#6366F1] transition-colors"
            />
            {filter && <button onClick={() => setFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={12} /></button>}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} items</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Database size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No media found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="group border border-gray-100 dark:border-[#232650] rounded-xl overflow-hidden">
                <div className="aspect-square bg-gray-50 dark:bg-[#191c40] flex items-center justify-center relative">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                    onError={e => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).className = 'hidden'; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => copyUrl(item.url)} className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                      <Copy size={14} className="text-gray-700" />
                    </button>
                    <button onClick={() => remove(item.id)} className="p-2 bg-red-500/90 rounded-lg hover:bg-red-600 transition-colors">
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-gray-400 capitalize">{item.type}</span>
                    <span className="text-[10px] text-gray-400">{item.uploadedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};
