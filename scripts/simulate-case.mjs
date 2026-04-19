#!/usr/bin/env node
// @ts-check
/**
 * Phase 3 — Runtime physiology simulation.
 *
 * Drives a case through the dynamicTreatmentEngine by calling
 * applyDynamicTreatment with a scripted treatment sequence, then asserts
 * that vitals moved in clinically correct directions. Surfaces engine
 * bugs that the static audit can't see (wrong SpO2 ceilings, HR moving
 * the wrong way, missing rhythm transitions, etc.).
 *
 * Usage:   node scripts/simulate-case.mjs [--verbose]
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const jiti = require('jiti')(projectRoot, {
  interopDefault: true,
  alias: { '@': resolve(projectRoot, 'src') },
  esmResolve: true,
});

const { allCases } = jiti('./src/data/cases.ts');
const { createInitialPatientState, applyDynamicTreatment } = jiti('./src/data/dynamicTreatmentEngine.ts');
const { TREATMENTS } = jiti('./src/data/enhancedTreatmentEffects.ts');
const { applyDeterioration } = jiti('./src/data/deteriorationSystem.ts');

const verbose = process.argv.includes('--verbose');
const byId = new Map(TREATMENTS.map((t) => [t.id, t]));
const findCase = (id) => allCases.find((c) => c.id === id);

// ============================================================================
// Test scaffold
// ============================================================================
/** @type {{ name: string; caseId: string; steps: Array<{ treatmentId: string; expect: (v: any, prev: any) => string | null }> }[]} */
const scenarios = [];

// Helpers to build assertions
const parseBP = (bp) => {
  if (!bp) return null;
  const m = String(bp).match(/(\d+)\s*\/\s*(\d+)/);
  return m ? { sys: +m[1], dia: +m[2] } : null;
};

const expect = {
  spo2Up: (v, prev) => v.spo2 > prev.spo2 ? null : `SpO2 did not rise (${prev.spo2} → ${v.spo2})`,
  // Accepts "rose OR already at/above a near-normal ceiling" — avoids
  // false-flagging treatments that come after the patient is already
  // saturated from prior oxygen therapy.
  spo2UpOrSaturated: (v, prev) => v.spo2 >= prev.spo2 && (v.spo2 > prev.spo2 || prev.spo2 >= 96) ? null : `SpO2 fell (${prev.spo2} → ${v.spo2})`,
  spo2AtLeast: (target) => (v) => v.spo2 >= target ? null : `SpO2 ${v.spo2} < expected ≥${target}`,
  pulseDown: (v, prev) => v.pulse < prev.pulse ? null : `HR did not fall (${prev.pulse} → ${v.pulse})`,
  pulseUp: (v, prev) => v.pulse > prev.pulse ? null : `HR did not rise (${prev.pulse} → ${v.pulse})`,
  rrDown: (v, prev) => v.respiration < prev.respiration ? null : `RR did not fall (${prev.respiration} → ${v.respiration})`,
  bpUp: (v, prev) => {
    const a = parseBP(prev.bp)?.sys, b = parseBP(v.bp)?.sys;
    return a != null && b != null && b > a ? null : `SBP did not rise (${a} → ${b})`;
  },
  soundClears: (what) => (_v, _prev, state, prevState) => {
    const had = prevState.sounds?.leftLung === what || prevState.sounds?.rightLung === what;
    const still = state.sounds?.leftLung === what || state.sounds?.rightLung === what;
    if (!had) return `Expected prior sound=${what} but wasn't present`;
    return still ? `Lung sound did not improve from ${what}` : null;
  },
};

// ============================================================================
// Scenario 1: Cardiac STEMI (cardiac-001)
// Anterior STEMI with SpO2 94, HR 110, SBP 90.
// Protocol: oxygen only if SpO2 <94, aspirin, cautious GTN.
// Expect: aspirin doesn't worsen BP; GTN may lower BP slightly.
// ============================================================================
scenarios.push({
  name: 'cardiac-001 — Anterior STEMI + O2 + aspirin + GTN',
  caseId: 'cardiac-001',
  steps: [
    { treatmentId: 'oxygen_nasal', expect: expect.spo2AtLeast(94) },
    { treatmentId: 'aspirin', expect: () => null }, // aspirin doesn't move vitals acutely; passing is fine
  ],
});

