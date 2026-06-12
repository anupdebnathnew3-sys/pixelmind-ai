/**
 * ThemeProvider
 *
 * Reads the admin's themeSettings from useAdminStore and injects
 * them as CSS custom properties on :root so any component that uses
 * var(--pix-*) gets live updates without a page reload.
 *
 * CSS vars exposed:
 *   --pix-primary        main brand / action colour
 *   --pix-secondary      supporting UI colour
 *   --pix-accent         gradient / highlight colour
 *   --pix-btn            CTA button background
 *   --pix-navbar-bg      navbar background
 *   --pix-footer-bg      footer background
 *   --pix-light-bg       light-mode page background
 *   --pix-dark-bg        dark-mode page background
 *   --pix-light-card     light-mode card background
 *   --pix-dark-card      dark-mode card background
 *   --pix-light-text     light-mode body text
 *   --pix-dark-text      dark-mode body text
 *
 * Legacy aliases (kept for backwards compat with existing components):
 *   --color-primary       = --pix-primary
 *   --color-gradient-end  = --pix-accent
 */

import { useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';

export function ThemeProvider() {
  const { themeSettings } = useAdminStore();

  useEffect(() => {
    const root = document.documentElement;
    const t = themeSettings;

    // Primary palette
    root.style.setProperty('--pix-primary',     t.primaryColor);
    root.style.setProperty('--pix-secondary',   t.secondaryColor);
    root.style.setProperty('--pix-accent',      t.accentColor);
    root.style.setProperty('--pix-btn',         t.buttonColor);

    // Surface colours
    root.style.setProperty('--pix-navbar-bg',   t.navbarBgColor);
    root.style.setProperty('--pix-footer-bg',   t.footerBgColor);
    root.style.setProperty('--pix-light-bg',    t.lightBg);
    root.style.setProperty('--pix-dark-bg',     t.darkBg);
    root.style.setProperty('--pix-light-card',  t.lightCard);
    root.style.setProperty('--pix-dark-card',   t.darkCard);
    root.style.setProperty('--pix-light-text',  t.lightText);
    root.style.setProperty('--pix-dark-text',   t.darkText);

    // Legacy aliases
    root.style.setProperty('--color-primary',      t.primaryColor);
    root.style.setProperty('--color-gradient-end', t.accentColor);
  }, [themeSettings]);

  return null;
}
