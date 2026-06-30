#!/usr/bin/env node
// @ts-check
/**
 * Audits CASE_IMAGE_PROMPTS.md against generated scene assets.
 *
 * Usage:
 *   node scripts/audit-case-image-prompts.mjs
 *   node scripts/audit-case-image-prompts.mjs --strict
 */
import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = new Set(process.argv.slice(2));
const knownArgs = new Set(['--strict', '--help', '-h']);
const unknownArgs = [...args].filter(arg => !knownArgs.has(arg));

if (unknownArgs.length > 0) {
  console.error(`Unknown option: ${unknownArgs.join(', ')}`);
  console.error('Usage: node scripts/audit-case-image-prompts.mjs [--strict]');
  process.exit(1);
}

if (args.has('--help') || args.has('-h')) {
  console.log('Usage: node scripts/audit-case-image-prompts.mjs [--strict]');
  console.log('');
  console.log('Reads CASE_IMAGE_PROMPTS.md, extracts PNG scene prompt targets,');
  console.log('and reports which targets exist in public/scene-assets.');
  process.exit(0);
}

const strict = args.has('--strict');
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const promptFile = resolve(projectRoot, 'CASE_IMAGE_PROMPTS.md');
const assetsDir = resolve(projectRoot, 'public', 'scene-assets');
const pngFilenamePattern = /^[A-Za-z0-9][A-Za-z0-9._-]*\.png$/i;

/**
 * @param {Map<string, Set<string>>} targets
 * @param {string} filename
 * @param {string} source
 */
function addTarget(targets, filename, source) {
  if (!pngFilenamePattern.test(filename)) return;
  const sources = targets.get(filename) ?? new Set();
  sources.add(source);
  targets.set(filename, sources);
}

/**
 * @param {string} markdown
 */
function extractPromptTargets(markdown) {
  /** @type {Map<string, Set<string>>} */
  const targets = new Map();
  const sceneAssetPathTargets = new Set();
  const backtickedTargets = new Set();
  const sceneAssetPathPattern = /\/scene-assets\/([A-Za-z0-9][A-Za-z0-9._-]*\.png)\b/gi;
  const backtickedPngPattern = /`([^`\r\n]+?\.png)`/gi;

  for (const match of markdown.matchAll(sceneAssetPathPattern)) {
    const filename = match[1];
    sceneAssetPathTargets.add(filename);
    addTarget(targets, filename, '/scene-assets reference');
  }

  for (const match of markdown.matchAll(backtickedPngPattern)) {
    const rawTarget = match[1].trim();
    if (rawTarget.includes('<') || rawTarget.includes('>')) continue;

    const filename = basename(rawTarget);
    if (!pngFilenamePattern.test(filename)) continue;

    backtickedTargets.add(filename);
    addTarget(targets, filename, 'backticked PNG target');
  }

  return {
    targets,
    sceneAssetPathTargetCount: sceneAssetPathTargets.size,
    backtickedTargetCount: backtickedTargets.size,
  };
}

async function main() {
  const [markdown, assetEntries] = await Promise.all([
    readFile(promptFile, 'utf8'),
    readdir(assetsDir, { withFileTypes: true }),
  ]);

  const assetFiles = new Set(
    assetEntries
      .filter(entry => entry.isFile() && pngFilenamePattern.test(entry.name))
      .map(entry => entry.name),
  );

  const { targets, sceneAssetPathTargetCount, backtickedTargetCount } = extractPromptTargets(markdown);
  const rows = [...targets.entries()]
    .map(([filename, sources]) => ({
      filename,
      exists: assetFiles.has(filename),
      sources: [...sources].sort(),
    }))
    .sort((a, b) => a.filename.localeCompare(b.filename));

  const existing = rows.filter(row => row.exists);
  const missing = rows.filter(row => !row.exists);

  console.log('Case image prompt target audit');
  console.log(`Prompt targets: ${rows.length} (${existing.length} existing, ${missing.length} missing)`);
  console.log(`Sources: ${sceneAssetPathTargetCount} /scene-assets refs, ${backtickedTargetCount} backticked PNG targets`);

  if (missing.length > 0) {
    console.log('');
    console.log('Missing generated prompt targets:');
    for (const row of missing) {
      console.log(`- ${row.filename}`);
    }
  } else {
    console.log('');
    console.log('All generated prompt targets exist in public/scene-assets.');
  }

  if (missing.length > 0 && !strict) {
    console.log('');
    console.log('Non-strict mode: exiting 0 despite missing prompt targets.');
  }

  if (missing.length > 0 && strict) {
    console.error('');
    console.error(`Strict mode: ${missing.length} generated prompt target(s) missing.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
