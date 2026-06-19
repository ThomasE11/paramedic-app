#!/usr/bin/env node
/* Replays treatmentBelongsToBag() over every TREATMENT and reports any drug or
 * piece of kit that is reachable in NO bag (an orphan the student can never
 * select), plus the per-bag counts. Run after editing bag categories/ids. */
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const jiti = require('jiti')(projectRoot, { interopDefault: true, alias: { '@': resolve(projectRoot, 'src') }, esmResolve: true });
const { TREATMENTS } = jiti('./src/data/enhancedTreatmentEffects.ts');

const DISABILITY_IDS = ['glucose_10g','dextrose_10','dextrose_10_250ml','midazolam_5mg','midazolam_buccal','diazepam_rectal','mannitol_20','naloxone_04mg','ketamine_iv','ondansetron_4mg','metoclopramide_10mg','hypertonic_saline','lorazepam_4mg','flumazenil_02mg'];
const TRANSPORT_IDS = ['cervical_collar','head_blocks','spinal_board','scoop_stretcher','vacuum_mattress','ked','traction_splint'];

// Mirror of TREATMENT_JUMP_BAGS {categories, treatmentIds}.
const BAGS = [
  { key: 'airway', categories: ['airway'], treatmentIds: ['oxygen_nasal','oxygen_mask','oxygen_nonrebreather','nebulizer_salbutamol'] },
  { key: 'breathing', categories: ['breathing'], treatmentIds: [] },
  { key: 'circulation', categories: ['circulation'], treatmentIds: [] },
  { key: 'medications', categories: ['medication'], treatmentIds: [] },
  { key: 'disability', categories: ['psychological'], treatmentIds: DISABILITY_IDS },
  { key: 'exposure', categories: ['comfort','positioning'], treatmentIds: [] },
  { key: 'transport', categories: [], treatmentIds: TRANSPORT_IDS },
];

function belongs(t, bag) {
  const isTransport = TRANSPORT_IDS.includes(t.id);
  if (bag.key !== 'transport' && isTransport) return false;
  if (bag.key === 'transport') return isTransport;
  return bag.categories.includes(t.category)
    || Boolean(bag.treatmentIds?.includes(t.id))
    || (bag.key === 'disability' && /seizure|glucose|conscious/.test(String(t.description).toLowerCase()));
}

const counts = Object.fromEntries(BAGS.map(b => [b.key, 0]));
const orphans = [];
for (const t of TREATMENTS) {
  let homed = false;
  for (const bag of BAGS) if (belongs(t, bag)) { counts[bag.key]++; homed = true; }
  if (!homed) orphans.push(t);
}

console.log(`TREATMENTS total: ${TREATMENTS.length}`);
console.log('per-bag reachable counts:', counts);
console.log('');
if (orphans.length === 0) {
  console.log('ALL TREATMENTS REACHABLE IN A BAG ✓');
} else {
  console.log(`${orphans.length} ORPHAN(S) — reachable in NO bag ✗`);
  for (const t of orphans) console.log(`  ${t.id.padEnd(28)} [${t.category}]  ${t.name}`);
  process.exitCode = 1;
}
