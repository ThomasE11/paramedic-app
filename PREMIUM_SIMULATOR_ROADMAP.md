# Premium Simulator Roadmap

## Product north star

Build a living patient bay: the student should feel that they are treating a responsive human patient, not completing a checklist.

Every important action should produce four linked consequences:

- A visible body change on the mannequin.
- A physiologic change in vitals over time.
- A patient reaction when the patient can respond.
- A debrief signal that explains why the action was helpful, harmful, early, late, or inappropriate.

The premium version should make the student think: "I can see what is happening, I can intervene, and the patient responds like a real person."

## What the current app already has

The interface has strong foundations:

- Scenario generation, dispatch context, scene survey, PPE, hazards, and resources.
- A 3D mannequin with surface/anatomy modes and region-based assessment.
- Treatment jump bags with visual equipment and application logic.
- Equipment overlays for oxygen devices, IV access, fluids, defib pads, LUCAS, ET tube, and OPA.
- Injury inference from case text.
- Dynamic treatment effects, vitals drift, clinical sounds, contraindication checks, and patient voice events.
- Procedure steps for practical interventions such as tourniquet application.
- A classroom path that can become a shared instructor/student simulation.

The main gap is that these pieces still feel like separate panels. The premium leap is to bind them into one patient reality model so the body, vitals, voice, equipment, and scoring all react to the same clinical state.

## Clinical realism grounding

The realism layer should not be built around one feature. It should be case-adaptive.

Each case family needs its own visible physiology, assessment findings, treatment effects, patient behavior, and debrief logic:

- Trauma: wounds, bleeding, fractures, burns, splints, immobilization, pain, shock, and mechanism-specific risks.
- Respiratory: work of breathing, chest rise, wheeze/stridor/crackles, cyanosis, oxygen response, nebulizer response, CPAP/BVM suitability.
- Cardiac: chest pain behavior, diaphoresis, perfusion, ECG rhythm changes, aspirin/nitro appropriateness, shockable versus non-shockable pathways.
- Toxicology: pupils, respiratory depression, agitation, secretions, toxidrome clues, antidote response, and scene-safety hazards.
- Metabolic/neuro: glucose-related mental status changes, seizure/post-ictal behavior, stroke signs, pupil changes, GCS/AVPU progression.
- Infection/sepsis: fever, skin signs, capillary refill, tachycardia, hypotension, oxygen/fluids/antibiotics timing.
- Obstetric/pediatric: age-appropriate communication, caregiver context, smaller equipment, different vitals norms, consent/cooperation behavior.

External references should be attached per domain. For example, hemorrhage logic can use AHA/Red Cross First Aid, STOP THE BLEED, and JTS/CoTCCC materials; airway, asthma, anaphylaxis, cardiac arrest, toxicology, and pediatric rules should each be grounded against current service protocols and reviewed for UAE practice before being treated as official teaching logic.

## Premium principle

No critical treatment should only create a toast.

Clinical action should equal:

```text
attempted action -> patient suitability check -> visual response -> vital trajectory -> patient voice -> debrief note
```

Examples:

- Apply non-rebreather: mask appears on the face, SpO2 improves gradually if airway/breathing physiology allows it, anxious patients may pull away, debrief records oxygen appropriateness.
- Attempt OPA in an awake talking patient: patient gags, pushes away, the device does not remain applied, and the debrief records the contraindication.
- Start IV: cannula and line appear on the arm, fluids appear only if selected, the patient may flinch or say it hurts, vitals respond based on the underlying problem.
- Apply tourniquet to active limb hemorrhage: bleeding animation stops, tourniquet appears, distal pulse is affected, pain/distress rises, and time-to-control is recorded.

## Case-adaptive realism engine

Bleeding is one example, not the whole product. The premium system should model active patient problems and let each case express itself differently.

### State model

Add a shared visual/realism state that can be derived from the case and updated by assessments, time, and treatments.

