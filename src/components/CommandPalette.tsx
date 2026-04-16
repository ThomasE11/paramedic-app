/**
 * CommandPalette — ⌘K / Ctrl+K fast launcher.
 *
 * The paramedic simulator has ~100 cases scattered across 18 categories. The
 * sidebar filters are great for discovery, but clinicians who know what they
 * want (a Wellens ECG case, a DKA case, a paediatric anaphylaxis) need a
 * faster path. This palette fuzzy-matches every case by title, diagnosis,
 * category, and keywords — three keystrokes, enter, go.
 *
 * It also surfaces the top-level app actions (switch role, toggle theme,
 * toggle language, open guided simulation setup) so the entire app is
 * keyboard-driveable.
 *
 * Opens on ⌘K (mac) / Ctrl+K (win/linux) / slash key when not in a text
 * field. The keyboard layer sits at the app shell so every screen picks
 * it up.
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command';
import { useTranslation } from 'react-i18next';
import { Activity, Search, Sparkles, Stethoscope, GraduationCap, Languages, Moon, Sun } from 'lucide-react';
import { allCases } from '@/data/cases';
import type { CaseScenario } from '@/types';
import i18n from '@/i18n';

interface CommandPaletteProps {
  /** Called when the user picks a case from the palette. */
  onCaseSelect?: (caseData: CaseScenario) => void;
  /** Called when the user picks "switch role" (returns to role selection). */
  onSwitchRole?: () => void;
  /** Optional extra actions unique to the current screen. */
  extraActions?: Array<{
    id: string;
    label: string;
    hint?: string;
    onSelect: () => void;
    icon?: React.ReactNode;
  }>;
}

export function CommandPalette({ onCaseSelect, onSwitchRole, extraActions = [] }: CommandPaletteProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // ⌘K / Ctrl+K globally — unless a text field is focused on the palette itself.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isTextField =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === '/' && !isTextField && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Small-batch fuzzy filter. We don't need a library for ~100 cases at
  // typing speed; score by substring matches on title, diagnosis, category,
  // and subcategory. Keeps the bundle tiny.
  const filteredCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCases.slice(0, 24); // cap initial view
    const score = (c: CaseScenario) => {
      const fields = [
        c.title,
        c.category,
        c.subcategory ?? '',
        c.expectedFindings?.mostLikelyDiagnosis ?? '',
        (c.expectedFindings?.differentialDiagnoses ?? []).join(' '),
      ].join(' ').toLowerCase();
      if (!fields.includes(q)) return -1;
      // Weight title > category > others.
      const title = c.title.toLowerCase();
      if (title.startsWith(q)) return 10;
      if (title.includes(q)) return 6;
      if (c.category.toLowerCase().includes(q)) return 3;
      return 1;
    };
    return allCases
      .map(c => ({ c, s: score(c) }))
      .filter(x => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map(x => x.c);
  }, [query]);

  const onSelectCase = useCallback((c: CaseScenario) => {
    setOpen(false);
    setQuery('');
    onCaseSelect?.(c);
  }, [onCaseSelect]);

  const handleRoleSwitch = useCallback(() => {
    setOpen(false);
    onSwitchRole?.();
  }, [onSwitchRole]);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    root.classList.toggle('dark', !isDark);
    localStorage.setItem('paramedic-theme', isDark ? 'light' : 'dark');
    setOpen(false);
  }, []);

  const toggleLanguage = useCallback(() => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    void i18n.changeLanguage(next);
    localStorage.setItem('paramedic-studio-language', next);
    setOpen(false);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={t('palette.placeholder', { defaultValue: 'Search cases, actions, or type a diagnosis…' })}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{t('palette.noResults', { defaultValue: 'No matches' })}</CommandEmpty>

        {extraActions.length > 0 && (
          <>
            <CommandGroup heading={t('palette.actions', { defaultValue: 'Actions' })}>
              {extraActions.map(a => (
                <CommandItem key={a.id} value={`action-${a.id} ${a.label}`} onSelect={() => { setOpen(false); a.onSelect(); }}>
                  {a.icon ?? <Sparkles className="mr-2 h-4 w-4 text-primary" />}
                  <span>{a.label}</span>
                  {a.hint && <CommandShortcut>{a.hint}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading={t('palette.cases', { defaultValue: 'Cases' })}>
          {filteredCases.map(c => (
            <CommandItem
              key={c.id}
              value={`${c.title} ${c.category} ${c.subcategory ?? ''} ${c.expectedFindings?.mostLikelyDiagnosis ?? ''}`}
              onSelect={() => onSelectCase(c)}
            >
              <Stethoscope className="mr-2 h-4 w-4 text-primary/70" />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{c.title}</span>
                {c.expectedFindings?.mostLikelyDiagnosis && (
                  <span className="text-[10px] text-muted-foreground truncate">
                    {c.expectedFindings.mostLikelyDiagnosis}
                  </span>
                )}
              </div>
              <CommandShortcut className="uppercase text-[9px]">{c.category}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading={t('palette.navigation', { defaultValue: 'Navigation' })}>
          {onSwitchRole && (
            <CommandItem value="switch role educator student" onSelect={handleRoleSwitch}>
              <GraduationCap className="mr-2 h-4 w-4" />
              {t('header.switchRole', { defaultValue: 'Switch role' })}
              <CommandShortcut>ESC</CommandShortcut>
            </CommandItem>
          )}
          <CommandItem value="toggle theme dark light" onSelect={toggleTheme}>
            <Moon className="mr-2 h-4 w-4" />
            {t('palette.toggleTheme', { defaultValue: 'Toggle dark mode' })}
            <CommandShortcut>⇧ D</CommandShortcut>
          </CommandItem>
          <CommandItem value="toggle language arabic english" onSelect={toggleLanguage}>
            <Languages className="mr-2 h-4 w-4" />
            {t('palette.toggleLanguage', { defaultValue: 'Toggle language (EN ↔ AR)' })}
            <CommandShortcut>⇧ L</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Tiny hint chip to display near the search/generate UI so first-time users
 * discover the palette.
 */
export function CommandPaletteHint({ className }: { className?: string }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground ${className ?? ''}`}
    >
      <Search className="h-3 w-3" />
      <span>Press</span>
      <kbd className="inline-flex items-center gap-0.5 rounded bg-background border border-border px-1.5 py-0.5 font-mono text-[10px] font-semibold">
        {isMac ? '⌘' : 'Ctrl'} K
      </kbd>
      <span>for quick search</span>
    </div>
  );
}

// Avoid unused warnings when Activity/Sun are only referenced for future use.
void Activity; void Sun;
