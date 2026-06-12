import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { useAdminStore } from './store/useAdminStore';
import { Shield } from 'lucide-react';
import { firebaseReady } from './services/firebase';
import { initFirestoreSync, pushSettingsToFirestore } from './services/firestoreSync';

// Pages include their own DashboardLayout / public layout internally
import { HomePage } from './pages/public/HomePage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { ToolsOverviewPage } from './pages/public/ToolsOverviewPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AISettingsPage } from './pages/dashboard/AISettingsPage';
import { BillingPage } from './pages/dashboard/BillingPage';
import { MetadataGeneratorPage } from './pages/tools/MetadataGeneratorPage';
import { ImageToPromptPage } from './pages/tools/ImageToPromptPage';
import { ContentWriterPage } from './pages/tools/ContentWriterPage';
import { SocialSchedulerPage } from './pages/tools/SocialSchedulerPage';
import { EventCalendarPage } from './pages/tools/EventCalendarPage';
import { WordCounterPage } from './pages/tools/WordCounterPage';
import { AgeCalculatorPage } from './pages/tools/AgeCalculatorPage';
import { SloganGeneratorPage } from './pages/tools/SloganGeneratorPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { PromptManagementPage } from './pages/admin/PromptManagementPage';
import { GlobalSettingsPage } from './pages/admin/GlobalSettingsPage';
import { APIManagementPage } from './pages/admin/APIManagementPage';
import { SubscriptionsPage } from './pages/admin/SubscriptionsPage';
import { CreditManagementPage } from './pages/admin/CreditManagementPage';
import { ContentManagementPage } from './pages/admin/ContentManagementPage';
import { MaintenancePage } from './pages/admin/MaintenancePage';
import { AboutManagerPage } from './pages/admin/AboutManagerPage';
import { PricingManagerPage } from './pages/admin/PricingManagerPage';
import { DiscountManagerPage } from './pages/admin/DiscountManagerPage';
import { BillingManagerPage } from './pages/admin/BillingManagerPage';
import { PaymentGatewayPage } from './pages/admin/PaymentGatewayPage';
import { FeatureAccessPage } from './pages/admin/FeatureAccessPage';
import { NavigationManagerPage } from './pages/admin/NavigationManagerPage';
import { ThemeManagerPage } from './pages/admin/ThemeManagerPage';
import { LegalManagerPage } from './pages/admin/LegalManagerPage';
import { SecuritySettingsPage } from './pages/admin/SecuritySettingsPage';
import { GuestAlertManagerPage } from './pages/admin/GuestAlertManagerPage';
import { CMSEditorPage } from './pages/admin/CMSEditorPage';
import { HomepageManagerPage } from './pages/admin/HomepageManagerPage';
import { ContactManagerPage } from './pages/admin/ContactManagerPage';
import { FooterManagerPage } from './pages/admin/FooterManagerPage';
import { TermsManagerPage } from './pages/admin/TermsManagerPage';
import { PrivacyManagerPage } from './pages/admin/PrivacyManagerPage';
import { MediaLibraryPage } from './pages/admin/MediaLibraryPage';
import { BannerManagerPage } from './pages/admin/BannerManagerPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { SEOSettingsPage } from './pages/admin/SEOSettingsPage';
import { CreditsSystemPage } from './pages/admin/CreditsSystemPage';
import { ImageToPromptManagerPage } from './pages/admin/tools/ImageToPromptManagerPage';
import { MetadataManagerPage } from './pages/admin/tools/MetadataManagerPage';
import { ContentWriterManagerPage } from './pages/admin/tools/ContentWriterManagerPage';
import { SloganManagerPage } from './pages/admin/tools/SloganManagerPage';
import { SocialManagerPage } from './pages/admin/tools/SocialManagerPage';
import { WordCounterManagerPage } from './pages/admin/tools/WordCounterManagerPage';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { HistoryPage } from './pages/dashboard/HistoryPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

function ToolRoute({ toolId, element }: { toolId: string; element: React.ReactElement }) {
  const { tools } = useAdminStore();
  const tool = tools.find(t => t.id === toolId);
  if (tool && !tool.enabled) return <Navigate to="/" replace />;
  return element;
}

function MaintenanceScreen() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1030] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
          <Shield size={36} className="text-amber-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Under Maintenance</h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
          We're currently performing scheduled maintenance. We'll be back shortly. Thank you for your patience.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-full">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Maintenance in progress</span>
        </div>
      </div>
    </div>
  );
}

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { maintenanceMode } = useAdminStore();
  const { user } = useStore();
  if (maintenanceMode && user?.role !== 'admin') {
    return <MaintenanceScreen />;
  }
  return <>{children}</>;
}

