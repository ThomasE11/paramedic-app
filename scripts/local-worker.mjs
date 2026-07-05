#!/usr/bin/env node
/**
 * local-worker — run a tightly-specified code task on a LOCAL LLM with
 * self-verification, so frontier (Fable) tokens are spent on specs and
 * review, not bulk generation.
 *
 * Flow: task spec → prompt (spec + whitelisted file contents) → local model
 * proposes FULL replacement contents for editable files → harness writes
 * them → runs the verify command → on failure feeds the error output back
 * to the model and retries (max N) → restores originals if it never passes
 * → emits a compact JSON report (the only thing the orchestrator reads).
 *
 * Usage:
 *   node scripts/local-worker.mjs <task.json> [--endpoint ollama|lmstudio] [--model NAME]
 *
 * task.json:
 * {
 *   "goal": "instructions for the model — be exact",
 *   "context": ["src/lib/foo.ts"],          // read-only reference files
 *   "editable": ["src/lib/bar.ts"],         // model may (re)write ONLY these
 *   "verify": "npx vitest run src/lib/bar.test.ts",
 *   "maxRetries": 3
 * }
 *
 * ponytail: full-file replacement only — no diff formats. Local models fumble
 * SEARCH/REPLACE; whole small files are reliable. Keep editable files <300
 * lines; split bigger tasks instead of teaching the harness patch formats.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const ENDPOINTS = {
  ollama: { url: 'http://localhost:11434/v1/chat/completions', model: 'qwen2.5-coder:7b-instruct-q4_K_M' },
  lmstudio: { url: 'http://127.0.0.1:1234/v1/chat/completions', model: 'google/gemma-4-12b-qat' },
};

const args = process.argv.slice(2);
const taskFile = args.find(a => !a.startsWith('--'));
if (!taskFile) { console.error('usage: local-worker.mjs <task.json> [--endpoint ollama|lmstudio] [--model NAME]'); process.exit(2); }
const endpointName = args.includes('--endpoint') ? args[args.indexOf('--endpoint') + 1] : 'ollama';
const endpoint = ENDPOINTS[endpointName];
const model = args.includes('--model') ? args[args.indexOf('--model') + 1] : endpoint.model;

const task = JSON.parse(readFileSync(taskFile, 'utf8'));
const maxRetries = task.maxRetries ?? 3;
const repoRoot = process.cwd();

const inRepo = (p) => {
  const full = path.resolve(repoRoot, p);
  if (!full.startsWith(repoRoot + path.sep)) throw new Error(`path escapes repo: ${p}`);
  return full;
};

// Snapshot originals of editable files so a failed run leaves the tree clean.
const originals = new Map();
for (const p of task.editable) {
  originals.set(p, existsSync(inRepo(p)) ? readFileSync(inRepo(p), 'utf8') : null);
}

const fileBlock = (p) => {
  const full = inRepo(p);
  if (!existsSync(full)) return `--- FILE ${p} (does not exist yet — you are creating it) ---\n`;
  return `--- FILE ${p} ---\n${readFileSync(full, 'utf8')}\n--- END FILE ---\n`;
};

const SYSTEM = `You are a precise code-writing worker. You will be given a GOAL, read-only CONTEXT files, and EDITABLE files.
Respond with the complete new contents for every editable file you change, using EXACTLY this format (no markdown fences, no commentary between blocks):

===FILE: <path>===
<entire file contents>
===END===

Rules: output ONLY file blocks. Rewrite each changed editable file IN FULL. Do not touch or invent other paths. Match the existing code style. TypeScript must compile strictly (unused imports are errors).
In test files: import the functions AND any types you reference from the module under test.
When a verification error names a file, you MUST rewrite that file in your next answer.`;

function buildMessages(errorFeedback) {
  const parts = [
    `GOAL:\n${task.goal}`,
    task.context?.length ? `READ-ONLY CONTEXT:\n${task.context.map(fileBlock).join('\n')}` : '',
    `EDITABLE FILES:\n${task.editable.map(fileBlock).join('\n')}`,
  ];
  if (errorFeedback) parts.push(`YOUR PREVIOUS ATTEMPT FAILED VERIFICATION. Fix these errors:\n${errorFeedback}`);
  return [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: parts.filter(Boolean).join('\n\n') },
  ];
}

async function callModel(messages) {
  const res = await fetch(endpoint.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 8000, stream: false }),
  });
  if (!res.ok) throw new Error(`model endpoint ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  return json.choices[0].message.content;
}

function applyEdits(output) {
  writeFileSync('/tmp/local-worker-last-output.txt', output); // debug: raw model output
  const written = [];
  const re = /===FILE: (.+?)===\n([\s\S]*?)\n?===END===/g;
  let m;
  while ((m = re.exec(output)) !== null) {
    const p = m[1].trim();
    if (!task.editable.includes(p)) { console.error(`  ! model tried to write non-editable ${p} — skipped`); continue; }
    // Models habitually wrap contents in markdown fences despite instructions —
    // strip a single leading/trailing fence pair.
    let body = m[2].replace(/^```[a-zA-Z]*\s*\n/, '').replace(/\n```\s*$/, '');
    const dir = path.dirname(inRepo(p));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(inRepo(p), body.endsWith('\n') ? body : body + '\n');
    written.push(p);
  }
  return written;
}

function verify() {
  try {
    const out = execSync(task.verify, { cwd: repoRoot, timeout: 600_000, stdio: 'pipe' }).toString();
    return { ok: true, out: out.slice(-1500) };
  } catch (e) {
    const out = ((e.stdout?.toString() || '') + '\n' + (e.stderr?.toString() || '')).slice(-3000);
    return { ok: false, out };
  }
}

const t0 = Date.now();
let feedback = null;
let attempts = 0;
let finalResult = null;

for (attempts = 1; attempts <= maxRetries; attempts++) {
  console.error(`[local-worker] attempt ${attempts}/${maxRetries} via ${endpointName}/${model}`);
  let output;
  try { output = await callModel(buildMessages(feedback)); }
  catch (e) { finalResult = { status: 'model-error', error: String(e) }; break; }
  const written = applyEdits(output);
  if (written.length === 0) { feedback = 'You produced no valid ===FILE:=== blocks. Follow the output format exactly.'; continue; }
  const v = verify();
  if (v.ok) { finalResult = { status: 'pass', written, attempts, verifyTail: v.out.slice(-400) }; break; }
  feedback = v.out;
  console.error(`  verify failed (${v.out.split('\n').length} lines of errors) — retrying`);
}

if (!finalResult || finalResult.status !== 'pass') {
  // Restore originals — a failed task must leave the tree untouched.
  for (const [p, content] of originals) {
    if (content === null) { try { execSync(`rm -f ${JSON.stringify(inRepo(p))}`); } catch { /* noop */ } }
    else writeFileSync(inRepo(p), content);
  }
  finalResult = finalResult ?? { status: 'fail', attempts: attempts - 1, lastError: (feedback || '').slice(-1200) };
  if (finalResult.status === 'fail' || finalResult.status === 'model-error') finalResult.restored = true;
}

finalResult.elapsedSec = Math.round((Date.now() - t0) / 1000);
console.log(JSON.stringify(finalResult, null, 1));
process.exit(finalResult.status === 'pass' ? 0 : 1);
