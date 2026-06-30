#!/usr/bin/env node
// @ts-check
/**
 * Verifies every case resolves to a project-local scene image.
 *
 * Usage:
 *   node scripts/audit-scene-assets.mjs
 *   node scripts/audit-scene-assets.mjs --json
 */
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const jiti = require('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});

/** @type {{ allCases: any[] }} */
const casesMod = jiti('./src/data/cases.ts');
/** @type {{ inferSceneImage: (caseData: any) => string, PROMPT_SCENE_IMAGE_OVERRIDES?: Record<string, string> }} */
const sceneMod = jiti('./src/lib/sceneImageSelection.ts');

const allCases = casesMod.allCases ?? casesMod.default?.allCases ?? [];
const inferSceneImage = sceneMod.inferSceneImage;
const promptSceneImageOverrides = sceneMod.PROMPT_SCENE_IMAGE_OVERRIDES ?? {};
const jsonOut = process.argv.includes('--json');

if (!Array.isArray(allCases) || allCases.length === 0) {
  console.error('Could not load allCases from src/data/cases.ts');
  process.exit(1);
}

const rows = allCases.map((caseData) => {
  const asset = inferSceneImage(caseData);
  const relativePath = asset.startsWith('/') ? asset.slice(1) : asset;
  return {
    id: caseData.id,
    title: caseData.title,
    category: caseData.category,
    gender: caseData.patientInfo?.gender,
    age: caseData.patientInfo?.age,
    location: caseData.dispatchInfo?.location,
    asset,
    exists: existsSync(resolve(projectRoot, 'public', relativePath.replace(/^public\//, ''))),
  };
});

const missing = rows.filter(row => !row.exists);
const promptTargets = Object.entries(promptSceneImageOverrides).map(([id, asset]) => {
  const relativePath = asset.startsWith('/') ? asset.slice(1) : asset;
  return {
    id,
    asset,
    exists: existsSync(resolve(projectRoot, 'public', relativePath.replace(/^public\//, ''))),
  };
});
const promptTargetsReady = promptTargets.filter(row => row.exists);
const promptTargetsMissing = promptTargets.filter(row => !row.exists);
const counts = rows.reduce((acc, row) => {
  acc[row.asset] = (acc[row.asset] ?? 0) + 1;
  return acc;
}, /** @type {Record<string, number>} */ ({}));

const summary = {
  totalCases: rows.length,
  assetsUsed: Object.keys(counts).length,
  missingAssets: missing.length,
  promptTargetsReady: promptTargetsReady.length,
  promptTargetsMissing: promptTargetsMissing.length,
  counts: Object.entries(counts).sort((a, b) => b[1] - a[1]),
  missing,
  promptTargetsMissingList: promptTargetsMissing,
};

if (jsonOut) {
  console.log(JSON.stringify({ summary, rows }, null, 2));
} else {
  console.log(`Scene asset coverage: ${summary.totalCases - summary.missingAssets}/${summary.totalCases} cases mapped to existing assets`);
  console.log(`Assets used: ${summary.assetsUsed}`);
  console.log(`Missing assets: ${summary.missingAssets}`);
  console.log(`Prompt-specific generated assets ready: ${summary.promptTargetsReady}/${promptTargets.length}`);
  console.log('');
  for (const [asset, count] of summary.counts) {
    console.log(`${String(count).padStart(3, ' ')}  ${asset}`);
  }
  if (missing.length > 0) {
    console.log('');
    console.log('Missing scene assets:');
    for (const row of missing) {
      console.log(`- ${row.id}: ${row.asset}`);
    }
  }
  if (promptTargetsMissing.length > 0) {
    console.log('');
    console.log('Prompt-specific scene assets still pending:');
    for (const row of promptTargetsMissing) {
      console.log(`- ${row.id}: ${row.asset}`);
    }
  }
}

process.exit(missing.length > 0 ? 1 : 0);