export default function App() {
  const { theme, user } = useStore();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Real-time CMS sync via Firestore ──────────────────────────────────────
  useEffect(() => {
    if (!firebaseReady) return;

    // All clients subscribe to live updates from Firestore
    const unsubListen = initFirestoreSync((data) => {
      useAdminStore.setState(data as unknown as Parameters<typeof useAdminStore.setState>[0]);
    });

    // Admin pushes changes to Firestore so all other clients receive them
    const unsubStore = useAdminStore.subscribe((state) => {
      if (user?.role === 'admin') {
        pushSettingsToFirestore(state as unknown as Record<string, unknown>);
      }
    });

    return () => {
      unsubListen();
      unsubStore();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseReady, user?.role]);

  return (
    <>
      <ThemeProvider />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <MaintenanceGuard>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/tools-overview" element={<ToolsOverviewPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai-settings" element={<AISettingsPage guestAllowed />} />
        <Route path="/billing" element={<BillingPage />} />

        {/* Tools — all allow guest access with 50 free credits */}
        <Route path="/tools/metadata" element={<ToolRoute toolId="metadata" element={<MetadataGeneratorPage guestAllowed />} />} />
        <Route path="/tools/image-to-prompt" element={<ToolRoute toolId="image-to-prompt" element={<ImageToPromptPage guestAllowed />} />} />
        <Route path="/tools/content-writer" element={<ToolRoute toolId="content-writer" element={<ContentWriterPage guestAllowed />} />} />
        <Route path="/tools/social-scheduler" element={<ToolRoute toolId="social-scheduler" element={<SocialSchedulerPage guestAllowed />} />} />
        <Route path="/tools/event-calendar" element={<ToolRoute toolId="event-calendar" element={<EventCalendarPage guestAllowed />} />} />
        <Route path="/tools/word-counter" element={<ToolRoute toolId="word-counter" element={<WordCounterPage guestAllowed />} />} />
        <Route path="/tools/age-calculator" element={<ToolRoute toolId="age-calculator" element={<AgeCalculatorPage guestAllowed />} />} />
        <Route path="/tools/slogan-generator" element={<ToolRoute toolId="slogan-generator" element={<SloganGeneratorPage guestAllowed />} />} />

        {/* Placeholder dashboard pages */}
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/prompts" element={<PromptManagementPage />} />
        <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/admin/apis" element={<APIManagementPage />} />
        <Route path="/admin/credits" element={<CreditManagementPage />} />
        <Route path="/admin/settings" element={<GlobalSettingsPage />} />
        <Route path="/admin/content" element={<ContentManagementPage />} />
        <Route path="/admin/maintenance" element={<MaintenancePage />} />
        <Route path="/admin/about" element={<AboutManagerPage />} />
        <Route path="/admin/pricing" element={<PricingManagerPage />} />
        <Route path="/admin/discounts" element={<DiscountManagerPage />} />
        <Route path="/admin/billing-manager" element={<BillingManagerPage />} />
        <Route path="/admin/payment-gateway" element={<PaymentGatewayPage />} />
        <Route path="/admin/feature-access" element={<FeatureAccessPage />} />
        <Route path="/admin/navigation" element={<NavigationManagerPage />} />
        <Route path="/admin/theme" element={<ThemeManagerPage />} />
        <Route path="/admin/legal" element={<LegalManagerPage />} />
        <Route path="/admin/security" element={<SecuritySettingsPage />} />
        <Route path="/admin/guest-alerts" element={<GuestAlertManagerPage />} />
        <Route path="/admin/cms" element={<CMSEditorPage />} />

        {/* Admin — Website Management */}
        <Route path="/admin/homepage" element={<HomepageManagerPage />} />
        <Route path="/admin/contact-manager" element={<ContactManagerPage />} />
        <Route path="/admin/footer" element={<FooterManagerPage />} />
        <Route path="/admin/terms" element={<TermsManagerPage />} />
        <Route path="/admin/privacy" element={<PrivacyManagerPage />} />

        {/* Admin — Tool Management */}
        <Route path="/admin/tool/image-to-prompt" element={<ImageToPromptManagerPage />} />
        <Route path="/admin/tool/metadata" element={<MetadataManagerPage />} />
        <Route path="/admin/tool/content-writer" element={<ContentWriterManagerPage />} />
        <Route path="/admin/tool/slogan" element={<SloganManagerPage />} />
        <Route path="/admin/tool/social" element={<SocialManagerPage />} />
        <Route path="/admin/tool/word-counter" element={<WordCounterManagerPage />} />

        {/* Admin — System */}
        <Route path="/admin/media" element={<MediaLibraryPage />} />
        <Route path="/admin/banners" element={<BannerManagerPage />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        <Route path="/admin/seo" element={<SEOSettingsPage />} />
        <Route path="/admin/credits-system" element={<CreditsSystemPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </MaintenanceGuard>
    </>
  );
}
