/**
 * Attributions Screen
 *
 * Credits for CC0/CC-BY and open-source assets used in ParaMedic Studio.
 * See PATIENT_SIM_RESEARCH.md for the full audit trail.
 */

import { type ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollText } from 'lucide-react';

interface CreditSection {
  title: string;
  license: string;
  items: string[];
}

const creditSections: CreditSection[] = [
  {
    title: '3D patient bodies',
    license: 'CC0',
    items: [
      'MPFB2 (MakeHuman Community) — male & female patient meshes, posed variants, decimated exports. CC0 — no attribution required.',
      'patient-female.glb (original) — derived from Ready Player Me (CC-BY-NC-SA by default); replaced with MPFB2 CC0 export during Stage 2.',
    ],
  },
  {
    title: 'Environment lighting',
    license: 'CC0',
    items: [
      'Poly Haven — HDRI environment maps (studio interior, hospital ward, outdoor scene). CC0.',
    ],
  },
  {
    title: 'Anatomy overlays',
    license: 'CC-BY-SA (quarantined)',
    items: [
      'Z-Anatomy / BodyParts3D — anatomy reference overlays. CC-BY-SA. These meshes are loaded at runtime under assets/anatomy/ with their own LICENSE file — never merged into proprietary art.',
    ],
  },
  {
    title: 'Clinical simulation engine',
    license: 'Apache 2.0',
    items: [
      'Infirmary Integrated — scenario and vitals-signs mechanics. Apache 2.0. NOTICE included in project credits.',
    ],
  },
  {
    title: 'Equipment props',
    license: 'CC0 (preferred) / CC-BY',
    items: [
      'Sketchfab — individual equipment models (monitor, defibrillator, airway kit, IO drill). Per-model licenses apply; CC0-first sourcing policy. CC-BY models include full TASL credit in their respective asset metadata.',
    ],
  },
  {
    title: 'Application framework',
    license: 'MIT / Apache 2.0',
    items: [
      'React, Three.js, React Three Fiber/Drei, Vite, Tailwind CSS, shadcn/ui, Lucide, Radix UI, Supabase — all permissively licensed.',
    ],
  },
];

export function AttributionsDialog({ trigger }: { trigger?: ReactNode } = {}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <ScrollText className="w-3 h-3" />
            Attributions
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-cyan-700 dark:text-cyan-300" />
            Open-source credits &amp; attributions
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5">
            {creditSections.map((section) => (
              <section key={section.title}>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold">{section.title}</h3>
                  <span className="rounded-full border border-cyan-200/60 bg-cyan-50/60 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                    {section.license}
                  </span>
                </div>
                <ul className="space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed pl-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="border-t border-white/45 dark:border-white/10 pt-4 mt-5">
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                ParaMedic Studio is for educational purposes only. If you believe an asset or
                attribution has been omitted or misidentified, please{' '}
                <a
                  href="mailto:elias@twetemo.com"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  contact the developer
                </a>
                .
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