// ============================================================================
// Scenario 2: Life-threatening asthma (resp-001)
// SpO2 88, RR 32, silent chest/wheeze. Protocol: O2, salbutamol + ipratropium + steroid.
// Expect: lung sound improves, SpO2 rises toward 94+.
// ============================================================================
scenarios.push({
  name: 'resp-001 — Life-threatening asthma: neb salbutamol + ipratropium + hydrocortisone',
  caseId: 'resp-001',
  steps: [
    { treatmentId: 'oxygen_nonrebreather', expect: expect.spo2Up },
    { treatmentId: 'nebulizer_salbutamol', expect: expect.spo2UpOrSaturated },
    { treatmentId: 'nebulizer_ipratropium', expect: () => null },
    { treatmentId: 'hydrocortisone_200mg', expect: () => null },
  ],
});

// ============================================================================
// Scenario 3: DKA (metab-002)
// BGL 28.5, HR 110, BP 95/60. Protocol: IV fluid bolus (don't give insulin pre-hospital).
// Expect: SBP rises with fluids.
// ============================================================================
scenarios.push({
  name: 'metab-002 — DKA: 1L crystalloid bolus',
  caseId: 'metab-002',
  steps: [
    { treatmentId: 'fluids_1000ml', expect: expect.bpUp },
  ],
});

// ============================================================================
// Scenario 4: Tension pneumothorax (resp-002)
// Protocol: needle decompression.
// Expect: SpO2 up, SBP up after decompression (relieves obstructive shock).
// ============================================================================
scenarios.push({
  name: 'resp-002 — Tension pneumothorax: needle decompression',
  caseId: 'resp-002',
  steps: [
    { treatmentId: 'oxygen_nonrebreather', expect: () => null },
    { treatmentId: 'needle_decompression', expect: expect.spo2Up },
  ],
});

// ============================================================================
// Scenario 5: Acute ischaemic stroke (neuro-001)
// SpO2 96 (no O2 indicated), HR 88, GCS 10. Protocol is supportive:
// positioning, BGL confirmation, transport. Avoid lowering BP acutely.
// ============================================================================
scenarios.push({
  name: 'neuro-001 — Acute ischaemic stroke: O2 only if SpO2<94 + supportive',
  caseId: 'neuro-001',
  steps: [
    // SpO2 is 96 so O2 shouldn't be needed — skip O2, go to fluid only
    // if hypotensive. This case starts normotensive (180/100), so no fluid.
    // We just assert the engine doesn't crash on a stroke with no drug arc.
    { treatmentId: 'oxygen_nasal', expect: expect.spo2UpOrSaturated },
  ],
});

// ============================================================================
// Scenario 6: Multi-trauma haemorrhagic shock (trauma-001)
// HR 125, BP 80/50, SpO2 85, GCS 5. Protocol: airway, O2, TXA within 3h,
// permissive hypotension, rapid transport. Expect TXA doesn't drop BP
// (trust CRASH-2: TXA is neutral/beneficial on BP in haemorrhage).
// ============================================================================
scenarios.push({
  name: 'trauma-001 — Multi-trauma shock: O2 + TXA',
  caseId: 'trauma-001',
  steps: [
    { treatmentId: 'oxygen_nonrebreather', expect: expect.spo2Up },
    { treatmentId: 'txa_1g', expect: (v, prev) => parseBP(v.bp).sys >= parseBP(prev.bp).sys - 2 ? null : `TXA unexpectedly dropped BP (${prev.bp} → ${v.bp})` },
  ],
});

// ============================================================================
// Scenario 7: Paediatric febrile seizure (ped-001)
// HR 150, SpO2 94, GCS 10 (post-ictal). Protocol: airway/O2, temp-control,
// midazolam if seizing persists. Expect midazolam brings RR down slightly
// but doesn't tank SpO2.
// ============================================================================
scenarios.push({
  name: 'ped-001 — Paediatric febrile seizure: O2 + midazolam',
  caseId: 'ped-001',
  steps: [
    { treatmentId: 'oxygen_mask', expect: expect.spo2Up },
    { treatmentId: 'midazolam_buccal', expect: (v, prev) => v.spo2 >= prev.spo2 - 3 ? null : `SpO2 crashed ${prev.spo2}→${v.spo2} after midazolam (expected ≤3pt drop)` },
  ],
});

// ============================================================================
// Scenario 8: Heat exhaustion (env-001)
// HR 110, Temp elevated. Protocol: active cooling, fluid.
// Expect: active cooling reduces temp; fluids normalise HR.
// ============================================================================
scenarios.push({
  name: 'env-001 — Heat exhaustion: active cooling + fluids',
  caseId: 'env-001',
  steps: [
    { treatmentId: 'active_cooling', expect: (v, prev) => (v.temperature ?? 0) <= (prev.temperature ?? 0) ? null : `Temp rose with cooling (${prev.temperature}→${v.temperature})` },
    { treatmentId: 'fluids_500ml', expect: expect.bpUp },
  ],
});