```ts
type ProblemFamily =
  | 'trauma'
  | 'respiratory'
  | 'cardiac'
  | 'toxicology'
  | 'metabolic'
  | 'neurology'
  | 'infection'
  | 'obstetric'
  | 'pediatric';

type ActiveProblemKind =
  | 'external_hemorrhage'
  | 'fracture'
  | 'burn'
  | 'bronchospasm'
  | 'pulmonary_edema'
  | 'airway_obstruction'
  | 'opioid_toxicity'
  | 'anaphylaxis'
  | 'hypoglycemia'
  | 'sepsis'
  | 'acute_coronary_syndrome'
  | 'stroke'
  | 'seizure';

interface ActivePatientProblem {
  id: string;
  family: ProblemFamily;
  kind: ActiveProblemKind;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  region?: string;
  isResolved: boolean;
  improvesWith: string[];
  worsensWith: string[];
  visualSigns: string[];
  audioSigns: string[];
  patientReactions: string[];
}

interface PatientRealismState {
  activeProblems: ActivePatientProblem[];
  visibleEquipment: Record<string, boolean>;
  skin: {
    pallor: number;
    cyanosis: number;
    diaphoresis: number;
  };
  distress: {
    pain: number;
    anxiety: number;
    cooperation: number;
  };
}
```

### Scenario behavior examples

Each scenario family should have a small set of high-fidelity behaviors.

| Case type | Mannequin/visual state | Assessment findings | Treatment response |
| --- | --- | --- | --- |
| Massive hemorrhage | Active wound, blood flow/pool, pallor, dressing/tourniquet after control | Weak pulse, delayed cap refill, falling BP, rising HR | Correct control stops visible bleeding; fluids/TXA support but do not replace source control |
| Asthma/COPD | Tripod posture, accessory muscle effort, reduced chest expansion, cyanosis if severe | Wheeze, difficulty speaking, low SpO2, high RR | Nebulizer/oxygen improves gradually; CPAP may help selected patients; inappropriate BVM causes distress unless failing |
| Anaphylaxis | Rash/urticaria, facial/lip swelling, agitation, possible stridor | Wheeze/stridor, hypotension, rapid onset after exposure | IM adrenaline is decisive; antihistamine alone should not reverse shock |
| Opioid toxicity | Pinpoint pupils on eye zoom, slow breathing, low tone, low GCS | Bradypnea, hypoxia, reduced responsiveness | Naloxone improves RR and consciousness but may trigger agitation/vomiting |
| Hypoglycemia | Diaphoresis, confusion, tremor, reduced cooperation | Low glucose, altered mental status, possible seizure | Oral glucose only if safe airway; IV/IM glucose/glucagon improves consciousness |
| Pulmonary edema | Distress, upright posture, cyanosis, frothy secretions in severe cases | Crackles, low SpO2, hypertension or shock depending cause | CPAP/nitrates/oxygen improve selected cases; fluids can worsen |
| Chest trauma | Wound/bruise, asymmetric chest rise, distress | Reduced breath sounds, percussion changes, shock signs | Chest seal/needle decompression pathway only works when matched to findings |
| Stroke | Facial droop, arm drift, speech change, gaze/pupil findings when relevant | FAST findings, glucose check required, BP/context | Oxygen/glucose only when indicated; priority is recognition, time, and transport |
| Burns/inhalation | Burn pattern, soot, swelling risk, pain, exposure risk | Airway concern, pain, hypothermia risk, fluid needs | Cooling, dressings, analgesia, airway vigilance; oxygen if inhalation suspected |

### Universal acceptance criteria

- Every generated case maps to one or more `ActivePatientProblem` entries.
- The mannequin displays case-specific findings, not generic overlays.
- Assessments reveal findings in context: eyes show pupil state, chest zones reveal breath sounds, limbs reveal wounds/fractures, skin shows perfusion or burns.
- Treatments can improve, worsen, fail, or be blocked based on the patient state.
- Patient voice and behavior respond to both appropriate and inappropriate actions.
- Vitals change gradually over time according to unresolved problems and successful interventions.
- Debrief tracks clinically meaningful endpoints such as time to oxygen, time to bronchodilator, time to hemorrhage control, contraindicated airway attempt, missed glucose check, missed sepsis recognition, or delayed transport.

## Realism north star: game-grade clinical bay

The goal is not a prettier dashboard. The target is a game-grade, first-person clinical training bay: the same kind of embodied realism that makes a tactical game feel believable, but focused tightly on ambulance care.

What "PUBG-level realism" means for this product:

