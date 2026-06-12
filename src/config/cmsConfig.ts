// ─── CMS field / section / page schema + default values ────────────────────────
// Components call useCMS(key) to read dynamic text; this file defines
// every key with its label, hint, and default value.

export interface CMSField {
  key: string;
  label: string;
  hint?: string;
  type: 'text' | 'textarea';
}

export interface CMSSection {
  id: string;
  title: string;
  fields: CMSField[];
}

export interface CMSPage {
  id: string;
  label: string;
  icon: string;
  path?: string;
  sections: CMSSection[];
}

// ─── Default values ────────────────────────────────────────────────────────────

export const CMS_DEFAULTS: Record<string, string> = {

  // ── Site-wide ─────────────────────────────────────────────────────────────────
  'site.name':    'PixelMind AI',
  'site.tagline': 'The AI Creative Suite for Visual Creators',

  // ── Home — Hero ───────────────────────────────────────────────────────────────
  'home.hero.badge':      'The AI Creative Suite — No Account Required',
  'home.hero.microlabel': 'AI Prompts · Stock Metadata · Content Tools',
  'home.hero.title1':     'Your Images Deserve',
  'home.hero.title2':     'Perfect Words.',
  'home.hero.subtitle':   'Generate platform-perfect AI prompts for Midjourney, DALL·E & Flux. Create SEO-ready metadata for Adobe Stock, Shutterstock & Freepik. One powerful workspace — built for visual creators.',
  'home.hero.cta_primary':   'Start Creating Free',
  'home.hero.cta_secondary': 'See How It Works',

  // ── Home — Stats ──────────────────────────────────────────────────────────────
  'home.stats.label1': 'Prompts Generated',
  'home.stats.label2': 'Metadata Created',
  'home.stats.label3': 'Active Users',
  'home.stats.label4': 'AI Platforms',

  // ── Home — Tools section ──────────────────────────────────────────────────────
  'home.tools.title':    'Powerful Tools, Free to Try',
  'home.tools.subtitle': 'No account required. Start generating with 50 free guest credits — instantly.',

  // ── Home — Features section ───────────────────────────────────────────────────
  'home.features.title':    'Everything a Creator Needs',
  'home.features.subtitle': 'From image analysis to content writing — all tools work together seamlessly. No switching between apps.',

  // ── Home — CTA banner ─────────────────────────────────────────────────────────
  'home.cta.title':        'Create Your First Prompt in 30 Seconds',
  'home.cta.subtitle':     'No setup. No credit card. Just drop an image and watch PixelMind AI do the work.',
  'home.cta.primary':      'Start For Free',
  'home.cta.secondary':    'View Pricing',

  // ── Pricing ───────────────────────────────────────────────────────────────────
  'pricing.hero.title':           'Simple, Transparent Pricing',
  'pricing.hero.subtitle':        'Start free. Upgrade when you need more. Cancel anytime.',
  'pricing.free.name':            'Free',
  'pricing.free.description':     'Perfect for getting started and exploring all tools.',
  'pricing.pro.name':             'Pro',
  'pricing.pro.description':      'For serious creators who need unlimited power.',
  'pricing.enterprise.name':      'Enterprise',
  'pricing.enterprise.description': 'For agencies and teams that need maximum scale.',
  'pricing.cta.monthly':          'Monthly',
  'pricing.cta.annual':           'Annual',
  'pricing.cta.save':             'Save 35%',

  // ── Features ──────────────────────────────────────────────────────────────────
  'features.hero.title':    'Built for Visual Creators',
  'features.hero.subtitle': 'Every feature designed to save time and produce better results.',
  'features.cta.title':     'Ready to Transform Your Workflow?',
  'features.cta.subtitle':  'Join thousands of creators who use PixelMind AI every day.',

  // ── Tool descriptions ─────────────────────────────────────────────────────────
  'tool.metadata.name':        'AI Metadata Generator',
  'tool.metadata.description': 'Generate SEO-optimized titles, descriptions, and tags for Adobe Stock, Shutterstock, and Freepik instantly.',
  'tool.img2prompt.name':        'Image to Prompt Generator',
  'tool.img2prompt.description': 'Reverse-engineer any image into a platform-perfect AI prompt for Midjourney, DALL·E, Flux, or Stable Diffusion.',
  'tool.content.name':        'AI Content Writer',
  'tool.content.description': 'Generate blogs, YouTube scripts, marketing copy, stories, and emails powered by the latest AI models.',
  'tool.slogan.name':        'Slogan Generator',
  'tool.slogan.description': 'Create memorable, on-brand slogans and taglines for any industry in seconds.',
  'tool.wordcount.name':        'Word Counter',
  'tool.wordcount.description': 'Advanced word, character, sentence, and readability analysis — paste any text and get instant stats.',
  'tool.age.name':        'Age Calculator',
  'tool.age.description': 'Calculate exact age, time differences, and upcoming birthday milestones with precision.',
  'tool.social.name':        'Social Scheduler',
  'tool.social.description': 'Plan and organize your social media content calendar with AI-assisted caption generation.',
  'tool.calendar.name':        'Event Calendar',
  'tool.calendar.description': 'Manage events, deadlines, and creative milestones with a smart integrated calendar.',

  // ── Auth ──────────────────────────────────────────────────────────────────────
  'auth.login.title':         'Welcome Back',
  'auth.login.subtitle':      'Sign in to your PixelMind AI account',
  'auth.login.email':         'Email address',
  'auth.login.password':      'Password',
  'auth.login.cta':           'Sign In',
  'auth.login.google':        'Continue with Google',
  'auth.login.forgot':        'Forgot password?',
  'auth.login.no_account':    "Don't have an account?",
  'auth.login.register_link': 'Create one free',

  'auth.register.title':         'Create Your Account',
  'auth.register.subtitle':      'Join thousands of visual creators using PixelMind AI',
  'auth.register.name':          'Full name',
  'auth.register.email':         'Email address',
  'auth.register.password':      'Password',
  'auth.register.cta':           'Create Account',
  'auth.register.google':        'Sign up with Google',
  'auth.register.has_account':   'Already have an account?',
  'auth.register.login_link':    'Sign in',

  // ── Global UI labels ──────────────────────────────────────────────────────────
  'ui.btn.generate':   'Generate',
  'ui.btn.upload':     'Upload Files',
  'ui.btn.browse':     'Browse Files',
  'ui.btn.copy':       'Copy',
  'ui.btn.download':   'Download',
  'ui.btn.save':       'Save',
  'ui.btn.cancel':     'Cancel',
  'ui.btn.add':        'Add',
  'ui.btn.edit':       'Edit',
  'ui.btn.delete':     'Delete',
  'ui.btn.reset':      'Reset',
  'ui.btn.get_started': 'Get Started Free',
  'ui.btn.login':      'Sign In',
  'ui.btn.register':   'Create Account',
  'ui.btn.upgrade':    'Upgrade to Pro',
  'ui.btn.api_key':    'Get API Key',
  'ui.btn.add_more':   'Add More',
  'ui.btn.clear_all':  'Clear All',
  'ui.btn.regenerate': 'Regenerate',
  'ui.btn.try_free':   'Try for Free',

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  'dashboard.welcome':       'Welcome back',
  'dashboard.subtitle':      'Here\'s what\'s happening with your creative workspace.',
  'dashboard.credits_label': 'Credits Remaining',
  'dashboard.plan_label':    'Current Plan',

  // ── Footer ────────────────────────────────────────────────────────────────────
  'footer.tagline':   'The professional AI creative suite for visual creators.',
  'footer.copyright': '© 2025 PixelMind AI. All rights reserved.',
  'footer.newsletter.title':       'Stay in the loop',
  'footer.newsletter.placeholder': 'Enter your email',
  'footer.newsletter.cta':         'Subscribe',
};

