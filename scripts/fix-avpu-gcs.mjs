#!/usr/bin/env node
// @ts-check
/**
 * Batch fix: align AVPU with GCS total.
 *
 * Rule: A=15, V=10-14, P=6-9, U≤8 (paramedic teaching).
 * When AVPU mismatches, we trust the GCS (it's the objective score) and
 * downgrade the AVPU letter to match.
 *
 * Dry-run by default; pass --write to apply.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const write = process.argv.includes('--write');

const FILES = [
  'src/data/cases.ts',
  'src/data/additionalCases.ts',
  'src/data/enhancedCases.ts',
  'src/data/firstYearCases.ts',
  'src/data/secondYearCases.ts',
  'src/data/litflCases.ts',
  'src/data/severityVariantCases.ts',
];

function expectedAvpuFromGcs(gcs) {
  if (gcs === 15) return 'A';
  if (gcs >= 10) return 'V';
  if (gcs >= 6) return 'P';
  return 'U';
}

let totalEdits = 0;
const edits = [];

for (const rel of FILES) {
  const path = resolve(projectRoot, rel);
  let src = readFileSync(path, 'utf8');

  const caseMarkers = [...src.matchAll(/createCase\s*\(\s*\{/g)];
  const positions = caseMarkers.map((m) => m.index ?? 0);
  positions.push(src.length);

  for (let i = 0; i < caseMarkers.length; i++) {
    const blockStart = positions[i];
    const blockEnd = positions[i + 1] ?? src.length;
    const block = src.slice(blockStart, blockEnd);
    const idHit = block.match(/\bid:\s*['"]([\w-]+)['"]/);
    const caseId = idHit?.[1] || '(unknown)';

    // Brace-walk the disability block.
    const disStart = block.search(/\bdisability\s*:/);
    if (disStart < 0) continue;
    const openIdx = block.indexOf('{', disStart);
    if (openIdx < 0) continue;
    let depth = 0;
    let closeIdx = -1;
    for (let k = openIdx; k < block.length; k++) {
      if (block[k] === '{') depth++;
      else if (block[k] === '}') {
        depth--;
        if (depth === 0) { closeIdx = k; break; }
      }
    }
    if (closeIdx < 0) continue;

    const disabilityBlock = block.slice(openIdx, closeIdx + 1);
    const avpuMatch = disabilityBlock.match(/avpu:\s*['"]([AVPU])['"]/);
    const gcsMatch = disabilityBlock.match(/total:\s*(\d+)/);
    if (!avpuMatch || !gcsMatch) continue;

    const currentAvpu = avpuMatch[1];
    const gcsTotal = parseInt(gcsMatch[1], 10);
    const expected = expectedAvpuFromGcs(gcsTotal);
    if (currentAvpu === expected) continue;

    // Replace only the AVPU line inside this disability block.
    const newDisability = disabilityBlock.replace(
      /(avpu:\s*['"])[AVPU](['"])/,
      `$1${expected}$2`,
    );
    if (newDisability === disabilityBlock) continue;

    const newBlock = block.slice(0, openIdx) + newDisability + block.slice(closeIdx + 1);
    src = src.slice(0, blockStart) + newBlock + src.slice(blockEnd);
    const delta = newBlock.length - block.length;
    for (let j = i + 1; j < positions.length; j++) positions[j] += delta;

    edits.push({ file: rel, caseId, from: currentAvpu, to: expected, gcs: gcsTotal });
    totalEdits++;
  }

  if (write) writeFileSync(path, src, 'utf8');
}

console.log(`${write ? 'Wrote' : 'Would write'} ${totalEdits} AVPU fixes across ${FILES.length} files.`);
for (const e of edits) console.log(`  [${e.file}] ${e.caseId} — AVPU ${e.from} → ${e.to} (GCS ${e.gcs})`);
if (!write) console.log('\nRe-run with --write to apply.');