- The patient, equipment, audio, lighting, monitor, and environment must all tell the same clinical story.
- The student should feel they are working around a real patient in a real scene, not selecting answers from panels.
- Every meaningful action should leave visible evidence: mask on face, IV on arm, pads on chest, dressing over wound, splint on limb, oxygen running, mist from nebuliser, chest rising with ventilation.
- The patient must react like a person: speaking, refusing, gagging, guarding pain, becoming drowsy, becoming more cooperative after reassurance, or deteriorating when the wrong thing is done.
- Scene constraints should matter: cramped spaces, poor light, heat, bystanders, privacy, position on floor/bed/chair, language, cultural needs, access issues, and ambulance transport context.
- Visual effects should be clinical, not theatrical: pallor, cyanosis, diaphoresis, rash, swelling, soot, bleeding, bruising, tremor, weakness, altered gaze, respiratory effort, asymmetric chest rise.
- Sound should carry realism: breathing, wheeze, stridor, monitor alarms, radio, bystanders, patient speech, equipment sounds, and environmental noise.
- The frame rate and responsiveness must stay smooth. A beautiful but laggy patient bay breaks immersion.

Build strategy: do not attempt all 114 cases at this fidelity immediately. Build 6-8 sentinel scenarios to premium quality first, then generalise the systems.

First implementation slice now shipped: the live patient bay derives a compact realism director state from case family, vitals, scene constraints, applied treatments, visible patient cues, and reassessment prompts. The next realism layers should use this same state as the anchor for anatomy-locked equipment, patient behavior, and synchronized sound/visual consequences.

Sentinel cases to prove the realism standard:

- Asthma/COPD respiratory distress.
- Anaphylaxis.
- Opioid toxicity.
- Hypoglycemia or seizure.
- Chest pain/ACS.
- Stroke.
- Major trauma or hemorrhage.
- Burns or inhalation injury.

## Cohort progression rule

The case library should feel larger as learners progress, without exposing juniors to senior material.

- Year 1 sees Year 1 cases only.
- Year 2 sees Year 1 review plus Year 2 cases.
- Year 3 sees Year 1/2 review plus Year 3 cases.
- Year 4 sees the full degree-pathway library.
- Diploma sees explicit diploma cases plus Year 1/2 fundamentals. Year 3/4 advanced cases stay hidden unless they are deliberately tagged for diploma.

This keeps foundational practice available to senior students while protecting early learners from cognitive overload. Smart random should explain that it is using the selected cohort's "training scope", not pretending that every visible case is newly authored for that exact year.

## Interface direction: the patient bay frame

The current page has useful content, but the student has to read too many disconnected panels. The premium layout should become a single clinical bay.

### Center

- Large mannequin remains the main workspace.
- Body regions are interactive.
- Visible wounds, equipment, oxygen devices, IVs, dressings, and blood are all anchored to anatomy.
- Eye, chest, abdomen, and limb assessments open as in-frame zoom modules, not separate side panels.

### Left rail

- Scene and case memory: dispatch, hazards, PPE, mechanism, patient story.
- Current priorities: scene safe, MARCH/ABCDE, unanswered critical checks.
- Instructor hints can live here, but should be collapsible.

### Right rail

- Monitor and treatment bag.
- Bags open as realistic trays of equipment, not text lists.
- Equipment can be clicked or dragged onto the patient.
- Contraindications and patient consent warnings appear at the point of action.

### Bottom rail

- Clinical timeline: assessments, treatments, patient responses, vitals changes, and debrief markers.
- Timeline should read like a case narrative, not a chat log.

### Road-side assessment realism

The assessment UI should behave like a paramedic working around a real patient, not a static body-part menu.

- Start with a doorway/general impression: patient position, work of breathing, bleeding, skin colour, hazards, access, bystanders, and consent.
- Let scene context shape what is easy or hard: cramped bathroom, roadside, bed, floor, seated patient, language barrier, family interference, poor light, heat, noise, or privacy concerns.
- Keep MARCH/ABCDE available, but show the next useful actions on or near the anatomy the student is examining.
- Reassessment must be built into the frame: after oxygen, medication, splinting, bleeding control, ventilation, or positioning, the UI should naturally ask the student to look again, listen again, feel pulses, and compare the monitor.
- Avoid panels that cover the anatomy they refer to. Zoom loupes should preserve context and close back to the exact patient region.
- Patient behavior should constrain examination: awake patients speak, refuse, guard painful areas, gag with inappropriate airway adjuncts, pull away from distressing masks, and settle when reassured.
- Equipment on the patient should change what can be assessed: masks, cannulas, IV lines, dressings, collars, splints, and pads must sit anatomically and not block unrelated hotspots.

