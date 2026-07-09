# Case Image Prompts — Paramedic Simulator (UAE)

> Hand-off doc for ChatGPT image generation. Copy a per-case or per-archetype prompt block and paste into ChatGPT 4o / DALL-E / Sora. All images target 16:9 photoreal output. Save each generated PNG into `/public/scene-assets/`, then either (a) overwrite the existing archetype filename to refresh it, or (b) save as `<case-id>.png` and add an entry to the new `ID_OVERRIDES` map shown at the bottom of this doc.

**The core problem.** The runtime selector in `src/lib/sceneImageSelection.ts` originally mapped most cases to a small stock set by regex on the case haystack. Many cases got the wrong image — most visibly generic home, office, fall, and adult arrest files being reused for unrelated complaints. This doc tells you the **posture, hand placement, facial cue and scene composition** to specify in ChatGPT for each case so the image actually matches the chief complaint.

**Scene QA pass — 2026-05-30.** The app now has prompt-specific overrides for 63 case/image pairings and resolves 100/100 cases to existing files. Added/verified dedicated assets include anaphylaxis with visible swelling/urticaria, choking, burns/inhalation injury, electrical arrest, home/workplace cardiac arrest, traumatic pneumothorax, splenic abdominal trauma, ectopic lower abdominal pain, female asthma, eclampsia, hypothermia, pneumonia, hypoglycaemia, renal/hyperkalaemia, and wound infection. Pediatric critical images remain a special sourcing/staging item where generated child emergency imagery was blocked; those cases are mapped to the closest existing pediatric/water-context stopgaps rather than adult-only images.

**Style guidelines (applied to every per-case prompt below):**

1. Always specify "Photoreal medical training scene, 16:9".
2. Patient demographics: age band + ethnicity (inferred from `patientInfo.language` and `occupation`) + culturally appropriate dress (kandura, abaya, hi-vis workwear, business shirt, tourist casual).
3. Setting matches `sceneInfo.environment` and `dispatchInfo.location`. The setting block in each prompt was inferred from both fields; tweak if you know the case better.
4. Posture / hands / face / scene-detail are from the §1 taxonomy keyed off the case's chief-complaint class.
5. Bystanders included where `sceneInfo.bystanders` or the description mentions them.
6. Lighting from `dispatchInfo.timeOfDay` (warm morning, bright midday, evening warmth, night-time low light).
7. Always end with "Photorealistic, no on-image text or watermarks".
8. No gore beyond what is clinically relevant — this is training, not shock.
9. UAE cultural fit: women in modest clothing or abaya unless tourist context; mixed Emirati / South Asian / Filipino / European demographics reflecting the actual UAE patient mix.

## 1. Posture taxonomy

Quick lookup: what posture matches what chief complaint. This is the table to consult when you regenerate any prompt.

| Chief complaint | Patient posture | Hand placement | Facial cue | Other clinical cues |
|---|---|---|---|---|
| Cardiac chest pain (STEMI, NSTEMI, ACS, angina) | Sitting upright, leaning forward slightly | Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm | Grimace, jaw set, brow furrowed; eyes half-closed in pain | Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm |
| Aortic dissection | Restless, shifting, cannot find a comfortable position | One hand on anterior chest, the other reaching round to back between shoulder blades | Wide-eyed expression of tearing/ripping pain, mouth slightly open | Pale, diaphoretic, looks frightened — characteristic "feeling of impending doom" |
| Cardiac arrest (any rhythm) | Supine on the ground or floor, motionless | Arms loose at sides, palms up or thrown out; chest exposed for CPR | Cyanotic lips, slack jaw, eyes half-open and unfocused or closed | Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life |
| Pulmonary embolism | Sitting upright; cannot tolerate lying flat; tachypneic | One hand on lateral chest wall, other gripping seat or knee for support | Anxious, cyanotic around lips, eyes wide, mouth open breathing | Pale or grey-cyanotic, profuse sweating, may have one swollen calf visible (DVT) |
| Pulmonary oedema / decompensated heart failure | Sitting bolt upright on edge of bed/sofa, legs dangling — absolutely cannot lie flat | Both hands gripping edge of bed/mattress to prop body up | Distressed, cyanotic lips, pink frothy sputum at corners of mouth | Open-mouth breathing, accessory muscle use in neck, pillow pushed away |
| Pneumothorax (spontaneous or traumatic) | Sitting upright leaning slightly toward injured side | Hand splinting affected hemithorax, other arm braced | Distressed, pale or cyanotic, mouth open, brows pulled together | Subtle tracheal deviation away from affected side, accessory neck muscle use, asymmetric chest rise |
| Acute severe asthma | Tripod position: sitting on edge of bed/chair, leaning forward, arms braced on knees or thighs | Hands gripping knees or thighs, sometimes inhaler clutched in fist | Pursed-lip exhalation, nostrils flaring, focused stare, cannot speak full sentences | Visible accessory muscle use (sternocleidomastoid prominent), shoulders elevated and hunched, used spacer/inhaler on side table |
| COPD exacerbation | Tripod position, often with portable home oxygen cylinder nearby | Hands gripping knees/armrests, nasal cannula in place | Pursed-lip exhalation, barrel chest visible, cyanotic lips | Inhalers/nebuliser on side table, tissues, oxygen tubing on floor |
| Anaphylaxis | Semi-recumbent or sitting (may be supine if hypotensive), legs may be elevated | One hand at throat (sense of throat closing), the other at chest; epipen visible | Grossly swollen lips and face/eyelids, urticaria/hives on neck and arms, cyanotic | Widespread erythematous wheals on exposed skin, used epinephrine auto-injector nearby, may be drooling |
| Choking / foreign body aspiration | Standing or seated, leaning forward; universal choking sign | Both hands clutched at own throat (universal choking sign) | Eyes wide and panicked, mouth open, cyanosis around lips, silent — cannot cough or speak | Food on plate in front; companion behind preparing to do abdominal thrusts |
| Paediatric croup with stridor | Upright, on parent's lap, refusing to lie back | Small fists, may rub face/eyes; parent steadies torso | Tearful but tired, occasional barking cough | Audible stridor implied (open mouth, neck slightly extended), small child in pyjamas |
| Hyperventilation syndrome | Seated, often legs drawn up; may be on floor against wall | Hands cramping into carpopedal spasm or held to chest | Frightened, tearful, mouth open, rapid shallow breathing visible at chest | No cyanosis (key — distinguishes from true respiratory distress), pale around lips |
| Pneumonia | Sitting propped up, leaning toward affected side | Hand resting on affected lateral chest; tissues in other hand | Flushed (febrile), tired, eyes glassy; productive cough implied | Tissues, water glass, thermometer on side table |
| Meningitis | Lying still in dim room; refusing to move neck (neck rigidity) | One hand shading eyes from any light (photophobia) | Flushed/febrile, grimacing, may have non-blanching petechial rash on torso/legs | Curtains drawn, lights off, sheet pulled up — photophobia is diagnostic visual cue |
| Acute stroke / TIA | Sitting or supine; visibly asymmetric posture, slumped to one side | Affected arm hanging flaccid or held weakly, unaffected hand at face | Facial droop on one side (mouth corner down, asymmetric smile) | Frustrated/confused expression, partner or family member supporting them |
| Generalised seizure (active or post-ictal) | Lying on side (recovery position) post-ictally, OR mid-seizure with rigid limbs | During tonic-clonic: rigid then jerking. Post-ictal: limp, often with bitten tongue | During: eyes rolled back, jaw clenched, frothing. Post-ictal: drowsy, confused, drooling | Family member panicked nearby, may have urinary incontinence (wet patch), bitten tongue with blood at mouth |
| Syncope / faint | Seated with legs elevated, OR supine post-faint, recovering | Hand to forehead, looking dazed | Pale, slightly diaphoretic, beginning to recover colour; confused-but-alert | Bystander or colleague supporting, water glass nearby |
| Panic attack | Pacing OR sitting against wall with knees drawn up | Hands trembling, one at chest, one at temple; may have carpopedal spasm | Tearful, wide-eyed, hyperventilating, terrified expression — believes she is dying | Not cyanotic (key — distinguishes from asthma/PE), surroundings safe and quiet |
| Acute psychosis / behavioural emergency | Pacing, restless, unable to sit still; may be aggressive or withdrawn | Clenched fists OR gesturing wildly to no one; may be holding broken object | Disheveled hair, eyes wide and suspicious, talking to unseen entity, sweaty | Broken furniture/objects in background, family member or police visible at scene edge |
| Obstetric (haemorrhage, eclampsia, delivery, ectopic) | Semi-recumbent on bed or floor, knees drawn up; OR lying on left side | Both hands cradling gravid abdomen | Sweating, focused/bearing down (labour) or pale and anxious (haemorrhage) | Visible pregnancy (third trimester), towels laid out, female family member supporting |
| Acute abdominal pain | Lying on side, knees drawn up to chest (fetal position) — wants to stay still | Both hands cupping abdomen, guarding the painful quadrant | Wincing, refusing to move, eyes screwed shut; pale and clammy | Vomitus bowl/bag nearby, may have refused food |
| Renal colic | Restless, writhing, cannot stay still — pacing, then squatting, then standing again | Hand pressed to flank radiating round to groin | Sweating, often vomiting, grimacing — cannot find any comfortable position (key clinical sign) | Bucket or bowl for vomiting nearby |
| Diabetic ketoacidosis | Sitting forward or supine; characteristic deep sighing breaths (Kussmaul) | Listless, by sides; insulin pen or glucometer visible nearby | Sunken eyes (dehydration), dry cracked lips, flushed cheeks, fruity acetone breath (open mouth) | Diabetes supplies on side table, dry skin tenting, water bottle |
| Severe hypoglycaemia | Often slumped or on floor; sweating profusely | Trembling, may be clammy and cold; glucometer or sugary drink nearby | Pale, profuse sweating, confused or combative expression; may be drooling | Insulin pen visible, glucose tabs |
| Electrolyte emergency (hyperkalaemia, dialysis) | Weak, sitting in armchair, too tired to stand | AV fistula visible on forearm (raised, scarred) for dialysis patients | Pale, mild swelling around eyes, lethargic | Peritoneal dialysis equipment or visible AV fistula, ankle oedema, multiple medication bottles |
| Heat exhaustion / heat stroke | Slumped/supine in shade, semi-conscious (heat stroke) or seated sweating (exhaustion) | Loose at sides; may be holding water bottle | Heat stroke: flushed, dry, hot skin, altered mental state. Exhaustion: pale, profuse sweat | Outdoor sun, construction PPE (hi-vis vest, hard hat off), colleague trying to cool with damp cloth |
| Hypothermia | Curled or semi-recumbent in cool environment, minimally responsive | Pale, mottled, fingertips cyanotic | Pale/grey, lips cyanotic, eyes drooping, slow movements | Inappropriate clothing for environment, wet clothes if immersion, blanket being applied |
| Drowning / near-drowning | Supine on pool deck, beach, or floor; wet | Limp at sides | Cyanotic lips, pale or grey; foam at mouth possible; eyes closed | Wet clothing/swimsuit, towels, lifeguard or parent kneeling beside, pool or sea visible in background |
| Poisoning / overdose | Variable: supine (CNS depression) or seated holding mouth (caustic) | Loose by sides if unconscious; or one hand to mouth if caustic | Pinpoint pupils (opioid), drooling, possible vomit | Substance container visible (pesticide spray, pill bottle, household cleaner) |
| Burns (thermal, scald, flash) | Sitting or standing, holding injured limb away from body | Injured area held distinctly away from torso | Tearful, pale, in obvious pain; soot around nose/mouth if inhalation injury | Visible erythema/blistering, cool water or wet cloth applied, source of burn visible |
| Traumatic amputation | Sitting, often supported by colleagues; affected limb wrapped or elevated | Stump wrapped in cloth/dressing, blood-stained; intact hand applies pressure | Pale, shocked, may be vacantly staring (acute shock) | Industrial machine/saw visible in background, colleagues helping |
| Spinal cord injury | Supine, may be in shallow water or on hard surface; held still by bystanders | Arms flaccid, not moving (motor level dependent) | Alert, anxious, frightened — "I cannot feel/move my legs" | Bystanders holding head in inline immobilisation, body slack below injury level |
| Traumatic brain injury | Supine, unconscious; head turned to one side | Loose at sides; may have abnormal posturing if severe | Blood on face/scalp, periorbital haematoma (raccoon eyes) if base of skull, unilateral pupil dilation possible | Bleeding scalp wound, hard hat or helmet on ground beside, scaffolding or vehicle visible |
| Pelvic fracture | Supine, cannot move; legs may be shortened/externally rotated | Loose at sides or one to abdomen | Pale, diaphoretic, in shock; distressed | On road surface, pelvic binder being applied OR clothing intact over pelvis |
| Major / multi-trauma (RTC, GSW, stab) | Supine on ground; visible deformity to limbs/chest | Loose or splinted depending on injury | Blood on face, pale, may be unconscious | Damaged vehicle/motorcycle, glass debris, road or scene context, paramedics in PPE working |
| Minor trauma | Sitting, alert; protecting injured area | Cradling injured limb with intact hand | Pale but composed, may be tearful (child) | Mechanism visible (bicycle on ground, low-speed car damage), no overt life-threats |
| Elderly fall | On floor where they fell; affected limb shortened/externally rotated if hip fracture | May reach for help; intact hand on uninjured side | Pale, in pain, frightened; may have been on floor for hours | Bathroom/bedroom setting, walking stick or frame visible, frail elderly patient |
| Sepsis / wound infection | Lying down weak, lethargic; flushed if hot, mottled if cold sepsis | Loose at sides | Flushed (febrile) or mottled, glassy eyes, drowsy | Recent surgical wound visible with redness/pus, thermometer/medication on bedside |
| Arrhythmia (SVT, AF, bradycardia, heart block) | Sitting, sometimes anxious, hand on chest | One hand on chest (feeling palpitations), other on lap | Anxious, pale, may be diaphoretic; alert | BP cuff/monitor nearby |
| Hypertensive emergency | Sitting, may be flushed; severe headache | Hand to temple/forehead (headache), other on chest | Flushed, diaphoretic, eyes squinted/closed (light sensitivity), nosebleed possible | BP monitor showing very high reading, may be vomiting (raised ICP) |
| Mass casualty incident | Multiple patients — mixed: walking wounded, seated, supine | Triage tags being applied | Various — from shocked to crying to unresponsive | Damaged vehicles, debris field, multiple emergency responders in hi-vis, triage tape |

**The single most common error in the current image bank:** treating every cardiac/respiratory/abdominal patient as "male clutching chest". An abdominal pain patient is in the foetal position guarding their belly. A renal colic patient is writhing — cannot stay still. A respiratory distress patient is tripoding, not chest-clutching. A pulmonary oedema patient is sitting bolt upright on the edge of the bed, not lying down. **The posture is half the diagnosis.**

## 2. Image archetypes (currently in `/public/scene-assets/`)

For each PNG file in the assets folder: file name + usage count, a recommended ChatGPT regeneration prompt for the *archetype itself* (use this if you just want to refresh the file), the cases currently mapped to it (with chief complaint), and a flag for cases where the archetype does not fit the case's clinical picture.

### `home-medical-male-dubai-apartment.png` (20 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Middle-aged Middle Eastern man (45-65), seated on a sofa in a contemporary Dubai apartment living room — beige walls, large window with high-rise skyline visible in soft evening light, modern furniture. Distressed expression, pale, diaphoretic. Photorealistic, no on-image text or watermarks. **[Insert posture detail from §1 per case — this archetype should ONLY be reused for cardiac chest pain, arrhythmia, syncope or sepsis. Do not reuse for COPD, abdo pain, or stroke — generate per-case for those.]**

**Cases that fit this archetype (15):**

- `cardiac-001` (45M) — Severe chest pain, patient called 998 himself
- `cardiac-004` (52M) — Severe headache, vision changes
- `cardiac-008` (72M) — Chest pain, shortness of breath
- `cardiac-012` (79M) — Very dizzy, weak, tired for 2 days
- `cardiac-015` (72M) — Neighbour reports elderly male confused and unresponsive in chair
- `cardiac-ecg-001` (62M) — Severe epigastric pain, vomiting, diaphoresis
- `litfl-003` (64M) — Male, 64, difficulty breathing, very weak, dialysis patient
- `mci-13` (34M) — 
- `metab-001` (58M) — Father confused and sweating, not responding properly
- `metab-003` (58M) — Weakness, palpitations, known kidney disease
- `postd-001` (52M) — Surgical wound red and draining pus, fever
- `resp-011` (65M) — Fever and cough for 3 days, now very short of breath
- `ruleout-001` (38M) — Chest pain, worried it might be heart attack
- `y1-003` (45M) — 45-year-old diabetic feeling
- `y2-002` (55M) — 55-year-old male with chest pain

**POSTURE MISMATCH — these cases need a per-case image (5):**

