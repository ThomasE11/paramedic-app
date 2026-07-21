/**
 * Attributions & Licensing
 *
 * In-app credits for third-party assets and libraries. Lazy-loaded from the
 * footer. Kept factually accurate to the shipped assets:
 * - Patient meshes (male + female) are MPFB2/MakeHuman CC0 — the female mesh
 *   was re-baked as MPFB2 in July 2026 (was previously RPM CC BY-NC, now gone).
 * - LITFL ECG images ship under CC BY-NC-SA 4.0 (non-commercial) and are being
 *   replaced with programmatic rendering.
 */

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollText, ExternalLink } from 'lucide-react';

type Attribution = {
  titleKey: string;
  source: string;
  license: string;
  url?: string;
  note?: string;
};

const ATTRIBUTIONS: Attribution[] = [
  {
    titleKey: 'attributions.sections.patientModels',
    source: 'MPFB2 / MakeHuman Community',
    license: 'CC0 1.0 Universal (Public Domain)',
    url: 'https://static.makehumancommunity.org/',
    note: 'Both patient meshes (male and female) are MPFB2/MakeHuman CC0. The female mesh was re-baked as MPFB2 in July 2026.',
  },
  {
    titleKey: 'attributions.sections.ecgImages',
    source: 'Life in the Fast Lane (LITFL) ECG Library',
    license: 'CC BY-NC-SA 4.0',
    url: 'https://litfl.com',
    note: 'Non-commercial use. Being replaced with programmatic canvas rendering.',
  },
  {
    titleKey: 'attributions.sections.clinicalContent',
    source: 'UAE DOH / National Ambulance protocols · LITFL educational resources',
    license: 'Educational reference',
  },
  {
    titleKey: 'attributions.sections.skeleton',
    source: 'Open3D project',
    license: 'MIT License',
    url: 'https://www.open3d.org/',
  },
  {
    titleKey: 'attributions.sections.hdri',
    source: 'HDRI Haven — studio_small_08_1k.hdr',
    license: 'CC0 1.0 Universal',
    url: 'https://hdri-haven.com/',
  },
  {
    titleKey: 'attributions.sections.libraries',
    source: 'Three.js · React · shadcn/ui · framer-motion · i18next · Supabase · Vite',
    license: 'Respective open-source licenses (MIT / Apache-2.0)',
  },
];

export function AttributionsDialog({ trigger }: { trigger?: ReactNode } = {}) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground/80 underline-offset-2 hover:underline">
            {t('attributions.trigger')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            {t('attributions.title')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6 pb-6">
          <div className="space-y-4 pr-4">
            {ATTRIBUTIONS.map((item) => (
              <div key={item.titleKey} className="rounded-lg border bg-card p-4">
                <h4 className="text-sm font-semibold">{t(item.titleKey)}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{item.source}</p>
                <p className="mt-0.5 text-xs font-medium text-foreground/80">{item.license}</p>
                {item.note && (
                  <p className="mt-1 text-xs text-muted-foreground/80">{item.note}</p>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {item.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default AttributionsDialog;