## Human-like patient system

Add a patient behavior layer that sits between treatment attempts and final application.

```text
treatment attempted
  -> can the patient tolerate this?
  -> does the patient consent/cooperate?
  -> does the treatment match clinical state?
  -> apply, block, warn, or trigger a reaction
```

Examples:

- Awake/talking patient plus OPA: gagging, refusal, device rejected.
- Confused hypoxic patient plus oxygen mask: may pull at mask until reassured.
- IV cannulation: flinch/pain, possible failed attempt if agitation is high.
- BVM on breathing patient: distress and resistance unless ventilation support is truly indicated.
- Bleeding control: pain during pressure/tourniquet, then relief when hemorrhage is controlled.
- Eye assessment: zoom into eyes with pupil state matching the scenario, such as pinpoint pupils in opioid toxicity.

## Implementation phases

### Phase 1: Case-adaptive realism foundation

- Add `PatientRealismState` with active patient problems, visible equipment, skin signs, distress, cooperation, and revealed findings.
- Derive initial active problems from case category, dispatch text, mechanism, symptoms, vitals, and existing injury inference.
- Build a small sentinel scenario set that proves the engine across different physiology:
  - Massive hemorrhage or major trauma.
  - Asthma/COPD respiratory distress.
  - Anaphylaxis.
  - Opioid toxicity.
  - Hypoglycemia or seizure.
  - Chest pain/ACS.
  - Sepsis.
  - Burns or inhalation injury.
- For each sentinel scenario, define visual signs, assessment findings, deterioration path, correct interventions, harmful interventions, patient reactions, and debrief endpoints.

### Phase 2: Treatment suitability and patient reactions

- Add a `realismEngine` that evaluates attempted treatments before application.
- Expand contraindication behavior beyond warnings into realistic patient responses.
- Add OPA gag/refusal, oxygen mask anxiety, IV pain, BVM resistance, and procedure-specific reaction events.

### Phase 3: Premium bay layout

- Keep the mannequin central and persistent.
- Move assessment actions into anatomy-anchored popovers.
- Turn the treatment bag into a compact visual equipment drawer.
- Pin monitor and critical vitals in the same frame.
- Add a polished clinical timeline at the bottom.

### Phase 4: Advanced visual physiology library

- Pupils with zoom loupe and scenario-matched findings.
- Cyanosis, pallor, diaphoresis, burns, bruising, wounds, dressings, splints, and immobilization.
- Chest rise asymmetry, respiratory effort, and accessory muscle use.
- Tremor, seizure/post-ictal state, agitation, reduced tone, facial droop, limb weakness, rash, swelling, soot, secretions, and pain guarding.
- Gradual changes rather than binary on/off states.

### Phase 5: Educator and classroom sync

- Sync realism state in classroom mode.
- Give educators controls for scenario severity, deterioration speed, hint level, patient cooperation, and key complication toggles.
- Add debrief analytics: time to oxygen, time to bronchodilator, time to adrenaline, time to glucose, time to naloxone, time to hemorrhage control, contraindicated actions, missed assessments, and patient safety events.

## First implementation slice I recommend

Start with the engine and three contrasting sentinel cases, not one feature:

1. Add the realism state model.
2. Map generated cases into `ActivePatientProblem` entries.
3. Implement three visually different scenarios first:
   - Respiratory distress: work of breathing, wheeze, oxygen/nebulizer/CPAP response.
   - Toxicology/metabolic: pupil or glucose/mental-status findings, antidote or glucose response, airway safety checks.
   - Trauma/circulation: wound/fracture/bleeding or shock findings, immobilization/control/resuscitation response.
4. Render the right findings on the mannequin and in assessment zoom panels.
5. Route treatments through the realism engine before they apply.
6. Record patient reaction, vital trajectory, visible change, and debrief endpoint for each intervention.

This gives us a reusable pattern for airway, breathing, circulation, disability, exposure, and specialist case families without locking the product around bleeding.

## Quality bar

- Educational realism over shock value.
- Fast, readable, and usable on student laptops.
- Every visual effect must correspond to a clinical concept.
- Every blocked or harmful action must teach the student why.
- Visuals should be premium, minimal, glass-like where appropriate, but the patient and equipment should remain realistic rather than decorative.
- UAE protocol review should happen before final clinical rules are treated as official.