// ─── Page / Section / Field registry — drives the CMS editor UI ───────────────

export const CMS_PAGES: CMSPage[] = [
  {
    id: 'home',
    label: 'Home Page',
    icon: '🏠',
    path: '/',
    sections: [
      {
        id: 'hero',
        title: 'Hero Section',
        fields: [
          { key: 'home.hero.badge',         label: 'Hero Badge',             hint: 'Small pill label above headline',           type: 'text' },
          { key: 'home.hero.microlabel',     label: 'Micro Label',            hint: 'Tiny uppercase text beneath the badge',     type: 'text' },
          { key: 'home.hero.title1',         label: 'Headline — Line 1',      hint: 'First line of main headline',               type: 'text' },
          { key: 'home.hero.title2',         label: 'Headline — Line 2 (accented)', hint: 'Highlighted second line',             type: 'text' },
          { key: 'home.hero.subtitle',       label: 'Hero Subtitle',          hint: 'Descriptive paragraph below headline',      type: 'textarea' },
          { key: 'home.hero.cta_primary',    label: 'Primary CTA Button',     hint: 'Main action button text',                  type: 'text' },
          { key: 'home.hero.cta_secondary',  label: 'Secondary CTA Button',   hint: 'Secondary ghost button text',               type: 'text' },
        ],
      },
      {
        id: 'stats',
        title: 'Stats Section',
        fields: [
          { key: 'home.stats.label1', label: 'Stat 1 — Label', hint: 'e.g. "Prompts Generated"', type: 'text' },
          { key: 'home.stats.label2', label: 'Stat 2 — Label', hint: 'e.g. "Metadata Created"',  type: 'text' },
          { key: 'home.stats.label3', label: 'Stat 3 — Label', hint: 'e.g. "Active Users"',      type: 'text' },
          { key: 'home.stats.label4', label: 'Stat 4 — Label', hint: 'e.g. "AI Platforms"',      type: 'text' },
        ],
      },
      {
        id: 'tools',
        title: 'Tools Section',
        fields: [
          { key: 'home.tools.title',    label: 'Section Title',    type: 'text'     },
          { key: 'home.tools.subtitle', label: 'Section Subtitle', type: 'textarea' },
        ],
      },
      {
        id: 'features',
        title: 'Features Section',
        fields: [
          { key: 'home.features.title',    label: 'Section Title',    type: 'text'     },
          { key: 'home.features.subtitle', label: 'Section Subtitle', type: 'textarea' },
        ],
      },
      {
        id: 'cta',
        title: 'CTA Banner',
        fields: [
          { key: 'home.cta.title',     label: 'CTA Heading',          type: 'text'     },
          { key: 'home.cta.subtitle',  label: 'CTA Subtitle',         type: 'textarea' },
          { key: 'home.cta.primary',   label: 'CTA Primary Button',   type: 'text'     },
          { key: 'home.cta.secondary', label: 'CTA Secondary Button', type: 'text'     },
        ],
      },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing Page',
    icon: '💰',
    path: '/pricing',
    sections: [
      {
        id: 'hero',
        title: 'Page Header',
        fields: [
          { key: 'pricing.hero.title',    label: 'Page Title',    type: 'text'     },
          { key: 'pricing.hero.subtitle', label: 'Page Subtitle', type: 'textarea' },
          { key: 'pricing.cta.monthly',   label: 'Monthly Toggle Label', type: 'text' },
          { key: 'pricing.cta.annual',    label: 'Annual Toggle Label',  type: 'text' },
          { key: 'pricing.cta.save',      label: 'Annual Save Badge',    type: 'text' },
        ],
      },
      {
        id: 'plans',
        title: 'Plan Names & Descriptions',
        fields: [
          { key: 'pricing.free.name',             label: 'Free Plan — Name',                type: 'text' },
          { key: 'pricing.free.description',      label: 'Free Plan — Description',         type: 'text' },
          { key: 'pricing.pro.name',              label: 'Pro Plan — Name',                 type: 'text' },
          { key: 'pricing.pro.description',       label: 'Pro Plan — Description',          type: 'text' },
          { key: 'pricing.enterprise.name',       label: 'Enterprise Plan — Name',          type: 'text' },
          { key: 'pricing.enterprise.description', label: 'Enterprise Plan — Description',  type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'features',
    label: 'Features Page',
    icon: '✨',
    path: '/features',
    sections: [
      {
        id: 'hero',
        title: 'Page Header',
        fields: [
          { key: 'features.hero.title',    label: 'Page Title',    type: 'text'     },
          { key: 'features.hero.subtitle', label: 'Page Subtitle', type: 'textarea' },
        ],
      },
      {
        id: 'cta',
        title: 'CTA Section',
        fields: [
          { key: 'features.cta.title',    label: 'CTA Title',    type: 'text'     },
          { key: 'features.cta.subtitle', label: 'CTA Subtitle', type: 'textarea' },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tool Descriptions',
    icon: '🔧',
    sections: [
      {
        id: 'tool-names',
        title: 'Names & Descriptions',
        fields: [
          { key: 'tool.metadata.name',        label: 'Metadata Generator — Name',        type: 'text'     },
          { key: 'tool.metadata.description', label: 'Metadata Generator — Description', type: 'textarea' },
          { key: 'tool.img2prompt.name',        label: 'Image to Prompt — Name',          type: 'text'     },
          { key: 'tool.img2prompt.description', label: 'Image to Prompt — Description',   type: 'textarea' },
          { key: 'tool.content.name',        label: 'Content Writer — Name',        type: 'text'     },
          { key: 'tool.content.description', label: 'Content Writer — Description', type: 'textarea' },
          { key: 'tool.slogan.name',        label: 'Slogan Generator — Name',        type: 'text'     },
          { key: 'tool.slogan.description', label: 'Slogan Generator — Description', type: 'textarea' },
          { key: 'tool.wordcount.name',        label: 'Word Counter — Name',        type: 'text'     },
          { key: 'tool.wordcount.description', label: 'Word Counter — Description', type: 'textarea' },
          { key: 'tool.age.name',        label: 'Age Calculator — Name',        type: 'text'     },
          { key: 'tool.age.description', label: 'Age Calculator — Description', type: 'textarea' },
          { key: 'tool.social.name',        label: 'Social Scheduler — Name',        type: 'text'     },
          { key: 'tool.social.description', label: 'Social Scheduler — Description', type: 'textarea' },
          { key: 'tool.calendar.name',        label: 'Event Calendar — Name',        type: 'text'     },
          { key: 'tool.calendar.description', label: 'Event Calendar — Description', type: 'textarea' },
        ],
      },
    ],
  },
  {
    id: 'auth',
    label: 'Auth Pages',
    icon: '🔐',
    sections: [
      {
        id: 'login',
        title: 'Login Page',
        fields: [
          { key: 'auth.login.title',         label: 'Page Title',           type: 'text' },
          { key: 'auth.login.subtitle',      label: 'Page Subtitle',        type: 'text' },
          { key: 'auth.login.cta',           label: '"Sign In" Button',     type: 'text' },
          { key: 'auth.login.google',        label: '"Google" Button',      type: 'text' },
          { key: 'auth.login.forgot',        label: '"Forgot Password" Link', type: 'text' },
          { key: 'auth.login.no_account',    label: '"No Account" Text',    type: 'text' },
          { key: 'auth.login.register_link', label: 'Register Link Text',   type: 'text' },
        ],
      },
      {
        id: 'register',
        title: 'Register Page',
        fields: [
          { key: 'auth.register.title',      label: 'Page Title',           type: 'text' },
          { key: 'auth.register.subtitle',   label: 'Page Subtitle',        type: 'text' },
          { key: 'auth.register.cta',        label: '"Create Account" Button', type: 'text' },
          { key: 'auth.register.google',     label: '"Google" Button',      type: 'text' },
          { key: 'auth.register.has_account', label: '"Has Account" Text',  type: 'text' },
          { key: 'auth.register.login_link', label: 'Login Link Text',      type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'buttons',
    label: 'Button Labels',
    icon: '🔘',
    sections: [
      {
        id: 'global-actions',
        title: 'Global Action Buttons',
        fields: [
          { key: 'ui.btn.generate',    label: '"Generate" Button',       hint: 'Main AI generation action', type: 'text' },
          { key: 'ui.btn.upload',      label: '"Upload" Button',         type: 'text' },
          { key: 'ui.btn.browse',      label: '"Browse Files" Button',   type: 'text' },
          { key: 'ui.btn.copy',        label: '"Copy" Button',           type: 'text' },
          { key: 'ui.btn.download',    label: '"Download" Button',       type: 'text' },
          { key: 'ui.btn.save',        label: '"Save" Button',           type: 'text' },
          { key: 'ui.btn.cancel',      label: '"Cancel" Button',         type: 'text' },
          { key: 'ui.btn.regenerate',  label: '"Regenerate" Button',     type: 'text' },
          { key: 'ui.btn.add_more',    label: '"Add More" Button',       type: 'text' },
          { key: 'ui.btn.clear_all',   label: '"Clear All" Button',      type: 'text' },
        ],
      },
      {
        id: 'cta-buttons',
        title: 'CTA & Navigation Buttons',
        fields: [
          { key: 'ui.btn.get_started', label: '"Get Started" CTA',     hint: 'Main hero CTA', type: 'text' },
          { key: 'ui.btn.login',       label: '"Sign In" Button',       type: 'text' },
          { key: 'ui.btn.register',    label: '"Create Account" Button', type: 'text' },
          { key: 'ui.btn.upgrade',     label: '"Upgrade to Pro" Button', type: 'text' },
          { key: 'ui.btn.api_key',     label: '"Get API Key" Button',   type: 'text' },
          { key: 'ui.btn.try_free',    label: '"Try for Free" Button',  type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
    sections: [
      {
        id: 'welcome',
        title: 'Welcome Section',
        fields: [
          { key: 'dashboard.welcome',       label: 'Welcome Greeting',       type: 'text' },
          { key: 'dashboard.subtitle',      label: 'Dashboard Subtitle',     type: 'text' },
          { key: 'dashboard.credits_label', label: 'Credits Label',          type: 'text' },
          { key: 'dashboard.plan_label',    label: 'Plan Label',             type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    icon: '📄',
    sections: [
      {
        id: 'footer-content',
        title: 'Footer Content',
        fields: [
          { key: 'footer.tagline',                 label: 'Brand Tagline',             type: 'text'     },
          { key: 'footer.copyright',               label: 'Copyright Notice',          type: 'text'     },
          { key: 'footer.newsletter.title',        label: 'Newsletter Section Title',  type: 'text'     },
          { key: 'footer.newsletter.placeholder',  label: 'Email Placeholder',         type: 'text'     },
          { key: 'footer.newsletter.cta',          label: 'Subscribe Button Text',     type: 'text'     },
        ],
      },
    ],
  },
  {
    id: 'site',
    label: 'Site Identity',
    icon: '🌐',
    sections: [
      {
        id: 'branding',
        title: 'Brand Identity',
        fields: [
          { key: 'site.name',    label: 'Site Name',    hint: 'Appears in browser tab and meta tags', type: 'text' },
          { key: 'site.tagline', label: 'Site Tagline', hint: 'Used in SEO meta description',         type: 'text' },
        ],
      },
    ],
  },
];
