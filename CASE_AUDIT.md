# Case Bank Audit — 2026-05-28

Auditor: Critical-Care Paramedic (15y field / 5y ACP curriculum), audit scope per Director's brief: clinical authenticity, internal consistency, UAE regional fit, instructional fitness for HAAD/MOH boards.

## Headline findings

- **Total cases reviewed: 100** across 7 files (`cases.ts` 42, `enhancedCases.ts` 9, `additionalCases.ts` 16, `firstYearCases.ts` 15, `secondYearCases.ts` 9, `litflCases.ts` 6, `severityVariantCases.ts` 3).
- **Cases with critical clinical issues (would mislead a student on boards): 6** — `fall-001`, `tox-001`, `resp-002`, `cardiac-002`, `multi-001`, `trauma-008` (the user-flagged case).
- **Cases with consistency issues (vitals/narrative/scene mismatch): 9** — `trauma-008`, `resp-002`, `tox-001`, `resp-004`, `resp-005`, `ped-001`, `cardiac-002`, `cardiac-001` + the wider 999/998 dispatch mix.
- **Cases with UAE regional issues: ~22** — emergency number 999 vs 998 confused across most pre-LITFL files; only `litflCases.ts` is consistent. Several "tourist" / "Russian guest" / "UK family" choices are fine, but the case bank tilts heavily toward expatriate patients and *under*-represents Emirati / South Asian / Filipino patients given the actual demographic in UAE prehospital practice.
- **Overall quality: high.** The post-2025 protocol updates (AHA 2025 ACLS, EBA 2023 burns, CRASH-2 TXA, BTF 4th ed TBI, NICE NG10 ABD, AHA 2024 IV-over-IO focused update, Magpie Trial for eclampsia, etc.) are accurately reflected in the body of the management pathway text on most cases — this is a clinically sophisticated bank. The issues below are localised, fixable, and concentrated in a small subset of cases.

---

## The 45F crash case (user-flagged)

**Case ID: `trauma-008` — "Pelvic Fracture with Hemorrhagic Shock"**
**File: `src/data/enhancedCases.ts` lines 2061–2510**

### What the user reported
> "45-something female involved in a crash with a rotation — details absent from the scene; image shows a male; legs don't show the described injuries."

### What I found

This is the only 45-year-old female trauma case in the bank, and the only female pelvic / lower-limb-deformity case at age 40+. The "rotation" the user remembers is the **external rotation** of the leg described in `sceneInfo.description` (line 2086), `abcde.exposure.findings` (line 2128), `secondarySurvey.pelvis` (line 2138), and `secondarySurvey.extremities` (line 2139). The mechanism is **pedestrian struck by car at ~40 km/h**, not a rotational/rollover MVC — the user has conflated the *finding* (externally rotated leg) with the *mechanism*.

Three real problems, three perceived ones.

#### Real problem 1 — Scene image is generic and contradicts the described injury
**File: `src/components/SceneSurveyPanel.tsx` line 247–248**

```tsx
if (/pedestrian|struck by car|pelvic pain|pelvic fracture/.test(haystack)) {
  return '/scene-assets/pedestrian-road-night.png';
}
```

The image `/public/scene-assets/pedestrian-road-night.png` shows a single dark-clothed figure lying supine on a road at night, **legs straight and parallel**. The case explicitly states "Left leg shortened and externally rotated" and "Pelvic deformity" — the patient on the image does **not** show this. Students reading the case will see contradictory visual evidence and either lose trust in the simulator or, worse, internalise a flat-legged supine pedestrian as the "look" of an unstable pelvic fracture.

The figure on the image also reads as male / ambiguous gender — patient is stated as female.

**Recommended fix (developer):** Either commission/generate a scene image that actually shows the leg deformity and a female-appearing patient, or remove the scene image for this case and fall back to no-image. *Do not* use a stock "pedestrian on road" image when the case turns on a specific orthopaedic finding.

