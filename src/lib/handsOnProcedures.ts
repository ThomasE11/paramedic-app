import type { CaseScenario } from '@/types';
import { inferInjuries, type BodyInjury, type BodyRegion } from '@/lib/injuryMap';
import { assessTractionSplintSafety } from '@/lib/tractionSplintSafety';
import { assessLimbSplintSafety, type LimbSplintTreatmentId } from '@/lib/limbSplintSafety';

export type ProcedureMotion =
  | 'prepare'
  | 'expose'
  | 'place'
  | 'press'
  | 'wrap'
  | 'tighten'
  | 'connect'
  | 'ventilate'
  | 'laryngoscopy'
  | 'confirm';

export type ProcedureSite = BodyRegion | 'right-chest' | 'left-chest';

export interface HandsOnProcedureStep {
  id: string;
  label: string;
  instruction: string;
  clinicalCue: string;
  motion: ProcedureMotion;
  durationMs: number;
}

export interface ProcedureTarget {
  id: ProcedureSite;
  label: string;
  detail: string;
  priority: 'injury' | 'available';
}

export interface HandsOnProcedurePlan {
  id: string;
  title: string;
  subtitle: string;
  treatmentId: string;
  requiresTarget: boolean;
  targets: ProcedureTarget[];
  steps: HandsOnProcedureStep[];
  equipmentAsset: string;
  completionLabel: string;
}

const BLEEDING_KINDS = new Set<BodyInjury['kind']>(['bleeding', 'wound', 'amputation']);
const LIMB_REGIONS: BodyRegion[] = ['right-arm', 'left-arm', 'right-leg', 'left-leg'];
const GENERAL_WOUND_REGIONS: BodyRegion[] = ['head', 'chest', 'abdomen', 'pelvis', ...LIMB_REGIONS];
const SPLINT_INJURY_KINDS = new Set<BodyInjury['kind']>(['deformity', 'fracture', 'rotation', 'shortening', 'swelling']);

const REGION_LABELS: Record<BodyRegion, string> = {
  head: 'Head / scalp',
  face: 'Face',
  neck: 'Neck',
  airway: 'Airway',
  chest: 'Chest',
  abdomen: 'Abdomen',
  pelvis: 'Pelvis',
  'right-arm': 'Right arm',
  'left-arm': 'Left arm',
  'right-leg': 'Right leg',
  'left-leg': 'Left leg',
  back: 'Posterior / back',
};

function injuryTargets(caseData: CaseScenario, limbOnly: boolean): ProcedureTarget[] {
  const injuries = inferInjuries(caseData);
  const allowed = limbOnly ? LIMB_REGIONS : GENERAL_WOUND_REGIONS;
  const candidates = injuries.filter(injury =>
    allowed.includes(injury.region) && BLEEDING_KINDS.has(injury.kind),
  );
  const unique = new Map<BodyRegion, ProcedureTarget>();
  for (const injury of candidates) {
    unique.set(injury.region, {
      id: injury.region,
      label: REGION_LABELS[injury.region],
      detail: injury.detail,
      priority: 'injury',
    });
  }
  if (unique.size) return [...unique.values()];
  return allowed.map(region => ({
    id: region,
    label: REGION_LABELS[region],
    detail: limbOnly ? 'Select the limb with life-threatening haemorrhage.' : 'Select the visible bleeding wound.',
    priority: 'available',
  }));
}

function limbInjuryTargets(caseData: CaseScenario): ProcedureTarget[] {
  const unique = new Map<BodyRegion, ProcedureTarget>();
  for (const injury of inferInjuries(caseData)) {
    if (!LIMB_REGIONS.includes(injury.region) || !SPLINT_INJURY_KINDS.has(injury.kind)) continue;
    unique.set(injury.region, {
      id: injury.region,
      label: REGION_LABELS[injury.region],
      detail: injury.detail,
      priority: 'injury',
    });
  }
  if (unique.size) return [...unique.values()];
  return LIMB_REGIONS.map(region => ({
    id: region,
    label: REGION_LABELS[region],
    detail: 'Select the injured limb identified during the secondary survey.',
    priority: 'available',
  }));
}

function burnInjuryTargets(caseData: CaseScenario): ProcedureTarget[] {
  const unique = new Map<BodyRegion, ProcedureTarget>();
  for (const injury of inferInjuries(caseData)) {
    if (injury.kind !== 'burn') continue;
    unique.set(injury.region, {
      id: injury.region,
      label: REGION_LABELS[injury.region],
      detail: injury.detail,
      priority: 'injury',
    });
  }
  if (unique.size) return [...unique.values()];
  return ['face', 'chest', 'right-arm', 'left-arm', 'right-leg', 'left-leg'].map(region => ({
    id: region as BodyRegion,
    label: REGION_LABELS[region as BodyRegion],
    detail: 'Select the burn identified during exposure and TBSA assessment.',
    priority: 'available' as const,
  }));
}

function isBurnCoolingCase(caseData: CaseScenario): boolean {
  return caseData.category === 'burns'
    || /\b(?:burns?|scald|flash[- ]burn)\b/i.test(`${caseData.subcategory} ${caseData.dispatchInfo?.callReason}`);
}

function accessTargets(kind: 'iv' | 'io'): ProcedureTarget[] {
  const regions: BodyRegion[] = kind === 'iv'
    ? ['right-arm', 'left-arm']
    : ['right-leg', 'left-leg', 'right-arm', 'left-arm'];
  return regions.map(region => ({
    id: region,
    label: REGION_LABELS[region],
    detail: kind === 'iv' ? 'Choose a suitable peripheral vein.' : 'Choose an age-appropriate IO landmark without fracture or infection.',
    priority: 'available',
  }));
}

function thoracicTargets(
  caseData: CaseScenario,
  treatment: 'seal' | 'decompression',
): ProcedureTarget[] {
  const strings = [
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.description,
    caseData.initialPresentation?.appearance,
    ...(caseData.secondarySurvey?.chest ?? []),
    ...(caseData.abcde?.breathing?.findings ?? []),
    ...(caseData.abcde?.circulation?.findings ?? []),
    ...(caseData.abcde?.exposure?.findings ?? []),
  ].filter((value): value is string => Boolean(value));
  const relevant = strings
    .flatMap(value => value.toLowerCase().split(/[.;,]|\band\b/))
    .filter(clause => /chest|thorax|pneumo|breath sound|air entry|sucking|penetrat|stab|gunshot|decompress/.test(clause));
  const authoredSides = (['right', 'left'] as const).filter(side =>
    relevant.some(clause => new RegExp(`\\b${side}(?:-sided)?\\b`).test(clause)),
  );
  const sides = authoredSides.length > 0 ? authoredSides : (['right', 'left'] as const);
  const procedure = treatment === 'seal' ? 'open chest wound' : 'tension physiology';

  return sides.map(side => ({
    id: `${side}-chest` as ProcedureSite,
    label: `${side[0].toUpperCase()}${side.slice(1)} chest`,
    detail: authoredSides.includes(side)
      ? `Case findings localise the ${procedure} to this side.`
      : `Select only after assessment localises the ${procedure} to this side.`,
    priority: authoredSides.includes(side) ? 'injury' : 'available',
  }));
}

function requiresSpinalAirwayPrecautions(caseData: CaseScenario): boolean {
  const text = [
    caseData.category,
    caseData.subcategory,
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.description,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.position,
    ...(caseData.abcde?.exposure?.findings ?? []),
    ...(caseData.secondarySurvey?.head ?? []),
    ...(caseData.secondarySurvey?.neck ?? []),
    ...(caseData.secondarySurvey?.posterior ?? []),
  ].filter(Boolean).join(' ').toLowerCase();

  return caseData.category === 'trauma'
    || /\b(collision|crash|fall|fallen|struck|blunt|penetrating|spinal|c[ -]?spine|neck injury|head injury|polytrauma|extricat)/.test(text);
}

const STEP = (
  id: string,
  label: string,
  instruction: string,
  clinicalCue: string,
  motion: ProcedureMotion,
  durationMs = 850,
): HandsOnProcedureStep => ({ id, label, instruction, clinicalCue, motion, durationMs });

