/**
 * Asset Audit Script
 *
 * Verifies that all equipment items in the system have rendered
 * or available asset files. Uses a manual mapping table for items
 * where the asset filename differs from the equipment ID naming
 * convention (which is most of them).
 *
 * Reports:
 * 1. Missing equipment-asset files
 * 2. Duplicate treatment mappings (informational)
 * 3. Suspiciously small / placeholder-named assets
 * 4. Orphan assets not referenced by any equipment
 *
 * Usage: node scripts/audit-assets.mjs
 * Exits non-zero if assets with hard issues are missing.
 * Add new mappings below when new equipment or assets are added.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// =====================================================
// ASSET NAME MAPPINGS
// =====================================================
// Key: equipment ID (from equipmentSystem.ts)
// Value: asset stem(s) in public/equipment-assets/ to check
// Add new entries here when new equipment or assets are added.
// =====================================================
const EQUIPMENT_ASSET_MAP = {
  // Monitoring
  pulse_oximeter:      ['pulse-oximeter'],
  bp_cuff_manual:      ['bp-cuff-manual'],
  bp_monitor_auto:     ['bp-monitor-auto'],
  thermometer_digital: ['thermometer-digital'],
  thermometer_tympanic:['thermometer-tympanic'],
  ecg_monitor:         ['ecg-monitor', 'aed-defib'],
  glucometer:          ['glucometer'],
  capnography:         ['capnography'],

  // Airway
  oxygen_cylinder:     ['oxygen-cylinder'],
  bag_valve_mask:      ['bvm'],
  suction_unit:        ['portable-suction'],
  opa_set:             ['opa-set'],
  npa_set:             ['npa-set'],
  laryngoscope:        ['laryngoscope'],
  ett_set:             ['et-tube'],

  // Vascular
  iv_start_kit:        ['iv-cannula'],
  io_drill:            ['io-drill'],
  io_needles:          ['io-drill'], // same visual — IO drill's needles
  saline_bags:         ['fluid-bag'],

  // Medication
  syringes_needles:    ['analgesia-syringe'],
  nebulizer_kit:       ['nebulizer-mask'],

  // Immobilization
  c_collar:            ['cervical-collar'],
  backboard:           ['spine-board'],
  tourniquet_cat:      ['tourniquet'],
  pelvic_binder:       ['pelvic-binder'],

  // Diagnostic
  stethoscope:         ['stethoscope'],
  penlight:            ['penlight'],
  ecg_leads:           ['ecg-leads'],

  // Medications (supplementary images, not in equipment system but in assets)
  _medication_assets:  ['adrenaline-vials', 'aspirin-tablets', 'dextrose-bag',
                        'glucose-gel', 'gtn-spray', 'hydrocortisone-vial',
                        'mannitol-bag', 'midazolam-syringe', 'naloxone-vial',
                        'ondansetron-vial', 'txa-vials', 'analgesia-syringe'],

  // Treatment-asset-dedicated items (not in equipment system, used for treatment UI)
  _treatment_only:     ['nonrebreather-mask', 'defib-pads', 'cpap-circuit',
                        'ventilator-circuit', 'lucas-device', 'simple-mask'],

  // Immobilization extras
  _immobilization:     ['air-splint', 'box-splint', 'sam-splint', 'traction-splint',
                        'vacuum-limb-splint', 'ked-extrication-device', 'scoop-stretcher',
                        'head-blocks', 'vacuum-mattress', 'positioning', 'splints',
                        'bandages', 'ambulance-stretcher', 'cooling-pack',
                        'warming-blanket', 'needle-decompression', 'nasal-cannula',
                        'oxygen-mask', 'compact-mechanical-ventilator',
                        'portable-transport-ventilator'],

  // Treatment assets (svg format in treatment-assets/)
  _treatment_assets:   ['nonrebreather-mask', 'defib-pads', 'fluid-bag', 'cpap-mask',
                        'nebulizer-mask', 'nasal-cannula', 'bvm', 'opa', 'simple-mask',
                        'ventilator-circuit', 'lucas-device', 'et-tube', 'iv-cannula'],
};

// ---------- Helpers ----------

function dumpify(obj) {
  return JSON.stringify(obj, null, 2);
}

// ---------- Parse equipment data (for actual IDs) ----------
const equipmentPath = join(ROOT, 'src', 'data', 'equipmentSystem.ts');
const src = readFileSync(equipmentPath, 'utf-8');

const inventoryMatch = src.match(
  /export\s+const\s+EQUIPMENT_INVENTORY:\s*Equipment\[\]\s*=\s*\[([\s\S]*?)\];/
);
if (!inventoryMatch) {
  console.error('FAIL: Could not find EQUIPMENT_INVENTORY in equipmentSystem.ts');
  process.exit(1);
}

const inventoryBlock = inventoryMatch[1];

const objects = [];
let depth = 0;
let start = -1;
for (let i = 0; i < inventoryBlock.length; i++) {
  const ch = inventoryBlock[i];
  if (ch === '{') { if (depth === 0) start = i; depth++; }
  else if (ch === '}') { depth--; if (depth === 0 && start !== -1) { objects.push(inventoryBlock.slice(start, i + 1)); start = -1; }}
}

function parseEquipmentObj(objStr) {
  const item = { treatments: [] };
  const inner = objStr.trim().slice(1, -1).trim();
  const props = [];
  let pDepth = 0, pStart = 0, inString = false, stringChar = null;
  for (let i = 0; i <= inner.length; i++) {
    const ch = inner[i];
    if (inString) { if (ch === '\\') i++; else if (ch === stringChar) inString = false; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inString = true; stringChar = ch; continue; }
    if (ch === '{' || ch === '[') { pDepth++; continue; }
    if (ch === '}' || ch === ']') { pDepth--; continue; }
    if (ch === ',' && pDepth === 0) { props.push(inner.slice(pStart, i).trim()); pStart = i + 1; }
  }
  const lastProp = inner.slice(pStart).trim();
  if (lastProp) props.push(lastProp);

  for (const prop of props) {
    const colonIdx = prop.indexOf(':');
    if (colonIdx === -1) continue;
    const key = prop.slice(0, colonIdx).trim();
    let val = prop.slice(colonIdx + 1).trim();
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) val = val.slice(1, -1);
    if (key === 'id') item.id = val;
    else if (key === 'name') item.name = val;
    else if (key === 'category') item.category = val;
    else if (key === 'requiredForTreatments') {
      const arrMatch = val.match(/\[([\s\S]*?)\]/);
      if (arrMatch) item.treatments = arrMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')).filter(Boolean);
    }
  }
  return item;
}

const equipment = objects.map(parseEquipmentObj).filter(e => e.id);

// ---------- Read existing assets ----------
const ASSET_DIR = join(ROOT, 'public', 'equipment-assets');
const T_ASSET_DIR = join(ROOT, 'public', 'treatment-assets');

const existingAssets = new Set(
  existsSync(ASSET_DIR) ? readdirSync(ASSET_DIR).map(f => f.replace(/\.(webp|png|svg)$/, '')) : []
);
const existingTreatmentAssets = new Set(
  existsSync(T_ASSET_DIR) ? readdirSync(T_ASSET_DIR).map(f => f.replace(/\.(webp|png|svg)$/, '')) : []
);

// ---------- Check 1: Equipment asset coverage ----------
let missing = [];
let found = 0;

for (const eq of equipment) {
  const expectedAssets = EQUIPMENT_ASSET_MAP[eq.id];
  if (!expectedAssets) {
    missing.push({ id: eq.id, name: eq.name, reason: 'no mapping defined in EQUIPMENT_ASSET_MAP' });
    continue;
  }
  const matched = expectedAssets.some(a => existingAssets.has(a));
  if (matched) {
    found++;
  } else {
    missing.push({ id: eq.id, name: eq.name, reason: `expected one of: ${expectedAssets.join(', ')}` });
  }
}

// ---------- Check 2: Orphan assets ----------
const allMappedStems = new Set();
for (const [, stems] of Object.entries(EQUIPMENT_ASSET_MAP)) {
  if (Array.isArray(stems)) stems.forEach(s => allMappedStems.add(s));
}

const orphanAssets = [];
for (const asset of existingAssets) {
  if (!allMappedStems.has(asset)) {
    // Skip obvious non-equipment files
    if (/^\d+$/.test(asset)) continue;
    orphanAssets.push(asset);
  }
}
// Deduplicate known extras (medications that exist as supplement images)
const knownExtras = new Set([
  ...(EQUIPMENT_ASSET_MAP._medication_assets || []),
  ...(EQUIPMENT_ASSET_MAP._treatment_only || []),
  ...(EQUIPMENT_ASSET_MAP._immobilization || []),
]);
const orphanAssetsFiltered = orphanAssets.filter(a => !knownExtras.has(a));

// ---------- Check 3: Treatment mapping duplicates ----------
const treatmentMap = new Map();
for (const eq of equipment) {
  if (eq.treatments && eq.treatments.length > 0) {
    for (const tid of eq.treatments) {
      if (!treatmentMap.has(tid)) treatmentMap.set(tid, []);
      treatmentMap.get(tid).push(eq.name);
    }
  }
}

const duplicateTreatments = [];
for (const [tid, names] of treatmentMap.entries()) {
  if (names.length > 1) duplicateTreatments.push({ tid, names, count: names.length });
}

// ---------- Check 4: Placeholders ----------
const placeholders = [];
function scanForPlaceholders(dir, label) {
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    const fp = join(dir, file);
    if (!statSync(fp).isFile()) continue;
    const size = statSync(fp).size;
    if (size < 200 && size > 0) placeholders.push({ file: `${label}/${file}`, reason: `${size} bytes` });
    const lower = file.toLowerCase();
    if (/placeholder|missing|notfound|temp-/.test(lower)) {
      if (!placeholders.find(p => p.file === `${label}/${file}`))
        placeholders.push({ file: `${label}/${file}`, reason: 'filename suggests placeholder' });
    }
  }
}
scanForPlaceholders(ASSET_DIR, 'equipment-assets');
scanForPlaceholders(T_ASSET_DIR, 'treatment-assets');

// ---------- Report ----------
let hardIssues = 0;
let warnings = 0;

console.log('\n' + '='.repeat(60));
console.log('1. EQUIPMENT ASSET COVERAGE');
console.log('='.repeat(60));

if (missing.length === 0) {
  console.log(`  ✓ All ${found} equipment items have matching assets`);
} else {
  hardIssues += missing.length;
  console.log(`  ✗ ${missing.length} equipment item(s) need assets:`);
  for (const m of missing) {
    console.log(`    ${m.id.padEnd(25)} ${m.name}`);
    console.log(`    ${' '.repeat(25)} → ${m.reason}`);
    console.log('');
  }
}

console.log('');
console.log('='.repeat(60));
console.log('2. ORPHAN ASSETS (not in map)');
console.log('='.repeat(60));
if (orphanAssetsFiltered.length === 0) {
  console.log('  ✓ All assets are mapped');
} else {
  warnings += orphanAssetsFiltered.length;
  console.log(`  ⚠ ${orphanAssetsFiltered.length} unmapped asset(s):`);
  for (const a of orphanAssetsFiltered) {
    console.log(`    ${a}`);
  }
  console.log('  → Add to EQUIPMENT_ASSET_MAP in scripts/audit-assets.mjs or document as knownExtra');
}
console.log('');

console.log('='.repeat(60));
console.log('3. TREATMENT MAPPING NOTES');
console.log('='.repeat(60));
if (duplicateTreatments.length === 0) {
  console.log('  ✓ No duplicate treatment mappings');
} else {
  warnings += duplicateTreatments.length;
  console.log(`  ℹ ${duplicateTreatments.length} treatment(s) with multiple equipment mappings:`);
  for (const d of duplicateTreatments) {
    console.log(`    "${d.tid}" ← ${d.count} items:`);
    for (const n of d.names) console.log(`      · ${n}`);
  }
  console.log('  (Multiple tools for one treatment is clinically realistic.)');
}
console.log('');

console.log('='.repeat(60));
console.log('4. PLACEHOLDER / SMALL ASSETS');
console.log('='.repeat(60));
if (placeholders.length === 0) {
  console.log('  ✓ No suspicious assets');
} else {
  hardIssues += placeholders.length;
  console.log(`  ✗ ${placeholders.length} suspicious asset(s):`);
  for (const p of placeholders) console.log(`    ${p.file} — ${p.reason}`);
}
console.log('');

// ---------- Summary ----------
console.log('='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`  Equipment items defined:          ${equipment.length}`);
console.log(`  Equipment assets present:         ${existingAssets.size}`);
console.log(`  Treatment assets present:         ${existingTreatmentAssets.size}`);
console.log(`  Equipment items w/ assets:        ${found}/${equipment.length}`);
console.log(`  Missing equipment assets (HARD):  ${missing.length}`);
console.log(`  Orphan/unmapped assets:           ${orphanAssetsFiltered.length}`);
console.log(`  Treatment mapping duplicates:     ${duplicateTreatments.length}`);
console.log(`  Placeholder/small assets:         ${placeholders.length}`);
console.log(`  Hard issues (exit ≠ 0):           ${hardIssues}`);
console.log('');

if (hardIssues > 0) {
  console.log(`❌ AUDIT FAILED — ${hardIssues} hard issue(s)`);
  process.exit(1);
} else {
  console.log('✅ AUDIT PASSED');
  process.exit(0);
}
