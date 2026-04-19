#!/usr/bin/env node
// @ts-check
/**
 * Batch fix: mirror abcde.disability.bloodGlucose into
 * vitalSignsProgression.initial.bloodGlucose for every case that has one
 * but not the other.
 *
 * Works by text-scanning the case source files rather than mutating the
 * runtime value, so the change lives in source (where the student's case
 * view reads from).
 *
 * Conservative: only injects when vitalSignsProgression.initial exists
 * and does NOT already contain bloodGlucose. Dry-run by default; pass
 * --write to apply.
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

// Match a case block from `id: 'case-xxx'` to the next `id:` or end-of-array.
// Inside each block, locate the disability's bloodGlucose value and the
// vitalSignsProgression.initial object literal.
let totalEdits = 0;
const edits = [];

for (const rel of FILES) {
  const path = resolve(projectRoot, rel);
  let src = readFileSync(path, 'utf8');
  const before = src;

  // Walk block-by-block: each case lives inside `createCase({ ... })`.
  // Use createCase as the anchor so nested `id:` lines (checklist items,
  // objectives) don't fragment the block boundary.
  const caseMarkers = [...src.matchAll(/createCase\s*\(\s*\{/g)];
  const positions = caseMarkers.map((m) => m.index ?? 0);
  positions.push(src.length);

  for (let i = 0; i < caseMarkers.length; i++) {
    const blockStart = positions[i];
    const blockEnd = positions[i + 1] ?? src.length;
    const block = src.slice(blockStart, blockEnd);
    // Case id is the first top-level `id:` inside the block.
    const idHit = block.match(/\bid:\s*['"]([\w-]+)['"]/);
    const caseId = idHit?.[1] || '(unknown)';

    // Only look inside abcde.disability { ... } — not top-level metadata.
    // Regex can't balance braces, so find `disability:` then walk forward
    // counting braces until we close the outer object.
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
    const bglMatch = disabilityBlock.match(/bloodGlucose:\s*([\d.]+)/);
    if (!bglMatch) continue;
    const bglValue = parseFloat(bglMatch[1]);
    if (!isFinite(bglValue)) continue;

    // Find vitalSignsProgression.initial in the block and check if it
    // already has bloodGlucose.
    const vpMatch = block.match(/vitalSignsProgression:\s*\{\s*initial:\s*\{([^}]*)\}/);
    if (!vpMatch) continue;
    if (/bloodGlucose\s*:/.test(vpMatch[1])) continue; // already present

    // Inject bloodGlucose at the end of the initial {} (before closing brace).
    // Keep the original formatting style by mirroring the nearby separator.
    const injected = `${vpMatch[1].replace(/\s+$/, '')}, bloodGlucose: ${bglValue} `;
    const newVP = `vitalSignsProgression: {\n      initial: {${injected}}`;
    // Replace only inside the current block to avoid cross-block clobber.
    const newBlock = block.replace(vpMatch[0], newVP);
    if (newBlock === block) continue;

    // Splice newBlock back into src.
    src = src.slice(0, blockStart) + newBlock + src.slice(blockEnd);
    // Adjust subsequent positions by the length delta.
    const delta = newBlock.length - block.length;
    for (let j = i + 1; j < positions.length; j++) positions[j] += delta;

    edits.push({ file: rel, caseId, bgl: bglValue });
    totalEdits++;
  }

  if (src !== before && write) writeFileSync(path, src, 'utf8');
}

console.log(`${write ? 'Wrote' : 'Would write'} ${totalEdits} BGL mirrors across ${FILES.length} files.`);
if (edits.length <= 20) {
  for (const e of edits) console.log(`  [${e.file}] ${e.caseId} — BGL ${e.bgl}`);
} else {
  console.log(`  (showing first 10)`);
  for (const e of edits.slice(0, 10)) console.log(`  [${e.file}] ${e.caseId} — BGL ${e.bgl}`);
}
if (!write) console.log('\nRe-run with --write to apply.');
