# Realism Execution Directive

Generated: 2026-07-06

Purpose: give a local implementation model a clear, executable brief for continuing the premium patient-realism work in ParaMedic Studio.

## Copy-paste prompt for the local model

You are implementing the next realism layer for ParaMedic Studio, a UAE-focused ambulance clinician training simulator. Your job is to make the simulator feel like a living patient bay, not a checklist app.

Do not start by redesigning the whole UI. Start by building a reusable realism scenario layer that drives body visuals, equipment state, treatment reactions, reassessment prompts, vitals, voice responses, and debrief endpoints from the same clinical truth.

Work conservatively inside the existing codebase. First inspect these files:

- `src/lib/patientRealism.ts`
- `src/lib/patientRealismDirector.ts`
- `src/components/StudentPanel.tsx`
- `src/components/Body3DModel/index.tsx`
- `src/components/TreatmentJumpBagPanel.tsx`
- `src/data/dynamicTreatmentEngine.ts`
- `src/data/enhancedTreatmentEffects.ts`
- `src/data/assessmentFramework.ts`
- `src/data/cases.ts`
- Existing tests under `src/lib/*.test.ts` and `src/data/*.test.ts`

If any file is missing, search with `rg --files` before creating replacements. Do not delete or rewrite major simulator surfaces. Add a small, tested layer first.

Primary implementation target:

1. Add `src/lib/patientRealismScenarios.ts`.
2. Define typed sentinel realism scenarios for asthma/COPD, anaphylaxis, opioid toxicity, hypoglycemia/seizure, ACS, stroke, major trauma/open chest/hemorrhage, and burns/inhalation.
3. Extend `deriveRealismDirectorState` so it can include `activeProblems`, `visualEffects`, `equipmentAnchors`, `patientBehavior`, `reassessmentRequirements`, and `debriefSignals`.
4. Add tests proving the scenario layer maps cases and treatments into the correct visible cues and reassessment rules.
5. Wire only a minimal UI update if needed. The patient bay should show better realism without blocking mannequin interaction.

Run before finishing:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run audit:cases`
- `npm run audit:clinical`

When reporting back, list changed files, test results, and one or two screenshots or browser observations if UI changed.

## Product principle

Clinical action should never be only a toast.

Every important intervention should produce:

- Visible evidence on the mannequin.
- A physiologic trajectory over time.
- A patient reaction when the patient can respond.
- A reassessment requirement.
- A debrief signal explaining whether the action was helpful, harmful, premature, late, refused, or clinically inappropriate.

The simulator should teach paramedic thinking:

```text
observe patient -> assess finding -> choose treatment -> see consequence -> reassess -> decide next action
```

## Architecture directive

Build a pure scenario layer before UI polish.

Recommended file:

```ts
// src/lib/patientRealismScenarios.ts

export type ProblemFamily =
  | 'trauma'
  | 'respiratory'
  | 'cardiac'
  | 'toxicology'
  | 'metabolic'
  | 'neurology'
  | 'infection'
  | 'burns'
  | 'obstetric'
  | 'pediatric';

export type RealismVisualEffectKind =
  | 'cyanosis'
  | 'diaphoresis'
  | 'pallor'
  | 'mottling'
  | 'rash'
  | 'facial_swelling'
  | 'pinpoint_pupils'
  | 'dilated_pupils'
  | 'facial_droop'
  | 'tremor'
  | 'seizure_activity'
  | 'burn_pattern'
  | 'soot'
  | 'active_bleeding'
  | 'blood_pool'
  | 'open_wound'
  | 'deformity'
  | 'asymmetric_chest_rise'
  | 'accessory_muscle_use'
  | 'reduced_chest_rise'
  | 'vomit_risk';

export type EquipmentAnchorRegion =
  | 'face'
  | 'mouth'
  | 'nose'
  | 'neck'
  | 'chest'
  | 'left-arm'
  | 'right-arm'
  | 'left-leg'
  | 'right-leg'
  | 'pelvis'
  | 'posterior'
  | 'scene';