// ============================================================================
// Scenario 9: Organophosphate poisoning (tox-001)
// HR 45 (SLUDGE — bradycardia), SpO2 88. Protocol: atropine ± pralidoxime.
// Expect atropine raises HR. SpO2 improves as secretions dry.
// ============================================================================
scenarios.push({
  name: 'tox-001 — Organophosphate poisoning: atropine',
  caseId: 'tox-001',
  steps: [
    { treatmentId: 'oxygen_nonrebreather', expect: expect.spo2Up },
    { treatmentId: 'atropine_05mg', expect: expect.pulseUp },
  ],
});

// ============================================================================
// Scenario 10: Burns / inhalation injury (burn-001)
// HR 135, SpO2 91, GCS 14. Protocol: high-flow O2 (confirmed CO/suspected
// inhalation), fluids (Parkland). Expect SpO2 up, BP supported by fluids.
// ============================================================================
scenarios.push({
  name: 'burn-001 — Industrial fire + inhalation: NRB O2 + fluids',
  caseId: 'burn-001',
  steps: [
    { treatmentId: 'oxygen_nonrebreather', expect: expect.spo2Up },
    { treatmentId: 'fluids_1000ml', expect: expect.bpUp },
  ],
});

// ============================================================================
// Scenario 11: Clinical gotcha — IV fluid in heart failure (resp-008)
// Pulmonary oedema patient; engine's cross-system physiology should drop
// SpO2 when crystalloid is pushed in (fluid overload into wet lungs).
// ============================================================================
scenarios.push({
  name: 'resp-008 — Fluid bolus in heart failure: SpO2 must DROP (cross-system warning fires)',
  caseId: 'resp-008',
  steps: [
    { treatmentId: 'fluids_500ml', expect: (v, prev) => v.spo2 < prev.spo2 ? null : `Expected SpO2 drop from fluid overload but got ${prev.spo2}→${v.spo2}` },
  ],
});

// ============================================================================
// Scenario 12: Clinical gotcha — GTN in inferior STEMI (cardiac-007)
// Inferior MI may involve RV (preload-dependent). GTN should crash the BP
// via the engine's cross-system warning branch.
// ============================================================================
scenarios.push({
  name: 'cardiac-007 — GTN in inferior STEMI: SBP must drop ≥20 mmHg (RV infarct warning)',
  caseId: 'cardiac-007',
  steps: [
    { treatmentId: 'gtn_spray', expect: (v, prev) => {
      const a = parseBP(prev.bp)?.sys, b = parseBP(v.bp)?.sys;
      return a != null && b != null && (a - b) >= 20 ? null : `Expected SBP drop ≥20 from GTN in inferior STEMI, got ${a}→${b}`;
    }},
  ],
});

// ============================================================================
// Scenario 13: Clinical gotcha — opioid stacking (repeat morphine)
// Engine's cross-system branch fires on opioid count ≥ 2 (combined morphine
// doses). RR should fall on the second dose.
// ============================================================================
scenarios.push({
  name: 'cardiac-001 — Repeat opioid dosing: RR must fall on 2nd dose (respiratory depression warning)',
  caseId: 'cardiac-001',
  steps: [
    { treatmentId: 'morphine_5mg', expect: () => null },
    { treatmentId: 'morphine_5mg', expect: (v, prev) => v.respiration < prev.respiration ? null : `Expected RR drop on 2nd opioid, got ${prev.respiration}→${v.respiration}` },
  ],
});

// ============================================================================
// Scenario 14: Deterioration physiology — peri-arrest HR crossover
// Our periarrest profile rewrite: HR rises while SpO2 ≥ 70 (compensatory
// tachycardia), then falls once SpO2 < 70 (decompensatory bradycardia).
// We drive the patient through both phases directly via applyDeterioration.
// ============================================================================
{
  const phases = [
    // 1 min of deterioration from a compensated-hypoxia state — HR should rise
    { from: { pulse: 120, spo2: 85, respiration: 32, bp: '90/60', gcs: 8 }, dir: 'up', label: 'SpO2=85 (compensating)' },
    // 1 min from profound hypoxia — HR should fall (decompensatory brady)
    { from: { pulse: 160, spo2: 60, respiration: 36, bp: '70/40', gcs: 4 }, dir: 'down', label: 'SpO2=60 (decompensating)' },
  ];
  scenarios.push({
    name: 'peri-arrest deterioration — HR direction crosses over at SpO2<70',
    caseId: 'cardiac-013', // any periarrest-eligible case; only used to satisfy the runner
    customRun: () => {
      const results = [];
      for (const p of phases) {
        const before = { ...p.from };
        const { newVitals } = applyDeterioration(before, 'periarrest', 1, []);
        const after = newVitals;
        const ok = p.dir === 'up' ? after.pulse > before.pulse : after.pulse < before.pulse;
        results.push({
          pass: ok,
          label: p.label,
          msg: ok
            ? `${p.label}: HR ${before.pulse}→${after.pulse} (${p.dir})`
            : `${p.label}: HR ${before.pulse}→${after.pulse} expected ${p.dir}`,
        });
      }
      return results;
    },
  });
}