- `neuro-003` (25M) — Fever, severe headache, neck stiffness — needs **Meningitis** posture instead
- `resp-005` (72M) — Elderly man struggling to breathe, known COPD — needs **COPD exacerbation** posture instead
- `trauma-006` (26M) — Multiple GSW victims, one with chest wounds — needs **Major / multi-trauma (RTC, GSW, stab)** posture instead
- `y2-003` (67M) — 67-year-old male slurred speech, weak arm — needs **Acute stroke / TIA** posture instead
- `y2-006` (62M) — 62-year-old male, episode of facial droop and slurred speech, now resolved — needs **Acute stroke / TIA** posture instead

### `office-medical-dubai.png` (10 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Patient in business attire (shirt and trousers with loosened tie, or modest work dress) at a glass desk in a modern Dubai high-rise office. Floor-to-ceiling windows showing skyline in soft morning sun. Laptop and coffee mug on desk, papers scattered. One concerned colleague approaching from behind frame. Photorealistic, no on-image text or watermarks. **[Insert posture detail.]**

**Cases that fit this archetype (6):**

- `cardiac-003` (58F) — Palpitations and dizziness
- `cardiac-007` (58M) — Severe chest pain, sweating, vomiting
- `cardiac-ecg-002` (48M) — Chest pain, now pain-free but feeling unwell
- `general-001` (29F) — Employee fainted at work, now awake but confused
- `litfl-019` (51M) — Male, 51, crushing chest pain for 30 minutes, diaphoretic
- `y1-013` (45M) — 45-year-old male, heart racing, anxious

**POSTURE MISMATCH — these cases need a per-case image (4):**

- `neuro-001` (67M) — Husband suddenly cannot speak or move right side — needs **Acute stroke / TIA** posture instead
- `resp-009` (45M) — Man choking on food, cannot breathe — needs **Choking / foreign body aspiration** posture instead
- `trauma-004` (32M) — Stabbing to chest, patient unresponsive — needs **Major / multi-trauma (RTC, GSW, stab)** posture instead
- `y1-002` (25M) — 25-year-old male with abdominal pain — needs **Acute abdominal pain** posture instead

### `home-medical-female-dubai-apartment.png` (8 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Adult Middle Eastern woman (30-55) in modest abaya and shayla, seated on a sofa in a contemporary Dubai apartment living room — beige walls, large window with high-rise skyline visible, modern furniture. Distressed expression, pale. Photorealistic, no on-image text or watermarks. **[Insert posture detail.]**

**Cases that fit this archetype (5):**

- `cardiac-006` (28F) — Heart racing, feels like going to pass out
- `cardiac-010` (42F) — Passed out, woke up confused
- `cardiac-017` (0F) — Parents report 8-month-old baby
- `metab-002` (24F) — Vomiting, abdominal pain, breathing fast
- `psych-001` (34F) — Wife having panic attack, cannot breathe, chest pain

**POSTURE MISMATCH — these cases need a per-case image (3):**

- `litfl-007` (42F) — Female, 42, sudden severe breathing difficulty and chest pain after long flight — needs **Pulmonary embolism** posture instead
- `resp-004` (42F) — Sudden shortness of breath, chest pain — needs **Pulmonary embolism** posture instead
- `trauma-012` (4F) — Child pulled from swimming pool, not breathing — needs **Cardiac arrest (any rhythm)** posture instead

### `construction-fall-male-29-dubaihills.png` (8 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. South Asian male construction worker (25-45) in hi-vis vest, hard hat to one side, work boots, on the ground at an active Dubai construction site. Scaffolding, concrete dust, partially built tower visible. Co-worker kneeling beside in matching workwear. Bright afternoon sun, dust haze. Photorealistic, no on-image text or watermarks. **[Vary posture per case: head injury vs heat illness vs anaphylaxis vs pneumothorax after fall.]**

**Cases that fit this archetype (3):**

- `env-001` (35M) — Worker dizzy and nauseated at construction site
- `trauma-002` (35M) — Fall from height, head injury, unconscious
- `trauma-009` (29M) — Fall from height, unconscious

**POSTURE MISMATCH — these cases need a per-case image (5):**

- `env-002` (35M) — Construction worker collapsed at site, very hot, confused — needs **Acute stroke / TIA** posture instead
- `litfl-001` (58M) — Male, 58, severe chest pain radiating to jaw, feeling faint — needs **Cardiac chest pain (STEMI, NSTEMI, ACS, angina)** posture instead
- `resp-002` (34M) — Sudden chest pain, difficulty breathing after fall — needs **Pneumothorax (spontaneous or traumatic)** posture instead
- `resp-006` (34M) — Man fell from ladder, chest pain, difficulty breathing — needs **Pneumothorax (spontaneous or traumatic)** posture instead
- `resp-010` (45M) — 45-year-old male collapsed on construction site after bee sting, severe breathing difficul — needs **Anaphylaxis** posture instead

### `cardiac-arrest-mall-male-dubai.png` (7 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Adult male supine on polished marble floor in a Dubai shopping mall food court. Bystander performing chest compressions with arms locked straight, AED case open beside, two pads visible on bare chest. Mall security keeping crowd back at edge of frame. Photorealistic, fluorescent overhead lighting, no on-image text or watermarks.

**Cases that fit this archetype (7):**

- `burn-002` (35M) — Electrician shocked, unconscious, not breathing
- `cardiac-002` (62M) — Husband not breathing, wife found him unconscious in bed
- `cardiac-013` (48M) — Male collapsed at gym, bystander CPR in progress, AED has shocked twice — still in cardiac
- `cardiac-014` (8M) — Child pulled from swimming pool, not breathing, no pulse — bystander CPR attempted then st
- `tox-002` (32M) — Found unconscious, not breathing properly, needle nearby
- `y1-014` (55M) — 55-year-old male collapsed in shopping mall food court, bystander CPR in progress
- `y2-009` (62M) — 62-year-old male collapsed at work, not breathing

### `road-traffic-male-dubai.png` (6 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Adult South Asian male in delivery-driver attire, supine on hot asphalt at the side of Sheikh Zayed Road. Motorcycle on its side a few metres away, car with front-end damage further back, palm trees on the verge. Blood on face and one deformed leg. Bright afternoon sun, asphalt heat shimmer. Photorealistic, no on-image text or watermarks. **[Vary posture per case.]**

**Cases that fit this archetype (4):**

- `trauma-001` (28M) — Motorcycle accident, rider on ground not moving
- `trauma-003` (30M) — Stab wound to chest, bleeding heavily
- `y1-010` (14M) — 14-year-old fell off bicycle, wrist injury
- `y1-011` (30M) — 30-year-old male, rear-ended at low speed, complaining of neck pain

**POSTURE MISMATCH — these cases need a per-case image (2):**

- `trauma-005` (28M) — MVC - driver trapped, chest injury, difficulty breathing — needs **Pneumothorax (spontaneous or traumatic)** posture instead
- `trauma-007` (35M) — MVC - driver complaining of abdominal pain — needs **Acute abdominal pain** posture instead

### `elderly-fall-bathroom-female-uae.png` (5 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Elderly Middle Eastern woman (75-85) in modest nightgown, on the floor of a UAE bathroom, left leg externally rotated and shortened (hip fracture). Bunched rug visible nearby, walking stick fallen. Pale and in pain. Adult daughter kneeling beside. Photorealistic, warm morning light through frosted window, no on-image text or watermarks.

**Cases that fit this archetype (1):**

- `y1-001` (78F) — 78-year-old female fallen, unable to get up

**POSTURE MISMATCH — these cases need a per-case image (4):**

- `cardiac-009` (76F) — Heart racing, feeling weak — needs **Arrhythmia (SVT, AF, bradycardia, heart block)** posture instead
- `fall-001` (78F) — Mother fell in bathroom, cannot get up, leg looks wrong — needs **Minor trauma** posture instead
- `litfl-010` (82F) — Elderly person found unresponsive on balcony, very cold — needs **Hypothermia** posture instead
- `resp-008` (78F) — Elderly woman severely short of breath, frothy sputum — needs **Pulmonary oedema / decompensated heart failure** posture instead

### `seizure-bedroom-female-uae.png` (5 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Adult Middle Eastern female on side (recovery position) on a bedroom bed or floor in a UAE villa, post-ictal — limp, drooling slightly, eyes half-closed, blood at corner of mouth from bitten tongue. Bedside lamp on. Anxious family member kneeling beside. Photorealistic, warm evening light, no on-image text or watermarks.

**Cases that fit this archetype (5):**

- `neuro-002` (22F) — Daughter having a seizure, just stopped
- `obs-002` (28F) — Pregnant woman having a seizure, 34 weeks pregnant
- `ped-001` (3F) — Child having seizure, very hot, mother screaming
- `ped-002` (2M) — 2-year-old having a seizure, fever
- `y1-005` (3F) — 3-year-old child had a seizure, now stopped

### `home-pediatric-uae-family.png` (4 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Small child (1-5 years) in pyjamas, on parent's lap in a UAE family living room. Mother's hands supporting torso. Toys visible on rug. Warm domestic lighting. Photorealistic, no on-image text or watermarks. **[Vary posture per case — croup child sits upright; ingestion child cries and drools; febrile seizure child on side recovery position.]**

**Cases that fit this archetype (3):**

- `resp-007` (2M) — 2-year-old with barking cough, difficulty breathing
- `y1-007` (2M) — 2-year-old with barking cough and noisy breathing
- `y1-009` (3M) — 3-year-old found with open bottle of household cleaner, drooling and crying

**POSTURE MISMATCH — these cases need a per-case image (1):**

- `multi-001` (0M) — Bus vs car collision, multiple injuries, road blocked, MCI declared — needs **Mass casualty incident** posture instead

### `psychiatric-apartment-safety-uae.png` (4 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Adult male (20s-30s), disheveled, pacing in a UAE apartment living room with overturned furniture, broken glass on the floor. Wide suspicious eyes, sweaty brow, clenched fists. Concerned family member visible at the doorway. Police officer in frame for scene safety. Photorealistic, evening interior light, no on-image text or watermarks.

**Cases that fit this archetype (3):**

- `psych-002` (24M) — Son behaving erratically, breaking things, threatening family
- `psych-003` (26M) — Man acting strangely, hearing voices, family concerned
- `y2-008` (28M) — 28-year-old male, bizarre behaviour, aggressive, talking to unseen people

**POSTURE MISMATCH — these cases need a per-case image (1):**

- `y1-008` (22F) — 22-year-old female, difficulty breathing, thinks she is having a heart attack — needs **Panic attack** posture instead

### `industrial-workshop-male-uae.png` (3 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. South Asian male factory worker (25-45) in work overalls and safety boots, on a workshop floor. Industrial machinery in background — lathe, conveyor or panel. Co-workers in matching PPE assisting. Fluorescent overhead lighting, dust in air. Photorealistic, no on-image text or watermarks. **[Vary injury per case: burn, amputation, electrical.]**

**Cases that fit this archetype (3):**

- `burn-001` (42M) — Factory fire, multiple people trapped, one with severe burns
- `trauma-011` (30M) — Hand caught in machine, hand severed, heavy bleeding
- `y2-004` (35M) — 35-year-old male, flash burn to face and chest from welding accident

### `asthma-villa-male-uae.png` (3 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Young adult male (18-30) sitting on edge of a bed in a UAE villa bedroom, tripod position: leaning forward, arms braced on knees, shoulders elevated. Pursed-lip breathing, accessory neck muscles prominent. Inhaler in hand or on bedside table, spacer device beside. Carpet visible. Photorealistic, evening interior light, no on-image text or watermarks.

**Cases that fit this archetype (2):**

- `resp-001` (19M) — Son cannot breathe, using inhaler repeatedly
- `y2-001` (22F) — 22-year-old female with asthma attack, difficulty breathing

**POSTURE MISMATCH — these cases need a per-case image (1):**

- `cardiac-011` (68M) — Cannot breathe, asthma attack — needs **Pulmonary oedema / decompensated heart failure** posture instead

### `campus-student-uae.png` (3 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Young adult (18-25), modest clothing, in a UAE university library, dorm room or campus medical room. Books, desk lamp, modern educational interior. Photorealistic, warm interior light, no on-image text or watermarks. **[Vary posture per case.]**

**Cases that fit this archetype (3):**

- `neuro-004` (20F) — Severe headache, fever, stiff neck, confused
- `y1-012` (18M) — 18-year-old male, difficulty breathing, tingling, dizzy
- `y2-007` (19F) — 19-year-old female, taken overdose of paracetamol tablets

### `obstetric-home-female-uae.png` (3 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Pregnant Middle Eastern woman (third trimester, visibly gravid) in modest abaya, on a bed in a UAE home bedroom with towels laid out. Knees drawn up or on left side. Sweating, focused expression. Female family member supporting. Photorealistic, warm morning light, no on-image text or watermarks. **[Vary per case: imminent delivery vs haemorrhage vs eclampsia vs ectopic.]**

**Cases that fit this archetype (3):**

- `obs-001` (28F) — Pregnant woman, heavy vaginal bleeding, 34 weeks pregnant
- `y1-006` (28F) — 28-year-old female, 39 weeks pregnant, contractions very close together, feels need to pus
- `y2-005` (26F) — 26-year-old female with sudden severe lower abdominal pain

### `mall-foodcourt-chestpain-male-65.png` (2 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Elderly Middle Eastern man (60-70) seated at a table in a Dubai shopping mall food court, polished marble floor, brand-name signage subtle. Fist clenched on centre of chest (Levine sign), pale, diaphoretic, grimacing. Tray of unfinished food in front, concerned bystander next to him. Photorealistic, fluorescent lighting, no on-image text or watermarks.

**Cases that fit this archetype (1):**

- `cardiac-005` (65M) — Chest pain, not severe

**POSTURE MISMATCH — these cases need a per-case image (1):**

- `litfl-012` (35M) — Male, 35, found collapsed at home, unresponsive — needs **Acute stroke / TIA** posture instead

### `public-restaurant-female-uae.png` (2 cases)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Adult female in modest restaurant attire, at a table in an upscale Dubai restaurant. Ambient warm lighting, other diners blurred in background. Photorealistic, no on-image text or watermarks. **[Vary posture per case: anaphylaxis = swollen face + hands at throat; choking = both hands at throat (universal sign); syncope = collapsed in seat.]**

**Cases that fit this archetype (2):**

- `cardiac-016` (68F) — Collapse in shopping centre, brief loss of consciousness, now conscious
- `y1-015` (32F) — 32-year-old female difficulty breathing after eating at restaurant, swollen face

### `home-copd-male-68-sharjah.png` (1 case)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Elderly Middle Eastern man (65-75) seated in an armchair in a Sharjah apartment living room, tripod position with arms on armrests. Nasal cannula in place, portable home oxygen cylinder on the floor beside him. Pursed-lip breathing, cyanotic lips, barrel chest visible. Inhalers and tissues on side table. Photorealistic, warm afternoon light, no on-image text or watermarks.

**Cases that fit this archetype (1):**

- `resp-003` (68M) — Increased breathlessness, using oxygen at home

### `farm-toxicology-male-35-alawir.png` (1 case)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. South Asian male farm worker (25-45) on the ground at a UAE agricultural farm in Al Awir, dusty soil, pesticide spraying equipment visible nearby. Drooling, pinpoint pupils, profuse sweating, urinary incontinence (wet patch). Co-worker calling for help. Bright morning sun, dust in air. Photorealistic, no on-image text or watermarks.

**Cases that fit this archetype (1):**

- `tox-001` (35M) — Worker collapsed after spraying pesticides, difficult breathing, vomiting

### `pedestrian-road-night-female-45.png` (1 case)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Adult European tourist female (40-50) supine in the kerbside lane of a Dubai road at night. Left leg shortened and externally rotated at the hip. Pale and diaphoretic. Sodium street lamp casting orange light overhead, dry asphalt, palm trees visible. Photorealistic, no on-image text or watermarks.

**Cases that fit this archetype (1):**

- `trauma-008` (45F) — Pedestrian struck by car, pelvic pain

### `water-beach-drowning-dubai.png` (1 case)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Patient supine on a Dubai pool deck or beach, wet swimsuit/clothing, towels nearby. Pale, cyanotic lips, eyes closed. Lifeguard or family member kneeling beside. Bright sun and water visible behind. Photorealistic, no on-image text or watermarks.

**Cases that fit this archetype (1):**

- `trauma-010` (22M) — Diving accident, cannot move arms or legs

### `kitchen-scald-burn-female-uae.png` (1 case)

**Recommended ChatGPT regeneration prompt for this archetype:**

> Photoreal medical training scene, 16:9. Adult female in casual clothing, in a UAE residential kitchen near the sink. Holding burned arm distinctly away from body, erythema and early blistering visible on forearm. Boiling pot or kettle on stove visible in background, water spilled. Tearful, distressed expression. Cool tap water running over arm. Photorealistic, warm evening light, no on-image text or watermarks.

**Cases that fit this archetype (1):**