export interface RealismVisualEffect {
  id: string;
  kind: RealismVisualEffectKind;
  region: EquipmentAnchorRegion;
  intensity: 'subtle' | 'moderate' | 'severe';
  showWhen: 'immediate' | 'on-assessment' | 'after-treatment' | 'if-deteriorating';
  clearsWhen?: string[];
  detail: string;
}

export interface EquipmentAnchorSpec {
  treatmentIdFragments: string[];
  region: EquipmentAnchorRegion;
  appearance: string;
  fitRule: string;
  shouldNotBlock: string[];
  activeEffect?: string;
  reassess: string[];
}

export interface PatientBehaviorRule {
  id: string;
  when: string;
  responseType: 'cooperate' | 'refuse' | 'gag' | 'guard' | 'agitate' | 'improve' | 'deteriorate' | 'silent';
  quote?: string;
  debrief: string;
}

export interface TreatmentResponseRule {
  treatmentIdFragments: string[];
  expectedFit: 'matched' | 'partial' | 'mismatch' | 'harmful' | 'blocked';
  visualResult: string[];
  vitalTrajectory: string[];
  reassessment: string[];
  patientBehavior: string[];
  debriefSignal: string;
}

export interface RealismScenarioSpec {
  id: string;
  family: ProblemFamily;
  match: string[];
  priority: number;
  activeProblems: string[];
  immediateVisuals: RealismVisualEffect[];
  equipmentAnchors: EquipmentAnchorSpec[];
  patientBehavior: PatientBehaviorRule[];
  treatmentResponses: TreatmentResponseRule[];
  reassessmentRequirements: string[];
  debriefSignals: string[];
}
```

Keep this layer pure. It should accept case data, vitals, patient state, and treatment IDs, then return deterministic state. UI components should consume it, not recreate rules.

## Sentinel scenario specs

These are the first scenarios to implement. They are not optional. They form the realism spine.

### 1. Severe asthma / COPD respiratory distress

Match keywords:

- asthma, COPD, wheeze, bronchospasm, respiratory distress, short of breath, accessory muscles, tripod, silent chest, hypoxia

Immediate visuals:

- Accessory muscle use on chest/neck.
- Fast chest rise tied to live RR.
- Cyanosis if SpO2 below 90.
- Sweating/anxiety if severe distress.
- Tripod/upright posture if available.

Assessment findings:

- Wheeze or reduced air entry must be tied to chest auscultation zones.
- Silent chest is critical and should look worse than ordinary wheeze.
- Speech tolerance should matter: full sentences, phrases, single words, or unable.

Treatment response:

- Oxygen device appears snug on face.
- Nebulizer mask appears on face with visible mist.
- Salbutamol/ipratropium improves wheeze gradually only when bronchospasm is present.
- CPAP can help selected COPD/pulmonary edema physiology but must check tolerance.
- BVM is resisted if the patient is awake and ventilating.

Wrong action behavior:

- Awake patient resists BVM: "Stop, I can breathe. What are you doing?"
- Excessive oxygen in COPD should prompt target saturation reassessment, not instant failure.

Reassessment:

- RR, SpO2, speech tolerance, air entry, work of breathing, fatigue, mask tolerance.

Debrief:

- Time to oxygen.
- Time to bronchodilator.
- Missed silent chest.
- Inappropriate BVM or CPAP.

### 2. Anaphylaxis

Match keywords:

- anaphylaxis, allergic reaction, hives, urticaria, rash, facial swelling, lip swelling, tongue swelling, stridor, wheeze, hypotension, bee sting, peanuts, prawns

Immediate visuals:

- Rash/urticaria on face/chest/arms.
- Facial or lip swelling.
- Airway concern at mouth/neck.
- Anxiety/restlessness.
- Pallor or mottling if hypotensive.

Assessment findings:

- Wheeze or stridor.
- Airway swelling.
- Hypotension and poor perfusion.
- Allergen exposure history.

Treatment response:

- IM adrenaline is decisive and should improve airway, wheeze, and perfusion gradually.
- Oxygen appears on face.
- IV access and fluids support shock but do not replace adrenaline.
- Antihistamines/steroids are adjuncts and should not reverse shock on their own.

Wrong action behavior:

- If antihistamine/steroid given first in shock, patient remains worse.
- If airway manipulation is attempted while awake/swollen, patient panics or refuses.

Reassessment:

- Airway swelling, voice change, wheeze/stridor, BP, pulse, skin, repeat adrenaline timing.

Debrief:

- Time to IM adrenaline.
- Over-reliance on antihistamine/steroid.
- Failure to reassess airway.

### 3. Opioid toxicity / respiratory depression

Match keywords:

- opioid, overdose, naloxone, pinpoint pupils, slow respirations, bradypnea, hypoventilation, respiratory depression, unconscious

Immediate visuals:

- Pinpoint pupils in eye zoom.
- Slow shallow chest rise.
- Low tone, slumped posture.
- Cyanosis if hypoxic.
- Vomit/aspiration risk when mental status is poor.

Assessment findings:

- Low RR, low SpO2, low GCS.
- Pupil finding.
- Scene evidence.
- Glucose must be checked.

Treatment response:

- Oxygen and BVM support ventilation.
- Naloxone improves RR and consciousness gradually if opioid physiology is present.
- Awakening may cause agitation, vomiting, refusal, or confusion.

Wrong action behavior:

- Naloxone without opioid pattern produces minimal response.
- Oral glucose in low GCS is harmful/blocked due to aspiration risk.

Reassessment:

- RR, SpO2, EtCO2 if available, airway, vomiting, GCS, pupils, BGL.

Debrief:

- Ventilation before/with antidote.
- Time to naloxone.
- Missed glucose check.
- Airway protection.

### 4. Hypoglycemia / seizure mimic

Match keywords:

- hypoglycemia, diabetic, insulin, low BGL, glucose, confused, seizure, post-ictal, missed meal, tremor

Immediate visuals:

- Diaphoresis.
- Tremor.
- Confusion or agitation.
- Seizure/post-ictal state if authored.
- Reduced cooperation until corrected.

Assessment findings:

- BGL is mandatory.
- Airway safety determines route.
- Neuro screen should not anchor to stroke before glucose.

Treatment response:

- Oral glucose only if awake and safe to swallow.
- IV dextrose or glucagon improves mentation gradually.
- Post-seizure patient may remain confused after glucose depending case.

Wrong action behavior:

- Oral glucose with unsafe airway triggers aspiration warning/blocked action.
- Stroke transport without BGL should debrief as missed mimic.

Reassessment:

- Repeat BGL, GCS/AVPU, airway, ability to swallow, seizure recurrence.

Debrief:

- Time to glucose check.
- Correct glucose route.
- Avoided anchoring.

### 5. ACS / chest pain / cardiac instability

Match keywords:

- chest pain, ACS, STEMI, NSTEMI, angina, myocardial, diaphoresis, arrhythmia, SVT, VT, VF, arrest

Immediate visuals:

- Guarding chest.
- Pale/diaphoretic.
- Anxiety.
- Poor perfusion when shocky.
- Defib pads visibly attach when applied.

Assessment findings:

- 12-lead ECG.
- Pain history.
- BP and contraindications before GTN.
- Rhythm and pulse status.

Treatment response:

- Aspirin is appropriate for suspected ACS if not contraindicated.
- GTN depends on BP and contraindications.
- Defib/pacing/cardioversion must match rhythm and pulse state.
- CPR/LUCAS/pads should appear during arrest.

Wrong action behavior:

- GTN with hypotension should worsen or be blocked.
- Shock without indication should be harmful.
- Awake stable patient questions aggressive device-led treatment.

Reassessment:

- Pain, BP, rhythm, perfusion, nausea, repeat ECG if changing.

Debrief:

- Time to ECG.
- Appropriate aspirin/GTN.
- Contraindicated nitrate.
- Shockable/non-shockable decision.

### 6. Stroke / neuro deficit

Match keywords:

- stroke, facial droop, arm drift, slurred speech, gaze, weakness, FAST, seizure, postictal, unequal pupils

Immediate visuals:

- Facial droop when supported by case.
- Arm drift/weakness as an assessment cue.
- Slurred speech in voice.
- Abnormal gaze/pupil if authored.
- Confusion if post-ictal.

Assessment findings:

- FAST or neuro screen.
- BGL to exclude mimic.
- GCS/AVPU and pupils.
- Last known well.

Treatment response:

- Oxygen only if hypoxic.
- Glucose only if low BGL.
- Main intervention is recognition, pre-alert, and destination/time.

Wrong action behavior:

- Treating as anxiety without neuro screen should debrief.
- Missing glucose mimic should debrief.

Reassessment:

- FAST changes, GCS, pupils, BGL, speech, limb strength.

Debrief:

- Time to neuro screen.
- Last known well obtained.
- Missed glucose mimic.
- Destination/pre-alert.

### 7. Major trauma / hemorrhage / open chest wound

Match keywords:

- trauma, MVC, fall, stab, gunshot, open chest wound, sucking chest wound, bleeding, hemorrhage, haemorrhage, amputation, fracture, deformity, pelvic, flail, pneumothorax

Immediate visuals:

- Wounds/blood at anatomical site.
- Active bleeding and blood pool if external hemorrhage.
- Pallor, diaphoresis, mottling if shocky.
- Deformity/fracture if authored.
- Asymmetric chest rise for chest trauma.

Assessment findings:

- MARCH / ABCDE.
- External bleeding.
- Distal pulses.
- Chest auscultation and percussion when chest injury.
- Posterior/log-roll assessment when indicated.

Treatment response:

- Direct pressure/dressing should slow bleeding when matched.
- Tourniquet should stop limb arterial bleeding but increase pain and affect distal pulse.
- Chest seal appears over open chest wound; bubbling/sucking should stop.
- Needle decompression only helps tension physiology and correct site.
- IV/fluids/TXA support shock but source control is central.
- Splints/collar/binder/board appear on correct anatomy.

Wrong action behavior:

- Moving unsplinted fracture increases pain.
- Incorrect tourniquet location fails to stop bleeding.
- Oxygen mask/IV alone should not resolve uncontrolled hemorrhage.

Reassessment:

- Bleeding control, distal pulse, pain, shock trend, chest rise, breath sounds, BP/pulse, mental status.

Debrief:

- Time to hemorrhage control.
- Correct device matched to wound.
- Missed posterior assessment.
- Over-treatment without source control.

### 8. Burns / inhalation injury

Match keywords:

- burn, thermal, chemical, electrical, scald, soot, smoke inhalation, singed hair, facial burn, airway burn

Immediate visuals:

- Burn pattern by region.
- Redness/blister/char depth signal.
- Soot around mouth/nose if inhalation.
- Facial swelling risk.
- Pain/guarding.
- Hypothermia risk after cooling/exposure.

Assessment findings:

- Airway and inhalation signs.
- TBSA estimate.
- Burn depth/location.
- Pain.
- Temperature protection.

Treatment response:

- Cooling changes burn state, then must stop before hypothermia.
- Dressings appear over burn.
- Oxygen for inhalation risk.
- Analgesia improves distress.
- Warming blanket matters after cooling/exposure.

Wrong action behavior:

- Overcooling or prolonged exposure worsens temperature risk.
- Ignoring inhalation risk should deteriorate airway cue.

Reassessment:

- Airway, pain, temperature, perfusion, burn coverage, distal circulation if circumferential.

Debrief:

- Time to cooling and covering.
- Airway reassessment.
- Hypothermia prevention.

## Equipment realism rules

All applied equipment must obey anatomy fit and not block assessment.

### Oxygen devices

Non-rebreather:

- Must look like a clear/greenish transparent mask over nose and mouth with a reservoir bag hanging below the chin.
- Must have side ports/valves and tubing toward the oxygen source.
- Must sit snugly on face and not cover eyes.
- Reassess SpO2, RR, work of breathing, speech tolerance.

Simple face mask:

- Covers nose/mouth, no reservoir bag.
- Tubing visible.
- Should not obscure eye or neck assessment.

Nasal cannula:

- Prongs at nostrils, tubing loops around ears/cheeks.
- Must be subtle and leave mouth visible.

Nebulizer:

- Mask or mouthpiece plus medication chamber.
- Visible mist when running.
- Reassess wheeze and air entry after time delay.

CPAP/NIV:

- Larger sealed mask with head straps.
- Must show tight fit and tolerance issue.
- Reassess BP, SpO2, work of breathing, mask tolerance.

BVM:

- Should be hand-held, not permanently glued to face unless active ventilation state is on.
- Chest rise should synchronize with ventilation.
- Awake patients should resist.

### Circulation equipment

IV cannula:

- Visible cannula/tape on hand or forearm.
- Line should connect to fluid/drug if selected.
- Patient may flinch if awake.
- Reassess site, BP, pulse, lungs, mental status.

Fluids:

- Bag and line visible.
- Do not magically fix hemorrhage without source control.
- In pulmonary edema/heart failure, fluids can worsen respiratory state.

Defib pads:

- Anterior-lateral or anterior-posterior position.
- Do not cover entire chest assessment.
- Show pads/leads once applied.

Tourniquet:

- On limb, proximal to wound, not over joint.
- Stops visible bleeding when appropriate.
- Distal pulse changes.

Dressings/chest seal:

- Dressing covers wound.
- Chest seal must sit over open chest wound and reduce sucking/bubbling cue.

Splints/collar/pelvic binder:

- Must anchor to correct body region.
- Should reduce movement/pain when matched.
- Wrong device/region should be partial or mismatch.

## Implementation order

### Round 1: Pure scenario layer

Create `src/lib/patientRealismScenarios.ts`.

Add:

- Scenario types.
- `REALISM_SCENARIOS`.
- `matchRealismScenarios(caseData)`.
- `deriveScenarioVisuals(caseData, vitals, appliedTreatmentIds)`.
- `deriveScenarioTreatmentResponses(caseData, appliedTreatmentIds)`.

Tests:

- Asthma maps to respiratory scenario with oxygen/nebulizer prompts.
- Anaphylaxis maps to rash/swelling/adrenaline priority.
- Opioid maps to pinpoint pupils/naloxone/ventilation.
- Trauma maps to active bleeding/open wound/source control.
- Burns maps to burn pattern/airway/hypothermia.

### Round 2: Director integration

Extend `RealismDirectorState` with:

```ts
activeProblems: string[];
visualEffects: RealismVisualEffect[];
equipmentAnchors: EquipmentAnchorSpec[];
patientBehavior: PatientBehaviorRule[];
reassessmentRequirements: string[];
debriefSignals: string[];
```

Keep old fields so current UI does not break:

- `caseFamily`
- `severity`
- `headline`
- `sceneConstraints`
- `visibleCues`
- `reassessmentPrompts`
- `treatmentEvidence`
- `debriefTargets`

Tests:

- Existing director tests still pass.
- Oxygen treatment adds visible face equipment and reassessment requirement.
- OPA/BVM in awake patient produces refusal/gag behavior if already supported by treatment realism.

### Round 3: Body model visual adapter

Do not put complex clinical logic inside `Body3DModel`.

Add a small adapter:

```ts
// src/lib/patientVisualState.ts
export function derivePatientVisualState(realismDirectorState): PatientVisualState
```

`Body3DModel` should consume visual state only:

- skin effects
- eye effects
- chest rise/asymmetry
- wound/blood/burn overlays
- equipment anchors

Acceptance:

- Non-rebreather sits on nose/mouth and does not cover eyes.
- Nebulizer shows mist.
- IV appears on arm.
- Tourniquet/dressing/chest seal appears at correct region.
- Rash/facial swelling appears for anaphylaxis.
- Pinpoint pupils appear in eye zoom.

### Round 4: Treatment prepare/apply/reassess loop

Every high-impact treatment should have three states:

```text
selected -> applied -> reassessed
```

Do not award full realism credit until reassessment happens.

Examples:

- Oxygen selected and applied: device appears. Full credit after SpO2/work-of-breathing reassessment.
- IV selected and applied: cannula appears. Full credit after BP/pulse/lung reassessment.
- Tourniquet applied: bleeding stops only if correct wound/region. Full credit after distal pulse and bleeding reassessment.
- Naloxone applied: RR/GCS changes gradually. Full credit after airway/vomiting/RR reassessment.

### Round 5: Sentinel case polish

Pick 6 to 8 sentinel cases from `cases.ts` and make them premium before generalizing.

Required sentinel families:

- Severe asthma/COPD.
- Anaphylaxis.
- Opioid overdose.
- Hypoglycemia or seizure.
- ACS/chest pain.
- Stroke.
- Major trauma/open chest/hemorrhage.
- Burns/inhalation.

For each sentinel case, verify:

- Patient looks clinically consistent before treatment.
- Assessment findings reveal on relevant body regions.
- Correct treatments visibly attach or alter the body.
- Incorrect treatments trigger patient behavior or debrief.
- Vitals change gradually, not magically.
- Reassessment is required after treatment.

## Acceptance criteria

The work is not done unless all are true:

- Scenario rules are centralized in a pure file.
- At least 8 sentinel scenario specs exist.
- Tests cover mapping and treatment response for at least 5 scenario families.
- The existing app still builds.
- Existing treatment and assessment flows still work.
- New UI does not overlap mannequin controls.
- Equipment visuals never block critical assessment areas.
- Reassessment prompts change after treatment.
- Debrief signals include late/missed/wrong/inappropriate actions.

## Clinical safety guardrails

- Do not present new clinical rules as official UAE protocol unless a case already has that reference or the team has verified it.
- Phrase new logic as simulation behavior, not medical advice.
- When uncertain, prefer "reassess" and "confirm indication" over hard claims.
- Keep contraindication logic conservative: unsafe airway, low GCS, hypotension, poor tolerance, and patient refusal should matter.

## What to avoid

- Do not create another giant panel that covers the mannequin.
- Do not bury realism in random React components.
- Do not make treatments instant success buttons.
- Do not use theatrical effects that distract from clinical learning.
- Do not expose diagnosis spoilers in the student view.
- Do not add large visual assets without checking bundle impact.

## First concrete task

Implement Round 1 and Round 2 only.

Expected files changed:

- `src/lib/patientRealismScenarios.ts`
- `src/lib/patientRealismDirector.ts`
- `src/lib/patientRealismScenarios.test.ts`
- `src/lib/patientRealismDirector.test.ts`
- Maybe `TRACKER.md` after tests pass

Do not touch `Body3DModel` in the first pass unless a small type integration is absolutely necessary.

End result of first pass:

- The app has a tested realism scenario catalogue.
- The current live patient bay director can surface richer active problems, visuals, treatment anchors, behavior rules, reassessment requirements, and debrief signals.
- Later UI work can consume this state without guessing clinical rules.