export function getHandsOnProcedurePlan(
  treatmentId: string,
  caseData: CaseScenario,
  appliedTreatmentIds: string[] = [],
): HandsOnProcedurePlan | null {
  if (treatmentId === 'aed' || treatmentId === 'monitor_pads') {
    return {
      id: 'defib-pads',
      title: 'Attach defibrillator pads',
      subtitle: 'Expose, prepare and connect the chest before rhythm analysis or shock.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/defib-pads.webp',
      completionLabel: 'Pads connected — analyse rhythm',
      steps: [
        STEP('expose', 'Expose the chest', 'Remove or cut clothing. Preserve dignity while fully clearing pad sites.', 'Chest fully exposed; remove medication patches and metal jewellery.', 'expose'),
        STEP('prepare', 'Prepare the skin', 'Dry moisture and rapidly shave only where hair prevents pad adhesion.', 'The adhesive must make full skin contact.', 'prepare'),
        STEP('sternal', 'Place sternal pad', 'Apply below the right clavicle, lateral to the sternum.', 'Do not place over bone, breast tissue, wounds or implanted devices.', 'place'),
        STEP('apical', 'Place apical pad', 'Apply on the left lateral chest, below the axilla.', 'Pads must be separated and form an anterior-lateral vector through the heart.', 'place'),
        STEP('connect', 'Connect and verify', 'Connect the pad lead to the monitor/AED and confirm a clean rhythm trace.', 'Pads attached. Nobody touches the patient during rhythm analysis.', 'connect'),
      ],
    };
  }

  if (treatmentId === 'airway_open') {
    const spinalPrecautions = requiresSpinalAirwayPrecautions(caseData);
    return {
      id: spinalPrecautions ? 'airway-jaw-thrust' : 'airway-head-tilt-chin-lift',
      title: spinalPrecautions ? 'Open the airway with a jaw thrust' : 'Open the airway with head tilt–chin lift',
      subtitle: spinalPrecautions
        ? 'Maintain manual in-line stabilisation and advance the mandible without deliberately extending the neck.'
        : 'Position the head and lift the bony chin to relieve soft-tissue obstruction.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/positioning.webp',
      completionLabel: 'Airway patent — manoeuvre maintained',
      steps: spinalPrecautions ? [
        STEP('assess', 'Confirm the airway needs support', 'Check response, visible obstruction, airway sounds and spontaneous air movement while a second clinician maintains alignment.', 'A talking patient has a patent airway. Treat the cause rather than forcing a manoeuvre they do not need.', 'prepare'),
        STEP('align', 'Hold manual in-line stabilisation', 'Support the head in the position found and keep the neck aligned without traction while preparing to open the airway.', 'Airway takes priority, but avoid unnecessary cervical movement in suspected trauma.', 'place'),
        STEP('manoeuvre', 'Apply a bilateral jaw thrust', 'Place fingers behind both mandibular angles and lift the mandible forward; use the thumbs to open the mouth if required.', 'Lift the jaw itself. Do not press into the soft tissues beneath the chin or force neck extension.', 'place', 1200),
        STEP('clear', 'Inspect the opened airway', 'Look for blood, vomit, secretions or a visible foreign body and suction or remove only what can be seen safely.', 'The manoeuvre relieves tongue obstruction; it does not clear contamination.', 'expose'),
        STEP('confirm', 'Confirm and maintain patency', 'Look for chest movement, listen and feel for air movement, reassess airway sounds and monitor SpO₂ while maintaining the jaw thrust.', 'If patency cannot be maintained manually, escalate to suction, an appropriate adjunct and ventilation support.', 'confirm', 1100),
      ] : [
        STEP('assess', 'Confirm the airway needs support', 'Check response, visible obstruction, airway sounds and spontaneous air movement.', 'A talking patient has a patent airway. Treat the cause rather than forcing a manoeuvre they do not need.', 'prepare'),
        STEP('position', 'Position the head', 'Place one hand on the forehead and gently tilt the head while preserving a safe, stable body position.', 'Do not use head tilt when trauma or cervical injury is suspected.', 'place'),
        STEP('manoeuvre', 'Lift the bony chin', 'Place fingertips under the bony point of the chin and lift anteriorly to move the tongue away from the posterior pharynx.', 'Do not compress the soft tissue beneath the chin; that can worsen obstruction.', 'place', 1200),
        STEP('clear', 'Inspect the opened airway', 'Look for blood, vomit, secretions or a visible foreign body and suction or remove only what can be seen safely.', 'Never perform a blind finger sweep.', 'expose'),
        STEP('confirm', 'Confirm and maintain patency', 'Look for chest movement, listen and feel for air movement, reassess airway sounds and monitor SpO₂ while maintaining position.', 'If patency cannot be maintained manually, escalate to suction, an appropriate adjunct and ventilation support.', 'confirm', 1100),
      ],
    };
  }

  if (treatmentId === 'bleeding_control') {
    return {
      id: 'bleeding-control',
      title: 'Control external haemorrhage',
      subtitle: 'Treat the wound you can see; source control applies only to the selected site.',
      treatmentId,
      requiresTarget: true,
      targets: injuryTargets(caseData, false),
      equipmentAsset: '/equipment-assets/pressure-dressing-fitted-front-v2.png',
      completionLabel: 'Secure dressing and reassess',
      steps: [
        STEP('expose', 'Expose the wound', 'Cut clothing away and identify the exact bleeding source.', 'Look for spurting, pooling, deep cavities and foreign bodies.', 'expose'),
        STEP('pressure', 'Apply direct pressure', 'Place a sterile dressing directly over the source and press firmly.', 'Maintain uninterrupted pressure; do not repeatedly lift the dressing to look.', 'press', 1100),
        STEP('pack', 'Pack if required', 'For a deep junctional cavity, pack firmly to the source before continuing pressure.', 'Pack the cavity, not just its surface. Do not pack chest or abdominal penetrations.', 'press', 1000),
        STEP('wrap', 'Secure pressure dressing', 'Wrap firmly enough to maintain pressure without losing distal perfusion.', 'Bleeding should stop; check distal colour, warmth, movement, sensation and pulse.', 'wrap', 1200),
        STEP('confirm', 'Reassess haemorrhage', 'Watch the selected site for breakthrough bleeding.', 'If blood soaks through, add pressure or escalate to tourniquet where anatomically appropriate.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'tourniquet') {
    return {
      id: 'tourniquet',
      title: 'Apply windlass tourniquet',
      subtitle: 'A tourniquet is site-specific and appropriate only for life-threatening limb haemorrhage.',
      treatmentId,
      requiresTarget: true,
      targets: injuryTargets(caseData, true),
      equipmentAsset: '/equipment-assets/tourniquet.webp',
      completionLabel: 'Bleeding stopped — record time',
      steps: [
        STEP('expose', 'Expose and locate', 'Identify the limb wound and clear clothing from the application site.', 'Place 5–7 cm proximal to the wound, never over a joint.', 'expose'),
        STEP('place', 'Position the strap', 'Route the strap around the selected limb, proximal to the wound.', 'If the wound cannot be seen in a time-critical situation, place high and tight.', 'place'),
        STEP('tighten', 'Remove all slack', 'Pull the free end firmly before using the windlass.', 'A loose strap makes windlass turns ineffective and increases pain.', 'tighten', 1000),
        STEP('windlass', 'Turn the windlass', 'Twist until bleeding stops and the distal pulse is absent.', 'Stopping because it hurts is not source control.', 'tighten', 1300),
        STEP('secure', 'Secure and document', 'Lock the windlass, expose the device and record application time.', 'Do not cover or periodically loosen the tourniquet in prehospital care.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'pelvic_binder') {
    return {
      id: 'pelvic-binder',
      title: 'Apply pelvic binder',
      subtitle: 'Stabilise a suspected unstable pelvic injury at the greater trochanters with minimal patient movement.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/pelvic-binder.svg',
      completionLabel: 'Binder secured — trend perfusion',
      steps: [
        STEP('assess', 'Confirm the indication', 'Use the mechanism, pain, deformity and shock pattern to suspect pelvic ring injury. Explain the procedure if the patient is conscious.', 'Do not repeatedly spring or rock the pelvis: a single gentle assessment is enough and may already have occurred.', 'prepare'),
        STEP('prepare', 'Prepare with minimal movement', 'Expose only enough to identify both greater trochanters, empty bulky pockets and keep the legs aligned. Assign one clinician to control movement.', 'The binder belongs at hip level, not around the waist or iliac crests.', 'expose'),
        STEP('position', 'Position at the trochanters', 'Slide the open binder beneath the knees and work it proximally to centre over both greater trochanters without lifting or rolling the pelvis unnecessarily.', 'Confirm the broad belt is level and its centre line crosses the most prominent lateral points of both upper femurs.', 'place', 1300),
        STEP('close', 'Close and tension', 'Overlap the binder and pull the tension strap smoothly while a second clinician maintains alignment; secure the fastening at the device indicator.', 'Use controlled circumferential compression. Do not release the binder to recheck pelvic instability.', 'tighten', 1300),
        STEP('reassess', 'Reassess and document', 'Repeat distal pulses, motor and sensation, pain, skin, heart rate and blood pressure. Record time, position and response before rapid transport.', 'Keep the binder visible, protect skin and pressure points, and leave it secured unless directed by definitive care.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'assist_delivery') {
    return {
      id: 'imminent-normal-delivery',
      title: 'Assist imminent normal delivery',
      subtitle: 'Protect dignity, support physiology and make the newborn transition visible without pulling or rushing the birth.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/delivery-kit.webp',
      completionLabel: 'Mother and newborn stable — continue reassessment',
      steps: [
        STEP('confirm-imminent', 'Confirm delivery is imminent', 'Gain consent, expose only the perineum with a dignity sheet, identify crowning and ask about parity, gestation, membrane rupture, liquor and complications.', 'Visible crowning means remain on scene. Check for cord prolapse, abnormal presentation, meconium or major bleeding before proceeding.', 'expose'),
        STEP('prepare', 'Prepare the delivery field', 'Use PPE, place a clean absorbent underpad, open the delivery kit and position two warm dry towels, neonatal cap, cord clamps, suction and resuscitation equipment within reach.', 'Call for appropriate backup and record the time. Routine suction is not required for a vigorous newborn.', 'prepare'),
        STEP('position', 'Support the mother', 'Maintain a supported semi-recumbent position with knees flexed, preserve warmth and privacy, and coach controlled breathing between contractions.', 'Do not place a term patient flat supine; avoid aortocaval compression.', 'place'),
        STEP('support-head', 'Support the emerging head', 'With a clean gloved hand, support controlled extension of the head and protect the perineum as the mother pushes with contractions.', 'Guide only. Never pull on the head or attempt to delay a normal birth.', 'place', 1300),
        STEP('cord', 'Check for a nuchal cord', 'After the head delivers, feel gently around the neck. Slip a loose loop over the head; if too tight to reduce, clamp twice and cut between clamps.', 'Allow restitution and check that the airway is clear. Do not perform blind or routine suction.', 'expose'),
        STEP('birth', 'Guide shoulders and body', 'Support the head as the anterior shoulder delivers, then lift the newborn securely with both hands as the posterior shoulder and body follow.', 'Expect a slippery newborn. Keep the body level, apply no traction and record the birth time.', 'place', 1400),
        STEP('newborn', 'Dry, stimulate and keep warm', 'Place the vigorous newborn skin-to-skin on the mother, dry thoroughly, remove wet towels, apply a cap and cover both. Assess breathing, heart rate, tone and colour.', 'Start the newborn resuscitation pathway if apnoeic, gasping or heart rate is below 100/min. Record APGAR at 1 and 5 minutes.', 'wrap', 1300),
        STEP('placenta', 'Protect the third stage', 'Do not pull the cord. Observe for placental delivery, retain it for inspection, massage the uterus only according to local protocol and quantify blood loss.', 'Monitor maternal pulse, blood pressure, uterine tone and bleeding continuously; treat postpartum haemorrhage immediately if it develops.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'paced_breathing') {
    return {
      id: 'paced-breathing-coaching',
      title: 'Coach paced breathing',
      subtitle: 'Use a calm, patient-led cadence only after checking that the fast breathing is not an untreated organic emergency.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/positioning.webp',
      completionLabel: 'Cycle complete — reassess cause and response',
      steps: [
        STEP('exclude', 'Check for an organic emergency', 'Confirm SpO₂, chest expansion and sounds, pulse, ECG when indicated, blood glucose and red flags such as chest pain, wheeze, syncope, fever or thromboembolic risk.', 'Hyperventilation is a diagnosis of exclusion. Treat hypoxia, bronchospasm, cardiac or metabolic illness first.', 'confirm'),
        STEP('engage', 'Gain permission and set the pace', 'Sit at eye level, validate the distress and ask the patient to follow your hand or voice. Keep the scene quiet and avoid crowding.', 'Do not tell the patient to “just calm down”; give one simple task at a time.', 'prepare'),
        STEP('inhale', 'Guide a four-count inhale', 'Model a gentle diaphragmatic breath in through the nose for four counts without forcing a maximal inspiration.', 'Shoulders should soften; large repeated gasps can perpetuate symptoms.', 'ventilate', 1200),
        STEP('exhale', 'Guide a six-count exhale', 'Coach a relaxed breath out through pursed lips for six counts, making the exhalation longer than the inhalation.', 'Never use paper-bag rebreathing; it can worsen unrecognised hypoxia.', 'ventilate', 1300),
        STEP('cycles', 'Repeat five observed cycles', 'Continue the 4-in/6-out cadence, allowing a brief natural pause and adjusting to what the patient can comfortably follow.', 'Stay with the patient and watch speech, work of breathing, colour and cooperation rather than staring only at the monitor.', 'ventilate', 1400),
        STEP('reassess', 'Reassess symptoms and physiology', 'Repeat respiratory rate, pulse, SpO₂, chest findings and symptom severity; ask about tingling, dizziness, chest discomfort and sense of control.', 'A failure to improve or any new red flag means reopen the differential and escalate assessment or transport.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'back_blows') {
    const repeatedCycle = appliedTreatmentIds.includes('abdominal_thrusts');
    return {
      id: 'adult-fbao-back-blows',
      title: repeatedCycle ? 'Repeat five back blows' : 'Give five back blows',
      subtitle: 'Treat severe foreign-body airway obstruction one deliberate blow at a time, checking whether the object clears.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/choking-manoeuvres.svg',
      completionLabel: 'Five delivered — reassess airway',
      steps: [
        STEP('recognise', 'Confirm severe obstruction', 'Ask “Are you choking?” and look for an ineffective or absent cough, inability to speak, cyanosis or deteriorating consciousness.', 'If the patient can cough effectively, encourage coughing instead. Activate the emergency response for severe obstruction.', 'prepare'),
        STEP('position', 'Lean and support forward', 'Stand to the side and slightly behind. Support the chest with one hand and lean the patient well forward.', 'Forward positioning helps an expelled object leave the mouth rather than travel deeper.', 'place'),
        STEP('blow-1-2', 'Deliver blows 1 and 2', 'Strike firmly between the shoulder blades with the heel of your free hand, then check the mouth and response after each blow.', 'Each blow is a separate attempt; stop immediately if the airway clears.', 'press', 1200),
        STEP('blow-3-5', 'Deliver blows 3 to 5', 'Continue up to five total firm back blows, checking effectiveness after every strike.', 'Do not deliver all five automatically if the object is expelled earlier.', 'press', 1300),
        STEP('reassess', 'Reassess the airway', 'Check speech, cough, air movement, colour and consciousness without delaying the next manoeuvre.', 'If still conscious with severe obstruction, move immediately to five abdominal thrusts. If unresponsive, start CPR.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'abdominal_thrusts') {
    return {
      id: 'adult-fbao-abdominal-thrusts',
      title: 'Give five abdominal thrusts',
      subtitle: 'Follow ineffective back blows with correctly positioned inward-and-upward thrusts.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/choking-manoeuvres.svg',
      completionLabel: 'Five delivered — reassess airway',
      steps: [
        STEP('recheck', 'Reconfirm severe obstruction', 'Verify that back blows have not cleared the obstruction and that the patient remains conscious.', 'If the patient becomes unresponsive, lower them safely and begin CPR. Do not continue standing thrusts.', 'confirm'),
        STEP('position', 'Position behind the patient', 'Stand behind, lean the patient slightly forward and pass both arms around the upper abdomen.', 'Use chest thrusts instead for late pregnancy or when the abdomen cannot be encircled.', 'place'),
        STEP('hands', 'Place the hands correctly', 'Make a fist and place its thumb side between the umbilicus and lower end of the sternum; grasp it with the other hand.', 'Keep the fist off the xiphoid process and lower ribs to reduce injury.', 'place'),
        STEP('thrusts', 'Deliver five thrusts', 'Pull sharply inward and upward up to five times, releasing between attempts and checking after each one.', 'Each thrust is a distinct attempt. Stop as soon as the object is expelled.', 'press', 1400),
        STEP('reassess', 'Reassess and choose the next action', 'Check speech, cough, air movement, colour and consciousness.', 'If obstruction persists and the patient remains conscious, return to five back blows. If unresponsive, start CPR and look only for a visible object before breaths.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'oxygen_nonrebreather' || treatmentId === 'oxygen_mask' || treatmentId === 'oxygen_nasal') {
    const nonRebreather = treatmentId === 'oxygen_nonrebreather';
    const nasal = treatmentId === 'oxygen_nasal';
    return {
      id: `oxygen-${treatmentId}`,
      title: nasal ? 'Apply nasal cannula' : nonRebreather ? 'Apply non-rebreather mask' : 'Apply oxygen mask',
      subtitle: 'Oxygen delivery requires a connected supply, selected flow and a fitted interface.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: nasal ? '/equipment-assets/nasal-cannula.webp' : nonRebreather ? '/equipment-assets/nonrebreather-mask-v2.webp' : '/equipment-assets/oxygen-mask-front.webp',
      completionLabel: 'Oxygen running — reassess SpO₂',
      steps: [
        STEP('connect', 'Connect oxygen tubing', 'Attach tubing to the regulator outlet and open the cylinder.', 'Confirm adequate cylinder pressure and listen for flow.', 'connect'),
        ...(nonRebreather ? [STEP('reservoir', 'Pre-inflate reservoir', 'Set 10–15 L/min and occlude the valve until the reservoir fills.', 'Never place a collapsed reservoir mask on the patient.', 'ventilate', 1100)] : []),
        STEP('apply', nasal ? 'Position the prongs' : 'Seat the mask', nasal ? 'Insert prongs in the nares and route tubing over the ears.' : 'Place over nose and mouth, then position the elastic strap.', 'Check comfort, seal and skin pressure points.', 'place'),
        STEP('flow', 'Set prescribed flow', nasal ? 'Set 2–6 L/min according to target saturation.' : nonRebreather ? 'Maintain 10–15 L/min so the bag stays inflated during inspiration.' : 'Set 6–10 L/min to prevent CO₂ rebreathing.', 'Use the case-specific SpO₂ target; avoid uncontrolled oxygen in known CO₂ retainers.', 'connect'),
        STEP('confirm', 'Confirm response', 'Observe chest movement, work of breathing, SpO₂ trend and patient tolerance.', 'A number improving does not replace reassessment of the patient.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'intubation' || treatmentId === 'rsi_intubation') {
    const rsi = treatmentId === 'rsi_intubation';
    return {
      id: rsi ? 'rsi-intubation' : 'intubation',
      title: rsi ? 'Rapid sequence intubation' : 'Endotracheal intubation',
      subtitle: 'The airway is not secured until tube position is confirmed with waveform capnography.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/ett-secured-front-v2.png',
      completionLabel: 'Tube secured — ventilate and monitor',
      steps: [
        STEP('prepare', 'Prepare and preoxygenate', 'Check suction, BVM, laryngoscope, tube, stylet, bougie and rescue airway. Preoxygenate.', 'State a failed-airway plan before induction.', 'prepare', 1200),
        ...(rsi ? [STEP('induction', 'Induce and paralyse', 'Administer weight-based induction and neuromuscular blockade with continuous monitoring.', 'Confirm drug, dose, route and onset before laryngoscopy.', 'prepare', 1000)] : []),
        STEP('position', 'Position the airway', 'Optimise head position while maintaining manual in-line stabilisation when indicated.', 'Use external laryngeal manipulation if the view is poor.', 'place'),
        STEP('visualise', 'Perform laryngoscopy', 'Insert from the right, sweep the tongue and identify epiglottis then vocal cords.', 'Do not pass a tube blindly. Abort and oxygenate if saturation falls.', 'laryngoscopy', 1300),
        STEP('tube', 'Pass the tube', 'Advance through the cords, remove stylet, inflate cuff and note depth at the teeth.', 'Watch the cuff pass just beyond the cords.', 'place', 1100),
        STEP('capnography', 'Confirm placement', 'Attach waveform capnography, observe sustained trace, auscultate both axillae and epigastrium.', 'Persistent waveform EtCO₂ is the primary confirmation; misting alone is unreliable.', 'connect', 1200),
        STEP('secure', 'Secure and reassess', 'Secure the tube, record depth and reassess after every movement.', 'Monitor EtCO₂, SpO₂, chest rise and tube depth continuously.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'surgical_cric') {
    return {
      id: 'surgical-front-of-neck-airway',
      title: 'Emergency front-of-neck airway',
      subtitle: 'A scalpel–bougie–tube rescue for a declared cannot-intubate/cannot-oxygenate emergency.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/fona-kit.svg',
      completionLabel: 'FONA secured — ventilate and monitor',
      steps: [
        STEP('declare', 'Declare CICO and call for help', 'State that intubation and oxygenation have failed, summon the airway/resuscitation team, continue 100% oxygen from above and assign roles.', 'This is a last-resort trained-rescuer intervention. Do not delay once cannot-intubate/cannot-oxygenate is declared.', 'prepare'),
        STEP('position', 'Position and identify the membrane', 'Extend the neck when safe and use a laryngeal handshake to stabilise the larynx and identify the cricothyroid membrane.', 'If landmarks are impalpable, use a vertical skin incision and blunt dissection to identify the membrane.', 'place'),
        STEP('prepare', 'Prepare scalpel, bougie and tube', 'Open a number 10 scalpel, coude-tip bougie, lubricated cuffed 6.0 mm tracheal tube, syringe, circuit and waveform capnography.', 'Keep the blade visible and confirm the bougie tip orientation before cutting.', 'prepare'),
        STEP('incise', 'Open the cricothyroid membrane', 'Stabilise the larynx, incise the membrane, rotate the blade with its sharp edge caudally and maintain the opening.', 'Expect bleeding; keep the tract open and do not direct the blade cephalad.', 'press', 1300),
        STEP('bougie', 'Pass the bougie', 'Slide the coude tip along the blade into the trachea, then remove the scalpel while maintaining bougie control.', 'Tracheal clicks and distal hold-up support tracheal placement; never force against resistance.', 'place', 1200),
        STEP('tube', 'Railroad and cuff the tube', 'Pass the lubricated 6.0 cuffed tube over the bougie, remove the bougie, inflate the cuff and connect the ventilation circuit.', 'Avoid advancing too deeply; support the tube throughout connection.', 'connect', 1300),
        STEP('confirm', 'Ventilate, confirm and secure', 'Deliver a breath, observe chest rise and confirm a sustained waveform EtCO₂ trace; auscultate, secure the tube and document depth/time.', 'No sustained capnography means placement is unconfirmed. Reassess after every movement and arrange urgent surgical review.', 'confirm', 1200),
      ],
    };
  }

  if (treatmentId === 'magill_forceps') {
    return {
      id: 'direct-vision-foreign-body-removal',
      title: 'Remove visible airway foreign body',
      subtitle: 'Use laryngoscopy and Magill forceps only under direct vision; never perform a blind sweep.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/magill-forceps-kit.svg',
      completionLabel: 'Object removed — reoxygenate and reassess',
      steps: [
        STEP('prepare', 'Prepare oxygen, suction and rescue airway', 'Call for help, preoxygenate where possible, check suction and open the laryngoscope, Magill forceps, BVM and advanced-airway equipment.', 'The attempt must be brief. Return immediately to oxygenation if saturation or heart rate worsens.', 'prepare'),
        STEP('position', 'Position and open the airway', 'Place the unresponsive patient supine, optimise head position while maintaining trauma precautions, and open the mouth.', 'Do not attempt this in a conscious patient who can still protect their airway.', 'place'),
        STEP('visualise', 'Perform direct laryngoscopy', 'Insert the laryngoscope, sweep the tongue and expose the oropharynx and laryngeal inlet.', 'Proceed only when the foreign body is directly seen. Never probe blindly.', 'laryngoscopy', 1300),
        STEP('insert', 'Advance the forceps under vision', 'Introduce the closed Magill forceps along the blade while keeping the jaws and foreign body continuously visible.', 'Avoid the vocal cords and do not push the object farther into the airway.', 'place', 1100),
        STEP('remove', 'Grasp and withdraw the object', 'Open around the object, grasp securely and withdraw forceps and foreign body together under direct vision.', 'Stop if the object fragments or resistance suggests it is lodged beyond safe reach.', 'tighten', 1300),
        STEP('confirm', 'Reoxygenate and reassess', 'Remove loose visible debris, ventilate with BVM, check bilateral air entry, chest rise, SpO₂, EtCO₂ and return of spontaneous breathing.', 'If obstruction persists, continue the failed-airway pathway and prepare definitive rescue access.', 'confirm', 1200),
      ],
    };
  }

  if (treatmentId === 'orogastric_tube') {
    return {
      id: 'orogastric-decompression',
      title: 'Insert an orogastric decompression tube',
      subtitle: 'Measure, insert and verify gastric placement before connecting drainage or introducing anything through the tube.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/gastric-tube-kit.svg',
      completionLabel: 'Placement confirmed — decompression active',
      steps: [
        STEP('indication', 'Confirm indication and route', 'Confirm gastric decompression is required after airway control; review facial/base-of-skull injury, oesophageal pathology and bleeding risk.', 'Use the orogastric route for this secured-airway decompression sequence. Do not place a nasal tube through suspected base-of-skull or severe mid-face injury.', 'prepare'),
        STEP('measure', 'Measure and mark insertion length', 'Measure from the corner of the mouth to the ear lobe and then to the xiphisternum; mark and record the intended external length.', 'An unmeasured tube can remain in the oesophagus or advance too far.', 'prepare'),
        STEP('prepare', 'Prepare patient and tube', 'Preoxygenate, position safely, lubricate the distal tube with water-soluble gel, keep suction ready and assign one clinician to stabilise the airway tube.', 'Stop for falling SpO₂, bradycardia, resistance, bleeding or airway-tube movement.', 'prepare'),
        STEP('insert', 'Advance to the measured mark', 'Guide the tube through the mouth and posterior pharynx, advancing gently to the recorded mark without forcing resistance.', 'Watch continuously for coiling in the mouth and protect the existing airway tube.', 'place', 1400),
        STEP('secure', 'Secure and record external length', 'Fix the tube without pressure injury or traction and document the length at the mouth.', 'A change in external length later means displacement until proven otherwise.', 'wrap'),
        STEP('confirm', 'Confirm gastric placement', 'Aspirate gastric contents and test with an approved pH strip. Accept pH 1–5.5; if no aspirate or pH is above 5.5, obtain an appropriately interpreted X-ray.', 'Do not use air insufflation, a “whoosh” on auscultation, aspirate appearance or absence of distress to confirm placement.', 'confirm', 1300),
        STEP('decompress', 'Connect drainage and reassess', 'Only after confirmation, connect free drainage or prescribed suction and monitor output, abdominal distension, ventilation pressures and tube position.', 'Reconfirm placement after movement, coughing, retching or any change in external length.', 'connect', 1100),
      ],
    };
  }

  if (treatmentId === 'ett_confirmation') {
    return {
      id: 'ett-placement-confirmation',
      title: 'Confirm endotracheal tube placement',
      subtitle: 'A tube is not secured until placement, depth and ventilation are clinically confirmed and continuously monitored.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/et-tube.webp',
      completionLabel: 'ETT confirmed and secured',
      steps: [
        STEP('depth', 'Check tube depth and cuff', 'Visualise the tube passing the cords when possible, read the depth at the teeth/lips and verify cuff inflation without excessive pressure.', 'A depth number is a baseline for detecting later migration; document it clearly.', 'prepare'),
        STEP('capnography', 'Attach waveform capnography', 'Connect the capnography adapter and ventilate while observing for a sustained waveform over consecutive breaths.', 'A sustained EtCO₂ waveform is the primary confirmation. Colour change or misting alone is insufficient.', 'connect', 1200),
        STEP('chest', 'Inspect bilateral chest movement', 'Observe equal chest rise and look for neck or abdominal distension during controlled ventilation.', 'Unilateral rise may indicate mainstem placement; absent rise may indicate obstruction or oesophageal placement.', 'ventilate'),
        STEP('auscultate', 'Perform five-point auscultation', 'Listen at both upper and lower lateral chest fields, then over the epigastrium while ventilating.', 'Bilateral air entry with no epigastric insufflation supports—not replaces—waveform confirmation.', 'confirm', 1200),
        STEP('secure', 'Secure and record', 'Secure the tube, record depth, EtCO₂, chest findings and time, then protect the circuit from traction.', 'Reconfirm after every move, transfer, disconnection or unexplained physiological change.', 'wrap'),
        STEP('trend', 'Trend ventilation continuously', 'Monitor waveform EtCO₂, SpO₂, airway pressures, chest movement and tube depth continuously.', 'A previously confirmed tube can dislodge; confirmation is an ongoing process.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'bvm_ventilation') {
    const ageYears = caseData.patientInfo?.age;
    const weightKg = caseData.patientInfo?.weight;
    const singlePatient = !caseData.mci?.isMCI && typeof weightKg === 'number' && weightKg > 0;
    const newborn = singlePatient && typeof ageYears === 'number' && ageYears < (1 / 12);
    const infant = singlePatient && typeof ageYears === 'number' && ageYears < 1;
    const child = singlePatient && typeof ageYears === 'number' && ageYears < 12;
    const patientGroup = newborn ? 'newborn' : infant ? 'infant' : child ? 'child' : 'adult';
    const title = patientGroup === 'adult'
      ? 'Apply bag-valve-mask ventilation'
      : `Apply ${patientGroup} bag-valve-mask ventilation`;
    const sizeInstruction = newborn
      ? 'Select a neonatal bag or T-piece and a mask that covers the chin, mouth and nose without covering the eyes; connect the prescribed gas supply.'
      : infant
        ? 'Select a paediatric self-inflating bag and an infant mask that covers the chin, mouth and nose without covering the eyes; connect reservoir and oxygen tubing.'
        : child
          ? 'Select a paediatric bag and the smallest mask that seals from the bridge of the nose to the cleft of the chin; connect reservoir and oxygen tubing.'
          : 'Connect the correctly sized mask, bag, reservoir and oxygen tubing; set 15 L/min.';
    const positionInstruction = newborn || infant
      ? 'Place the head in a neutral position, using a small shoulder roll if the occiput flexes the neck; use a jaw thrust when trauma is suspected.'
      : child
        ? 'Position the head neutrally or in a gentle sniffing position; use a jaw thrust when trauma is suspected.'
        : 'Use head tilt–chin lift or jaw thrust when trauma is suspected.';
    const sealInstruction = newborn || infant
      ? 'Seat the mask chin-first over the mouth and nose, lift the mandible into the mask and use a two-person seal if one hand cannot prevent a leak.'
      : child
        ? 'Seat the mask from chin to nose, lift the mandible into it and use a two-person thenar-eminent seal if ventilation is ineffective.'
        : 'Seat the mask bridge-first and use a two-person thenar-eminent grip where possible.';
    const ventilationCue = newborn
      ? 'Use 30–60 inflations/min and reassess chest movement and heart rate; excessive pressure or volume can injure newborn lungs.'
      : infant || child
        ? 'Use 20–30 breaths/min when providing breaths with a pulse; reassess pulse and ventilation every 2 minutes and avoid excessive volume.'
        : 'Excess rate or volume causes gastric inflation and reduces venous return.';

    return {
      id: 'bvm-ventilation', title,
      subtitle: `${patientGroup === 'adult' ? 'Adult' : `${patientGroup[0].toUpperCase()}${patientGroup.slice(1)}`} ventilation requires a correctly sized interface, airway position and the smallest breath that produces visible chest rise.`,
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/bvm-face-seal-v2.png',
      completionLabel: 'Seal confirmed — begin timed ventilation',
      steps: [
        STEP('prepare', `Prepare the ${patientGroup} circuit`, sizeInstruction, 'Confirm the mask size and reservoir inflation before the first assisted breath.', 'connect'),
        STEP('position', 'Position the airway', positionInstruction, 'Suction visible contamination before ventilating and avoid unnecessary cervical movement.', 'place'),
        STEP('seal', 'Create an effective mask seal', sealInstruction, 'Lift the mandible into the mask; do not press into the eyes or compress the soft tissues beneath the chin.', 'place', 1100),
        STEP('ventilate', 'Deliver a test breath', 'Squeeze over one second, just enough to produce visible chest rise.', 'Excess rate or volume causes gastric inflation and reduces venous return.', 'ventilate', 1200),
        STEP('confirm', 'Set cadence and reassess', 'Check bilateral rise, SpO₂ and waveform capnography when available, then select the patient-appropriate ventilation rate.', ventilationCue, 'confirm'),
      ],
    };
  }

  if (treatmentId === 'lucas_device') {
    return {
      id: 'lucas-device', title: 'Apply mechanical CPR device',
      subtitle: 'Interruptions are minimised by preparing the device before briefly pausing compressions for placement.',
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/lucas-device.webp',
      completionLabel: 'Device aligned and running — verify compressions',
      steps: [
        STEP('prepare', 'Prepare during manual CPR', 'Power on, select the correct back plate and position the device beside the patient.', 'Manual compressions continue while equipment is prepared.', 'prepare'),
        STEP('backplate', 'Place the back plate', 'Pause briefly, log-roll or lift just enough to slide the plate beneath the thorax, then resume CPR.', 'Keep the pause under 10 seconds.', 'place', 1100),
        STEP('frame', 'Attach the frame', 'Connect both support legs and centre the suction cup over the lower half of the sternum.', 'Incorrect position can injure the xiphoid or abdomen.', 'place'),
        STEP('lower', 'Lower and lock the cup', 'Lower until it contacts the chest, lock the position and select the correct compression mode.', 'Do not start until central alignment and depth are checked.', 'tighten'),
        STEP('confirm', 'Start and verify', 'Resume mechanical compressions and confirm rate, depth, recoil, EtCO₂ and device security.', 'Recheck alignment after every move and rhythm analysis.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'ventilator_setup' || treatmentId === 'mechanical_ventilation') {
    return {
      id: 'ventilator-circuit', title: treatmentId === 'mechanical_ventilation' ? 'Prepare the transport ventilator' : 'Connect the ventilator circuit',
      subtitle: 'A secured airway must be confirmed before the tested circuit is connected.', treatmentId,
      requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/ett-ventilator-connected-v3.png', completionLabel: 'Circuit connected — verify delivered ventilation',
      steps: [
        STEP('assemble', 'Assemble the circuit', 'Connect tubing, filter/HME, catheter mount and capnography sampling line.', 'Keep every connection visible and tight.', 'connect'),
        STEP('test', 'Run pre-use test', 'Check the ventilator battery, oxygen supply, leak test and alarm function.', 'Never connect an untested circuit to the patient.', 'prepare'),
        STEP('airway', 'Confirm the airway', 'Verify ETT depth, cuff pressure and sustained waveform capnography.', 'Disconnect immediately if tube placement is uncertain.', 'confirm'),
        STEP('connect', 'Connect without traction', 'Support the tube and attach the catheter mount without twisting or pulling.', 'Route tubing so it cannot lever the tube out.', 'connect'),
        STEP('confirm', 'Verify delivered breaths', 'Observe bilateral rise, pressures, volumes, SpO₂, EtCO₂ and alarms.', 'Reassess after every transfer or circuit change.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'suction') {
    return {
      id: 'oropharyngeal-suction', title: 'Suction the airway',
      subtitle: 'Prepare and measure first; apply suction only while withdrawing.',
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/portable-suction.webp',
      completionLabel: 'Airway cleared — reassess breathing',
      steps: [
        STEP('prepare', 'Check suction pressure', 'Connect the catheter and verify effective suction before approaching the airway.', 'Use appropriate pressure and PPE; have oxygen immediately available.', 'connect'),
        STEP('measure', 'Measure insertion depth', 'Measure from the corner of the mouth to the angle of the jaw.', 'Never advance blindly beyond the measured depth.', 'prepare'),
        STEP('insert', 'Insert without suction', 'Open the mouth and advance under direct vision without occluding the control port.', 'Stop for resistance, severe cough, bradycardia or hypoxia.', 'place'),
        STEP('withdraw', 'Suction on withdrawal', 'Occlude the control port and withdraw with rotation for no more than 10–15 seconds.', 'Continuous prolonged suction rapidly worsens hypoxia.', 'laryngoscopy', 1100),
        STEP('confirm', 'Reoxygenate and reassess', 'Listen for cleared airflow and reassess SpO₂, effort and secretions.', 'Repeat only after reoxygenation if material remains.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'opa_insert') {
    return {
      id: 'opa-insertion', title: 'Insert an oropharyngeal airway',
      subtitle: 'Correct sizing and absence of a gag reflex are essential.',
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/opa-flange-front-v2.png',
      completionLabel: 'OPA seated — reassess airway',
      steps: [
        STEP('size', 'Select and measure', 'Measure from incisors or corner of mouth to the angle of the mandible.', 'Too small can push the tongue backward; too large can injure the larynx.', 'prepare'),
        STEP('reflex', 'Confirm no gag reflex', 'Open the airway and confirm the patient is deeply unresponsive.', 'Do not insert an OPA in a conscious patient with an intact gag reflex.', 'confirm'),
        STEP('insert', 'Insert the airway', 'Insert using the adult rotation or tongue-depressor technique without forcing it.', 'For children, use direct insertion with a tongue depressor.', 'place', 1100),
        STEP('seat', 'Seat the flange', 'Advance until the flange rests at the lips without compressing them.', 'The airway should follow the tongue and remain stable.', 'place'),
        STEP('confirm', 'Confirm patency', 'Reassess airflow, chest movement and tolerance; prepare BVM if ventilation is inadequate.', 'Remove immediately if gagging or vomiting occurs.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'nebulizer_salbutamol' || treatmentId === 'nebulizer_ipratropium' || treatmentId === 'nebulised_adrenaline' || treatmentId === 'cpap_niv') {
    const cpap = treatmentId === 'cpap_niv';
    const connectedNebuliser = !cpap && appliedTreatmentIds.some(id =>
      id === 'nebulizer_salbutamol' || id === 'nebulizer_ipratropium' || id === 'nebulised_adrenaline',
    );
    if (connectedNebuliser) {
      const ipratropium = treatmentId === 'nebulizer_ipratropium';
      const adrenaline = treatmentId === 'nebulised_adrenaline';
      const medicine = adrenaline ? 'adrenaline 5 mg/5 mL (1:1,000)' : ipratropium ? 'ipratropium 500 mcg' : 'salbutamol 5 mg';
      return {
        id: 'connected-nebulizer-medication',
        title: adrenaline ? 'Load adrenaline into connected nebuliser' : ipratropium ? 'Add ipratropium to connected nebuliser' : 'Reload connected salbutamol nebuliser',
        subtitle: 'Keep the fitted interface available while the chamber is safely paused, loaded and restarted.',
        treatmentId,
        requiresTarget: false,
        targets: [],
        equipmentAsset: '/equipment-assets/nebulizer-mask-v2.webp',
        completionLabel: adrenaline ? 'Adrenaline mist flowing — reassess stridor' : 'Combined aerosol flowing — reassess wheeze and pulse',
        steps: [
          STEP('assemble', 'Pause and isolate the chamber', 'Stop the driving gas, keep the patient upright and disconnect the medication chamber without pulling the fitted mask.', 'Do not open a pressurised or actively misting chamber.', 'connect'),
          STEP('verify', `Verify ${medicine}`, 'Read the medicine, dose, expiry and route aloud; confirm it matches the prescription and is suitable for nebulisation.', 'Use a single-patient ampoule and maintain asepsis.', 'prepare'),
          STEP('apply', 'Load and reconnect', 'Open the chamber, add the medicine, close it securely and reconnect it beneath the mask while keeping it upright.', 'Avoid contaminating the chamber or spilling the dose.', 'place', 1000),
          STEP('start', 'Restart aerosol flow', 'Restart at 6–8 L/min and confirm a consistent visible mist without a circuit leak.', 'Keep the chamber upright until sputtering stops.', 'connect'),
          STEP('confirm', adrenaline ? 'Reassess response' : 'Reassess combined response', adrenaline ? 'Recheck stridor at rest, air entry, work of breathing, SpO₂, pulse and patient tolerance.' : 'Recheck work of breathing, air entry, SpO₂, pulse and patient tolerance after the combined bronchodilator dose.', adrenaline ? 'Nebulised adrenaline is temporary support; prepare for rebound oedema and escalate a failing airway.' : 'Escalate if fatigue, silent chest, falling consciousness or marked tachycardia develops.', 'confirm'),
        ],
      };
    }
    return {
      id: cpap ? 'cpap-application' : 'nebulizer-application',
      title: cpap ? 'Apply CPAP circuit' : 'Apply nebuliser mask',
      subtitle: cpap ? 'A sealed, pressurised circuit requires cooperation and continuous monitoring.' : 'The chamber must remain upright with visible aerosol output.',
      treatmentId, requiresTarget: false, targets: [],
      equipmentAsset: cpap ? '/equipment-assets/cpap-mask-front-v2.png' : '/equipment-assets/nebulizer-mask-v2.webp',
      completionLabel: cpap ? 'Pressure stable — monitor continuously' : treatmentId === 'nebulised_adrenaline' ? 'Aerosol flowing — reassess stridor' : 'Aerosol flowing — reassess wheeze',
      steps: [
        STEP('assemble', 'Assemble and connect', cpap ? 'Connect mask, circuit, filter, valve and oxygen/driver.' : 'Add the prescribed drug, close the chamber and connect driving gas.', 'Check every connection before placing the mask.', 'connect'),
        STEP('explain', 'Explain and coach', 'Let the conscious patient hold the mask initially and coach slow breathing.', 'Claustrophobia and agitation can worsen respiratory distress.', 'prepare'),
        STEP('apply', 'Fit the mask', 'Seat over nose and mouth, then adjust straps evenly without excessive pressure.', 'Check the bridge of the nose and visible leak.', 'place', 1100),
        STEP('start', cpap ? 'Increase pressure gradually' : 'Start aerosol flow', cpap ? 'Begin at the prescribed PEEP and titrate while watching BP and tolerance.' : 'Set 6–8 L/min until a consistent mist is visible.', cpap ? 'CPAP can worsen hypotension or an untreated pneumothorax.' : 'Keep the chamber upright until sputtering stops.', 'connect'),
        STEP('confirm', 'Reassess response', 'Recheck work of breathing, air entry, SpO₂, pulse and patient tolerance.', 'Escalate if fatigue, silent chest, falling consciousness or hypotension develops.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'iv_access' || treatmentId === 'io_access') {
    const io = treatmentId === 'io_access';
    return {
      id: io ? 'io-access' : 'iv-access', title: io ? 'Establish intraosseous access' : 'Establish peripheral IV access',
      subtitle: 'Select and prepare the exact access site before the line can be used.',
      treatmentId, requiresTarget: true, targets: accessTargets(io ? 'io' : 'iv'),
      equipmentAsset: '/equipment-assets/iv-cannula.webp', completionLabel: 'Access secured, flushed and labelled',
      steps: io ? [
        STEP('landmark', 'Identify the landmark', 'Palpate the proximal tibia or humeral head and exclude fracture or infection.', 'Choose an age-appropriate landmark away from injured bone.', 'prepare'),
        STEP('clean', 'Prepare the skin', 'Clean antiseptically and allow the site to dry.', 'Maintain asepsis throughout insertion.', 'prepare'),
        STEP('insert', 'Insert at 90°', 'Advance the IO needle until bone contact, then drill until loss of resistance.', 'Stop after entering the medullary space.', 'tighten', 1200),
        STEP('confirm', 'Confirm and flush', 'Remove the stylet, aspirate when possible and flush while checking for extravasation.', 'A line that flushes into soft tissue is not usable.', 'connect'),
        STEP('secure', 'Secure and label', 'Stabilise the hub, connect extension tubing and document site and time.', 'Recheck the limb for swelling throughout infusion.', 'wrap'),
      ] : [
        STEP('vein', 'Select the vein', 'Apply a tourniquet and palpate a suitable distal peripheral vein.', 'Avoid injured, infected or fistula-bearing limbs.', 'prepare'),
        STEP('clean', 'Prepare the skin', 'Clean with antiseptic and allow it to dry completely.', 'Do not repalpate the cleaned site without sterile technique.', 'prepare'),
        STEP('insert', 'Cannulate the vein', 'Insert bevel-up until flashback, lower the angle, then advance the catheter.', 'Never reinsert the needle into the advanced catheter.', 'place', 1200),
        STEP('flush', 'Release, connect and flush', 'Release the tourniquet, occlude the vein, attach extension and confirm patency.', 'Pain, swelling or resistance suggests infiltration.', 'connect'),
        STEP('secure', 'Dress and label', 'Apply a transparent dressing, secure the tubing and document gauge, site and time.', 'Keep the insertion site visible for reassessment.', 'wrap'),
      ],
    };
  }

  if (treatmentId.startsWith('fluids_')) {
    return {
      id: 'fluid-infusion', title: 'Connect an IV fluid bolus', subtitle: 'Verify the fluid, prime the line and connect it to confirmed vascular access.',
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/fluid-bag.webp',
      completionLabel: 'Fluid running — reassess after bolus',
      steps: [
        STEP('check', 'Verify fluid and dose', 'Check indication, fluid type, volume, expiry and bag integrity.', 'Use measured boluses rather than an uncontrolled open line.', 'prepare'),
        STEP('spike', 'Spike and prime', 'Close the roller clamp, spike aseptically, fill the chamber and prime all air from the tubing.', 'Never connect an air-filled line.', 'connect'),
        STEP('connect', 'Connect to vascular access', 'Scrub the hub, verify patency and attach the primed giving set.', 'Stop if the site swells, leaks or becomes painful.', 'connect'),
        STEP('run', 'Set the delivery rate', 'Open the clamp or set the pump to deliver the selected bolus.', 'Account for age, shock state and heart failure risk.', 'tighten'),
        STEP('confirm', 'Reassess after the bolus', 'Repeat BP, pulse, lung sounds, perfusion and access-site assessment.', 'Do not assume benefit from fluid volume alone.', 'confirm'),
      ],
    };
  }

  if (['chest_seal_vented', 'vented_chest_seal', 'occlusive_dressing_3sided'].includes(treatmentId)) {
    const improvised = treatmentId === 'occlusive_dressing_3sided';
    return {
      id: 'chest-seal', title: improvised ? 'Apply three-sided occlusive dressing' : 'Apply a vented chest seal',
      subtitle: 'Expose, dry and seal the actual open chest wound; inspect for an exit wound.', treatmentId,
      requiresTarget: true, targets: thoracicTargets(caseData, 'seal'), equipmentAsset: '/equipment-assets/bandages.webp', completionLabel: 'Seal adhered — monitor for tension',
      steps: [
        STEP('expose', 'Expose the chest', 'Cut clothing away and identify the sucking wound without probing it.', 'Look and listen for air movement, bubbling and impaired ventilation.', 'expose'),
        STEP('posterior', 'Inspect for an exit wound', 'Check the corresponding posterior and axillary surfaces while maintaining spinal precautions.', 'Seal every open thoracic wound that communicates with the pleural space.', 'prepare'),
        STEP('dry', 'Dry the skin', 'Wipe blood and moisture far enough for the adhesive perimeter to seal.', 'Do not remove embedded objects.', 'press'),
        STEP('apply', 'Apply over expiration', improvised ? 'Place the occlusive material and secure three sides, leaving a dependent vent.' : 'Centre the vent over the wound and press the adhesive firmly from centre outward.', 'Prevent air entry without trapping an enlarging tension pneumothorax.', 'place', 1200),
        STEP('confirm', 'Reassess continuously', 'Check adhesion, breathing, bilateral sounds, SpO₂ and signs of tension.', 'If tension develops, lift/burp the seal and decompress when indicated.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'needle_decompression') {
    return {
      id: 'needle-decompression', title: 'Perform needle thoracostomy',
      subtitle: 'Confirm tension physiology and use an anatomically correct site before decompression.', treatmentId,
      requiresTarget: true, targets: thoracicTargets(caseData, 'decompression'), equipmentAsset: '/equipment-assets/needle-decompression.webp', completionLabel: 'Catheter secured — reassess for re-tensioning',
      steps: [
        STEP('confirm', 'Confirm clinical indication', 'Correlate severe distress or shock with unilateral absent sounds and tension signs.', 'Do not decompress a simple pneumothorax solely from mechanism.', 'confirm'),
        STEP('landmark', 'Identify and clean the site', 'Locate 4th/5th intercostal space anterior to mid-axillary line on the affected side and clean it.', 'Insert just above the upper border of the rib to avoid the neurovascular bundle.', 'prepare'),
        STEP('insert', 'Advance the catheter', 'Insert perpendicular to the chest wall until air release, then advance the catheter off the needle.', 'Keep fingers clear of the needle path and never direct medially.', 'place', 1300),
        STEP('secure', 'Secure the catheter', 'Remove the needle safely and secure the catheter without kinking it.', 'A displaced or blocked catheter allows re-tensioning.', 'wrap'),
        STEP('reassess', 'Reassess response', 'Repeat BP, pulse, SpO₂, chest movement and bilateral breath sounds.', 'No improvement requires diagnostic review and equipment check.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'pericardiocentesis') {
    return {
      id: 'ultrasound-guided-pericardiocentesis',
      title: 'Perform ultrasound-guided pericardiocentesis',
      subtitle: 'Rescue decompression requires confirmed tamponade physiology, continuous monitoring, a sterile image-guided path and controlled drainage.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/pericardiocentesis-kit.svg',
      completionLabel: 'Pericardial drain secured — perfusion reassessed',
      steps: [
        STEP('confirm', 'Confirm decompensated tamponade', 'Correlate shock or arrest with focused cardiac ultrasound showing pericardial fluid and tamponade physiology; consider traumatic haemopericardium and aortic dissection.', 'POCUS supports the diagnosis. An effusion without haemodynamic compromise is not an emergency needle-drainage indication.', 'confirm'),
        STEP('prepare', 'Prepare the monitored rescue field', 'Call for expert and definitive surgical support, apply continuous ECG and blood-pressure monitoring, expose the chest and open the sterile drainage kit with resuscitation equipment ready.', 'In traumatic arrest, follow the resuscitative thoracotomy pathway when the required team and setting are available.', 'prepare'),
        STEP('window', 'Select the safest ultrasound window', 'Scan subcostal, apical and parasternal views. Choose the point where the fluid is closest to the probe with the widest pocket and no lung, liver or vessel in the planned path.', 'Do not default blindly to a subxiphoid route; the effusion and safe trajectory determine the entry site.', 'prepare', 1200),
        STEP('sterile', 'Prepare skin, probe and anaesthesia', 'Disinfect widely, apply sterile drapes, cover the cardiac probe with sterile gel and infiltrate local anaesthetic if the situation allows.', 'Keep the selected window visible and maintain asepsis throughout wire and catheter placement.', 'expose'),
        STEP('needle', 'Advance while aspirating under ultrasound', 'Attach a saline-filled syringe to the sheathed needle and advance slowly along the imaged trajectory while aspirating and continuously tracking the needle tip.', 'Stop for ectopy, loss of tip visibility, resistance or unexpected bright blood; never advance blindly toward the heart.', 'place', 1400),
        STEP('confirm-space', 'Confirm pericardial position', 'Confirm the tip and aspirate are in the pericardial space; use agitated saline contrast on ultrasound when position is uncertain.', 'Blood that clots or intracardiac microbubbles suggests chamber puncture—stop and seek immediate expert support.', 'confirm', 1200),
        STEP('catheter', 'Place the pigtail catheter', 'Advance a J-tip guidewire under ultrasound, withdraw the needle, dilate the tract and pass the pigtail catheter using a controlled Seldinger technique.', 'Keep the guidewire controlled at all times and verify it remains in the pericardial space before dilating.', 'connect', 1400),
        STEP('drain', 'Drain only to restore perfusion', 'Aspirate in measured aliquots while trending BP, pulse, ECG, symptoms and the effusion on ultrasound.', 'In haemopericardium or possible aortic pathology, avoid uncontrolled decompression; drain the minimum required as a bridge to surgery.', 'press', 1200),
        STEP('secure', 'Secure, document and reassess', 'Secure a closed drainage system, record volume and character, repeat focused ultrasound and haemodynamics, and expedite definitive care.', 'Watch for re-accumulation, dysrhythmia, myocardial or coronary injury, pneumothorax and drain blockage.', 'wrap'),
      ],
    };
  }

  const splintIds = ['splinting', 'sam_splint', 'box_splint', 'vacuum_limb_splint', 'air_splint', 'traction_splint'];
  if (splintIds.includes(treatmentId)) {
    const traction = treatmentId === 'traction_splint';
    const tractionTarget = traction ? assessTractionSplintSafety(caseData, appliedTreatmentIds).target : null;
    const compatibleTargets = traction
      ? tractionTarget ? [tractionTarget] : []
      : assessLimbSplintSafety(caseData, treatmentId as LimbSplintTreatmentId, appliedTreatmentIds).eligibleTargets;
    const splintTargets = limbInjuryTargets(caseData);
    const title = traction ? 'Apply a traction splint' : `Apply ${treatmentId === 'splinting' ? 'a limb splint' : treatmentId.replaceAll('_', ' ')}`;
    const assetById: Record<string, string> = {
      splinting: '/equipment-assets/splints.webp', sam_splint: '/equipment-assets/sam-splint.webp',
      box_splint: '/equipment-assets/box-splint.webp', vacuum_limb_splint: '/equipment-assets/vacuum-limb-splint.webp',
      air_splint: '/equipment-assets/air-splint.webp', traction_splint: '/equipment-assets/traction-splint.webp',
    };
    return {
      id: `splint-${treatmentId}`, title,
      subtitle: traction
        ? 'Use only for the identified femoral-shaft injury. Measure, apply controlled traction and document circulation, sensation and movement.'
        : 'Immobilise the selected injury and document circulation, sensation and movement before and after.',
      treatmentId,
      requiresTarget: true,
      targets: compatibleTargets.length ? splintTargets.filter(target => compatibleTargets.some(region => region === target.id)) : splintTargets,
      equipmentAsset: assetById[treatmentId],
      completionLabel: traction ? 'Traction maintained — distal status documented' : 'Splint secured — distal status documented',
      steps: [
        STEP('expose', 'Expose and inspect', 'Remove clothing and jewellery; inspect the whole limb for wounds and deformity.', 'Control bleeding and cover open fractures before splinting.', 'expose'),
        STEP('csm-before', 'Check distal neurovascular status', 'Palpate distal pulse and assess colour, warmth, capillary refill, movement and sensation.', 'Document findings before any manipulation.', 'confirm'),
        ...(traction ? [STEP('traction', 'Apply manual traction', 'Stabilise the pelvis, measure the device and apply steady longitudinal traction.', 'Use only for an isolated mid-shaft femur fracture without pelvic or lower-leg injury.', 'tighten', 1300)] : [STEP('shape', 'Prepare the splint', 'Measure and shape or mould the device before moving the injured limb.', 'Immobilise the joint above and below the injury.', 'prepare')]),
        STEP('apply', 'Support and apply', 'Maintain alignment while positioning the device around the selected limb.', 'Do not force alignment if pain or neurovascular compromise worsens.', 'place', 1200),
        STEP('secure', 'Secure without constriction', traction ? 'Secure ischial, thigh, knee and ankle straps while maintaining prescribed traction.' : 'Apply straps or wraps from distal to proximal, leaving assessment points visible.', 'Avoid direct pressure over the fracture or bony prominences.', 'wrap', 1200),
        STEP('csm-after', 'Repeat distal assessment', 'Repeat pulse, capillary refill, movement and sensation; compare with pre-splint findings.', 'Loosen or reposition immediately if distal status deteriorates.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'cervical_collar') {
    return {
      id: 'cervical-collar', title: 'Apply a cervical collar', subtitle: 'Manual in-line stabilisation continues while the collar is sized and fitted.',
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/cervical-collar-fitted-front-v2.png', completionLabel: 'Collar fitted — maintain spinal precautions',
      steps: [
        STEP('mils', 'Maintain manual stabilisation', 'A second clinician holds the head neutral without traction.', 'Do not force neutral alignment against pain, resistance or neurological change.', 'place'),
        STEP('size', 'Measure and size', 'Measure shoulder-to-mandible height and select the matching collar setting.', 'An oversized collar extends the neck; an undersized collar allows flexion.', 'prepare'),
        STEP('posterior', 'Position the posterior section', 'Slide behind the neck without lifting or twisting the head.', 'Keep hair and clothing clear of contact surfaces.', 'place'),
        STEP('anterior', 'Seat chin and fasten', 'Place the chin centrally, wrap the collar and fasten evenly.', 'The chin must sit in the support without airway compression.', 'wrap', 1100),
        STEP('confirm', 'Reassess fit and neurology', 'Check airway, comfort, skin, alignment and limb neurology.', 'A collar does not replace manual care during movement.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'warming_blanket' || treatmentId === 'active_cooling') {
    const cooling = treatmentId === 'active_cooling';
    if (cooling && isBurnCoolingCase(caseData)) {
      return {
        id: 'burn-cooling',
        title: 'Cool and cover the burn',
        subtitle: 'Cool the injured tissue—not the whole patient—then protect it while preventing systemic hypothermia.',
        treatmentId,
        requiresTarget: true,
        targets: burnInjuryTargets(caseData),
        equipmentAsset: '/equipment-assets/bandages.webp',
        completionLabel: 'Burn cooled and loosely covered — keep the patient warm',
        steps: [
          STEP('expose', 'Stop the burning process and expose', 'Remove the patient from the source. Remove jewellery, watches and loose clothing near the burn, but do not pull away material stuck to skin.', 'Expose enough to assess location, depth and TBSA while preserving dignity.', 'expose'),
          STEP('irrigate', 'Cool with running water', 'Irrigate the selected burn with cool running water for 20 minutes as soon as possible after injury.', 'Use cool—not ice-cold—water. Do not apply ice, creams or hydrogel in place of adequate irrigation.', 'press', 1400),
          STEP('protect', 'Keep the rest of the patient warm', 'Dry and cover uninjured areas while the burn is cooled, especially in children or larger burns.', 'Local burn cooling must not create systemic hypothermia. Recheck core temperature.', 'wrap'),
          STEP('cover', 'Cover the cooled burn loosely', 'Apply a sterile non-adherent dressing or longitudinal strips of clean cling film. Separate burned fingers or toes individually.', 'Do not wrap circumferentially or apply an adhesive dressing directly to damaged skin.', 'wrap', 1200),
          STEP('confirm', 'Reassess after cooling', 'Repeat pain score, distal circulation, burn depth/TBSA, temperature and airway signs where relevant.', 'Escalate facial burns, circumferential burns, large TBSA or any inhalation features.', 'confirm'),
        ],
      };
    }
    return {
      id: treatmentId, title: cooling ? 'Apply active cooling' : 'Apply a warming blanket',
      subtitle: cooling ? 'Cool the patient while preserving airway access and continuously tracking temperature.' : 'Dry, cover and insulate the patient while preserving access for reassessment.',
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: cooling ? '/equipment-assets/cooling-pack.webp' : '/equipment-assets/warming-blanket.webp',
      completionLabel: cooling ? 'Cooling active — trend core temperature' : 'Patient covered — continue temperature monitoring',
      steps: [
        STEP('prepare', cooling ? 'Remove excess clothing' : 'Dry and prepare', cooling ? 'Move to a cool environment and remove excess clothing while maintaining dignity.' : 'Remove wet clothing, dry the patient and address heat loss from beneath.', 'Keep essential monitoring and airway access unobstructed.', 'expose'),
        STEP('apply', cooling ? 'Apply cooling measures' : 'Cover the patient', cooling ? 'Apply cool wet sheets, mist/fan or cold packs to axillae and groins with skin protection.' : 'Unfold over the torso and limbs, tucking edges without restricting movement or IV lines.', 'Do not place ice directly on skin or hide active bleeding.', 'place', 1200),
        STEP('protect', 'Protect pressure points and lines', 'Route monitoring cables, oxygen tubing and IV lines above the cover.', 'All applied equipment must remain visible and functional.', 'wrap'),
        STEP('confirm', 'Trend response', 'Repeat core temperature, skin, pulse, BP and level of consciousness.', cooling ? 'Stop active cooling near 39°C to reduce overshoot.' : 'Avoid overheating and reassess exposed areas regularly.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'targeted_temp_mgmt') {
    return {
      id: 'post-rosc-fever-prevention',
      title: 'Establish post-ROSC temperature control',
      subtitle: 'For a comatose patient after ROSC, monitor core temperature continuously and prevent fever without indiscriminate prehospital cold-fluid loading.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/temperature-control-pads.svg',
      completionLabel: 'Feedback control active — fever prevention maintained',
      steps: [
        STEP('confirm', 'Confirm ROSC and ongoing coma', 'Confirm a sustained pulse and organised circulation, then document neurological response after immediate ABC stabilisation.', 'Temperature control is for patients who remain comatose after ROSC; do not distract from airway, ventilation or perfusion.', 'confirm'),
        STEP('measure', 'Insert continuous core monitoring', 'Use an appropriate continuous core-temperature probe and record the starting value and route.', 'Peripheral skin temperature is not a reliable control signal for a feedback cooling system.', 'connect'),
        STEP('target', 'Set the fever-prevention target', 'Set a target no higher than 37.5°C and plan to prevent fever for 36–72 hours in definitive care.', 'Do not actively warm a comatose post-ROSC patient who is already mildly hypothermic at 32–36°C.', 'prepare'),
        STEP('apply', 'Apply feedback-controlled surface pads', 'Expose only the required skin, dry it, inspect for wounds, then adhere water-circulating torso and thigh pads without covering defibrillator pads or access lines.', 'Do not routinely give a large rapid bolus of ice-cold IV fluid after ROSC.', 'place', 1300),
        STEP('connect', 'Connect and start feedback control', 'Connect both pad circuits to the controller, confirm flow, enter the core-probe source and start closed-loop temperature control.', 'A device without a valid core-temperature signal can overcool the patient.', 'connect', 1200),
        STEP('shivering', 'Assess shivering and complications', 'Observe for shivering, skin pressure injury, dysrhythmia, electrolyte change and haemodynamic instability; escalate sedation only through the appropriate critical-care plan.', 'Do not use routine paralysis or mask seizures without adequate monitoring and sedation.', 'confirm'),
        STEP('trend', 'Trend and hand over the target', 'Record core temperature and device status repeatedly, protect every line during transfer and hand over the ≤37.5°C target and 36–72-hour fever-prevention plan.', 'Avoid fever, unintended deep hypothermia and rapid temperature swings.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'post_rosc_bundle') {
    return {
      id: 'structured-post-rosc-care',
      title: 'Complete the post-ROSC care bundle',
      subtitle: 'Consolidate the interventions already performed, verify every physiological target and hand over a coherent plan without losing the patient during transfer.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/post-rosc-board.svg',
      completionLabel: 'Post-ROSC targets verified — transfer ready',
      steps: [
        STEP('rosc', 'Verify sustained ROSC', 'Confirm a central pulse, organised rhythm and abrupt EtCO₂ rise; stop compressions only after circulation is verified.', 'A monitor rhythm alone is not ROSC. Recheck immediately if pulse, pressure or EtCO₂ falls.', 'confirm'),
        STEP('airway', 'Protect and confirm the airway', 'Reassess airway patency and consciousness; if an advanced airway is required, confirm depth, bilateral ventilation and sustained waveform capnography.', 'Use an ABC approach and do not intubate an awake patient solely because an arrest occurred.', 'confirm'),
        STEP('oxygen', 'Titrate oxygenation', 'Use maximum available oxygen until SpO₂ is reliable, then titrate inspired oxygen to maintain 94–98%.', 'Avoid both hypoxaemia and continued unnecessary hyperoxaemia.', 'connect'),
        STEP('ventilation', 'Target normocapnia', 'Use waveform EtCO₂ and controlled ventilation to target 35–45 mmHg; obtain blood gas confirmation when available.', 'Avoid hyperventilation, which can reduce cerebral blood flow after ROSC.', 'ventilate'),
        STEP('circulation', 'Optimise perfusion and access', 'Confirm IV or IO access, repeat BP frequently, treat the cause and use measured fluid or vasoactive support to target SBP above 100 mmHg or MAP 60–65 mmHg.', 'Individualise perfusion to organ function and avoid uncontrolled fluid loading.', 'connect'),
        STEP('ecg', 'Acquire and interpret a 12-lead ECG', 'Record a diagnostic 12-lead ECG, look for coronary occlusion and repeat it if the first tracing is equivocal or physiology changes.', 'Prioritise an appropriate cardiac-arrest centre and urgent angiography when persistent ST elevation or strong occlusion evidence is present.', 'confirm'),
        STEP('disability', 'Reassess neurology and glucose', 'Document pupils, motor response, GCS and blood glucose; identify and treat seizures without premature prognostication.', 'Sedation and paralysis can confound examination. Record exactly what was given and when.', 'confirm'),
        STEP('temperature', 'Set the temperature plan', 'Measure core temperature continuously. If the patient remains comatose, prevent fever at ≤37.5°C for 36–72 hours using feedback control.', 'Do not actively warm mild 32–36°C hypothermia and do not routinely use rapid large-volume cold IV fluid.', 'connect'),
        STEP('transfer', 'Secure, document and pre-alert', 'Protect every line and circuit, trend vitals through movement, state the arrest timeline and treatments, and pre-alert the receiving critical-care/cardiac-arrest centre.', 'ROSC is a high-risk transition, not the end of resuscitation; anticipate re-arrest throughout transport.', 'wrap'),
      ],
    };
  }

  if (['supine_position', 'recovery_position', 'fowlers_position', 'left_lateral_tilt', 'leg_elevation', 'assisted_ambulation'].includes(treatmentId)) {
    const positioning: Record<string, { title: string; destination: string; completion: string }> = {
      supine_position: { title: 'Position patient supine', destination: 'flat on their back with alignment and airway access maintained', completion: 'Supine position secured — reassess' },
      recovery_position: { title: 'Place in recovery position', destination: 'lateral with the airway dependent and the upper leg supporting the body', completion: 'Recovery position secured — reassess airway' },
      fowlers_position: { title: "Move to Fowler's position", destination: 'supported at 45–60 degrees without slumping or losing lines', completion: "Fowler's position secured — reassess breathing" },
      left_lateral_tilt: { title: 'Apply left lateral tilt', destination: 'tilted 15–30 degrees to relieve aortocaval compression', completion: 'Left tilt secured — reassess perfusion' },
      leg_elevation: { title: 'Elevate the legs', destination: 'supine with both lower legs supported and pressure points protected', completion: 'Legs supported — reassess perfusion' },
      assisted_ambulation: { title: 'Assist patient to walk', destination: 'upright with close support for a short observed walk', completion: 'Ambulation observed — reassess tolerance' },
    };
    const meta = positioning[treatmentId];
    return {
      id: `position-${treatmentId}`,
      title: meta.title,
      subtitle: 'Position changes are physical procedures: explain, prepare, move together and reassess immediately.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/positioning.webp',
      completionLabel: meta.completion,
      steps: [
        STEP('safety', 'Check safety and explain', 'Confirm the patient can tolerate movement, explain the plan and obtain consent where possible.', 'Check consciousness, pain, injury pattern, blood pressure, oxygenation, lines and monitoring before moving.', 'prepare'),
        STEP('prepare', 'Prepare the route and supports', 'Clear obstacles, lock equipment and place pillows, rails or a second clinician where required.', 'Oxygen, monitor cables, IV lines and injured limbs must move with the patient.', 'prepare'),
        STEP('move', 'Move on a coordinated count', `Support the head, torso and limbs; move the patient ${meta.destination}.`, 'Stop for dizziness, collapse, new pain, dyspnoea or loss of alignment.', 'place', 1300),
        STEP('settle', 'Support and secure', 'Settle the patient, protect pressure points and make sure they cannot fall or roll.', 'Keep the airway visible and all treatment equipment functional.', 'wrap', 1000),
        STEP('confirm', 'Reassess after movement', 'Repeat airway, breathing, pulse, BP, SpO2, pain and neurological status.', 'A position is not complete until tolerance and physiological response are confirmed.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'main_stretcher') {
    return {
      id: 'load-main-stretcher',
      title: 'Load onto ambulance stretcher',
      subtitle: 'Bring the trolley to the patient, lift as a team, secure, then reassess.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/ambulance-stretcher.webp',
      completionLabel: 'Patient loaded — reassess after movement',
      steps: [
        STEP('brief', 'Brief and lock the trolley', 'Park the stretcher alongside, lock the wheels and assign head, torso and limb roles.', 'Never lift without a count and a locked trolley.', 'prepare'),
        STEP('prepare', 'Prepare straps and height', 'Lower or raise the trolley to a safe lifting height and open the straps.', 'Remove obstacles and protect injured limbs and lines.', 'prepare'),
        STEP('move', 'Lift on a coordinated count', 'Move the patient onto the mattress as one team, keeping the airway visible.', 'Stop for pain, dyspnoea, loss of alignment or a dropped limb.', 'place', 1300),
        STEP('secure', 'Secure and set the height', 'Fasten torso then limbs, raise side rails and set transport height.', 'Do not leave an unstrapped patient on a raised trolley.', 'wrap', 1200),
        STEP('confirm', 'Reassess after loading', 'Repeat airway, breathing, distal pulses, pain and strap tension.', 'Loading is not complete until the patient is secured and reassessed.', 'confirm'),
      ],
    };
  }

  if (['spinal_board', 'scoop_stretcher', 'vacuum_mattress', 'head_blocks', 'ked'].includes(treatmentId)) {
    const labels: Record<string, string> = {
      spinal_board: 'long spinal board', scoop_stretcher: 'scoop stretcher', vacuum_mattress: 'vacuum mattress',
      head_blocks: 'head blocks and straps', ked: 'KED extrication device',
    };
    const assets: Record<string, string> = {
      spinal_board: '/equipment-assets/spine-board.webp', scoop_stretcher: '/equipment-assets/scoop-stretcher.webp',
      vacuum_mattress: '/equipment-assets/vacuum-mattress.webp', head_blocks: '/equipment-assets/head-blocks.webp',
      ked: '/equipment-assets/ked-extrication-device.webp',
    };
    return {
      id: `immobilisation-${treatmentId}`, title: `Apply ${labels[treatmentId]}`,
      subtitle: 'Coordinate the team, preserve alignment, secure the patient and repeat neurovascular assessment.',
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: assets[treatmentId], completionLabel: 'Patient secured — reassess after movement',
      steps: [
        STEP('brief', 'Brief and assign positions', 'Name a team leader, head controller and movement plan before touching the patient.', 'The head controller coordinates every movement.', 'prepare'),
        STEP('prepare', 'Prepare the device', 'Size, open or position the device and release straps before movement.', 'Keep equipment within reach and remove obstructions.', 'prepare'),
        STEP('move', 'Move as one team', 'Use a coordinated log roll, lift or split-scoop technique appropriate to the device.', 'Stop immediately for loss of alignment or neurological change.', 'place', 1300),
        STEP('secure', 'Secure torso, pelvis and limbs', 'Fasten in the correct order without restricting breathing or circulation.', 'Head fixation follows torso restraint; never secure only the head.', 'wrap', 1200),
        STEP('confirm', 'Reassess after movement', 'Repeat airway, breathing, distal neurovascular status, comfort and strap tension.', 'Minimise time on a rigid board and inspect pressure areas.', 'confirm'),
      ],
    };
  }

  return null;
}

const HANDS_ON_TREATMENTS = new Set([
  'aed', 'monitor_pads', 'airway_open', 'bleeding_control', 'tourniquet', 'oxygen_nonrebreather', 'oxygen_mask', 'oxygen_nasal',
  'intubation', 'rsi_intubation', 'bvm_ventilation', 'suction', 'opa_insert', 'nebulizer_salbutamol',
  'nebulizer_ipratropium', 'nebulised_adrenaline', 'cpap_niv', 'iv_access', 'io_access', 'chest_seal_vented', 'vented_chest_seal',
  'occlusive_dressing_3sided', 'needle_decompression', 'splinting', 'sam_splint', 'box_splint',
  'vacuum_limb_splint', 'air_splint', 'traction_splint', 'cervical_collar', 'warming_blanket',
  'active_cooling', 'targeted_temp_mgmt', 'spinal_board', 'scoop_stretcher', 'vacuum_mattress', 'head_blocks', 'ked', 'main_stretcher',
  'lucas_device', 'ventilator_setup', 'mechanical_ventilation', 'supine_position', 'recovery_position', 'fowlers_position',
  'left_lateral_tilt', 'leg_elevation', 'assisted_ambulation', 'post_rosc_bundle',
  'pelvic_binder',
  'assist_delivery',
  'paced_breathing',
  'back_blows', 'abdominal_thrusts',
  'surgical_cric',
  'magill_forceps',
  'orogastric_tube',
  'ett_confirmation',
  'pericardiocentesis',
]);

export const isHandsOnTreatment = (treatmentId: string): boolean =>
  HANDS_ON_TREATMENTS.has(treatmentId) || treatmentId.startsWith('fluids_');

const LIMB_SPLINT_TREATMENTS = new Set([
  'splinting',
  'sam_splint',
  'box_splint',
  'vacuum_limb_splint',
  'air_splint',
  'traction_splint',
]);

/**
 * These procedures cannot be completed until their final CSM-after step has
 * run, so closing the dialog is itself evidence of post-treatment review.
 */
export const procedureIncludesIntegratedReassessment = (treatmentId: string): boolean =>
  LIMB_SPLINT_TREATMENTS.has(treatmentId)
  || treatmentId === 'airway_open'
  || treatmentId === 'targeted_temp_mgmt'
  || treatmentId === 'post_rosc_bundle'
  || treatmentId === 'intubation'
  || treatmentId === 'rsi_intubation'
  || treatmentId === 'pelvic_binder'
  || treatmentId === 'back_blows'
  || treatmentId === 'abdominal_thrusts'
  || treatmentId === 'surgical_cric'
  || treatmentId === 'magill_forceps'
  || treatmentId === 'orogastric_tube'
  || treatmentId === 'ett_confirmation'
  || treatmentId === 'pericardiocentesis';

export function procedureSiteToken(treatmentId: string, target: ProcedureSite): string {
  return `site:${treatmentId}:${target}`;
}

export function parseProcedureSiteToken(token: string): { treatmentId: string; target: ProcedureSite } | null {
  const match = token.match(/^site:([^:]+):(.+)$/);
  if (!match) return null;
  return { treatmentId: match[1], target: match[2] as ProcedureSite };
}