- `y1-004` (25F) — 25-year-old female, boiling water spill on arm

## 3. Per-case detail (alphabetical by ID)

Every active case in the bank gets one block. Copy the prompt as-is into ChatGPT, save the output as `<case-id>.png` in `/public/scene-assets/`, and add an `ID_OVERRIDES` entry per §6.

### `burn-001` — Burns - Industrial Fire with Inhalation Injury

- **Patient:** 42-year-old male, Factory worker, Hindi, Arabic, English
- **Setting:** Industrial area in Jebel Ali, Dubai, afternoon
- **Chief complaint:** Factory fire, multiple people trapped, one with severe burns
- **Posture class:** Burns (thermal, scald, flash)
- **Generated asset:** `burn-001-jebel-ali-industrial-fire-burns.png`
- **Previous fallback:** `industrial-workshop-male-uae.png`
- **Case-file posture note:** Sitting on ground outside building
- **Case-file appearance note:** Burns to face/neck/chest/arms, soot marks around nose/mouth

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (42 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a UAE industrial workshop — machinery, fluorescent lighting, concrete floor, bright midday light. **Posture:** Sitting or standing, holding injured limb away from body. **Hands:** Injured area held distinctly away from torso. **Face:** Tearful, pale, in obvious pain; soot around nose/mouth if inhalation injury. **Scene detail:** Visible erythema/blistering, cool water or wet cloth applied, source of burn visible. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `burn-002` — Electrical Burn with Cardiac Arrest

- **Patient:** 35-year-old male, Electrician, English
- **Setting:** Commercial building, Business Bay, morning
- **Chief complaint:** Electrician shocked, unconscious, not breathing
- **Posture class:** Cardiac arrest (any rhythm)
- **Currently shows:** `cardiac-arrest-mall-male-dubai.png`
- **Case-file posture note:** Supine
- **Case-file appearance note:** Pale, burn marks on hands

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (35 years old) Middle Eastern or South Asian expat male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, warm morning light. **Posture:** Supine on the ground or floor, motionless. **Hands:** Arms loose at sides, palms up or thrown out; chest exposed for CPR. **Face:** Cyanotic lips, slack jaw, eyes half-open and unfocused or closed. **Scene detail:** Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-001` — Acute Anterior STEMI

- **Patient:** 45-year-old male, Business executive, English, Arabic
- **Setting:** Private villa in Al Barsha, Dubai, morning
- **Chief complaint:** Severe chest pain, patient called 998 himself
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting upright, leaning forward
- **Case-file appearance note:** Pale, sweaty, distressed

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (45 years old) Middle Eastern (Emirati or wider Arab) male, business shirt and trousers, tie loosened, in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, warm morning light. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-002` — Out-of-Hospital Cardiac Arrest

- **Patient:** 62-year-old male, Retired engineer, Arabic
- **Setting:** Apartment in Deira, Dubai, early-morning
- **Chief complaint:** Husband not breathing, wife found him unconscious in bed
- **Posture class:** Cardiac arrest (any rhythm)
- **Currently shows:** `cardiac-arrest-mall-male-dubai.png`
- **Case-file posture note:** Supine
- **Case-file appearance note:** Cyanotic around lips, no visible breathing

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (62 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, soft early-morning light, sun low. **Posture:** Supine on the ground or floor, motionless. **Hands:** Arms loose at sides, palms up or thrown out; chest exposed for CPR. **Face:** Cyanotic lips, slack jaw, eyes half-open and unfocused or closed. **Scene detail:** Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-003` — Atrial Fibrillation with Rapid Ventricular Response

- **Patient:** 58-year-old female, Accountant, English
- **Setting:** Office in Downtown Dubai, afternoon
- **Chief complaint:** Palpitations and dizziness
- **Posture class:** Arrhythmia (SVT, AF, bradycardia, heart block)
- **Currently shows:** `office-medical-dubai.png`
- **Case-file posture note:** Sitting
- **Case-file appearance note:** Pale, anxious

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (58 years old) Middle Eastern or South Asian expat female, modest western dress, in a modern Dubai high-rise office — glass desk, city skyline through floor-to-ceiling windows, bright midday light. **Posture:** Sitting, sometimes anxious, hand on chest. **Hands:** One hand on chest (feeling palpitations), other on lap. **Face:** Anxious, pale, may be diaphoretic; alert. **Scene detail:** BP cuff/monitor nearby. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-004` — Hypertensive Emergency

- **Patient:** 52-year-old male, CEO, English
- **Setting:** Villa in Jumeirah, Dubai, evening
- **Chief complaint:** Severe headache, vision changes
- **Posture class:** Hypertensive emergency
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting
- **Case-file appearance note:** Flushed, diaphoretic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (52 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, warm evening light, after-dark with warm interior lamps. **Posture:** Sitting, may be flushed; severe headache. **Hands:** Hand to temple/forehead (headache), other on chest. **Face:** Flushed, diaphoretic, eyes squinted/closed (light sensitivity), nosebleed possible. **Scene detail:** BP monitor showing very high reading, may be vomiting (raised ICP). Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-005` — Stable Angina - Exertional Chest Pain

- **Patient:** 65-year-old male, Retired teacher, English, Arabic
- **Setting:** Shopping mall in Dubai, afternoon
- **Chief complaint:** Chest pain, not severe
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `mall-foodcourt-chestpain-male-65.png`
- **Case-file posture note:** Sitting upright
- **Case-file appearance note:** No distress, calm

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (65 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a Dubai shopping mall food court — polished marble floor, brand-name signage subtle in background, ambient music, bright midday light. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-006` — Supraventricular Tachycardia (SVT) - Young Adult

- **Patient:** 28-year-old female, Marketing executive, English, Hindi
- **Setting:** Apartment in Dubai Marina, evening
- **Chief complaint:** Heart racing, feels like going to pass out
- **Posture class:** Arrhythmia (SVT, AF, bradycardia, heart block)
- **Currently shows:** `home-medical-female-dubai-apartment.png`
- **Case-file posture note:** Sitting up, leaning forward
- **Case-file appearance note:** Mildly diaphoretic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (28 years old) South Asian (Indian, Pakistani or Bangladeshi) female, modest salwar kameez or western office wear, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Sitting, sometimes anxious, hand on chest. **Hands:** One hand on chest (feeling palpitations), other on lap. **Face:** Anxious, pale, may be diaphoretic; alert. **Scene detail:** BP cuff/monitor nearby. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-007` — Acute Inferior STEMI with Right Ventricular Involvement

- **Patient:** 58-year-old male, Business traveler, Russian, limited English
- **Setting:** Hotel room in Downtown Dubai, early-morning
- **Chief complaint:** Severe chest pain, sweating, vomiting
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `office-medical-dubai.png`
- **Case-file posture note:** Lying in bed, clutching chest
- **Case-file appearance note:** Pale, diaphoretic, nauseated

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (58 years old) Eastern European (Russian) tourist male, business shirt and trousers, tie loosened, in a upscale Dubai hotel room — beige carpet, blackout curtains, king bed, city view through window, soft early-morning light, sun low. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-008` — Chest Pain with Known LBBB - Possible Occlusion MI

- **Patient:** 72-year-old male, Retired engineer, Arabic, limited English
- **Setting:** Apartment in Sharjah, evening
- **Chief complaint:** Chest pain, shortness of breath
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting forward in armchair
- **Case-file appearance note:** Anxious, diaphoretic, using accessory muscles

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (72 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-009` — Atrial Flutter with 2:1 Block - Elderly Patient   **MISMATCH**

- **Patient:** 76-year-old female, Retired nurse, English
- **Setting:** Retirement home in Dubai, morning
- **Chief complaint:** Heart racing, feeling weak
- **Posture class:** Arrhythmia (SVT, AF, bradycardia, heart block)
- **Currently shows:** `elderly-fall-bathroom-female-uae.png` (mismatch)
- **Case-file posture note:** Semi-reclined in bed
- **Case-file appearance note:** Comfortable, not in acute distress

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (76 years old) Middle Eastern or South Asian expat female, modest western dress, in a UAE clinical setting — medical bed, monitors, fluorescent lighting, warm morning light. **Posture:** Sitting, sometimes anxious, hand on chest. **Hands:** One hand on chest (feeling palpitations), other on lap. **Face:** Anxious, pale, may be diaphoretic; alert. **Scene detail:** BP cuff/monitor nearby. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-010` — Syncope - Rule Out Cardiac Cause

- **Patient:** 42-year-old female, Accountant, English
- **Setting:** Supermarket in Dubai, afternoon
- **Chief complaint:** Passed out, woke up confused
- **Posture class:** Syncope / faint
- **Currently shows:** `home-medical-female-dubai-apartment.png`
- **Case-file posture note:** Seated
- **Case-file appearance note:** Recovered, alert

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (42 years old) Middle Eastern or South Asian expat female, modest western dress, in a UAE indoor setting matching the scene description, bright midday light. **Posture:** Seated with legs elevated, OR supine post-faint, recovering. **Hands:** Hand to forehead, looking dazed. **Face:** Pale, slightly diaphoretic, beginning to recover colour; confused-but-alert. **Scene detail:** Bystander or colleague supporting, water glass nearby. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-011` — Acute Decompensated Heart Failure -    **MISMATCH**

- **Patient:** 68-year-old male, Retired, Arabic
- **Setting:** Apartment in Al Ain, evening
- **Chief complaint:** Cannot breathe, asthma attack
- **Posture class:** Pulmonary oedema / decompensated heart failure
- **Currently shows:** `asthma-villa-male-uae.png` (mismatch)
- **Case-file posture note:** Tripod position, sitting forward
- **Case-file appearance note:** Diaphoretic, cyanotic lips, using accessory muscles

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (68 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Sitting bolt upright on edge of bed/sofa, legs dangling — absolutely cannot lie flat. **Hands:** Both hands gripping edge of bed/mattress to prop body up. **Face:** Distressed, cyanotic lips, pink frothy sputum at corners of mouth. **Scene detail:** Open-mouth breathing, accessory muscle use in neck, pillow pushed away. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-012` — Possible Pacemaker Malfunction - Dizziness and Fatigue

- **Patient:** 79-year-old male, Retired, English
- **Setting:** Rehabilitation center in Dubai, afternoon
- **Chief complaint:** Very dizzy, weak, tired for 2 days
- **Posture class:** Arrhythmia (SVT, AF, bradycardia, heart block)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Lying in bed
- **Case-file appearance note:** Pale but not in acute distress

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (79 years old) Middle Eastern or South Asian expat male, smart casual clothing (shirt and trousers), in a UAE clinical setting — medical bed, monitors, fluorescent lighting, bright midday light. **Posture:** Sitting, sometimes anxious, hand on chest. **Hands:** One hand on chest (feeling palpitations), other on lap. **Face:** Anxious, pale, may be diaphoretic; alert. **Scene detail:** BP cuff/monitor nearby. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-013` — Refractory VF Cardiac Arrest

- **Patient:** 48-year-old male, Construction project manager, English
- **Setting:** FitLife Gym, Al Quoz Industrial Area, Dubai, evening
- **Chief complaint:** Male collapsed at gym, bystander CPR in progress, AED has shocked twice — still in cardiac
- **Posture class:** Cardiac arrest (any rhythm)
- **Currently shows:** `cardiac-arrest-mall-male-dubai.png`
- **Case-file posture note:** Supine on gym floor
- **Case-file appearance note:** Cyanotic, diaphoretic, no signs of life

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (48 years old) Middle Eastern or South Asian expat male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a Dubai commercial gym — rubber flooring, weights racks, squat rack, fluorescent lighting, warm evening light, after-dark with warm interior lamps. **Posture:** Supine on the ground or floor, motionless. **Hands:** Arms loose at sides, palms up or thrown out; chest exposed for CPR. **Face:** Cyanotic lips, slack jaw, eyes half-open and unfocused or closed. **Scene detail:** Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-014` — Hypothermic Drowning - Cardiac Arrest

- **Patient:** 8-year-old male, School student (tourist), English, Arabic
- **Setting:** Grand Palms Hotel, Jumeirah Beach Road, Dubai, morning
- **Chief complaint:** Child pulled from swimming pool, not breathing, no pulse — bystander CPR attempted then st
- **Posture class:** Cardiac arrest (any rhythm)
- **Currently shows:** `cardiac-arrest-mall-male-dubai.png`
- **Case-file posture note:** Supine on pool deck
- **Case-file appearance note:** Pale/grey, cyanotic lips, cold and wet, motionless

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 8-year-old child Middle Eastern (Emirati or wider Arab) boy, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a UAE outdoor poolside — hotel pool deck or villa pool, bright sun, palm trees, wet pool tiles, towels, warm morning light. **Posture:** Supine on the ground or floor, motionless. **Hands:** Arms loose at sides, palms up or thrown out; chest exposed for CPR. **Face:** Cyanotic lips, slack jaw, eyes half-open and unfocused or closed. **Scene detail:** Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-015` — Symptomatic Bradycardia — Medication Induced

- **Patient:** 72-year-old male, Retired teacher, English
- **Setting:** Ground floor flat, residential area, afternoon
- **Chief complaint:** Neighbour reports elderly male confused and unresponsive in chair
- **Posture class:** Arrhythmia (SVT, AF, bradycardia, heart block)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting in armchair, slumped to one side
- **Case-file appearance note:** Pale, cool skin, appears confused and lethargic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (72 years old) Middle Eastern or South Asian expat male, smart casual clothing (shirt and trousers), in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, bright midday light. **Posture:** Sitting, sometimes anxious, hand on chest. **Hands:** One hand on chest (feeling palpitations), other on lap. **Face:** Anxious, pale, may be diaphoretic; alert. **Scene detail:** BP cuff/monitor nearby. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-016` — Complete Heart Block — Syncope

- **Patient:** 68-year-old female, Retired nurse, English
- **Setting:** Shopping centre food court, midday
- **Chief complaint:** Collapse in shopping centre, brief loss of consciousness, now conscious
- **Posture class:** Syncope / faint
- **Currently shows:** `public-restaurant-female-uae.png`
- **Case-file posture note:** Supine on floor, coat under head as pillow
- **Case-file appearance note:** Pale, diaphoretic, anxious expression

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (68 years old) Middle Eastern or South Asian expat female, modest western dress, in a Dubai shopping mall food court — polished marble floor, brand-name signage subtle in background, ambient music, bright midday light. **Posture:** Seated with legs elevated, OR supine post-faint, recovering. **Hands:** Hand to forehead, looking dazed. **Face:** Pale, slightly diaphoretic, beginning to recover colour; confused-but-alert. **Scene detail:** Bystander or colleague supporting, water glass nearby. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-017` — Paediatric Bradycardia — Infant with Poor Perfusion

- **Patient:** 0-year-old female, Parents speak English
- **Setting:** Family home, first floor apartment, night
- **Chief complaint:** Parents report 8-month-old baby
- **Posture class:** Sepsis / wound infection
- **Currently shows:** `home-medical-female-dubai-apartment.png`
- **Case-file posture note:** Held by mother, head unsupported and lolling
- **Case-file appearance note:** Mottled skin, central cyanosis, lethargic, grunting respirations

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. infant (under 1 year) Middle Eastern or South Asian expat girl, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, night-time, low interior light or sodium street lamps. **Posture:** Lying down weak, lethargic; flushed if hot, mottled if cold sepsis. **Hands:** Loose at sides. **Face:** Flushed (febrile) or mottled, glassy eyes, drowsy. **Scene detail:** Recent surgical wound visible with redness/pus, thermometer/medication on bedside. Anxious parent visible in frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-ecg-001` — Acute Inferior STEMI with Right Ventricular Infarction

- **Patient:** 62-year-old male, Retired teacher, Arabic, English
- **Setting:** Apartment in Bur Dubai, early-morning
- **Chief complaint:** Severe epigastric pain, vomiting, diaphoresis
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting, leaning forward
- **Case-file appearance note:** Pale, diaphoretic, looks unwell

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (62 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, soft early-morning light, sun low. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `cardiac-ecg-002` — Wellens Syndrome - Critical LAD Stenosis

- **Patient:** 48-year-old male, Accountant, English
- **Setting:** Office in Business Bay, Dubai, morning
- **Chief complaint:** Chest pain, now pain-free but feeling unwell
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `office-medical-dubai.png`
- **Case-file posture note:** Sitting
- **Case-file appearance note:** Well, no distress

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (48 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a modern Dubai high-rise office — glass desk, city skyline through floor-to-ceiling windows, warm morning light. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `env-001` — Heat Exhaustion

- **Patient:** 35-year-old male, Construction worker, Hindi, Basic English
- **Setting:** Construction site in Dubai, afternoon
- **Chief complaint:** Worker dizzy and nauseated at construction site
- **Posture class:** Heat exhaustion / heat stroke
- **Currently shows:** `construction-fall-male-29-dubaihills.png`
- **Case-file posture note:** Sitting in shade
- **Case-file appearance note:** Pale, profuse sweating, fatigued

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (35 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, bright midday light. **Posture:** Slumped/supine in shade, semi-conscious (heat stroke) or seated sweating (exhaustion). **Hands:** Loose at sides; may be holding water bottle. **Face:** Heat stroke: flushed, dry, hot skin, altered mental state. Exhaustion: pale, profuse sweat. **Scene detail:** Outdoor sun, construction PPE (hi-vis vest, hard hat off), colleague trying to cool with damp cloth. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `env-002` — Heat Stroke with Altered Consciousness   **MISMATCH**

- **Patient:** 35-year-old male, Construction worker, Hindi
- **Setting:** Construction site, Jebel Ali, afternoon
- **Chief complaint:** Construction worker collapsed at site, very hot, confused
- **Posture class:** Acute stroke / TIA
- **Generated asset:** `env-002-heat-stroke-jebel-ali.png`
- **Previous fallback:** `construction-fall-male-29-dubaihills.png`
- **Case-file posture note:** Semi-conscious, restless
- **Case-file appearance note:** Flushed, dry hot skin

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (35 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, bright midday light. **Posture:** Sitting or supine; visibly asymmetric posture, slumped to one side. **Hands:** Affected arm hanging flaccid or held weakly, unaffected hand at face. **Face:** Facial droop on one side (mouth corner down, asymmetric smile). **Scene detail:** Frustrated/confused expression, partner or family member supporting them. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `fall-001` — Elderly Fall with Hip Fracture   **MISMATCH**

- **Patient:** 78-year-old female, Retired, Arabic
- **Setting:** Apartment in Sharjah, morning
- **Chief complaint:** Mother fell in bathroom, cannot get up, leg looks wrong
- **Posture class:** Minor trauma
- **Currently shows:** `elderly-fall-bathroom-female-uae.png` (mismatch)
- **Case-file posture note:** Supine, left leg externally rotated and shortened
- **Case-file appearance note:** Pale, in pain

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (78 years old) Middle Eastern (Emirati or wider Arab) female, modest abaya and shayla headscarf, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm morning light. **Posture:** Sitting, alert; protecting injured area. **Hands:** Cradling injured limb with intact hand. **Face:** Pale but composed, may be tearful (child). **Scene detail:** Mechanism visible (bicycle on ground, low-speed car damage), no overt life-threats. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `general-001` — Syncope - First Episode

- **Patient:** 29-year-old female, Architect, English
- **Setting:** Office building in Business Bay, Dubai, morning
- **Chief complaint:** Employee fainted at work, now awake but confused
- **Posture class:** Syncope / faint
- **Currently shows:** `office-medical-dubai.png`
- **Case-file posture note:** Sitting with legs elevated
- **Case-file appearance note:** Pale, slightly diaphoretic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (29 years old) Middle Eastern or South Asian expat female, modest western dress, in a modern Dubai high-rise office — glass desk, city skyline through floor-to-ceiling windows, warm morning light. **Posture:** Seated with legs elevated, OR supine post-faint, recovering. **Hands:** Hand to forehead, looking dazed. **Face:** Pale, slightly diaphoretic, beginning to recover colour; confused-but-alert. **Scene detail:** Bystander or colleague supporting, water glass nearby. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `litfl-001` — Inferior STEMI with Right Ventricular Infarction   **MISMATCH**

- **Patient:** 58-year-old male, Construction project manager, English, Hindi
- **Setting:** Construction site office, Al Quoz Industrial Area, Dubai, morning
- **Chief complaint:** Male, 58, severe chest pain radiating to jaw, feeling faint
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `construction-fall-male-29-dubaihills.png` (mismatch)
- **Case-file posture note:** Supine on floor, legs slightly elevated by colleague
- **Case-file appearance note:** Ashen grey complexion, cold clammy skin, distressed expression

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (58 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, warm morning light. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `litfl-003` — Life-Threatening Hyperkalemia — Renal Failure

- **Patient:** 64-year-old male, Retired teacher, Arabic, English (limited)
- **Setting:** Apartment in Bur Dubai, 7th floor, evening
- **Chief complaint:** Male, 64, difficulty breathing, very weak, dialysis patient
- **Posture class:** Electrolyte emergency (hyperkalaemia, dialysis)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting in armchair, too weak to stand
- **Case-file appearance note:** Pale, mild periorbital edema, bilateral ankle edema, AV fistula left forearm

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (64 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Weak, sitting in armchair, too tired to stand. **Hands:** AV fistula visible on forearm (raised, scarred) for dialysis patients. **Face:** Pale, mild swelling around eyes, lethargic. **Scene detail:** Peritoneal dialysis equipment or visible AV fistula, ankle oedema, multiple medication bottles. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `litfl-007` — Massive Pulmonary Embolism with RV Strain   **MISMATCH**

- **Patient:** 42-year-old female, Marketing executive, English
- **Setting:** Arrivals hall, Dubai International Airport Terminal 3, afternoon
- **Chief complaint:** Female, 42, sudden severe breathing difficulty and chest pain after long flight
- **Posture class:** Pulmonary embolism
- **Currently shows:** `home-medical-female-dubai-apartment.png` (mismatch)
- **Case-file posture note:** Supine on floor, unable to sit up without severe dyspnea
- **Case-file appearance note:** Central cyanosis, diaphoretic, distressed, tachypneic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (42 years old) Middle Eastern or South Asian expat female, modest western dress, in a Dubai International Airport terminal interior — polished floor, baggage carousel, signage, wheelchair, bright midday light. **Posture:** Sitting upright; cannot tolerate lying flat; tachypneic. **Hands:** One hand on lateral chest wall, other gripping seat or knee for support. **Face:** Anxious, cyanotic around lips, eyes wide, mouth open breathing. **Scene detail:** Pale or grey-cyanotic, profuse sweating, may have one swollen calf visible (DVT). Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `litfl-010` — Severe Hypothermia with Osborn Waves   **MISMATCH**

- **Patient:** 82-year-old female, Retired, Arabic
- **Setting:** Apartment in Fujairah, ground floor, early-morning
- **Chief complaint:** Elderly person found unresponsive on balcony, very cold
- **Posture class:** Hypothermia
- **Currently shows:** `elderly-fall-bathroom-female-uae.png` (mismatch)
- **Case-file posture note:** Semi-recumbent in balcony chair
- **Case-file appearance note:** Pale/grey, cold to touch, mild cyanosis, bradycardic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (82 years old) Middle Eastern (Emirati or wider Arab) female, modest abaya and shayla headscarf, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, soft early-morning light, sun low. **Posture:** Curled or semi-recumbent in cool environment, minimally responsive. **Hands:** Pale, mottled, fingertips cyanotic. **Face:** Pale/grey, lips cyanotic, eyes drooping, slow movements. **Scene detail:** Inappropriate clothing for environment, wet clothes if immersion, blanket being applied. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `litfl-012` — Subarachnoid Hemorrhage with Cerebral T Waves   **MISMATCH**

- **Patient:** 35-year-old male, IT engineer, English, Tagalog
- **Setting:** Staff accommodation, Al Nahda, Sharjah, afternoon
- **Chief complaint:** Male, 35, found collapsed at home, unresponsive
- **Posture class:** Acute stroke / TIA
- **Currently shows:** `mall-foodcourt-chestpain-male-65.png` (mismatch)
- **Case-file posture note:** Supine on bathroom floor
- **Case-file appearance note:** Unresponsive, vomitus around mouth, no external trauma visible

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (35 years old) Filipino male, business shirt and trousers, tie loosened, in a shared expat worker accommodation in Sharjah / Al Nahda — bunk beds, shared bathroom, modest furniture, bright midday light. **Posture:** Sitting or supine; visibly asymmetric posture, slumped to one side. **Hands:** Affected arm hanging flaccid or held weakly, unaffected hand at face. **Face:** Facial droop on one side (mouth corner down, asymmetric smile). **Scene detail:** Frustrated/confused expression, partner or family member supporting them. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `litfl-019` — De Winter T-Wave Pattern — LAD Occlusion STEMI Equivalent

- **Patient:** 51-year-old male, Finance director, English, Arabic
- **Setting:** Office building, DIFC, Dubai, morning
- **Chief complaint:** Male, 51, crushing chest pain for 30 minutes, diaphoretic
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `office-medical-dubai.png`
- **Case-file posture note:** Sitting in office chair, leaning forward
- **Case-file appearance note:** Grey, diaphoretic, distressed, nauseated

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (51 years old) Middle Eastern (Emirati or wider Arab) male, business shirt and trousers, tie loosened, in a modern Dubai high-rise office — glass desk, city skyline through floor-to-ceiling windows, warm morning light. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `mci-13` — Untitled

- **Patient:** 34-year-old male, Bus Driver, Hindi, Basic English
- **Setting:** ?
- **Chief complaint:** 
- **Posture class:** Other (see case description)
- **Currently shows:** `home-medical-male-dubai-apartment.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (34 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a UAE indoor setting matching the scene description. **Posture:** Per case description. **Hands:** Per case description. **Face:** Per case description. **Scene detail:** Per case description. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `metab-001` — Severe Hypoglycemia

- **Patient:** 58-year-old male, Accountant, Arabic, English
- **Setting:** Villa in Abu Dhabi, early-morning
- **Chief complaint:** Father confused and sweating, not responding properly
- **Posture class:** Severe hypoglycaemia
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting on floor, leaning against bed
- **Case-file appearance note:** Pale, profuse sweating, trembling

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (58 years old) Middle Eastern (Emirati or wider Arab) male, business shirt and trousers, tie loosened, in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, soft early-morning light, sun low. **Posture:** Often slumped or on floor; sweating profusely. **Hands:** Trembling, may be clammy and cold; glucometer or sugary drink nearby. **Face:** Pale, profuse sweating, confused or combative expression; may be drooling. **Scene detail:** Insulin pen visible, glucose tabs. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `metab-002` — Diabetic Ketoacidosis (DKA)

- **Patient:** 24-year-old female, Student, English
- **Setting:** Apartment in Dubai, afternoon
- **Chief complaint:** Vomiting, abdominal pain, breathing fast
- **Posture class:** Diabetic ketoacidosis
- **Currently shows:** `home-medical-female-dubai-apartment.png`
- **Case-file posture note:** Sitting, leaning forward
- **Case-file appearance note:** Flushed, dry skin, acetone breath odor

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (24 years old) Middle Eastern or South Asian expat female, modest western dress, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, bright midday light. **Posture:** Sitting forward or supine; characteristic deep sighing breaths (Kussmaul). **Hands:** Listless, by sides; insulin pen or glucometer visible nearby. **Face:** Sunken eyes (dehydration), dry cracked lips, flushed cheeks, fruity acetone breath (open mouth). **Scene detail:** Diabetes supplies on side table, dry skin tenting, water bottle. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `metab-003` — Severe Hyperkalemia with ECG Changes

- **Patient:** 58-year-old male, Teacher, Arabic
- **Setting:** Clinic, transferred by ambulance, afternoon
- **Chief complaint:** Weakness, palpitations, known kidney disease
- **Posture class:** Electrolyte emergency (hyperkalaemia, dialysis)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting on examination table
- **Case-file appearance note:** Pale, anxious

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (58 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a UAE clinical setting — medical bed, monitors, fluorescent lighting, bright midday light. **Posture:** Weak, sitting in armchair, too tired to stand. **Hands:** AV fistula visible on forearm (raised, scarred) for dialysis patients. **Face:** Pale, mild swelling around eyes, lethargic. **Scene detail:** Peritoneal dialysis equipment or visible AV fistula, ankle oedema, multiple medication bottles. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `multi-001` — Mass Casualty Incident - Bus vs Car Collision (8 Patients)   **MISMATCH**

- **Patient:** 0-year-old male, N/A - Multiple Patients, Multiple languages
- **Setting:** Sheikh Zayed Road, near Mall of Emirates, Dubai, morning
- **Chief complaint:** Bus vs car collision, multiple injuries, road blocked, MCI declared
- **Posture class:** Mass casualty incident
- **Currently shows:** `home-pediatric-uae-family.png` (mismatch)
- **Case-file posture note:** Various - some ambulatory, some seated, some supine
- **Case-file appearance note:** Variable - from walking wounded to critical trauma

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. infant (under 1 year) Middle Eastern or South Asian expat boy, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a Dubai shopping mall food court — polished marble floor, brand-name signage subtle in background, ambient music, warm morning light. **Posture:** Multiple patients — mixed: walking wounded, seated, supine. **Hands:** Triage tags being applied. **Face:** Various — from shocked to crying to unresponsive. **Scene detail:** Damaged vehicles, debris field, multiple emergency responders in hi-vis, triage tape. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `neuro-001` — Acute Ischemic Stroke - FAST Positive   **MISMATCH**

- **Patient:** 67-year-old male, Retired banker, English
- **Setting:** Apartment in Downtown Dubai, morning
- **Chief complaint:** Husband suddenly cannot speak or move right side
- **Posture class:** Acute stroke / TIA
- **Currently shows:** `office-medical-dubai.png` (mismatch)
- **Case-file posture note:** Sitting, leaning to right
- **Case-file appearance note:** Alert but unable to communicate

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (67 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm morning light. **Posture:** Sitting or supine; visibly asymmetric posture, slumped to one side. **Hands:** Affected arm hanging flaccid or held weakly, unaffected hand at face. **Face:** Facial droop on one side (mouth corner down, asymmetric smile). **Scene detail:** Frustrated/confused expression, partner or family member supporting them. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `neuro-002` — Generalized Tonic-Clonic Seizure

- **Patient:** 22-year-old female, Student, Arabic
- **Setting:** Villa in Al Ain, evening
- **Chief complaint:** Daughter having a seizure, just stopped
- **Posture class:** Generalised seizure (active or post-ictal)
- **Currently shows:** `seizure-bedroom-female-uae.png`
- **Case-file posture note:** Lying on side
- **Case-file appearance note:** Tachypneic, confused, bitten tongue

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (22 years old) Middle Eastern (Emirati or wider Arab) female, modest abaya and shayla headscarf, in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, warm evening light, after-dark with warm interior lamps. **Posture:** Lying on side (recovery position) post-ictally, OR mid-seizure with rigid limbs. **Hands:** During tonic-clonic: rigid then jerking. Post-ictal: limp, often with bitten tongue. **Face:** During: eyes rolled back, jaw clenched, frothing. Post-ictal: drowsy, confused, drooling. **Scene detail:** Family member panicked nearby, may have urinary incontinence (wet patch), bitten tongue with blood at mouth. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `neuro-003` — Meningitis   **MISMATCH**

- **Patient:** 25-year-old male, Marketing executive, English
- **Setting:** Apartment in Dubai Marina, morning
- **Chief complaint:** Fever, severe headache, neck stiffness
- **Posture class:** Meningitis
- **Currently shows:** `home-medical-male-dubai-apartment.png` (mismatch)
- **Case-file posture note:** Lying still
- **Case-file appearance note:** Febrile, distressed, photophobic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (25 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm morning light. **Posture:** Lying still in dim room; refusing to move neck (neck rigidity). **Hands:** One hand shading eyes from any light (photophobia). **Face:** Flushed/febrile, grimacing, may have non-blanching petechial rash on torso/legs. **Scene detail:** Curtains drawn, lights off, sheet pulled up — photophobia is diagnostic visual cue. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `neuro-004` — Bacterial Meningitis

- **Patient:** 20-year-old female, University student, English
- **Setting:** University dorm, Dubai, morning
- **Chief complaint:** Severe headache, fever, stiff neck, confused
- **Posture class:** Meningitis
- **Currently shows:** `campus-student-uae.png`
- **Case-file posture note:** Lying still
- **Case-file appearance note:** Flushed, distressed by light

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (20 years old) Middle Eastern or South Asian expat female, modest western dress, in a UAE university or school interior — modern study area, dorm room, or medical room, warm morning light. **Posture:** Lying still in dim room; refusing to move neck (neck rigidity). **Hands:** One hand shading eyes from any light (photophobia). **Face:** Flushed/febrile, grimacing, may have non-blanching petechial rash on torso/legs. **Scene detail:** Curtains drawn, lights off, sheet pulled up — photophobia is diagnostic visual cue. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `obs-001` — Pregnancy - Third Trimester Bleeding (Placenta Previa)

- **Patient:** 28-year-old female, Teacher, Arabic, English
- **Setting:** Apartment in Al Nahda, Dubai, morning
- **Chief complaint:** Pregnant woman, heavy vaginal bleeding, 34 weeks pregnant
- **Posture class:** Obstetric (haemorrhage, eclampsia, delivery, ectopic)
- **Currently shows:** `obstetric-home-female-uae.png`
- **Case-file posture note:** Lying on left lateral side
- **Case-file appearance note:** Pale, diaphoretic, visible blood on bedding

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (28 years old) Middle Eastern (Emirati or wider Arab) female, modest abaya and shayla headscarf, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm morning light. **Posture:** Semi-recumbent on bed or floor, knees drawn up; OR lying on left side. **Hands:** Both hands cradling gravid abdomen. **Face:** Sweating, focused/bearing down (labour) or pale and anxious (haemorrhage). **Scene detail:** Visible pregnancy (third trimester), towels laid out, female family member supporting. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `obs-002` — Eclamptic Seizure in Pregnancy

- **Patient:** 28-year-old female, Teacher, Arabic
- **Setting:** Villa, Mirdif, morning
- **Chief complaint:** Pregnant woman having a seizure, 34 weeks pregnant
- **Posture class:** Generalised seizure (active or post-ictal)
- **Currently shows:** `seizure-bedroom-female-uae.png`
- **Case-file posture note:** Recovery position
- **Case-file appearance note:** Drowsy, swollen face and hands

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (28 years old) Middle Eastern (Emirati or wider Arab) female, modest abaya and shayla headscarf, in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, warm morning light. **Posture:** Lying on side (recovery position) post-ictally, OR mid-seizure with rigid limbs. **Hands:** During tonic-clonic: rigid then jerking. Post-ictal: limp, often with bitten tongue. **Face:** During: eyes rolled back, jaw clenched, frothing. Post-ictal: drowsy, confused, drooling. **Scene detail:** Family member panicked nearby, may have urinary incontinence (wet patch), bitten tongue with blood at mouth. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `ped-001` — Pediatric - 3-Year-Old with Fever and Seizure

- **Patient:** 3-year-old female, None, Arabic, English
- **Setting:** Villa in Meadows, Dubai, afternoon
- **Chief complaint:** Child having seizure, very hot, mother screaming
- **Posture class:** Generalised seizure (active or post-ictal)
- **Currently shows:** `seizure-bedroom-female-uae.png`
- **Case-file posture note:** Lying on left side (recovery position)
- **Case-file appearance note:** Flushed, hot skin, eyes closed, twitching

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 3-year-old child Middle Eastern (Emirati or wider Arab) girl, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, bright midday light. **Posture:** Lying on side (recovery position) post-ictally, OR mid-seizure with rigid limbs. **Hands:** During tonic-clonic: rigid then jerking. Post-ictal: limp, often with bitten tongue. **Face:** During: eyes rolled back, jaw clenched, frothing. Post-ictal: drowsy, confused, drooling. **Scene detail:** Family member panicked nearby, may have urinary incontinence (wet patch), bitten tongue with blood at mouth. Anxious parent visible in frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `ped-002` — Pediatric Febrile Seizure

- **Patient:** 2-year-old male, N/A, None
- **Setting:** Villa, Arabian Ranches, evening
- **Chief complaint:** 2-year-old having a seizure, fever
- **Posture class:** Generalised seizure (active or post-ictal)
- **Currently shows:** `seizure-bedroom-female-uae.png`
- **Case-file posture note:** Supine on floor
- **Case-file appearance note:** Flushed, eyes rolled back, jerking limbs

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 2-year-old toddler Middle Eastern or South Asian expat boy, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, warm evening light, after-dark with warm interior lamps. **Posture:** Lying on side (recovery position) post-ictally, OR mid-seizure with rigid limbs. **Hands:** During tonic-clonic: rigid then jerking. Post-ictal: limp, often with bitten tongue. **Face:** During: eyes rolled back, jaw clenched, frothing. Post-ictal: drowsy, confused, drooling. **Scene detail:** Family member panicked nearby, may have urinary incontinence (wet patch), bitten tongue with blood at mouth. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `postd-001` — Post-Op Wound Infection

- **Patient:** 52-year-old male, Driver, Arabic
- **Setting:** House in Ajman, afternoon
- **Chief complaint:** Surgical wound red and draining pus, fever
- **Posture class:** Sepsis / wound infection
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Semi-recumbent
- **Case-file appearance note:** Flushed, diaphoretic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (52 years old) Middle Eastern (Emirati or wider Arab) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, bright midday light. **Posture:** Lying down weak, lethargic; flushed if hot, mottled if cold sepsis. **Hands:** Loose at sides. **Face:** Flushed (febrile) or mottled, glassy eyes, drowsy. **Scene detail:** Recent surgical wound visible with redness/pus, thermometer/medication on bedside. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `psych-001` — Panic Attack with Hyperventilation

- **Patient:** 34-year-old female, Marketing manager, English
- **Setting:** Apartment in Jumeirah, Dubai, evening
- **Chief complaint:** Wife having panic attack, cannot breathe, chest pain
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `home-medical-female-dubai-apartment.png`
- **Case-file posture note:** Pacing, unable to sit still
- **Case-file appearance note:** Flushed, trembling, tearful

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (34 years old) Middle Eastern or South Asian expat female, modest western dress, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `psych-002` — Psychiatric - Acute Psychosis with Aggression

- **Patient:** 24-year-old male, Unemployed, Arabic, English
- **Setting:** Apartment in Deira, Dubai, evening
- **Chief complaint:** Son behaving erratically, breaking things, threatening family
- **Posture class:** Acute psychosis / behavioural emergency
- **Currently shows:** `psychiatric-apartment-safety-uae.png`
- **Case-file posture note:** Pacing room, clenched fists
- **Case-file appearance note:** Disheveled, sweaty, eyes wide

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (24 years old) Middle Eastern (Emirati or wider Arab) male, casual modest clothing, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Pacing, restless, unable to sit still; may be aggressive or withdrawn. **Hands:** Clenched fists OR gesturing wildly to no one; may be holding broken object. **Face:** Disheveled hair, eyes wide and suspicious, talking to unseen entity, sweaty. **Scene detail:** Broken furniture/objects in background, family member or police visible at scene edge. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `psych-003` — Acute Psychotic Episode

- **Patient:** 26-year-old male, IT professional, English
- **Setting:** Apartment, Dubai Marina, evening
- **Chief complaint:** Man acting strangely, hearing voices, family concerned
- **Posture class:** Acute psychosis / behavioural emergency
- **Currently shows:** `psychiatric-apartment-safety-uae.png`
- **Case-file posture note:** Pacing
- **Case-file appearance note:** Disheveled, suspicious gaze

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (26 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Pacing, restless, unable to sit still; may be aggressive or withdrawn. **Hands:** Clenched fists OR gesturing wildly to no one; may be holding broken object. **Face:** Disheveled hair, eyes wide and suspicious, talking to unseen entity, sweaty. **Scene detail:** Broken furniture/objects in background, family member or police visible at scene edge. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-001` — Life-Threatening Asthma Attack

- **Patient:** 19-year-old male, University student, Arabic, English
- **Setting:** Villa in Al Ain, evening
- **Chief complaint:** Son cannot breathe, using inhaler repeatedly
- **Posture class:** Acute severe asthma
- **Currently shows:** `asthma-villa-male-uae.png`
- **Case-file posture note:** Sitting upright, leaning forward (tripod)
- **Case-file appearance note:** Diaphoretic, anxious, unable to speak in sentences

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (19 years old) Middle Eastern (Emirati or wider Arab) male, business shirt and trousers, tie loosened, in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, warm evening light, after-dark with warm interior lamps. **Posture:** Tripod position: sitting on edge of bed/chair, leaning forward, arms braced on knees or thighs. **Hands:** Hands gripping knees or thighs, sometimes inhaler clutched in fist. **Face:** Pursed-lip exhalation, nostrils flaring, focused stare, cannot speak full sentences. **Scene detail:** Visible accessory muscle use (sternocleidomastoid prominent), shoulders elevated and hunched, used spacer/inhaler on side table. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-002` — Pneumothorax - Tension   **MISMATCH**

- **Patient:** 34-year-old male, Construction worker, Hindi, Basic English
- **Setting:** Construction site, Dubai, afternoon
- **Chief complaint:** Sudden chest pain, difficulty breathing after fall
- **Posture class:** Pneumothorax (spontaneous or traumatic)
- **Generated asset:** `resp-002-construction-tension-pneumothorax.png`
- **Previous fallback:** `construction-fall-male-29-dubaihills.png` (mismatch)
- **Case-file posture note:** Sitting upright
- **Case-file appearance note:** Cyanotic, distressed, diaphoretic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (34 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, bright midday light. **Posture:** Sitting upright leaning slightly toward injured side. **Hands:** Hand splinting affected hemithorax, other arm braced. **Face:** Distressed, pale or cyanotic, mouth open, brows pulled together. **Scene detail:** Subtle tracheal deviation away from affected side, accessory neck muscle use, asymmetric chest rise. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-003` — COPD Exacerbation

- **Patient:** 68-year-old male, Retired taxi driver, Arabic
- **Setting:** Apartment in Sharjah, morning
- **Chief complaint:** Increased breathlessness, using oxygen at home
- **Posture class:** COPD exacerbation
- **Currently shows:** `home-copd-male-68-sharjah.png`
- **Case-file posture note:** Sitting forward, tripod
- **Case-file appearance note:** Cyanotic, breathless, anxious

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (68 years old) Middle Eastern (Emirati or wider Arab) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm morning light. **Posture:** Tripod position, often with portable home oxygen cylinder nearby. **Hands:** Hands gripping knees/armrests, nasal cannula in place. **Face:** Pursed-lip exhalation, barrel chest visible, cyanotic lips. **Scene detail:** Inhalers/nebuliser on side table, tissues, oxygen tubing on floor. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-004` — Pulmonary Embolism   **MISMATCH**

- **Patient:** 42-year-old female, Business traveler, English
- **Setting:** Hotel room, Dubai Marina, morning
- **Chief complaint:** Sudden shortness of breath, chest pain
- **Posture class:** Pulmonary embolism
- **Currently shows:** `home-medical-female-dubai-apartment.png` (mismatch)
- **Case-file posture note:** Sitting upright
- **Case-file appearance note:** Pale, tachypneic, distressed

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (42 years old) Middle Eastern or South Asian expat female, modest western dress, in a upscale Dubai hotel room — beige carpet, blackout curtains, king bed, city view through window, warm morning light. **Posture:** Sitting upright; cannot tolerate lying flat; tachypneic. **Hands:** One hand on lateral chest wall, other gripping seat or knee for support. **Face:** Anxious, cyanotic around lips, eyes wide, mouth open breathing. **Scene detail:** Pale or grey-cyanotic, profuse sweating, may have one swollen calf visible (DVT). Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-005` — Severe COPD Exacerbation   **MISMATCH**

- **Patient:** 72-year-old male, Retired teacher, Arabic
- **Setting:** Villa in Al Ain, early-morning
- **Chief complaint:** Elderly man struggling to breathe, known COPD
- **Posture class:** COPD exacerbation
- **Currently shows:** `home-medical-male-dubai-apartment.png` (mismatch)
- **Case-file posture note:** Sitting upright, leaning forward
- **Case-file appearance note:** Cyanotic lips, diaphoretic, barrel chest

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (72 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, soft early-morning light, sun low. **Posture:** Tripod position, often with portable home oxygen cylinder nearby. **Hands:** Hands gripping knees/armrests, nasal cannula in place. **Face:** Pursed-lip exhalation, barrel chest visible, cyanotic lips. **Scene detail:** Inhalers/nebuliser on side table, tissues, oxygen tubing on floor. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-006` — Pneumothorax After Chest Trauma   **MISMATCH**

- **Patient:** 34-year-old male, Construction worker, Hindi, Basic English
- **Setting:** Construction site, Dubai Marina, afternoon
- **Chief complaint:** Man fell from ladder, chest pain, difficulty breathing
- **Posture class:** Pneumothorax (spontaneous or traumatic)
- **Generated asset:** `resp-002-construction-tension-pneumothorax.png`
- **Previous fallback:** `construction-fall-male-29-dubaihills.png` (mismatch)
- **Case-file posture note:** Sitting, leaning to right side
- **Case-file appearance note:** Diaphoretic, distressed, rapid breathing

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (34 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, bright midday light. **Posture:** Sitting upright leaning slightly toward injured side. **Hands:** Hand splinting affected hemithorax, other arm braced. **Face:** Distressed, pale or cyanotic, mouth open, brows pulled together. **Scene detail:** Subtle tracheal deviation away from affected side, accessory neck muscle use, asymmetric chest rise. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-007` — Pediatric Croup with Stridor

- **Patient:** 2-year-old male, N/A, None
- **Setting:** Apartment, Jumeirah, evening
- **Chief complaint:** 2-year-old with barking cough, difficulty breathing
- **Posture class:** Paediatric croup with stridor
- **Currently shows:** `home-pediatric-uae-family.png`
- **Case-file posture note:** Sitting upright, preferring parents
- **Case-file appearance note:** Mild respiratory distress, barking cough

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 2-year-old toddler Middle Eastern or South Asian expat boy, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Upright, on parent's lap, refusing to lie back. **Hands:** Small fists, may rub face/eyes; parent steadies torso. **Face:** Tearful but tired, occasional barking cough. **Scene detail:** Audible stridor implied (open mouth, neck slightly extended), small child in pyjamas. Anxious parent visible in frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-008` — Acute Pulmonary Edema   **MISMATCH**

- **Patient:** 78-year-old female, Retired, English
- **Setting:** Villa, Emirates Hills, early-morning
- **Chief complaint:** Elderly woman severely short of breath, frothy sputum
- **Posture class:** Pulmonary oedema / decompensated heart failure
- **Generated asset:** `resp-008-female-pulmonary-oedema-villa.png`
- **Previous fallback:** `home-pulmonary-oedema-male-uae.png` (gender mismatch)
- **Case-file posture note:** Sitting upright, unable to lie flat
- **Case-file appearance note:** Diaphoretic, cyanotic lips, frothy pink sputum

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (78 years old) Middle Eastern or South Asian expat female, modest western dress, in a Emirati villa interior — marble flooring, neutral tones, sun-filled living room or bedroom, soft early-morning light, sun low. **Posture:** Sitting bolt upright on edge of bed/sofa, legs dangling — absolutely cannot lie flat. **Hands:** Both hands gripping edge of bed/mattress to prop body up. **Face:** Distressed, cyanotic lips, pink frothy sputum at corners of mouth. **Scene detail:** Open-mouth breathing, accessory muscle use in neck, pillow pushed away. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-009` — Foreign Body Aspiration in Adult   **MISMATCH**

- **Patient:** 45-year-old male, Businessman, English
- **Setting:** Restaurant, Downtown Dubai, evening
- **Chief complaint:** Man choking on food, cannot breathe
- **Posture class:** Choking / foreign body aspiration
- **Generated asset:** `resp-009-restaurant-choking-dubai.png`
- **Previous fallback:** `office-medical-dubai.png` (mismatch)
- **Case-file posture note:** Standing
- **Case-file appearance note:** Cyanotic, distressed, unable to speak

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (45 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a upscale Dubai restaurant — set table, warm ambient lighting, other diners blurred in background, warm evening light, after-dark with warm interior lamps. **Posture:** Standing or seated, leaning forward; universal choking sign. **Hands:** Both hands clutched at own throat (universal choking sign). **Face:** Eyes wide and panicked, mouth open, cyanosis around lips, silent — cannot cough or speak. **Scene detail:** Food on plate in front; companion behind preparing to do abdominal thrusts. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-010` — Refractory Anaphylaxis — Bee Sting   **MISMATCH**

- **Patient:** 45-year-old male, Construction worker, Hindi, basic English
- **Setting:** Construction site, Al Quoz Industrial Area, Dubai, afternoon
- **Chief complaint:** 45-year-old male collapsed on construction site after bee sting, severe breathing difficul
- **Posture class:** Anaphylaxis
- **Generated asset:** `construction-anaphylaxis-male-uae.png`
- **Previous fallback:** `construction-fall-male-29-dubaihills.png` (mismatch)
- **Case-file posture note:** Semi-recumbent on ground, propped against wall
- **Case-file appearance note:** Grossly swollen face and neck, cyanotic lips, widespread urticaria, drenched in sweat

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (45 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, bright midday light. **Posture:** Semi-recumbent or sitting (may be supine if hypotensive), legs may be elevated. **Hands:** One hand at throat (sense of throat closing), the other at chest; epipen visible. **Face:** Grossly swollen lips and face/eyelids, urticaria/hives on neck and arms, cyanotic. **Scene detail:** Widespread erythematous wheals on exposed skin, used epinephrine auto-injector nearby, may be drooling. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `resp-011` — Community Acquired Pneumonia

- **Patient:** 65-year-old male, Retired, Arabic
- **Setting:** Apartment, Deira, afternoon
- **Chief complaint:** Fever and cough for 3 days, now very short of breath
- **Posture class:** Pneumonia
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting
- **Case-file appearance note:** Flushed, diaphoretic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (65 years old) Middle Eastern (Emirati or wider Arab) male, traditional white kandura with ghutra headdress, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, bright midday light. **Posture:** Sitting propped up, leaning toward affected side. **Hands:** Hand resting on affected lateral chest; tissues in other hand. **Face:** Flushed (febrile), tired, eyes glassy; productive cough implied. **Scene detail:** Tissues, water glass, thermometer on side table. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `ruleout-001` — Chest Pain - Rule Out ACS

- **Patient:** 38-year-old male, IT consultant, English
- **Setting:** Apartment in Dubai Marina, evening
- **Chief complaint:** Chest pain, worried it might be heart attack
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting at desk
- **Case-file appearance note:** Well, no diaphoresis

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (38 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `tox-001` — Toxicology - Organophosphate Poisoning

- **Patient:** 35-year-old male, Farm worker, Urdu, Arabic, English
- **Setting:** Farm in Al Awir, Dubai, morning
- **Chief complaint:** Worker collapsed after spraying pesticides, difficult breathing, vomiting
- **Posture class:** Poisoning / overdose
- **Currently shows:** `farm-toxicology-male-35-alawir.png`
- **Case-file posture note:** Semi-conscious, slumped on ground
- **Case-file appearance note:** Diaphoretic, cyanotic, chemical odor on clothes

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (35 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a UAE rural farm — dusty ground, pesticide spraying equipment, hot sun, warm morning light. **Posture:** Variable: supine (CNS depression) or seated holding mouth (caustic). **Hands:** Loose by sides if unconscious; or one hand to mouth if caustic. **Face:** Pinpoint pupils (opioid), drooling, possible vomit. **Scene detail:** Substance container visible (pesticide spray, pill bottle, household cleaner). Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `tox-002` — Opioid Overdose with Severe Respiratory Depression

- **Patient:** 32-year-old male, Unknown, Unknown
- **Setting:** Parking garage, Downtown, evening
- **Chief complaint:** Found unconscious, not breathing properly, needle nearby
- **Posture class:** Cardiac arrest (any rhythm)
- **Currently shows:** `cardiac-arrest-mall-male-dubai.png`
- **Case-file posture note:** Supine
- **Case-file appearance note:** Cyanotic lips, track marks visible

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (32 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a underground parking garage — dim fluorescent lighting, concrete pillars, parked cars, warm evening light, after-dark with warm interior lamps. **Posture:** Supine on the ground or floor, motionless. **Hands:** Arms loose at sides, palms up or thrown out; chest exposed for CPR. **Face:** Cyanotic lips, slack jaw, eyes half-open and unfocused or closed. **Scene detail:** Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-001` — Multi-Trauma from RTC - Motorcycle vs Car

- **Patient:** 28-year-old male, Delivery driver, Urdu, Basic English
- **Setting:** Sheikh Zayed Road, Dubai, afternoon
- **Chief complaint:** Motorcycle accident, rider on ground not moving
- **Posture class:** Major / multi-trauma (RTC, GSW, stab)
- **Currently shows:** `road-traffic-male-dubai.png`
- **Case-file posture note:** Supine, head turned to side
- **Case-file appearance note:** Blood on face, right leg deformed, unconscious

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (28 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a Dubai roadside — asphalt, palm trees on verge, skyline in distance, damaged vehicle if RTC, bright midday light. **Posture:** Supine on ground; visible deformity to limbs/chest. **Hands:** Loose or splinted depending on injury. **Face:** Blood on face, pale, may be unconscious. **Scene detail:** Damaged vehicle/motorcycle, glass debris, road or scene context, paramedics in PPE working. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-002` — Head Injury with Skull Fracture

- **Patient:** 35-year-old male, Construction worker, Hindi
- **Setting:** Construction site, Dubai, afternoon
- **Chief complaint:** Fall from height, head injury, unconscious
- **Posture class:** Traumatic brain injury
- **Currently shows:** `construction-fall-male-29-dubaihills.png`
- **Case-file posture note:** Supine
- **Case-file appearance note:** Blood on face, unconscious

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (35 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, bright midday light. **Posture:** Supine, unconscious; head turned to one side. **Hands:** Loose at sides; may have abnormal posturing if severe. **Face:** Blood on face/scalp, periorbital haematoma (raccoon eyes) if base of skull, unilateral pupil dilation possible. **Scene detail:** Bleeding scalp wound, hard hat or helmet on ground beside, scaffolding or vehicle visible. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-003` — Penetrating Chest Wound

- **Patient:** 30-year-old male, Unknown, Arabic
- **Setting:** Street in Deira, Dubai, evening
- **Chief complaint:** Stab wound to chest, bleeding heavily
- **Posture class:** Major / multi-trauma (RTC, GSW, stab)
- **Currently shows:** `road-traffic-male-dubai.png`
- **Case-file posture note:** Sitting, leaning forward
- **Case-file appearance note:** Pale, distressed, blood on chest

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (30 years old) Middle Eastern (Emirati or wider Arab) male, casual modest clothing, in a Dubai roadside — asphalt, palm trees on verge, skyline in distance, damaged vehicle if RTC, warm evening light, after-dark with warm interior lamps. **Posture:** Supine on ground; visible deformity to limbs/chest. **Hands:** Loose or splinted depending on injury. **Face:** Blood on face, pale, may be unconscious. **Scene detail:** Damaged vehicle/motorcycle, glass debris, road or scene context, paramedics in PPE working. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-004` — Penetrating Chest Trauma - Cardiac Tamponade   **MISMATCH**

- **Patient:** 32-year-old male, Unknown, Unknown
- **Setting:** Public park in Downtown Dubai, evening
- **Chief complaint:** Stabbing to chest, patient unresponsive
- **Posture class:** Major / multi-trauma (RTC, GSW, stab)
- **Generated asset:** `trauma-004-park-stabbing-tamponade.png`
- **Previous fallback:** `office-medical-dubai.png` (mismatch)
- **Case-file posture note:** Supine
- **Case-file appearance note:** Pale, cyanotic lips, mottled skin

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (32 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a Dubai public park — green lawn, palm trees, pathway, warm evening light, after-dark with warm interior lamps. **Posture:** Supine on ground; visible deformity to limbs/chest. **Hands:** Loose or splinted depending on injury. **Face:** Blood on face, pale, may be unconscious. **Scene detail:** Damaged vehicle/motorcycle, glass debris, road or scene context, paramedics in PPE working. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-005` — Blunt Chest Trauma - Tension Pneumothorax with Flail Chest   **MISMATCH**

- **Patient:** 28-year-old male, Delivery driver, English, Hindi
- **Setting:** Sheikh Zayed Road, Dubai, afternoon
- **Chief complaint:** MVC - driver trapped, chest injury, difficulty breathing
- **Posture class:** Pneumothorax (spontaneous or traumatic)
- **Generated asset:** `trauma-005-trapped-driver-flail-chest.png`
- **Previous fallback:** `road-traffic-male-dubai.png` (mismatch)
- **Case-file posture note:** Sitting (leaning forward)
- **Case-file appearance note:** Diaphoretic, cyanotic, anxious, using accessory muscles

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (28 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a Dubai roadside — asphalt, palm trees on verge, skyline in distance, damaged vehicle if RTC, bright midday light. **Posture:** Sitting upright leaning slightly toward injured side. **Hands:** Hand splinting affected hemithorax, other arm braced. **Face:** Distressed, pale or cyanotic, mouth open, brows pulled together. **Scene detail:** Subtle tracheal deviation away from affected side, accessory neck muscle use, asymmetric chest rise. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-006` — Massive Hemothorax - Penetrating Trauma   **MISMATCH**

- **Patient:** 26-year-old male, Unknown, Unknown
- **Setting:** Nightclub in Dubai Marina, evening
- **Chief complaint:** Multiple GSW victims, one with chest wounds
- **Posture class:** Major / multi-trauma (RTC, GSW, stab)
- **Currently shows:** `home-medical-male-dubai-apartment.png` (mismatch)
- **Case-file posture note:** Supine
- **Case-file appearance note:** Pale, diaphoretic, in obvious distress

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (26 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a Dubai nightclub interior — darkness with flashing coloured lights, warm evening light, after-dark with warm interior lamps. **Posture:** Supine on ground; visible deformity to limbs/chest. **Hands:** Loose or splinted depending on injury. **Face:** Blood on face, pale, may be unconscious. **Scene detail:** Damaged vehicle/motorcycle, glass debris, road or scene context, paramedics in PPE working. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-007` — Blunt Abdominal Trauma - Splenic Laceration   **MISMATCH**

- **Patient:** 35-year-old male, Sales executive, English
- **Setting:** Al Khail Road, Dubai, afternoon
- **Chief complaint:** MVC - driver complaining of abdominal pain
- **Posture class:** Acute abdominal pain
- **Currently shows:** `road-traffic-male-dubai.png` (mismatch)
- **Case-file posture note:** Sitting, leaning forward
- **Case-file appearance note:** Pale, diaphoretic, in pain

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (35 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a Dubai roadside — asphalt, palm trees on verge, skyline in distance, damaged vehicle if RTC, bright midday light. **Posture:** Lying on side, knees drawn up to chest (fetal position) — wants to stay still. **Hands:** Both hands cupping abdomen, guarding the painful quadrant. **Face:** Wincing, refusing to move, eyes screwed shut; pale and clammy. **Scene detail:** Vomitus bowl/bag nearby, may have refused food. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-008` — Pelvic Fracture with Hemorrhagic Shock

- **Patient:** 45-year-old female, Tourist, English
- **Setting:** Mamzar Beach Road, Dubai, evening
- **Chief complaint:** Pedestrian struck by car, pelvic pain
- **Posture class:** Pelvic fracture
- **Currently shows:** `pedestrian-road-night-female-45.png`
- **Case-file posture note:** Supine
- **Case-file appearance note:** Pale, diaphoretic, distressed

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (45 years old) Western tourist female, tourist casual western clothing (light blouse, trousers), in a UAE outdoor poolside — hotel pool deck or villa pool, bright sun, palm trees, wet pool tiles, towels, warm evening light, after-dark with warm interior lamps. **Posture:** Supine, cannot move; legs may be shortened/externally rotated. **Hands:** Loose at sides or one to abdomen. **Face:** Pale, diaphoretic, in shock; distressed. **Scene detail:** On road surface, pelvic binder being applied OR clothing intact over pelvis. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-009` — Severe Head Injury - Epidural Hematoma

- **Patient:** 29-year-old male, Construction worker, Hindi, Basic English
- **Setting:** Construction site in Dubai Hills, morning
- **Chief complaint:** Fall from height, unconscious
- **Posture class:** Traumatic brain injury
- **Currently shows:** `construction-fall-male-29-dubaihills.png`
- **Case-file posture note:** Supine
- **Case-file appearance note:** Blood on face, pale

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (29 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, warm morning light. **Posture:** Supine, unconscious; head turned to one side. **Hands:** Loose at sides; may have abnormal posturing if severe. **Face:** Blood on face/scalp, periorbital haematoma (raccoon eyes) if base of skull, unilateral pupil dilation possible. **Scene detail:** Bleeding scalp wound, hard hat or helmet on ground beside, scaffolding or vehicle visible. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-010` — Cervical Spinal Cord Injury - Diving Accident

- **Patient:** 22-year-old male, University student, English
- **Setting:** Jumeirah Beach, Dubai, afternoon
- **Chief complaint:** Diving accident, cannot move arms or legs
- **Posture class:** Spinal cord injury
- **Currently shows:** `water-beach-drowning-dubai.png`
- **Case-file posture note:** Supine in shallow water
- **Case-file appearance note:** Alert, anxious, appears unable to move below shoulders

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (22 years old) Middle Eastern or South Asian expat male, business shirt and trousers, tie loosened, in a UAE beach in shallow water — bright midday sun, sand, sea, beach umbrellas, lifeguards visible, bright midday light. **Posture:** Supine, may be in shallow water or on hard surface; held still by bystanders. **Hands:** Arms flaccid, not moving (motor level dependent). **Face:** Alert, anxious, frightened — "I cannot feel/move my legs". **Scene detail:** Bystanders holding head in inline immobilisation, body slack below injury level. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-011` — Amputation Injury Industrial Accident

- **Patient:** 30-year-old male, Factory worker, Hindi, Basic English
- **Setting:** Factory, Industrial Area, morning
- **Chief complaint:** Hand caught in machine, hand severed, heavy bleeding
- **Posture class:** Traumatic amputation
- **Generated asset:** `trauma-011-industrial-hand-amputation.png`
- **Previous fallback:** `industrial-workshop-male-uae.png`
- **Case-file posture note:** Sitting
- **Case-file appearance note:** Pale, anxious, bleeding controlled with pressure

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (30 years old) South Asian (Indian, Pakistani or Bangladeshi) male, work clothes (hi-vis vest, work trousers and boots, hard hat nearby), in a UAE industrial workshop — machinery, fluorescent lighting, concrete floor, warm morning light. **Posture:** Sitting, often supported by colleagues; affected limb wrapped or elevated. **Hands:** Stump wrapped in cloth/dressing, blood-stained; intact hand applies pressure. **Face:** Pale, shocked, may be vacantly staring (acute shock). **Scene detail:** Industrial machine/saw visible in background, colleagues helping. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `trauma-012` — Drowning with Hypothermia   **MISMATCH**

- **Patient:** 4-year-old female, N/A, None
- **Setting:** Villa pool, Emirates Hills, afternoon
- **Chief complaint:** Child pulled from swimming pool, not breathing
- **Posture class:** Cardiac arrest (any rhythm)
- **Currently shows:** `home-medical-female-dubai-apartment.png` (mismatch)
- **Case-file posture note:** Supine on ground
- **Case-file appearance note:** Pale, cold, cyanotic lips

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 4-year-old child Middle Eastern or South Asian expat girl, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a UAE outdoor poolside — hotel pool deck or villa pool, bright sun, palm trees, wet pool tiles, towels, bright midday light. **Posture:** Supine on the ground or floor, motionless. **Hands:** Arms loose at sides, palms up or thrown out; chest exposed for CPR. **Face:** Cyanotic lips, slack jaw, eyes half-open and unfocused or closed. **Scene detail:** Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-001` — Elderly Female - Fall at Home

- **Patient:** 78-year-old female, Arabic
- **Setting:** Apartment in Al Ain, morning
- **Chief complaint:** 78-year-old female fallen, unable to get up
- **Posture class:** Elderly fall
- **Currently shows:** `elderly-fall-bathroom-female-uae.png`
- **Case-file posture note:** Sitting on floor, leaning against sofa
- **Case-file appearance note:** Calm, no visible distress

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (78 years old) Middle Eastern (Emirati or wider Arab) female, modest abaya and shayla headscarf, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm morning light. **Posture:** On floor where they fell; affected limb shortened/externally rotated if hip fracture. **Hands:** May reach for help; intact hand on uninjured side. **Face:** Pale, in pain, frightened; may have been on floor for hours. **Scene detail:** Bathroom/bedroom setting, walking stick or frame visible, frail elderly patient. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-002` — Young Adult - Abdominal Pain   **MISMATCH**

- **Patient:** 25-year-old male, English
- **Setting:** Office building in Dubai, afternoon
- **Chief complaint:** 25-year-old male with abdominal pain
- **Posture class:** Acute abdominal pain
- **Currently shows:** `office-medical-dubai.png` (mismatch)
- **Case-file posture note:** Sitting forward, holding right lower quadrant
- **Case-file appearance note:** Pale, guarding abdomen

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (25 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a modern Dubai high-rise office — glass desk, city skyline through floor-to-ceiling windows, bright midday light. **Posture:** Lying on side, knees drawn up to chest (fetal position) — wants to stay still. **Hands:** Both hands cupping abdomen, guarding the painful quadrant. **Face:** Wincing, refusing to move, eyes screwed shut; pale and clammy. **Scene detail:** Vomitus bowl/bag nearby, may have refused food. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-003` — Middle-Aged Male - Feeling Unwell (Diabetic)

- **Patient:** 45-year-old male, Arabic
- **Setting:** Residential home in Dubai, evening
- **Chief complaint:** 45-year-old diabetic feeling
- **Posture class:** Severe hypoglycaemia
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Lying in bed
- **Case-file appearance note:** Slightly diaphoretic, pale

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (45 years old) Middle Eastern (Emirati or wider Arab) male, casual modest clothing, in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, warm evening light, after-dark with warm interior lamps. **Posture:** Often slumped or on floor; sweating profusely. **Hands:** Trembling, may be clammy and cold; glucometer or sugary drink nearby. **Face:** Pale, profuse sweating, confused or combative expression; may be drooling. **Scene detail:** Insulin pen visible, glucose tabs. One worried family member visible in frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-004` — Young Female - Kitchen Scald Burn

- **Patient:** 25-year-old female, English
- **Setting:** Residential kitchen, evening
- **Chief complaint:** 25-year-old female, boiling water spill on arm
- **Posture class:** Burns (thermal, scald, flash)
- **Currently shows:** `kitchen-scald-burn-female-uae.png`
- **Case-file posture note:** Standing near kitchen sink
- **Case-file appearance note:** Distressed, tearful, holding burned arm away from body

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (25 years old) Middle Eastern or South Asian expat female, modest western dress, in a UAE residential kitchen — modern appliances, tile flooring, stove, warm evening light, after-dark with warm interior lamps. **Posture:** Sitting or standing, holding injured limb away from body. **Hands:** Injured area held distinctly away from torso. **Face:** Tearful, pale, in obvious pain; soot around nose/mouth if inhalation injury. **Scene detail:** Visible erythema/blistering, cool water or wet cloth applied, source of burn visible. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-005` — Toddler - Simple Febrile Seizure

- **Patient:** 3-year-old female, English
- **Setting:** Family home, afternoon
- **Chief complaint:** 3-year-old child had a seizure, now stopped
- **Posture class:** Generalised seizure (active or post-ictal)
- **Currently shows:** `seizure-bedroom-female-uae.png`
- **Case-file posture note:** Lying on sofa in recovery position
- **Case-file appearance note:** Flushed, drowsy, mildly limp

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 3-year-old child Middle Eastern or South Asian expat girl, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, bright midday light. **Posture:** Lying on side (recovery position) post-ictally, OR mid-seizure with rigid limbs. **Hands:** During tonic-clonic: rigid then jerking. Post-ictal: limp, often with bitten tongue. **Face:** During: eyes rolled back, jaw clenched, frothing. Post-ictal: drowsy, confused, drooling. **Scene detail:** Family member panicked nearby, may have urinary incontinence (wet patch), bitten tongue with blood at mouth. Anxious parent visible in frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-006` — Pregnant Female - Imminent Delivery

- **Patient:** 28-year-old female, English
- **Setting:** Residential home, early-morning
- **Chief complaint:** 28-year-old female, 39 weeks pregnant, contractions very close together, feels need to pus
- **Posture class:** Obstetric (haemorrhage, eclampsia, delivery, ectopic)
- **Currently shows:** `obstetric-home-female-uae.png`
- **Case-file posture note:** Semi-recumbent on bed, knees drawn up
- **Case-file appearance note:** Flushed, sweating, bearing down with contractions

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (28 years old) Middle Eastern or South Asian expat female, maternity dress with visible third-trimester pregnancy bump, in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, soft early-morning light, sun low. **Posture:** Semi-recumbent on bed or floor, knees drawn up; OR lying on left side. **Hands:** Both hands cradling gravid abdomen. **Face:** Sweating, focused/bearing down (labour) or pale and anxious (haemorrhage). **Scene detail:** Visible pregnancy (third trimester), towels laid out, female family member supporting. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-007` — Toddler - Barking Cough (Croup)

- **Patient:** 2-year-old male, English
- **Setting:** Family home, evening
- **Chief complaint:** 2-year-old with barking cough and noisy breathing
- **Posture class:** Paediatric croup with stridor
- **Currently shows:** `home-pediatric-uae-family.png`
- **Case-file posture note:** Sitting upright on father\
- **Case-file appearance note:** Mildly distressed, clingy, intermittent barking cough

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 2-year-old toddler Middle Eastern or South Asian expat boy, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, warm evening light, after-dark with warm interior lamps. **Posture:** Upright, on parent's lap, refusing to lie back. **Hands:** Small fists, may rub face/eyes; parent steadies torso. **Face:** Tearful but tired, occasional barking cough. **Scene detail:** Audible stridor implied (open mouth, neck slightly extended), small child in pyjamas. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-008` — Young Adult - Panic Attack   **MISMATCH**

- **Patient:** 22-year-old female, English
- **Setting:** University library, afternoon
- **Chief complaint:** 22-year-old female, difficulty breathing, thinks she is having a heart attack
- **Posture class:** Panic attack
- **Currently shows:** `psychiatric-apartment-safety-uae.png` (mismatch)
- **Case-file posture note:** Sitting on floor against wall, knees drawn up
- **Case-file appearance note:** Anxious, tearful, hyperventilating

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (22 years old) Middle Eastern or South Asian expat female, modest western dress, in a UAE university or school interior — modern study area, dorm room, or medical room, bright midday light. **Posture:** Pacing OR sitting against wall with knees drawn up. **Hands:** Hands trembling, one at chest, one at temple; may have carpopedal spasm. **Face:** Tearful, wide-eyed, hyperventilating, terrified expression — believes she is dying. **Scene detail:** Not cyanotic (key — distinguishes from asthma/PE), surroundings safe and quiet. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-009` — Toddler - Accidental Ingestion of Household Cleaner

- **Patient:** 3-year-old male, English
- **Setting:** Family home - kitchen, morning
- **Chief complaint:** 3-year-old found with open bottle of household cleaner, drooling and crying
- **Posture class:** Poisoning / overdose
- **Currently shows:** `home-pediatric-uae-family.png`
- **Case-file posture note:** Being held by mother
- **Case-file appearance note:** Crying, drooling, rubbing mouth

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 3-year-old child Middle Eastern or South Asian expat boy, age-appropriate clothing (pyjamas if at home, casual outfit if outdoors), in a UAE residential kitchen — modern appliances, tile flooring, stove, warm morning light. **Posture:** Variable: supine (CNS depression) or seated holding mouth (caustic). **Hands:** Loose by sides if unconscious; or one hand to mouth if caustic. **Face:** Pinpoint pupils (opioid), drooling, possible vomit. **Scene detail:** Substance container visible (pesticide spray, pill bottle, household cleaner). Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-010` — Adolescent - Wrist Fracture from Bicycle Fall

- **Patient:** 14-year-old male, English
- **Setting:** Local park pathway, afternoon
- **Chief complaint:** 14-year-old fell off bicycle, wrist injury
- **Posture class:** Minor trauma
- **Currently shows:** `road-traffic-male-dubai.png`
- **Case-file posture note:** Sitting on grass, supporting left wrist with right hand
- **Case-file appearance note:** Pale, guarding injured wrist, some tears but trying to be brave

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 14-year-old adolescent Middle Eastern or South Asian expat male, casual modest clothing, in a Dubai public park — green lawn, palm trees, pathway, bright midday light. **Posture:** Sitting, alert; protecting injured area. **Hands:** Cradling injured limb with intact hand. **Face:** Pale but composed, may be tearful (child). **Scene detail:** Mechanism visible (bicycle on ground, low-speed car damage), no overt life-threats. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-011` — Adult - Minor Road Traffic Collision with Neck Pain

- **Patient:** 30-year-old male, English
- **Setting:** Main road, vehicles pulled over to hard shoulder, morning
- **Chief complaint:** 30-year-old male, rear-ended at low speed, complaining of neck pain
- **Posture class:** Minor trauma
- **Currently shows:** `road-traffic-male-dubai.png`
- **Case-file posture note:** Seated in driver seat with seatbelt on
- **Case-file appearance note:** Anxious but not distressed, holding posterior neck

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (30 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a Dubai roadside — asphalt, palm trees on verge, skyline in distance, damaged vehicle if RTC, warm morning light. **Posture:** Sitting, alert; protecting injured area. **Hands:** Cradling injured limb with intact hand. **Face:** Pale but composed, may be tearful (child). **Scene detail:** Mechanism visible (bicycle on ground, low-speed car damage), no overt life-threats. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-012` — Student - Hyperventilation Syndrome

- **Patient:** 18-year-old male, English
- **Setting:** School examination hall, morning
- **Chief complaint:** 18-year-old male, difficulty breathing, tingling, dizzy
- **Posture class:** Hyperventilation syndrome
- **Currently shows:** `campus-student-uae.png`
- **Case-file posture note:** Sitting on examination couch, leaning forward
- **Case-file appearance note:** Anxious, breathing rapidly, hands trembling

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. 18-year-old adolescent Middle Eastern or South Asian expat male, casual modest clothing, in a UAE university or school interior — modern study area, dorm room, or medical room, warm morning light. **Posture:** Seated, often legs drawn up; may be on floor against wall. **Hands:** Hands cramping into carpopedal spasm or held to chest. **Face:** Frightened, tearful, mouth open, rapid shallow breathing visible at chest. **Scene detail:** No cyanosis (key — distinguishes from true respiratory distress), pale around lips. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-013` — Middle-Aged Adult - Palpitations

- **Patient:** 45-year-old male, English
- **Setting:** Office building, evening
- **Chief complaint:** 45-year-old male, heart racing, anxious
- **Posture class:** Arrhythmia (SVT, AF, bradycardia, heart block)
- **Currently shows:** `office-medical-dubai.png`
- **Case-file posture note:** Sitting in office chair
- **Case-file appearance note:** Anxious, mildly flushed, no acute distress

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (45 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a modern Dubai high-rise office — glass desk, city skyline through floor-to-ceiling windows, warm evening light, after-dark with warm interior lamps. **Posture:** Sitting, sometimes anxious, hand on chest. **Hands:** One hand on chest (feeling palpitations), other on lap. **Face:** Anxious, pale, may be diaphoretic; alert. **Scene detail:** BP cuff/monitor nearby. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-014` — Witnessed Cardiac Arrest - Shopping Mall

- **Patient:** 55-year-old male, English
- **Setting:** Mall of the Emirates, Dubai, afternoon
- **Chief complaint:** 55-year-old male collapsed in shopping mall food court, bystander CPR in progress
- **Posture class:** Cardiac arrest (any rhythm)
- **Currently shows:** `cardiac-arrest-mall-male-dubai.png`
- **Case-file posture note:** Supine on hard floor
- **Case-file appearance note:** Cyanotic, no signs of life, no spontaneous movement

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (55 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a Dubai shopping mall food court — polished marble floor, brand-name signage subtle in background, ambient music, bright midday light. **Posture:** Supine on the ground or floor, motionless. **Hands:** Arms loose at sides, palms up or thrown out; chest exposed for CPR. **Face:** Cyanotic lips, slack jaw, eyes half-open and unfocused or closed. **Scene detail:** Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y1-015` — Severe Allergic Reaction — Restaurant

- **Patient:** 32-year-old female, Marketing executive, English
- **Setting:** Seafood restaurant, Al Maryah Island, Abu Dhabi, evening
- **Chief complaint:** 32-year-old female difficulty breathing after eating at restaurant, swollen face
- **Posture class:** Anaphylaxis
- **Generated asset:** `restaurant-anaphylaxis-female-abu-dhabi.png`
- **Previous fallback:** `public-restaurant-female-uae.png`
- **Case-file posture note:** Sitting upright, leaning forward
- **Case-file appearance note:** Flushed, swollen lips and eyes, raised red welts on arms and torso

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (32 years old) Middle Eastern or South Asian expat female, modest western dress, in a upscale Dubai restaurant — set table, warm ambient lighting, other diners blurred in background, warm evening light, after-dark with warm interior lamps. **Posture:** Semi-recumbent or sitting (may be supine if hypotensive), legs may be elevated. **Hands:** One hand at throat (sense of throat closing), the other at chest; epipen visible. **Face:** Grossly swollen lips and face/eyelids, urticaria/hives on neck and arms, cyanotic. **Scene detail:** Widespread erythematous wheals on exposed skin, used epinephrine auto-injector nearby, may be drooling. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-001` — Asthma Exacerbation - Systematic Assessment Required

- **Patient:** 22-year-old female, English
- **Setting:** University campus in Sharjah, evening
- **Chief complaint:** 22-year-old female with asthma attack, difficulty breathing
- **Posture class:** Acute severe asthma
- **Currently shows:** `asthma-villa-male-uae.png`
- **Case-file posture note:** Sitting upright, leaning forward with arms supporting
- **Case-file appearance note:** Anxious, cyanotic lips, diaphoretic

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (22 years old) Middle Eastern or South Asian expat female, modest western dress, in a UAE university or school interior — modern study area, dorm room, or medical room, warm evening light, after-dark with warm interior lamps. **Posture:** Tripod position: sitting on edge of bed/chair, leaning forward, arms braced on knees or thighs. **Hands:** Hands gripping knees or thighs, sometimes inhaler clutched in fist. **Face:** Pursed-lip exhalation, nostrils flaring, focused stare, cannot speak full sentences. **Scene detail:** Visible accessory muscle use (sternocleidomastoid prominent), shoulders elevated and hunched, used spacer/inhaler on side table. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-002` — Cardiac Chest Pain - Assessment Focus

- **Patient:** 55-year-old male, English
- **Setting:** Home in Dubai Marina, early-morning
- **Chief complaint:** 55-year-old male with chest pain
- **Posture class:** Cardiac chest pain (STEMI, NSTEMI, ACS, angina)
- **Currently shows:** `home-medical-male-dubai-apartment.png`
- **Case-file posture note:** Sitting forward, leaning left
- **Case-file appearance note:** Pale, diaphoretic, anxious

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (55 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, soft early-morning light, sun low. **Posture:** Sitting upright, leaning forward slightly. **Hands:** Fist clenched against centre or left side of chest (Levine sign), other hand bracing on knee or chair arm. **Face:** Grimace, jaw set, brow furrowed; eyes half-closed in pain. **Scene detail:** Pale, diaphoretic (sweat on forehead/upper lip), tie or collar loosened, may rub left arm. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-003` — Acute Stroke - Neurological Assessment Focus   **MISMATCH**

- **Patient:** 67-year-old male, Arabic
- **Setting:** Home in Abu Dhabi, afternoon
- **Chief complaint:** 67-year-old male slurred speech, weak arm
- **Posture class:** Acute stroke / TIA
- **Currently shows:** `home-medical-male-dubai-apartment.png` (mismatch)
- **Case-file posture note:** Sitting on sofa, leaning to left
- **Case-file appearance note:** Facial droop on left side, clothes disheveled

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (67 years old) Middle Eastern (Emirati or wider Arab) male, casual modest clothing, in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, bright midday light. **Posture:** Sitting or supine; visibly asymmetric posture, slumped to one side. **Hands:** Affected arm hanging flaccid or held weakly, unaffected hand at face. **Face:** Facial droop on one side (mouth corner down, asymmetric smile). **Scene detail:** Frustrated/confused expression, partner or family member supporting them. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-004` — Workshop Flash Burn - Burns Assessment

- **Patient:** 35-year-old male, English
- **Setting:** Industrial workshop in Al Quoz, Dubai, morning
- **Chief complaint:** 35-year-old male, flash burn to face and chest from welding accident
- **Posture class:** Burns (thermal, scald, flash)
- **Generated asset:** `y2-004-workshop-flash-burn.png`
- **Previous fallback:** `industrial-workshop-male-uae.png`
- **Case-file posture note:** Sitting upright against wall, holding hands away from body
- **Case-file appearance note:** Singed eyebrows and nasal hairs, erythema and blistering to face and chest, soot around nostrils

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. middle-aged adult (35 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a UAE industrial workshop — machinery, fluorescent lighting, concrete floor, warm morning light. **Posture:** Sitting or standing, holding injured limb away from body. **Hands:** Injured area held distinctly away from torso. **Face:** Tearful, pale, in obvious pain; soot around nose/mouth if inhalation injury. **Scene detail:** Visible erythema/blistering, cool water or wet cloth applied, source of burn visible. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-005` — Ectopic Pregnancy - Obstetric Emergency

- **Patient:** 26-year-old female, English
- **Setting:** Office in DIFC, Dubai, afternoon
- **Chief complaint:** 26-year-old female with sudden severe lower abdominal pain
- **Posture class:** Obstetric (haemorrhage, eclampsia, delivery, ectopic)
- **Currently shows:** `obstetric-home-female-uae.png`
- **Case-file posture note:** Lying on floor, knees drawn up, guarding abdomen
- **Case-file appearance note:** Pale, sweaty, anxious, in obvious distress

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (26 years old) Middle Eastern or South Asian expat female, maternity dress with visible third-trimester pregnancy bump, in a modern Dubai high-rise office — glass desk, city skyline through floor-to-ceiling windows, bright midday light. **Posture:** Semi-recumbent on bed or floor, knees drawn up; OR lying on left side. **Hands:** Both hands cradling gravid abdomen. **Face:** Sweating, focused/bearing down (labour) or pale and anxious (haemorrhage). **Scene detail:** Visible pregnancy (third trimester), towels laid out, female family member supporting. One concerned colleague or staff member visible at edge of frame. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-006` — TIA (Transient Ischaemic Attack) - Neurological Assessment   **MISMATCH**

- **Patient:** 62-year-old male, English
- **Setting:** Golf club in Jumeirah, Dubai, morning
- **Chief complaint:** 62-year-old male, episode of facial droop and slurred speech, now resolved
- **Posture class:** Acute stroke / TIA
- **Currently shows:** `home-medical-male-dubai-apartment.png` (mismatch)
- **Case-file posture note:** Sitting comfortably in chair
- **Case-file appearance note:** Well-dressed, colour normal, no obvious distress

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (62 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, warm morning light. **Posture:** Sitting or supine; visibly asymmetric posture, slumped to one side. **Hands:** Affected arm hanging flaccid or held weakly, unaffected hand at face. **Face:** Facial droop on one side (mouth corner down, asymmetric smile). **Scene detail:** Frustrated/confused expression, partner or family member supporting them. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-007` — Paracetamol Overdose - Toxicological Emergency

- **Patient:** 19-year-old female, English
- **Setting:** Student accommodation in Academic City, Dubai, evening
- **Chief complaint:** 19-year-old female, taken overdose of paracetamol tablets
- **Posture class:** Poisoning / overdose
- **Currently shows:** `campus-student-uae.png`
- **Case-file posture note:** Sitting on edge of bed
- **Case-file appearance note:** Appears well, no obvious distress, may appear detached or withdrawn

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (19 years old) Middle Eastern or South Asian expat female, modest western dress, in a typical UAE family home — tiled floors, warm interior lighting, traditional rugs, warm evening light, after-dark with warm interior lamps. **Posture:** Variable: supine (CNS depression) or seated holding mouth (caustic). **Hands:** Loose by sides if unconscious; or one hand to mouth if caustic. **Face:** Pinpoint pupils (opioid), drooling, possible vomit. **Scene detail:** Substance container visible (pesticide spray, pill bottle, household cleaner). Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-008` — Acute Psychosis - Psychiatric Emergency

- **Patient:** 28-year-old male, English
- **Setting:** Apartment in JLT, Dubai, evening
- **Chief complaint:** 28-year-old male, bizarre behaviour, aggressive, talking to unseen people
- **Posture class:** Acute psychosis / behavioural emergency
- **Currently shows:** `psychiatric-apartment-safety-uae.png`
- **Case-file posture note:** Standing, pacing back and forth, will not sit
- **Case-file appearance note:** Disheveled, unwashed appearance, clothes inappropriate (wearing winter jacket indoors in warm room), barefoot

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. young adult (28 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a contemporary Dubai apartment interior — beige walls, large window with high-rise skyline visible, modern Arabic-influenced furniture, warm evening light, after-dark with warm interior lamps. **Posture:** Pacing, restless, unable to sit still; may be aggressive or withdrawn. **Hands:** Clenched fists OR gesturing wildly to no one; may be holding broken object. **Face:** Disheveled hair, eyes wide and suspicious, talking to unseen entity, sweaty. **Scene detail:** Broken furniture/objects in background, family member or police visible at scene edge. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

### `y2-009` — Cardiac Arrest - Workplace Collapse

- **Patient:** 62-year-old male, English
- **Setting:** Construction site office, Al Quoz Industrial, Dubai, morning
- **Chief complaint:** 62-year-old male collapsed at work, not breathing
- **Posture class:** Cardiac arrest (any rhythm)
- **Currently shows:** `cardiac-arrest-mall-male-dubai.png`
- **Case-file posture note:** Supine on office floor
- **Case-file appearance note:** Cyanotic, no chest rise, vomit visible around mouth

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. older adult (62 years old) Middle Eastern or South Asian expat male, casual modest clothing, in a active Dubai construction site — concrete dust, scaffolding, hi-vis-vested workers, hard hats, warm morning light. **Posture:** Supine on the ground or floor, motionless. **Hands:** Arms loose at sides, palms up or thrown out; chest exposed for CPR. **Face:** Cyanotic lips, slack jaw, eyes half-open and unfocused or closed. **Scene detail:** Bystander or paramedic performing chest compressions, AED pads visible on bare chest, no signs of life. Photorealistic, no on-image text or watermarks, no gore beyond what is clinically relevant.

## 4. Priority generation list — top 20 mismatches

Ranked by clinical severity then case ID. Generate replacement images for these first — they are the cases where the current archetype most badly misleads the learner about what the patient looks like.

| Rank | Case ID | Title | Currently shows | Should show |
|---|---|---|---|---|
| 1 | `cardiac-011` | Acute Decompensated Heart Failure -  | `asthma-villa-male-uae.png` | Pulmonary oedema / decompensated heart failure posture (see §1) |
| 2 | `litfl-007` | Massive Pulmonary Embolism with RV Strain | `home-medical-female-dubai-apartment.png` | Pulmonary embolism posture (see §1) |
| 3 | `multi-001` | Mass Casualty Incident - Bus vs Car Collision (8 Patients) | `home-pediatric-uae-family.png` | Mass casualty incident posture (see §1) |
| 4 | `resp-002` | Pneumothorax - Tension | `resp-002-construction-tension-pneumothorax.png` | Generated pneumothorax-specific asset |
| 5 | `resp-004` | Pulmonary Embolism | `home-medical-female-dubai-apartment.png` | Pulmonary embolism posture (see §1) |
| 6 | `resp-006` | Pneumothorax After Chest Trauma | `resp-002-construction-tension-pneumothorax.png` | Generated pneumothorax-specific asset |
| 7 | `resp-008` | Acute Pulmonary Edema | `resp-008-female-pulmonary-oedema-villa.png` | Generated female pulmonary-oedema asset |
| 8 | `trauma-004` | Penetrating Chest Trauma - Cardiac Tamponade | `trauma-004-park-stabbing-tamponade.png` | Generated non-graphic park emergency asset |
| 9 | `trauma-005` | Blunt Chest Trauma - Tension Pneumothorax with Flail Chest | `trauma-005-trapped-driver-flail-chest.png` | Generated trapped-driver chest-trauma asset |
| 10 | `trauma-006` | Massive Hemothorax - Penetrating Trauma | `home-medical-male-dubai-apartment.png` | Major / multi-trauma (RTC, GSW, stab) posture (see §1) |
| 11 | `trauma-012` | Drowning with Hypothermia | `home-medical-female-dubai-apartment.png` | Cardiac arrest (any rhythm) posture (see §1) |
| 12 | `env-002` | Heat Stroke with Altered Consciousness | `env-002-heat-stroke-jebel-ali.png` | Generated heat-stroke-specific asset |
| 13 | `litfl-012` | Subarachnoid Hemorrhage with Cerebral T Waves | `mall-foodcourt-chestpain-male-65.png` | Acute stroke / TIA posture (see §1) |
| 14 | `neuro-001` | Acute Ischemic Stroke - FAST Positive | `office-medical-dubai.png` | Acute stroke / TIA posture (see §1) |
| 15 | `neuro-003` | Meningitis | `home-medical-male-dubai-apartment.png` | Meningitis posture (see §1) |
| 16 | `resp-005` | Severe COPD Exacerbation | `home-medical-male-dubai-apartment.png` | COPD exacerbation posture (see §1) |
| 17 | `resp-010` | Refractory Anaphylaxis — Bee Sting | `construction-anaphylaxis-male-uae.png` | Generated anaphylaxis-specific asset |
| 18 | `y2-003` | Acute Stroke - Neurological Assessment Focus | `home-medical-male-dubai-apartment.png` | Acute stroke / TIA posture (see §1) |
| 19 | `y2-006` | TIA (Transient Ischaemic Attack) - Neurological Assessment | `home-medical-male-dubai-apartment.png` | Acute stroke / TIA posture (see §1) |
| 20 | `litfl-001` | Inferior STEMI with Right Ventricular Infarction | `construction-fall-male-29-dubaihills.png` | Cardiac chest pain (STEMI, NSTEMI, ACS, angina) posture (see §1) |

(27 cases have posture mismatch in total; top 20 by severity shown.)

## 5. New archetypes to commission

These case patterns recur in the bank but have no good current archetype. Generate one PNG per row below; each will cover several cases via the `ID_OVERRIDES` map in §6.

| Filename | What it covers | Why needed |
|---|---|---|
| `home-abdominal-female-uae.png` | Abdominal-pain female in foetal position in a UAE home | Covers metab-002 (DKA, partial) and other female abdominal pain cases. |
| `office-abdominal-male-uae.png` | Abdominal-pain male sitting forward at office desk holding RLQ | Covers y1-002 (25M abdo pain in office) and trauma-007 (abdominal trauma). |
| `airport-pe-female-uae.png` | Massive PE in a long-haul traveller at Dubai airport | Covers litfl-007 (42F airport PE). |
| `gym-cardiac-arrest-male-dubai.png` | Cardiac arrest mid-workout at a Dubai gym | Covers cardiac-013 (48M VF arrest in gym). |
| `hotel-room-medical-uae.png` | Patient critically unwell in a Dubai hotel room | Covers cardiac-007 (Russian tourist STEMI in hotel), resp-004 (42F PE in Dubai Marina hotel). |
| `parking-garage-opioid-od-uae.png` | Opioid overdose in a Dubai parking garage | Covers tox-002 (32M opioid OD). |
| `staff-accommodation-collapse-sharjah.png` | Sudden collapse in shared expat worker accommodation | Covers litfl-012 (35M Filipino subarachnoid haemorrhage in staff accommodation). |
| `beach-spinal-injury-uae.png` | Diving-accident spinal cord injury in Dubai shallow water | Covers trauma-010 (22M diving spinal injury). |
| `mci-highway-uae.png` | Mass casualty incident on Sheikh Zayed Road | Covers multi-001 (8-patient MCI bus vs car). |
| `nightclub-stabbing-male-dubai.png` | Penetrating chest trauma in a Dubai nightclub | Covers trauma-006 (26M massive haemothorax in nightclub). |
| `home-pulmonary-oedema-male-uae.png` | Pulmonary oedema patient sitting bolt upright on edge of bed | Covers cardiac-011 (68M decompensated HF), resp-008 (78F acute pulmonary oedema), cardiac-008 (72M LBBB-STEMI with SOB). |
| `home-stroke-elderly-male-uae.png` | Acute stroke patient slumped to one side in armchair | Covers neuro-001 (67M ischemic stroke), y2-003 (67M stroke), y2-006 (62M TIA). |
| `home-meningitis-young-adult-uae.png` | Meningitis patient in dim bedroom shielding eyes | Covers neuro-003 (25M meningitis at home), neuro-004 (20F meningitis in dorm — vary setting to dorm). |

### Prompts for the new archetypes

#### `home-abdominal-female-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Adult Middle Eastern female (20-40) on her side on a sofa or bed in a UAE apartment, knees drawn up to chest in foetal position, both hands cupping abdomen and guarding lower quadrants. Wincing, refusing to move, pale and clammy. Vomit bowl on floor. Warm interior light. Photorealistic, no on-image text or watermarks.

#### `office-abdominal-male-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Adult male in business shirt, sitting forward in office chair at a glass desk in a modern Dubai high-rise office, right hand pressed to right lower quadrant, left hand bracing on desk. Pale, sweating, guarding. Laptop and coffee mug on desk. Photorealistic, soft morning light, no on-image text or watermarks.

#### `airport-pe-female-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Adult European female (35-45) in tourist business-casual clothing, supine on the polished floor of Dubai International Airport Terminal 3 arrivals hall, near a baggage carousel. Cyanotic lips, profuse sweating, tachypneic — open mouth, accessory muscle use. Wheelchair nearby, suitcase tipped over. Airport medical responder kneeling beside with portable O2. Bright fluorescent overhead lighting, signage soft-blurred. Photorealistic, no on-image text or watermarks.

#### `gym-cardiac-arrest-male-dubai.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Adult male (35-50) in gym workout clothing, supine on rubber gym flooring between a squat rack and a deadlift platform. Bystander gym-goer performing chest compressions, AED case open with pads on bare chest. Other gym staff keeping bystanders back. Bright LED gym lighting, weights and equipment around. Photorealistic, no on-image text or watermarks.

#### `hotel-room-medical-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Adult patient in a Dubai upscale hotel room — beige carpet, blackout curtains half-drawn showing city view in early-morning light, king bed with sheets thrown back. Patient on edge of bed in distress. Suitcase on luggage rack. Photorealistic, no on-image text or watermarks. **[Insert posture per case — STEMI tourist, PE post-flight, anaphylaxis from room-service food.]**

#### `parking-garage-opioid-od-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Adult male (25-35), supine on concrete floor of an underground parking garage in Downtown Dubai. Cyanotic lips, slow shallow breathing, pinpoint pupils. Used syringe and tourniquet nearby. Dim fluorescent overhead light, concrete pillars and parked cars in background. Photorealistic, no on-image text or watermarks.

#### `staff-accommodation-collapse-sharjah.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Filipino male (30s) supine on the bathroom floor of a shared Al Nahda Sharjah staff accommodation flat. Vomitus near mouth, unresponsive, no external trauma. Concerned roommate at doorway. Modest bathroom with shared toiletries on shelf. Photorealistic, warm interior light, no on-image text or watermarks.

#### `beach-spinal-injury-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Young adult male (20s) supine in shallow water at Jumeirah Beach, head held in inline immobilisation by two bystanders kneeling in the surf. Body limp below shoulder level. Alert and frightened expression. Bright midday sun, palm trees and beach umbrellas in distance. Photorealistic, no on-image text or watermarks.

#### `mci-highway-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Major RTC on Sheikh Zayed Road: bus on its side with significant damage, car severely damaged, debris scattered across the highway. Multiple casualties — some walking wounded, some seated on the verge, some supine. Paramedics in hi-vis applying triage tags. Mall of Emirates skyline in distance, hot afternoon, asphalt heat shimmer. Photorealistic, no on-image text or watermarks.

#### `nightclub-stabbing-male-dubai.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Young adult male (25-35) supine on the floor of a darkened Dubai nightclub, flashing coloured lights, loud-music context. Pale, blood on chest from penetrating wound, paramedic in PPE kneeling beside applying pressure dressing. Security keeping crowd back. Photorealistic, no on-image text or watermarks.

#### `home-pulmonary-oedema-male-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Older Middle Eastern man (65-80) sitting bolt upright on the edge of a bed in a UAE home bedroom, legs dangling, both hands gripping the mattress edge. Cyanotic lips, pink frothy sputum at corners of mouth, open-mouth breathing, accessory neck muscle use. Pillow pushed away. Family member kneeling beside in worried posture. Photorealistic, warm evening light, no on-image text or watermarks.

#### `home-stroke-elderly-male-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Older Middle Eastern man (65-80) in armchair in a Dubai apartment living room, visibly slumped to right side, right arm hanging flaccid, mouth corner drooping on right. Confused, frustrated expression — unable to speak. Wife or daughter at his side holding his hand, clock visible on wall. Photorealistic, warm morning light, no on-image text or watermarks.

#### `home-meningitis-young-adult-uae.png`

**ChatGPT prompt:**

> Photoreal medical training scene, 16:9. Young adult patient lying in bed in a UAE apartment bedroom, curtains drawn, lights off, one hand shading eyes from any light (photophobia). Flushed/febrile, grimacing, neck rigidity implied (head not turning). Sheet pulled up, water glass on bedside. Photorealistic, very low light with single bedside lamp, no on-image text or watermarks.

## 6. Implementation note (after images are generated)

`src/lib/sceneImageSelection.ts` currently dispatches by regex on a haystack of `callReason + location + environment + description + bystanders + category + subcategory + title`. The safest, lowest-risk fix is a per-case override table at the top of `inferSceneImage()`:

```ts
// Add at top of inferSceneImage() before the regex dispatch:
const ID_OVERRIDES: Record<string, string> = {
  // Cardiac arrest in specific settings
  'cardiac-013':  '/scene-assets/gym-cardiac-arrest-male-dubai.png',
  'tox-002':      '/scene-assets/parking-garage-opioid-od-uae.png',

  // Travel medicine (hotel / airport)
  'cardiac-007':  '/scene-assets/hotel-room-medical-uae.png',
  'resp-004':     '/scene-assets/hotel-room-medical-uae.png',
  'litfl-007':    '/scene-assets/airport-pe-female-uae.png',

  // Pulmonary oedema — the misdiagnosed 'asthma' calls
  'cardiac-011':  '/scene-assets/home-pulmonary-oedema-male-uae.png',
  'resp-008':     '/scene-assets/home-pulmonary-oedema-male-uae.png',
  'cardiac-008':  '/scene-assets/home-pulmonary-oedema-male-uae.png',

  // Stroke
  'neuro-001':    '/scene-assets/home-stroke-elderly-male-uae.png',
  'y2-003':       '/scene-assets/home-stroke-elderly-male-uae.png',
  'y2-006':       '/scene-assets/home-stroke-elderly-male-uae.png',

  // Meningitis
  'neuro-003':    '/scene-assets/home-meningitis-young-adult-uae.png',
  'neuro-004':    '/scene-assets/home-meningitis-young-adult-uae.png',

  // Abdominal pain
  'y1-002':       '/scene-assets/office-abdominal-male-uae.png',
  'trauma-007':   '/scene-assets/office-abdominal-male-uae.png',
  'metab-002':    '/scene-assets/home-abdominal-female-uae.png',

  // Other setting-specific
  'trauma-006':   '/scene-assets/nightclub-stabbing-male-dubai.png',
  'trauma-010':   '/scene-assets/beach-spinal-injury-uae.png',
  'litfl-012':    '/scene-assets/staff-accommodation-collapse-sharjah.png',
  'multi-001':    '/scene-assets/mci-highway-uae.png',
};
if (caseData.id && ID_OVERRIDES[caseData.id]) return ID_OVERRIDES[caseData.id];
```

Then keep the existing regex selector as the fallback for cases without a per-case image yet. As more per-case images are generated, just add a row to `ID_OVERRIDES` — no other code changes needed.
