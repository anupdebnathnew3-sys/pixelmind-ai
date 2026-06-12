/**
 * useCMS(key) — reads a CMS text value from the admin store.
 * Falls back to CMS_DEFAULTS if the admin has not set a custom value.
 *
 * Usage:
 *   const title = useCMS('home.hero.title1');
 *
 * The hook also bridges the older homepageContent fields so the existing
 * HomePage works without changes while the CMS editor can edit those same values.
 */

import { useAdminStore } from '../store/useAdminStore';
import { CMS_DEFAULTS } from '../config/cmsConfig';

// Maps new CMS keys → existing homepageContent field names for backwards compat
const HOME_KEY_MAP: Record<string, keyof import('../store/useAdminStore').HomepageContent> = {
  'home.hero.badge':         'heroBadge',
  'home.hero.microlabel':    'heroMicroLabel',
  'home.hero.title1':        'heroTitleLine1',
  'home.hero.title2':        'heroTitleLine2',
  'home.hero.subtitle':      'heroSubtitle',
  'home.stats.label1':       'statsLabel1',
  'home.stats.label2':       'statsLabel2',
  'home.stats.label3':       'statsLabel3',
  'home.stats.label4':       'statsLabel4',
  'home.features.title':     'featuresTitle',
  'home.features.subtitle':  'featuresSubtitle',
  'home.tools.title':        'toolsSectionTitle',
  'home.tools.subtitle':     'toolsSectionSubtitle',
  'home.cta.title':          'ctaTitle',
  'home.cta.subtitle':       'ctaSubtitle',
};

export function useCMS(key: string): string {
  const { cmsContent, homepageContent } = useAdminStore();

  // 1. Prefer explicit CMS override
  if (cmsContent[key] !== undefined && cmsContent[key] !== '') {
    return cmsContent[key];
  }

  // 2. For home page keys, bridge to the existing homepageContent field
  const homeField = HOME_KEY_MAP[key];
  if (homeField) {
    const val = homepageContent[homeField];
    if (val) return val;
  }

  // 3. Fall back to static default
  return CMS_DEFAULTS[key] ?? key;
}

/** Non-hook version — useful in plain functions (e.g. metadata tags) */
export function getCMSValue(key: string): string {
  const { cmsContent, homepageContent } = useAdminStore.getState();

  if (cmsContent[key] !== undefined && cmsContent[key] !== '') {
    return cmsContent[key];
  }
  const homeField = HOME_KEY_MAP[key];
  if (homeField) {
    const val = homepageContent[homeField];
    if (val) return val;
  }
  return CMS_DEFAULTS[key] ?? key;
}
