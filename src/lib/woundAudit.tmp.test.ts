/**
 * TEMPORARY audit — which cases produce skin-visible wounds, where, and do
 * laterality/region/kind look sane? Prints a table; deleted after use.
 */
import { describe, it } from 'vitest';
import { allCases } from '@/data/cases';
import { inferInjuries, injuryRegionTo3D } from '@/lib/injuryMap';
import { spriteKindFor } from '@/components/Body3DModel/WoundLayer';

describe('WOUND AUDIT (temporary)', () => {
  it('dumps injury placement for every case', () => {
    const lines: string[] = [];
    let casesWithPaintable = 0;
    let totalPaintable = 0;
    for (const c of allCases) {
      const injuries = inferInjuries(c);
      if (injuries.length === 0) continue;
      const rows = injuries.map(i => {
        const kind = spriteKindFor(i);
        const r3 = injuryRegionTo3D(i.region);
        if (kind) totalPaintable++;
        return `      ${i.region} -> ${r3} | ${i.kind}${kind ? ' -> ' + kind : ' (no sprite)'} | ${i.severity} | ${i.label}`;
      });
      const paintable = injuries.filter(i => spriteKindFor(i)).length;
      if (paintable > 0) casesWithPaintable++;
      lines.push(`  ${c.id} (${(c as { title?: string }).title ?? ''})\n${rows.join('\n')}`);
    }
    console.log(`\n=== WOUND AUDIT: ${allCases.length} cases, ${casesWithPaintable} with paintable wounds, ${totalPaintable} paintable injuries ===\n${lines.join('\n')}`);
  });
});
