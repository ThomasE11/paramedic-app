/**
 * i18n configuration — English + Arabic.
 *
 * - Detects language from localStorage first, then browser, falling back to English.
 * - Sets `<html lang>` and `<html dir>` whenever the language changes so RTL
 *   works throughout the app (Tailwind classes are already direction-agnostic
 *   thanks to logical properties; raw `left/right` utilities are rare here).
 * - Case content (11k lines of clinical data) stays English for now — only the
 *   UI chrome is localised in Phase 1.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en.json';
import arCommon from '@/locales/ar.json';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

export function isRTL(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Apply the language to the document root — sets `lang` and `dir` attributes
 * so CSS and AT tooling know which direction to render.
 */
export function applyDocumentDirection(lang: string) {
  if (typeof document === 'undefined') return;
  const dir = isRTL(lang) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', dir);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enCommon },
      ar: { translation: arCommon },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true, // `en-GB` -> `en`
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'paramedic-studio-language',
      caches: ['localStorage'],
    },
    returnNull: false,
  });

// Apply direction whenever the language changes (including at first load).
applyDocumentDirection(i18n.language || 'en');
i18n.on('languageChanged', (lng) => {
  applyDocumentDirection(lng);
});

export default i18n;
