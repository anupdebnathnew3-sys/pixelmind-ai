import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Theme, APIKey, Notification } from '../types';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  // API Keys
  apiKeys: APIKey[];
  setApiKeys: (keys: APIKey[]) => void;
  addApiKey: (key: APIKey) => void;
  updateApiKey: (id: string, key: Partial<APIKey>) => void;
  deleteApiKey: (id: string) => void;
  setDefaultApi: (id: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Notification) => void;

  // AI Mode
  aiMode: 'system' | 'personal';
  setAiMode: (mode: 'system' | 'personal') => void;

  // Credits
  credits: number;
  setCredits: (c: number) => void;
  deductCredits: (amount: number) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (user) => set({ user, isAuthenticated: true, credits: user.credits }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // Theme
      theme: 'light',
      toggleTheme: () =>
        set((s) => {
          const newTheme = s.theme === 'light' ? 'dark' : 'light';
          const html = document.documentElement;
          html.classList.toggle('dark', newTheme === 'dark');
          html.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        }),
      setTheme: (theme) => {
        const html = document.documentElement;
        html.classList.toggle('dark', theme === 'dark');
        html.setAttribute('data-theme', theme);
        set({ theme });
      },

      // Sidebar
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // API Keys
      apiKeys: [
        {
          id: '1',
          name: 'OpenAI GPT-4o',
          provider: 'openai',
          key: 'sk-****************************',
          modelName: 'gpt-4o',
          status: 'connected',
          isDefault: true,
          isEnabled: true,
          visionCapable: true,
          toolCompatible: true,
          lastTested: new Date().toISOString(),
        },
      ],
      setApiKeys: (keys) => set({ apiKeys: keys }),
      addApiKey: (key) => set((s) => ({ apiKeys: [...s.apiKeys, key] })),
      updateApiKey: (id, updated) =>
        set((s) => ({ apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, ...updated } : k)) })),
      deleteApiKey: (id) => set((s) => ({ apiKeys: s.apiKeys.filter((k) => k.id !== id) })),
      setDefaultApi: (id) =>
        set((s) => ({
          apiKeys: s.apiKeys.map((k) => ({ ...k, isDefault: k.id === id })),
        })),

      // Notifications
      notifications: [
        {
          id: '1',
          title: 'Welcome to PixelMind AI!',
          message: 'Your account is ready. Start generating metadata today.',
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Pro Plan Available',
          message: 'Upgrade to Pro for unlimited AI generations.',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          title: 'API Rate Limit Warning',
          message: 'You have used 80% of your monthly API quota.',
          type: 'warning',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),

      // AI Mode
      aiMode: 'system',
      setAiMode: (mode) => set({ aiMode: mode }),

      // Credits
      credits: 500,
      setCredits: (c) => set({ credits: c }),
      deductCredits: (amount) => set((s) => ({ credits: Math.max(0, s.credits - amount) })),

      // Search
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: 'pixelmind-storage',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        apiKeys: state.apiKeys,
        aiMode: state.aiMode,
        credits: state.credits,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
