# Pose ↔ 3D staging honesty audit
Generated 2026-09-11 for standing realism worker.

## Elias playtest seed
- `general-001`: authored **Sitting with legs elevated** — currently renders seated without elevated legs. Fix first.
- Dispatch “awake but confused” vs body Alert/GCS15 — align copy.

## Gap
`patientStaging.ts` has no first-class `sitting + legs elevated` pose. `leg_elevation` treatment maps to recumbent/supine — wrong for this syncope pattern.

## P0 special poses (15) — elevate/recovery/tripod/lateral/driver
- `resp-001` [-] `Sitting upright, leaning forward (tripod)` — Life-Threatening Asthma Attack (cases.ts)
- `resp-003` [-] `Sitting forward, tripod` — COPD Exacerbation (cases.ts)
- `general-001` [public] `Sitting with legs elevated` — Syncope - First Episode (cases.ts)
- `obs-001` [-] `Lying on left lateral side` — Pregnancy - Third Trimester Bleeding (Placenta Previa) (cases.ts)
- `ped-001` [home] `Lying on left side (recovery position)` — Pediatric - 3-Year-Old with Fever and Seizure (cases.ts)
- `cardiac-011` [-] `Tripod position, sitting forward` — Acute Decompensated Heart Failure - "Crashing Asthma" (cases.ts)
- `y1-005` [-] `Lying on sofa in recovery position` — Toddler - Simple Febrile Seizure (firstYearCases.ts)
- `y1-011` [roadside] `Seated in driver seat with seatbelt on` — Adult - Minor Road Traffic Collision with Neck Pain (firstYearCases.ts)
- `y1-017` [public] `Supine, being rolled to recovery position` — Young Adult - Witnessed Seizure, Now Post-Ictal (firstYearCases.ts)
- `y1-018` [roadside] `Slumped in driver seat` — Fasting Diabetic - Drowsy and Sweating (firstYearCases.ts)
- `y1-021` [-] `Tripod, leaning on knees` — Older Smoker - Worsening Breathlessness with Green Sputum (firstYearCases.ts)
- `obs-002` [-] `Recovery position` — Eclamptic Seizure in Pregnancy (additionalCases.ts)
- `litfl-001` [public] `Supine on floor, legs slightly elevated by colleague` — Inferior STEMI with Right Ventricular Infarction (litflCases.ts)
- `asthma-mod-001` [-] `Sitting upright, leaning forward, tripod position` — Moderate Asthma Exacerbation (severityVariantCases.ts)
- `asthma-sev-001` [-] `Tripod position, leaning forward on arms, severe use of accessory muscles` — Severe Asthma — Failing to Respond (severityVariantCases.ts)

## P1 (35) — leaning / semi-recumbent / floor / holding
- `cardiac-001` [-] `Sitting upright, leaning forward` — Acute Anterior STEMI
- `trauma-003` [roadside] `Sitting, leaning forward` — Penetrating Chest Wound
- `metab-001` [-] `Sitting on floor, leaning against bed` — Severe Hypoglycemia
- `metab-002` [-] `Sitting, leaning forward` — Diabetic Ketoacidosis (DKA)
- `postd-001` [-] `Semi-recumbent` — Post-Op Wound Infection
- `cardiac-006` [-] `Sitting up, leaning forward` — Supraventricular Tachycardia (SVT) - Young Adult
- `cardiac-009` [-] `Semi-reclined in bed` — Atrial Flutter with 2:1 Block - Elderly Patient
- `resp-010` [roadside] `Semi-recumbent on ground, propped against wall` — Refractory Anaphylaxis — Bee Sting
- `cardiac-016` [-] `Supine on floor, coat under head as pillow` — Complete Heart Block — Syncope
- `y1-001` [-] `Sitting on floor, leaning against sofa` — Elderly Female - Fall at Home
- `y1-002` [public] `Sitting forward, holding right lower quadrant` — Young Adult - Abdominal Pain
- `y1-006` [-] `Semi-recumbent on bed, knees drawn up` — Pregnant Female - Imminent Delivery
- `y1-008` [-] `Sitting on floor against wall, knees drawn up` — Young Adult - Panic Attack
- `y1-012` [public] `Sitting on examination couch, leaning forward` — Student - Hyperventilation Syndrome
- `y1-014` [public] `Supine on hard floor` — Witnessed Cardiac Arrest - Shopping Mall
- `y1-015` [public] `Sitting upright, leaning forward` — Severe Allergic Reaction — Restaurant
- `y1-019` [-] `On floor, leaning against sofa` — Older Adult - Simple Mechanical Fall, Low Risk
- `y2-001` [-] `Sitting upright, leaning forward with arms supporting` — Asthma Exacerbation - Systematic Assessment Required
- `y2-002` [-] `Sitting forward, leaning left` — Cardiac Chest Pain - Assessment Focus
- `y2-004` [public] `Sitting upright against wall, holding hands away from body` — Workshop Flash Burn - Burns Assessment
- `y2-005` [public] `Lying on floor, knees drawn up, guarding abdomen` — Ectopic Pregnancy - Obstetric Emergency
- `y2-009` [public] `Supine on office floor` — Cardiac Arrest - Workplace Collapse
- `trauma-005` [roadside] `Sitting (leaning forward)` — Blunt Chest Trauma - Tension Pneumothorax with Flail Chest
- `trauma-007` [-] `Sitting, leaning forward` — Blunt Abdominal Trauma - Splenic Laceration
- `cardiac-ecg-001` [-] `Sitting, leaning forward` — Acute Inferior STEMI with Right Ventricular Infarction
- `resp-005` [-] `Sitting upright, leaning forward` — Severe COPD Exacerbation
- `ped-002` [-] `Supine on floor` — Pediatric Febrile Seizure
- `obs-003` [-] `Semi-recumbent on the bed` — Postpartum Haemorrhage After Home Birth
- `cardiac-018` [public] `Supine on floor` — Peri-Arrest Bradycardia - Syncope and Shock
- `sepsis-001` [-] `In bed, semi-recumbent` — Elderly Woman - Confusion, Fever and Low Blood Pressure
- `fall-003` [-] `On the floor, right leg shortened and externally rotated` — Long Lie - Fractured Hip, Cold and Shocked
- `litfl-007` [-] `Supine on floor, unable to sit up without severe dyspnea` — Massive Pulmonary Embolism with RV Strain
- `litfl-010` [-] `Semi-recumbent in balcony chair` — Severe Hypothermia with Osborn Waves
- `litfl-019` [public] `Sitting in office chair, leaning forward` — De Winter T-Wave Pattern — LAD Occlusion STEMI Equivalent
- `litfl-012` [home] `Supine on bathroom floor` — Subarachnoid Hemorrhage with Cerebral T Waves

## P2 (4)
- `y1-004` [-] `Standing near kitchen sink`
- `y1-010` [-] `Sitting on grass, supporting left wrist with right hand`
- `y1-020` [roadside] `Supine, guarding right leg`
- `resp-012` [roadside] `Slumped, prefers sitting but hypotensive`

## Method
1. Implement/extend staging keys for elevated-legs seated + verify chair plant.
2. For each P0: smoke on :5173, screenshot, blender-eval PASS/FAIL vs authored position.
3. Commit/push/Vercel (project app) per green batch. Continuous — do not stop.
