import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Card';
import {
  Calendar, Clock, Globe, Plus, Trash2, Send, Link, Image
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '📘', connected: true },
  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📸', connected: true },
  { id: 'x', name: 'X (Twitter)', color: '#000000', icon: '𝕏', connected: false },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: '💼', connected: true },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023', icon: '📌', connected: false },
  { id: 'tiktok', name: 'TikTok', color: '#000000', icon: '🎵', connected: false },
];

interface Post {
  id: string;
  platforms: string[];
  content: string;
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  hasImage: boolean;
}

const MOCK_POSTS: Post[] = [
  { id: '1', platforms: ['facebook', 'instagram'], content: '🚀 Exciting news! We just launched our new AI-powered metadata generator. Generate perfect titles, descriptions & keywords for 100 stock images in minutes!', scheduledAt: '2024-12-20T10:00', status: 'scheduled', hasImage: true },
  { id: '2', platforms: ['linkedin'], content: 'The future of content creation is here. Our AI platform helps creative professionals scale their workflow 10x. Swipe to see how it works.', scheduledAt: '2024-12-21T14:30', status: 'draft', hasImage: false },
  { id: '3', platforms: ['x', 'facebook'], content: 'Did you know you can turn any image into a perfect Midjourney prompt? Our Image-to-Prompt tool does it in seconds! ✨ #AI #CreativeTools', scheduledAt: '2024-12-19T09:00', status: 'published', hasImage: false },
];

export const SocialSchedulerPage: React.FC<{ guestAllowed?: boolean }> = ({ guestAllowed = false }) => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'calendar' | 'platforms'>('posts');
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [] as string[],
    scheduledAt: '',
    isDraft: false,
  });

  const togglePlatform = (id: string) => {
    setNewPost(p => ({
      ...p,
      platforms: p.platforms.includes(id)
        ? p.platforms.filter(pl => pl !== id)
        : [...p.platforms, id],
    }));
  };

  const handleSchedule = () => {
    if (!newPost.content) { toast.error('Please write some content'); return; }
    if (newPost.platforms.length === 0) { toast.error('Select at least one platform'); return; }
    const post: Post = {
      id: Date.now().toString(),
      platforms: newPost.platforms,
      content: newPost.content,
      scheduledAt: newPost.scheduledAt || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      status: newPost.isDraft ? 'draft' : 'scheduled',
      hasImage: false,
    };
    setPosts(prev => [post, ...prev]);
    setNewPost({ content: '', platforms: [], scheduledAt: '', isDraft: false });
    setShowCreate(false);
    toast.success(newPost.isDraft ? 'Saved as draft!' : 'Post scheduled!');
  };

  const statusColors = {
    draft: 'warning',
    scheduled: 'info',
    published: 'success',
    failed: 'error',
  } as const;

  return (
    <DashboardLayout guestAllowed={guestAllowed}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Social Media Scheduler</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and schedule posts across all platforms</p>
          </div>
          <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>New Post</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[#0d1030] rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'posts', label: 'Posts', icon: <Globe size={14} /> },
            { id: 'calendar', label: 'Calendar', icon: <Calendar size={14} /> },
            { id: 'platforms', label: 'Platforms', icon: <Link size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'posts' | 'calendar' | 'platforms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white dark:bg-[#191c40] text-[#6366F1] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Create Post Modal */}
        {showCreate && (
          <Card className="mb-6 border-2 border-[#6366F1]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Create New Post</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Select Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${newPost.platforms.includes(p.id)
                        ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1] dark:bg-[#6366F1]/20'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#6366F1]'
                        } ${!p.connected && 'opacity-50'}`}
                      disabled={!p.connected}
                    >
                      <span>{p.icon}</span>
                      {p.name}
                      {!p.connected && <span className="text-[10px] text-gray-400">(Connect)</span>}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                label="Post Content"
                placeholder="What would you like to share?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
              />
              <div className="text-xs text-right text-gray-400">{newPost.content.length} characters</div>
              <Input
                label="Schedule Date & Time"
                type="datetime-local"
                value={newPost.scheduledAt}
                onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
              />
              <Toggle
                checked={newPost.isDraft}
                onChange={(v) => setNewPost({ ...newPost, isDraft: v })}
                label="Save as Draft"
              />
              <div className="flex gap-3">
                <Button onClick={handleSchedule} icon={<Send size={16} />}>
                  {newPost.isDraft ? 'Save Draft' : 'Schedule Post'}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.map(post => (
              <Card key={post.id} className="hover:border-[#A5B4FC] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {post.platforms.map(pid => {
                        const platform = PLATFORMS.find(p => p.id === pid);
                        return platform ? (
                          <span key={pid} className="text-lg">{platform.icon}</span>
                        ) : null;
                      })}
                      <Badge variant={statusColors[post.status]}>{post.status}</Badge>
                      {post.hasImage && <Badge variant="info"><Image size={10} /> Has Image</Badge>}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(post.scheduledAt).toLocaleString()}</span>
                      <span className="flex items-center gap-1.5"><Globe size={12} /> {post.platforms.length} platform(s)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="xs" variant="ghost" onClick={() => { setPosts(prev => prev.filter(p => p.id !== post.id)); toast.success('Post deleted'); }}
                      className="text-red-400 hover:bg-red-50" icon={<Trash2 size={12} />}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">December 2024</h3>
              <div className="flex gap-2">
                <Button size="xs" variant="ghost">← Prev</Button>
                <Button size="xs" variant="ghost">Next →</Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 5;
                const hasPost = [19, 20, 21].includes(day);
                const isToday = day === new Date().getDate();
                return (
                  <div
                    key={i}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all cursor-pointer hover:bg-[#EEF2FF] ${isToday ? 'bg-[#6366F1] text-white font-bold' : day < 1 || day > 31 ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'} ${hasPost && !isToday ? 'border-b-2 border-[#6366F1]' : ''}`}
                  >
                    {day > 0 && day <= 31 ? day : ''}
                    {hasPost && <div className="w-1 h-1 rounded-full bg-[#A5B4FC] mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map(platform => (
              <Card key={platform.id} className="hover:border-[#A5B4FC] transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl">{platform.icon}</div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{platform.name}</p>
                    <Badge variant={platform.connected ? 'success' : 'warning'} size="sm">
                      {platform.connected ? '● Connected' : '○ Not Connected'}
                    </Badge>
                  </div>
                </div>
                <Button
                  fullWidth
                  variant={platform.connected ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toast.success(platform.connected ? `Disconnected from ${platform.name}` : `Connecting to ${platform.name}...`)}
                >
                  {platform.connected ? 'Disconnect' : 'Connect Account'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