#### Real problem 2 — Dispatch / scene text omits the mechanism details that justify the diagnosis
- `dispatchInfo.additionalInfo` only says: `['Patient struck at ~40km/h', 'Significant deformity', 'Police en route']` (line 2076)
- `sceneInfo.description` is one line: `'Patient supine on roadside, leg shortened and externally rotated'` (line 2086)
- `history.eventsLeading`: `'Walking on sidewalk when car struck her from behind. Thrown approximately 5 meters. Landed on left side.'` (line 2149)

What's missing for a high-energy pedestrian-vs-vehicle:
- Vehicle type (sedan vs SUV vs lorry — bumper height drives injury pattern)
- Was she thrown over the bonnet (Waddell's triad — knee + chest + contralateral head) or run over (degloving/crush)
- Position on road (which would change c-spine kinematics)
- Time of day already given (evening), light conditions (street lighting)
- Speed estimate confidence

The 40 km/h + 5 metres thrown puts this firmly in "high-energy mechanism" territory which should justify a c-spine call (and Waddell-pattern injuries should at least be considered) — but the case never mentions head, chest, or contralateral leg findings.

**Recommended fix:**
```ts
sceneInfo: {
  description: 'Patient supine on roadside near corner of Mamzar Beach Road. Scene marked by police. Sedan with cracked windscreen and front bumper deformity ~10m from patient. Skid marks ~15m. Patient was reportedly walking along pavement when struck from behind by car estimated at 40 km/h, thrown ~5m and landed on left side. Visible left leg shortening and external rotation. Bystanders did not move patient.',
  hazards: ['Traffic — partially blocked by police', 'Poor street lighting', 'Risk of secondary collision'],
  ...
},
```

Add to `secondarySurvey` a brief note on contralateral (right) leg and head/chest findings (even if negative — Waddell's triad is taught).

#### Real problem 3 — Vital-sign / treatment vs presentation internal contradiction
`abcde.exposure.findings` includes `'Blood at meatus'` (line 2128), and `expectedFindings.redFlags` says `'Blood at meatus = urethral injury - DO NOT insert Foley!'`. Good.

BUT: in `equipmentNeeded` line 2363:
```
'Urinary catheter kit (contraindicated if blood at meatus)',
```
This is fine as a teaching list. However on the same line block (2360):
```
'MAST trousers (if available)',
```
**MAST/PASG trousers have been removed from PHTLS / ATLS for over a decade** and are not recommended for prehospital pelvic haemorrhage. Pelvic binders supersede MAST entirely. Listing them as equipment is anachronistic for a case using EBA / RCEM 2019 / ATLS 11 references. Severity: Medium (teaching error — students may think MAST is still standard kit).

**Recommended fix:** Delete `'MAST trousers (if available)'` from `equipmentNeeded` (line 2360). Replace with `'Sheet for improvised pelvic binder (if commercial binder unavailable)'`.

#### Other items on this case
- `vitalSignsProgression.initial`: SBP 75, HR 135, RR 26, SpO2 93. Plausible for Class III–IV shock from pelvic-fracture haemorrhage. **OK.**
- `language: 'English'` + `occupation: 'Tourist'` — fine for Mamzar Beach Road (high tourist density).
- `culturalConsiderations` is **missing** from `patientInfo` — for a female patient, "female provider preferred where culturally appropriate" should be listed (it is mentioned in `uaeProtocols.localConsiderations` line 2406 but should be in the patientInfo field too for symmetry with other female cases like `obs-001`).
- `disability.bloodGlucose: 5.4` — same boilerplate as 60+ other cases. Real shocked patients have stress hyperglycaemia (8–12 mmol/L). Low severity but reduces realism.

### Perceived problems that aren't real
- **"rotation crash"** — the user's recollection. There is no rotational/rollover MVC case for a 45F in the bank. The only rollover case is the bus MCI (`multi-001`). The "rotation" they remember is leg/pelvic external rotation.
- **"legs don't show the described injuries"** — confirmed real (scene image, problem 1 above) — and a fair complaint. The scene image is wrong for this case.
- **"image shows a male"** — the figure is ambiguous but reads more masculine than feminine. Confirmed real (problem 1).

---

## Critical issues (clinical correctness)

### 1. `fall-001` — "Elderly Fall with Hip Fracture" — **Anticoagulant pharmacology error**
**File: `src/data/cases.ts` line 4664**

```ts
'Pre-alert: "78-year-old female, NOF fracture, anticoagulated on amlodipine — analgesia given"',
```

**Amlodipine is a dihydropyridine calcium-channel blocker, not an anticoagulant.** This is a serious clinical error — if a student parrots this on a board station they fail. The patient's medication list (line 4618–4622) is amlodipine + alendronate + paracetamol PRN — no anticoagulant. The pre-alert text is wrong on two counts: (a) misnames amlodipine, (b) describes the patient as anticoagulated when she isn't.

**Fix:** Change to: `'Pre-alert: "78-year-old female, mechanical fall, NOF fracture confirmed clinically, not anticoagulated, analgesia given — request orthopaedic and geriatric review"'`

Also, in the commonPitfalls list (line 4683) the text correctly discusses anticoagulant risk in falls — that's fine as a teaching pitfall, but it should not be confused with the patient's actual medication status. **Severity: Critical.**

### 2. `tox-001` — "Organophosphate Poisoning" — **Three internal contradictions on atropine titration endpoint**
**File: `src/data/cases.ts` lines 6514–6850**

`abcde.circulation.interventions` (line 6573):
> "Atropine 1-3mg IV initial ... NOT titrated to heart rate, NOT pupils. Total dose may reach grams."

`managementPathway.immediate` line 6627:
> "Atropine 2mg IV/IM bolus - repeat every 3-5 minutes until dry skin/secretions, **HR >80 bpm, and pupils dilate**"

`teachingPoints` line 6677:
> "Atropine ... titrated to drying tracheobronchial secretions (not HR, not pupils — pupils are unreliable)"

The case states two opposite titration endpoints in the same file. The correct one (clear tracheobronchial secretions) is in the abcde block and teachingPoints. The wrong one is in the immediate-management list (HR + pupils). Students reading the immediate-management section will titrate to HR and pupils and **under-dose** these patients — which kills them.

**Fix line 6627:**
```ts
'Atropine 2mg IV/IM bolus repeated and DOUBLED every 3-5 minutes (2mg → 4mg → 8mg → 16mg) until tracheobronchial secretions DRY. Do NOT titrate to HR or pupils — both are unreliable in OP poisoning. Total doses may reach tens-to-hundreds of mg.',
```

Also, **Poison Control number inconsistency**:
- Line 6639: `'Contact Poison Control Center (800-424 in UAE)'`
- Line 6678: `'Contact Poison Control Center: 800-4111 (UAE)'`

The correct UAE National Poison Control number is **80042426** (Federal Ministry of Health and Prevention). Pick one and put it everywhere in the file, including across all other tox cases (`tox-002` `metab-003`).

**Severity: Critical** for the titration endpoint, Medium for the phone number inconsistency.

### 3. `resp-002` — "Pneumothorax - Tension" — **Catheter length contradicts own teaching**
**File: `src/data/cases.ts` lines 1418–1700**

`managementPathway.immediate` line 1517 says correctly:
> "Use 14G x **8cm** catheter (5cm catheters demonstrably fail in ~1/3 of adults)"

`equipmentNeeded` line 1565 says:
> "14G or 16G IV cannula (**5cm length preferred**)"

The case itself says 5cm fails. Then it lists 5cm as preferred equipment. This is the single most important pitfall in tension pneumothorax teaching (catheter length) and the case contradicts itself on the right answer.

**Fix line 1565:** `'14G x 8cm catheter (Cook decompression needle or equivalent) — 5cm catheters fail in >30% of adults per TCCC 2022'`

**Severity: Critical** — this is exactly the kind of thing a HAAD examiner trips students on.

### 4. `cardiac-002` — "Out-of-Hospital Cardiac Arrest" — **Defib/amiodarone in a documented asystole case**
**File: `src/data/cases.ts` lines 263–550**

`abcde.circulation.findings` (line 320): `'No carotid pulse', 'Asystole on monitor'`
`expectedFindings.keyObservations` (line 364): `'Apneic', 'Pulseless', 'Asystole/PEA/VF'`

The presenting rhythm is **asystole** (matched by `subcategory: 'asystole'` line 266). Yet:
- `studentChecklist` item `c2-5` (line 380): "Defibrillate if VF/pVT - 150-200J biphasic" — **points: 15, listed as critical: true**. A student will lose marks for *not* defibrillating an asystole rhythm; conversely, awarding points for "would have shocked if rhythm were shockable" is teaching-by-confusion.
- `studentChecklist` item `c2-amio` (line 389): "Amiodarone 300mg IV after 3rd shock for shockable rhythms" — marked critical: true. Again, no shock indicated in an asystole arrest.

**Fix:** Either change `initialRhythm` to a shockable rhythm (then VF/pVT items make sense) OR rewrite the shock/amiodarone items as "recognise rhythm is non-shockable, continue CPR + adrenaline + identify reversible causes". The current state teaches students to apply VF algorithm to an asystole arrest.

Also AHA 2024/2025 IV-vs-IO messaging is inconsistent (line 381 says "IV weakly preferred", line 398 says "IV is recommended OVER IO" — pick one wording).

**Severity: High** — this is a 4th-year case (`yearLevels: ['4th-year']`) and the resus algorithm error is at exactly the level being assessed.

### 5. `multi-001` — "Mass Casualty Incident" — **patientInfo.age=0 / weight=0 will break vitals math**
**File: `src/data/cases.ts` lines 7114–7540**

```ts
patientInfo: {
  age: 0,            // line 7138
  gender: 'male',
  weight: 0,         // line 7140
  ...
},
```

The "patient" is conceptually 8 patients, but the type system has one patient — so this was hacked by setting age/weight to 0. Any downstream UI that computes paediatric-vs-adult thresholds, weight-based dosing, or age-banded vitals will misbehave on this case. Several systems in the bank read these fields (`severityVariantCases.ts` and `clinicalRealism.ts` both reference paediatric thresholds). The MCI also includes 8 sub-patients in `mci.patients[]` (line 7334+) with proper individual ages/genders, so the parent age=0/weight=0 is just a placeholder, but it propagates into vitals — see `vitalSignsProgression.initial.bp = 'Various'` (line 7224, a string where the schema usually expects numeric BP).

**Severity: High** for type-safety / UI breakage; Medium clinically (the individual sub-patients are properly formed).

**Fix:** Either extend the type to allow `'multi-patient'` mode where age/weight are optional, OR set the parent patient as one of the sub-patients (e.g. patient 1 / RED bus driver, age 34) and document that the case is the responder's perspective on patient 1 of an MCI.

### 6. `trauma-008` — covered in detail above. **MAST trousers** in equipment list is a critical anachronism. **Severity: Medium-High.**

---

## Consistency issues

### `cardiac-001` — Acute Anterior STEMI — minor — UAE emergency number
**File: `src/data/cases.ts` line 35**
`callReason: 'Severe chest pain, patient called 999 himself'`
In the UAE, **998 = ambulance**, 999 = police. A chest-pain patient phoning their own ambulance dials 998. **Fix:** `'Severe chest pain, patient called 998 himself'`. (Same correction pattern applies to lines 1316, 6083 — see "regional fit" section below.)

### `resp-002` — Tension pneumothorax — vital-sign / scene mismatch
**File: `src/data/cases.ts` lines 1418–1700**
- `secondarySurvey.posterior` line 1496: `'Right-sided bruising'` — but the scene description (line 1440) just says "Outdoor construction site". A 3-metre fall onto the right side per `eventsLeading` line 1505 is consistent, so this is OK once linked, but the scene description should mention "patient landed on right side".
- Vitals: BP 80/50, HR 135, SpO2 82, RR 36 — classic tension pneumo, consistent. **OK.**
- Catheter equipment error: see Critical issue 3 above.

### `cardiac-002` — OOHCA — pulseless ECG + asystole + amiodarone — see Critical 4 above.

### `trauma-005` — "Blunt Chest Trauma - Tension Pneumothorax with Flail Chest"
**File: `src/data/enhancedCases.ts` lines 515–1100**
`abcde.breathing.findings` line 569 says: `'Tracheal deviation to left'` (away from right pneumothorax — **correct**).
`abcde.circulation.findings` line 590: `'JVD present on left'` — **JVD is bilateral in tension pneumothorax; calling it "left only" because of contralateral mediastinal shift is anatomically wrong.** JVD = elevated jugular venous pressure on both sides because of impaired RV filling. The right-sided JVD might be diminished if the SVC is twisted, but it's not strictly "left only".
**Fix line 590:** `'JVD bilaterally elevated (impaired RV filling from rising intrathoracic pressure)'`. **Severity: Medium.**

### `trauma-007` — "Splenic Laceration"
**File: `src/data/enhancedCases.ts` lines 1597–2060**
- `history.eventsLeading` line 1683: "Driver of vehicle that **rear-ended a truck at ~60km/h**" — a rear-end at 60km/h with seatbelt + airbag deployment typically produces seatbelt-pattern injuries that match (LUQ/spleen, mesenteric tears). **OK as written, but**: a rear-ender hitting a truck would more typically produce posterior chest/c-spine/whiplash injuries from sudden deceleration; the splenic laceration would be more classic in a *side impact* or *steering wheel/seatbelt* mechanism from a frontal impact. Minor — keep, but the mechanism narrative could be tightened to "frontal impact with truck at ~60 km/h" if you want the seatbelt-sign LUQ pathology to fully line up. **Severity: Low.**
- Pelvic X-ray finding "Normal" is fine. Investigation list misses a routine CXR for pneumo/haemothorax in a seatbelt-sign patient. **Severity: Low.**

### `resp-004` — "Pulmonary Embolism"
**File: `src/data/cases.ts` lines 1988–2293**
- `circulation.findings` line 2042: `'Tachycardic'`, **`'Hypotensive'`** — BP is 100/65. SBP 100 is **not** hypotensive for a 42-year-old (normal SBP 90–140; "hypotension" usually defined as SBP <90 or MAP <65). Calling 100/65 hypotensive is inaccurate and risks priming students to over-call shock.
**Fix:** Change "Hypotensive" → "Borderline-low BP, watch for hemodynamic collapse" or drop entirely.
**Severity: Medium.**
- `secondarySurvey.chest` line 2062: `'Tender right lower chest'` + `'Clear auscultation'` — pleuritic tenderness on the side of the PE is plausible. OK.

### `resp-005` — Severe COPD — temperature inconsistency
**File: `src/data/additionalCases.ts`**
- `abcde.exposure.temperature` line 84: `36.8`
- `vitalSignsProgression.initial.temperature` line 112: `37.2`
Discrepancy. Pick one. Mild low-grade fever (37.2) is more consistent with infective exacerbation. **Fix:** Set both to `37.2`. **Severity: Low.**

### `ped-001` — Pediatric febrile seizure — circulation findings contradict each other
**File: `src/data/cases.ts` lines 6013–6021**
```ts
capillaryRefill: 1,
skin: 'Hot, flushed, dry',
findings: ['Tachycardic with good perfusion', 'Delayed capillary refill initially but improving', 'Signs of dehydration'],
```
Cap refill = 1 sec (fast/normal) but findings say "Delayed capillary refill initially but improving" — contradictory. Also "good perfusion" + "signs of dehydration" doesn't quite hang together for a child with 40.2°C fever.
**Fix:** Either set `capillaryRefill: 3` and findings stay as written, OR set findings to "Brisk capillary refill, flushed peripheries (vasodilation from fever), mild dehydration signs in mucous membranes".
**Severity: Low-Medium.**

### `cardiac-014` — Hypothermic drowning — **none** — this case is excellent. Use as a model.

### `trauma-009` — Epidural hematoma — disability.pupils is a 2-element array (string|string[] per schema), and `focalDeficits` indentation is inside disability but visually misaligned — type-checks OK, but linter may flag.

### Vitals "blood glucose 5.4" boilerplate
Across approximately **60+ cases** the disability block contains `bloodGlucose: 5.4` regardless of clinical context. This is a single normal value used as a default. Real-world consequences:
- Shock states (sepsis, haemorrhage) → stress hyperglycaemia 8–12 mmol/L
- DKA case (`metab-002`) — correctly has high glucose, but other DKA-like presentations are 5.4 default
- Septic shock patients trending hypoglycaemic late-stage
- Hypothermic arrests typically hyper- or hypoglycaemic (the paediatric drowning case `cardiac-014` is properly set at 2.1 mmol/L — good)

**Recommendation:** Build a small map of expected blood-glucose ranges by case category and reset the default per case. **Severity: Low individually, Medium cumulatively** (kills realism, but doesn't actively mislead).

---

## Regional/cultural fit (UAE)

### Emergency number — 999 vs 998 confusion (recurring)
The UAE uses:
- **998** — Ambulance (DCAS / National Ambulance / SEHA)
- **999** — Police
- **997** — Civil Defence / Fire

Pattern of errors:
- `cases.ts:35` `'patient called 999 himself'` — chest pain patient calling for ambulance, should be 998. **Fix.**
- `cases.ts:1316` `'Family may be hesitant to call 999'` — talking about an asthma attack, should be 998. **Fix.**
- `cases.ts:6083` `'when to call 999'` — paediatric seizure parental education, should be 998. **Fix.**
- `cases.ts:7126` `'Police Control Room (999)'` — MCI, **correct** (police are dispatching).
- `cases.ts:7221` `'Multiple 999 calls received.'` — MCI, **correct** (mixed reports to police).
- `cases.ts:7308` `'Dubai Police (999) coordinate scene'` — **correct**.
- `litflCases.ts` consistently uses 998 for ambulance dispatch. **Correct.**

**Recommendation:** A grep-and-replace pass on the older `cases.ts` and `additionalCases.ts` patient-education lines is needed. The pattern to spot is `call 999` when the context is ambulance/medical (not police/MCI).

### Patient demographic distribution
Of 100 cases:
- Approximately 20 patients are British/Western expatriate or "tourist"
- Approximately 12 are Indian/Hindi/Urdu construction workers (correct UAE workforce reality)
- Approximately 8 are Arabic-speaking Emiratis or GCC nationals
- The remaining ~60 are language="English" only without ethnic specification

For a Dubai/Abu Dhabi paramedic-board cohort, the actual prehospital workload is roughly: ~30% Emirati / GCC, ~30% South Asian (India/Pakistan/Bangladesh/Sri Lanka — Hindi/Urdu/Tagalog/Sinhalese), ~20% Filipino / SE-Asian, ~15% Western expat, ~5% other. Tagalog appears in **only 1 case** (`litfl-012`), which is a substantial under-representation. Filipino domestic workers and nurses are a *huge* demographic in UAE prehospital care.

**Recommendation:** Add 4–6 cases with:
- Filipino / Tagalog-speaking patients (3 of them — domestic worker scenarios, nurse-as-bystander scenarios)
- Bangladeshi labourer cases (currently underweighted)
- Khaleeji Arabic-speaking Emirati grandmother / grandfather (currently most Emiratis are middle-aged)
- A Sudanese / North African patient (also a real UAE demographic)

### Location strings
Largely correct — Dubai locations (Mamzar, Bur Dubai, Deira, Jumeirah, JBR, JLT, Dubai Marina, Business Bay, DIFC) and Abu Dhabi (Al Maryah Island, Corniche, Khalifa City) appear plausibly. Al Ain mentioned. **Sharjah** appears as residence but not as scene; **Ras Al Khaimah, Fujairah, Ajman, Umm Al Quwain** also appear — good geographic spread. `litfl-010` is set in Fujairah (severe hypothermia in elderly — appropriate for the cooler northern emirate). **Strong on this dimension.**

### UAE formulary
Medications referenced largely match UAE formulary:
- Adrenaline / Atropine / Amiodarone / Magnesium sulphate / Ipratropium / Salbutamol — all stocked.
- Hartmann's (Ringer's Lactate) referenced correctly (line 2925 burn case).
- TXA, ketamine, fentanyl, midazolam, morphine — all standard DCAS-approved.
- **`Combat Application Tourniquet (CAT)`** in `trauma-011` equipment — appropriate.
- **`Patiromer`** in `metab-003` definitive — Patiromer is FDA-approved but **not on UAE formulary as of 2026**; Kayexalate (sodium polystyrene sulfonate) is the available agent. Patiromer would not be available prehospital in any case. **Fix:** Remove Patiromer reference or qualify "Kayexalate (sodium polystyrene sulphonate); Patiromer if/when available".
- **Racemic epinephrine** mentioned in `resp-007` croup equipment — L-epinephrine 1:1000 nebulised is what's actually stocked in UAE ambulances; racemic epinephrine is largely a US legacy formulation. Replace with "L-adrenaline 1:1000, 5mL nebulised".

---

## Recommendations

### Top 5 patterns of error

1. **Internal contradictions between abcde, managementPathway, equipment, and teachingPoints within the same case** — the file is large enough (sometimes 400 lines per case) that the protocol gets stated correctly in one block (e.g. atropine titration in tox-001 abcde) and then re-stated incorrectly in another (managementPathway). **Single source of truth pattern needed.**

2. **999 vs 998 — UAE-specific knowledge errors** — old US/UK-derived "call 911/999" reflexes leaked into a UAE-targeted bank.

3. **Defaulted vitals** — `bloodGlucose: 5.4` and similar boilerplate across 60+ cases.

4. **Pharmacology fact errors** — `amlodipine`-as-anticoagulant in `fall-001` is the dangerous example. Patiromer / racemic-epinephrine are softer formulary errors.

5. **MAST trousers / 5cm pneumothorax needles** — outdated equipment listed in `equipmentNeeded` while the same case's body text explains *why* the modern alternative is correct.

### Fields to add to the case schema (build-time validation)

These would prevent the bulk of the issues above:

1. **`patientInfo.genderToken`** — auto-derived from `gender`; used in a build-time check that scans `dispatchInfo.callReason`, `sceneInfo.description`, `initialPresentation.generalImpression/appearance` for pronoun and noun consistency. Flag any female patient whose narrative says "him" or "father" without a caller-context tag.

2. **`patientInfo.bloodGlucose`** — required field, not boilerplate. Build-time lint: if a case category is in `[sepsis, shock, hypothermia, paediatric-critical, DKA-like]` and `bloodGlucose === 5.4`, warn.

3. **`mechanism: { kinematic: ..., expectedInjuries: string[] }`** in trauma cases — and a build-time check that at least one expected injury appears in `secondarySurvey`. Catches "rear-ended a truck → no chest/c-spine findings" and "pedestrian struck → no Waddell triad mention".

4. **`emergencyNumber`** — derived from country (UAE default 998 for ambulance, 999 for police). Build-time lint replaces hardcoded numbers in education strings.

5. **`medications: { name, formularyVerified: 'UAE'|'global'|'unverified' }`** with a curated UAE formulary list. Build-time lint warns on Patiromer, racemic epinephrine, MAST trousers, etc.

6. **`gender` mismatch lint between `patientInfo.gender` and `initialPresentation.appearance`/`generalImpression`** — would have caught the trauma-008 scene-image problem at the image-asset layer (if the schema also held `sceneImage.depictedGender`).

7. **`vitalsConsistency`** — a small rule engine: e.g. "if `findings` includes 'Hypotensive' then SBP must be <90 OR MAP <65"; "if `findings` includes 'Hypoxic' then SpO2 must be <94"; "if `redFlags` includes 'shock' then HR >100 AND SBP <100 (or shock-index >1)". Catches the resp-004 PE "hypotensive" at 100/65.

8. **A single curated `dispatchCode` enum** — to ensure Echo-1, Delta-1, etc. are used consistently across cases.

### Triage of fixes — by clinical impact

**Fix today (board-failing if a student parrots):**
- `fall-001` amlodipine-as-anticoagulant (line 4664)
- `tox-001` atropine titration endpoint (line 6627)
- `resp-002` needle thoracostomy catheter length (line 1565)
- `cardiac-002` asystole + amiodarone misalignment (lines 380, 389)

**Fix this week (consistency / regional fit):**
- 999→998 sweep across cases.ts (lines 35, 1316, 6083 minimum)
- `trauma-008` scene image + scene description rewrite (the user's actual complaint)
- `trauma-008` MAST trousers removal (line 2360)
- `resp-004` BP-vs-hypotensive wording
- `trauma-005` bilateral JVD wording
- Patiromer / racemic epinephrine formulary fixes

**Fix this sprint (quality of life):**
- Default `bloodGlucose: 5.4` → category-appropriate values
- Tagalog / Filipino patient diversification (add 3–4 cases)
- Khaleeji Emirati patient diversification (add 2 cases)
- Build-time schema validators per items 1–8 above

### Cases to use as exemplars (no issues found, build new cases against these)

- `cardiac-014` — Hypothermic drowning (paediatric weight-based dosing, ALS modifications for hypothermia, 5 rescue breaths first for drowning — model paediatric resus case)
- `cardiac-007` / `litfl-001` — Inferior STEMI with RV infarct (nitrate contraindication, V4R, preload-dependent shock — model ECG-driven case)
- `obs-002` — Eclampsia (magnesium first-line, Magpie Trial citation, antidote on standby — model obstetric emergency)
- `y2-007` — Paracetamol overdose (the "patient looks well NOW but liver fails in 48-72h" teaching point is excellent)
- `metab-003` — Hyperkalaemia (full medical algorithm, ECG progression, definitive dialysis pathway — model metabolic emergency)

---

## Auditor's overall summary

This is, on balance, a clinically sophisticated and well-researched case bank — the protocol updates referenced (AHA 2025, CRASH-2/3, NICE NG10/NG39/NG133/NG158, BTF 4th Ed, EBA 2023, JRCALC 2024, Magpie Trial, PARAMEDIC-2/IVIO, DETO2X-AMI, Sgarbossa, Wellens, AHA 2024 FBAO) are accurate and current. The issues identified are concentrated in a handful of cases and almost all fixable in <1 hour each.

The single biggest *systemic* risk is **internal contradiction within long case files** — a student reading the abcde block gets one answer, reading managementPathway gets another. Build-time linters covering the cross-references above will prevent that class of error from recurring as the bank grows.

The user-flagged `trauma-008` is a real instance of three separate small problems compounding: an absent/wrong scene image, a too-brief scene description, and an anachronistic piece of equipment. None of them are clinically dangerous in isolation but the combination broke the student's trust in the case — which is the right reaction. Fix all three.
