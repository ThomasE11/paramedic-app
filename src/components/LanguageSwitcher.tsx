/**
 * Language Switcher
 *
 * Small header control to toggle between English and Arabic.
 * Sits next to the VoiceToggleButton and ThemeToggle.
 */

import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'compact';
}

export function LanguageSwitcher({ className = '', variant = 'compact' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const currentLang = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;
  const nextLang: SupportedLanguage = currentLang === 'en' ? 'ar' : 'en';

  const nextLanguageLabel = nextLang === 'ar' ? t('language.arabic') : t('language.english');

  const handleToggle = () => {
    i18n.changeLanguage(nextLang);
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={t('language.switchTo', { language: nextLanguageLabel })}
        title={t('language.switchTo', { language: nextLanguageLabel })}
        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 active:bg-muted transition-colors touch-manipulation text-xs font-medium ${className}`}
      >
        <Languages className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{nextLang === 'ar' ? 'ع' : 'EN'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={t('language.switchTo', { language: nextLanguageLabel })}
      title={t('language.switchTo', { language: nextLanguageLabel })}
      className={`inline-flex items-center justify-center gap-1 h-8 w-auto min-w-8 px-2 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 active:bg-muted transition-colors touch-manipulation ${className}`}
    >
      <Languages className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[11px] font-semibold text-muted-foreground">
        {currentLang === 'en' ? 'ع' : 'EN'}
      </span>
    </button>
  );
}

// Also export the list in case consumers want to build their own dropdown later.
export { SUPPORTED_LANGUAGES };
