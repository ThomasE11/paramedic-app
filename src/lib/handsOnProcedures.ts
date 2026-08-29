import type { CaseScenario } from '@/types';
import { inferInjuries, type BodyInjury, type BodyRegion } from '@/lib/injuryMap';
import { assessTractionSplintSafety } from '@/lib/tractionSplintSafety';

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

export interface HandsOnProcedureStep {
  id: string;
  label: string;
  instruction: string;
  clinicalCue: string;
  motion: ProcedureMotion;
  durationMs: number;
}

export interface ProcedureTarget {
  id: BodyRegion;
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

  if (treatmentId === 'bleeding_control') {
    return {
      id: 'bleeding-control',
      title: 'Control external haemorrhage',
      subtitle: 'Treat the wound you can see; source control applies only to the selected site.',
      treatmentId,
      requiresTarget: true,
      targets: injuryTargets(caseData, false),
      equipmentAsset: '/equipment-assets/bandages.webp',
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
      equipmentAsset: nasal ? '/equipment-assets/nasal-cannula.webp' : nonRebreather ? '/equipment-assets/nonrebreather-mask.webp' : '/equipment-assets/oxygen-mask.webp',
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
      equipmentAsset: '/equipment-assets/et-tube.webp',
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

  if (treatmentId === 'bvm_ventilation') {
    return {
      id: 'bvm-ventilation', title: 'Apply bag-valve-mask ventilation',
      subtitle: 'A visible chest rise requires airway position, a connected oxygen supply and a two-handed mask seal.',
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/bvm.webp',
      completionLabel: 'Seal confirmed — begin timed ventilation',
      steps: [
        STEP('prepare', 'Prepare the circuit', 'Connect mask, bag, reservoir and oxygen tubing; set 15 L/min.', 'The reservoir should inflate before the first assisted breath.', 'connect'),
        STEP('position', 'Position the airway', 'Use head tilt–chin lift or jaw thrust when trauma is suspected.', 'Suction visible contamination before ventilating.', 'place'),
        STEP('seal', 'Create a two-handed seal', 'Seat the mask bridge-first and use a two-person thenar-eminent grip where possible.', 'Do not push the mask into the face or compress the soft tissues of the neck.', 'place', 1100),
        STEP('ventilate', 'Deliver a test breath', 'Squeeze over one second, just enough to produce visible chest rise.', 'Excess rate or volume causes gastric inflation and reduces venous return.', 'ventilate', 1200),
        STEP('confirm', 'Reassess ventilation', 'Check bilateral rise, SpO₂ and waveform capnography when available.', 'Correct the seal and airway position before increasing force.', 'confirm'),
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

  if (treatmentId === 'ventilator_setup') {
    return {
      id: 'ventilator-circuit', title: 'Connect the ventilator circuit',
      subtitle: 'A secured airway must be confirmed before the tested circuit is connected.', treatmentId,
      requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/ventilator-circuit.webp', completionLabel: 'Circuit connected — verify delivered ventilation',
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
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/opa-set.webp',
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

  if (treatmentId === 'nebulizer_salbutamol' || treatmentId === 'nebulizer_ipratropium' || treatmentId === 'cpap_niv') {
    const cpap = treatmentId === 'cpap_niv';
    return {
      id: cpap ? 'cpap-application' : 'nebulizer-application',
      title: cpap ? 'Apply CPAP circuit' : 'Apply nebuliser mask',
      subtitle: cpap ? 'A sealed, pressurised circuit requires cooperation and continuous monitoring.' : 'The chamber must remain upright with visible aerosol output.',
      treatmentId, requiresTarget: false, targets: [],
      equipmentAsset: cpap ? '/equipment-assets/cpap-circuit.webp' : '/equipment-assets/nebulizer-mask.webp',
      completionLabel: cpap ? 'Pressure stable — monitor continuously' : 'Aerosol flowing — reassess wheeze',
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
      requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/bandages.webp', completionLabel: 'Seal adhered — monitor for tension',
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
      requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/needle-decompression.webp', completionLabel: 'Catheter secured — reassess for re-tensioning',
      steps: [
        STEP('confirm', 'Confirm clinical indication', 'Correlate severe distress or shock with unilateral absent sounds and tension signs.', 'Do not decompress a simple pneumothorax solely from mechanism.', 'confirm'),
        STEP('landmark', 'Identify and clean the site', 'Locate 4th/5th intercostal space anterior to mid-axillary line on the affected side and clean it.', 'Insert just above the upper border of the rib to avoid the neurovascular bundle.', 'prepare'),
        STEP('insert', 'Advance the catheter', 'Insert perpendicular to the chest wall until air release, then advance the catheter off the needle.', 'Keep fingers clear of the needle path and never direct medially.', 'place', 1300),
        STEP('secure', 'Secure the catheter', 'Remove the needle safely and secure the catheter without kinking it.', 'A displaced or blocked catheter allows re-tensioning.', 'wrap'),
        STEP('reassess', 'Reassess response', 'Repeat BP, pulse, SpO₂, chest movement and bilateral breath sounds.', 'No improvement requires diagnostic review and equipment check.', 'confirm'),
      ],
    };
  }

  const splintIds = ['splinting', 'sam_splint', 'box_splint', 'vacuum_limb_splint', 'air_splint', 'traction_splint'];
  if (splintIds.includes(treatmentId)) {
    const traction = treatmentId === 'traction_splint';
    const tractionTarget = traction ? assessTractionSplintSafety(caseData).target : null;
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
      targets: tractionTarget ? splintTargets.filter(target => target.id === tractionTarget) : splintTargets,
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
      treatmentId, requiresTarget: false, targets: [], equipmentAsset: '/equipment-assets/cervical-collar.webp', completionLabel: 'Collar fitted — maintain spinal precautions',
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
  'aed', 'monitor_pads', 'bleeding_control', 'tourniquet', 'oxygen_nonrebreather', 'oxygen_mask', 'oxygen_nasal',
  'intubation', 'rsi_intubation', 'bvm_ventilation', 'suction', 'opa_insert', 'nebulizer_salbutamol',
  'nebulizer_ipratropium', 'cpap_niv', 'iv_access', 'io_access', 'chest_seal_vented', 'vented_chest_seal',
  'occlusive_dressing_3sided', 'needle_decompression', 'splinting', 'sam_splint', 'box_splint',
  'vacuum_limb_splint', 'air_splint', 'traction_splint', 'cervical_collar', 'warming_blanket',
  'active_cooling', 'spinal_board', 'scoop_stretcher', 'vacuum_mattress', 'head_blocks', 'ked',
  'lucas_device', 'ventilator_setup', 'supine_position', 'recovery_position', 'fowlers_position',
  'left_lateral_tilt', 'leg_elevation', 'assisted_ambulation',
]);

export const isHandsOnTreatment = (treatmentId: string): boolean =>
  HANDS_ON_TREATMENTS.has(treatmentId) || treatmentId.startsWith('fluids_');

export function procedureSiteToken(treatmentId: string, target: BodyRegion): string {
  return `site:${treatmentId}:${target}`;
}

export function parseProcedureSiteToken(token: string): { treatmentId: string; target: BodyRegion } | null {
  const match = token.match(/^site:([^:]+):(.+)$/);
  if (!match) return null;
  return { treatmentId: match[1], target: match[2] as BodyRegion };
}