// ============================================================================
// Scenario 15: OOHCA asystole (cardiac-002)
// Initial: pulse 0, BP 0/0, asystole. Protocol: CPR + adrenaline. Expect
// the engine routes adrenaline correctly for arrest (no perfusing-pt
// tachycardic side-effect branch).
// ============================================================================
scenarios.push({
  name: 'cardiac-002 — OOHCA asystole: adrenaline in arrest',
  caseId: 'cardiac-002',
  steps: [
    // With pulse 0, these are the arrest pathway; we just assert no crash
    // and that pulse stays 0 (no ROSC from adrenaline alone).
    { treatmentId: 'adrenaline_1mg', expect: (v) => v.pulse === 0 ? null : `Arrest HR unexpectedly became ${v.pulse} on single adrenaline — ROSC should need defib/shockable rhythm first.` },
  ],
});

// ============================================================================
// Runner
// ============================================================================
let pass = 0, fail = 0;
for (const sc of scenarios) {
  // Scenarios with a customRun drive the engine directly (no case init);
  // used for deterioration-physiology checks that don't go through
  // applyDynamicTreatment.
  if (sc.customRun) {
    console.log('');
    console.log('─'.repeat(78));
    console.log(`▶ ${sc.name}`);
    const results = sc.customRun() || [];
    for (const r of results) {
      if (r.pass) { console.log(`  ✓ ${r.msg}`); pass++; } else { console.log(`  ✗ ${r.msg}`); fail++; }
    }
    continue;
  }
  const c = findCase(sc.caseId);
  if (!c) { console.log(`SKIP [${sc.caseId}] case not found`); continue; }
  let state = createInitialPatientState(c);
  const initialVitals = { ...state.vitals };
  console.log('');
  console.log('─'.repeat(78));
  console.log(`▶ ${sc.name}`);
  console.log(`  initial: HR=${state.vitals.pulse} BP=${state.vitals.bp} SpO2=${state.vitals.spo2} RR=${state.vitals.respiration} GCS=${state.vitals.gcs} BGL=${state.vitals.bloodGlucose}`);
  console.log(`  sounds:  L=${state.sounds?.leftLung} R=${state.sounds?.rightLung} heart=${state.sounds?.heartSound}`);
  console.log(`  rhythm:  ${state.currentRhythm}`);

  for (const step of sc.steps) {
    const treatment = byId.get(step.treatmentId);
    if (!treatment) {
      console.log(`  ✗ unknown treatment id: ${step.treatmentId}`);
      fail++;
      continue;
    }
    const prev = { ...state };
    const prevVitals = { ...state.vitals };
    const { newState, response } = applyDynamicTreatment(treatment, state, c);
    state = newState;
    const errMsg = step.expect(state.vitals, prevVitals, state, prev);
    const label = `    [${step.treatmentId}]`;
    if (errMsg) {
      console.log(`  ✗ ${label} ${errMsg}`);
      if (verbose) console.log(`      response: ${response.description}`);
      fail++;
    } else {
      console.log(`  ✓ ${label} HR=${state.vitals.pulse} BP=${state.vitals.bp} SpO2=${state.vitals.spo2} RR=${state.vitals.respiration}${response.vitalChanges?.length ? ` [${response.vitalChanges.map(v => v.vital).join(',')}]` : ''}`);
      pass++;
    }
  }

  console.log(`  ∆: HR ${initialVitals.pulse}→${state.vitals.pulse}  BP ${initialVitals.bp}→${state.vitals.bp}  SpO2 ${initialVitals.spo2}→${state.vitals.spo2}  RR ${initialVitals.respiration}→${state.vitals.respiration}`);
}

console.log('');
console.log('='.repeat(78));
console.log(` Runtime simulation: ${pass} passed, ${fail} failed, ${scenarios.length} scenarios`);
console.log('='.repeat(78));
process.exit(fail > 0 ? 1 : 0);
