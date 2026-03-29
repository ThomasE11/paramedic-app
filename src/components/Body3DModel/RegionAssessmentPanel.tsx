/**
 * RegionAssessmentPanel
 *
 * When a student clicks a body region on the 3D model, this panel opens
 * showing detailed clinical assessment actions for that specific region.
 *
 * Each region has sub-areas and examination techniques (inspect, palpate,
 * percuss, auscultate) that reveal case-specific findings.
 */

import { useState, useMemo } from 'react';
import type { CaseScenario } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye, Hand, Volume2, Activity, X, ChevronRight,
  Stethoscope, Brain, Heart, Wind,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ExamAction {
  id: string;
  label: string;
  technique: 'inspect' | 'palpate' | 'percuss' | 'auscultate';
  icon: typeof Eye;
}

interface SubRegion {
  id: string;
  label: string;
  actions: ExamAction[];
}

interface RegionConfig {
  title: string;
  icon: typeof Brain;
  subRegions: SubRegion[];
}

interface RegionAssessmentPanelProps {
  regionId: string;
  caseData: CaseScenario;
  onClose: () => void;
  onFindingRevealed: (regionId: string, subRegionId: string, actionId: string) => void;
  revealedFindings: Set<string>; // "regionId:subRegionId:actionId"
  isStudentView?: boolean;
}

// ============================================================================
// Examination technique icons
// ============================================================================

const TECHNIQUE_ICONS: Record<string, typeof Eye> = {
  inspect: Eye,
  palpate: Hand,
  percuss: Activity,
  auscultate: Stethoscope,
};

const TECHNIQUE_LABELS: Record<string, string> = {
  inspect: 'Inspect',
  palpate: 'Palpate',
  percuss: 'Percuss',
  auscultate: 'Auscultate',
};

const TECHNIQUE_COLORS: Record<string, string> = {
  inspect: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
  palpate: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100',
  percuss: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100',
  auscultate: 'text-cyan-600 bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
};

// ============================================================================
// Region configurations — what you can examine in each body region
// ============================================================================

function getRegionConfig(regionId: string): RegionConfig | null {
  switch (regionId) {
    case 'head':
      return {
        title: 'Head Assessment',
        icon: Brain,
        subRegions: [
          {
            id: 'scalp',
            label: 'Scalp',
            actions: [
              { id: 'scalp-inspect', label: 'Look for wounds, bleeding, swelling', technique: 'inspect', icon: Eye },
              { id: 'scalp-palpate', label: 'Feel for depressions, step deformity, boggy swelling', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'pupils',
            label: 'Pupils',
            actions: [
              { id: 'pupils-inspect', label: 'PERRL — size, equality, reactivity to light', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'ears',
            label: 'Ears',
            actions: [
              { id: 'ears-inspect', label: "Battle's sign, CSF otorrhoea, blood in canal", technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    case 'face':
      return {
        title: 'Face Assessment',
        icon: Eye,
        subRegions: [
          {
            id: 'facial-symmetry',
            label: 'Facial Symmetry',
            actions: [
              { id: 'face-inspect', label: 'Droop, asymmetry, smile, raise eyebrows', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'mouth-airway',
            label: 'Mouth & Airway',
            actions: [
              { id: 'mouth-inspect', label: 'Open mouth — blood, vomit, foreign body, swelling, burns', technique: 'inspect', icon: Eye },
              { id: 'airway-listen', label: 'Listen for stridor, gurgling, snoring, hoarseness', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'jaw-nose',
            label: 'Jaw & Nose',
            actions: [
              { id: 'jaw-palpate', label: 'Jaw stability, crepitus, midface mobility', technique: 'palpate', icon: Hand },
              { id: 'nose-inspect', label: 'CSF rhinorrhoea, epistaxis, septal haematoma', technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    case 'neck-cspine':
      return {
        title: 'Neck & C-Spine Assessment',
        icon: Activity,
        subRegions: [
          {
            id: 'trachea',
            label: 'Trachea',
            actions: [
              { id: 'trachea-palpate', label: 'Position — midline or deviated (tension PTX)', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'jvp',
            label: 'Jugular Veins',
            actions: [
              { id: 'jvd-inspect', label: 'JVD — elevated (tamponade, tension PTX, CHF) or flat (hypovolaemia)', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'cspine',
            label: 'Cervical Spine',
            actions: [
              { id: 'cspine-palpate', label: 'Midline tenderness, step deformity, muscle spasm', technique: 'palpate', icon: Hand },
              { id: 'cspine-inspect', label: 'Subcutaneous emphysema, wounds, haematoma', technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    case 'chest':
      return {
        title: 'Chest Assessment',
        icon: Wind,
        subRegions: [
          {
            id: 'chest-wall',
            label: 'Chest Wall',
            actions: [
              { id: 'chest-inspect', label: 'Symmetry, movement, wounds, bruising, flail, paradoxical movement', technique: 'inspect', icon: Eye },
              { id: 'chest-palpate', label: 'Tenderness, crepitus, subcutaneous emphysema, rib fractures', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'lung-right-upper',
            label: 'Right Upper Lung Field',
            actions: [
              { id: 'rul-percuss', label: 'Percussion note — resonant / hyper-resonant / dull', technique: 'percuss', icon: Activity },
              { id: 'rul-auscultate', label: 'Breath sounds — vesicular / wheeze / crackles / absent', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'lung-right-lower',
            label: 'Right Lower Lung Field',
            actions: [
              { id: 'rll-percuss', label: 'Percussion note', technique: 'percuss', icon: Activity },
              { id: 'rll-auscultate', label: 'Breath sounds', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'lung-left-upper',
            label: 'Left Upper Lung Field',
            actions: [
              { id: 'lul-percuss', label: 'Percussion note', technique: 'percuss', icon: Activity },
              { id: 'lul-auscultate', label: 'Breath sounds', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'lung-left-lower',
            label: 'Left Lower Lung Field',
            actions: [
              { id: 'lll-percuss', label: 'Percussion note', technique: 'percuss', icon: Activity },
              { id: 'lll-auscultate', label: 'Breath sounds', technique: 'auscultate', icon: Stethoscope },
            ],
          },
          {
            id: 'heart-sounds',
            label: 'Heart Sounds',
            actions: [
              { id: 'heart-aortic', label: 'Aortic area (right 2nd ICS)', technique: 'auscultate', icon: Heart },
              { id: 'heart-pulm', label: 'Pulmonary area (left 2nd ICS)', technique: 'auscultate', icon: Heart },
              { id: 'heart-tricusp', label: 'Tricuspid area (left lower sternal)', technique: 'auscultate', icon: Heart },
              { id: 'heart-mitral', label: 'Mitral area (apex, 5th ICS MCL)', technique: 'auscultate', icon: Heart },
            ],
          },
        ],
      };

    case 'abdomen':
      return {
        title: 'Abdominal Assessment',
        icon: Activity,
        subRegions: [
          {
            id: 'abd-general',
            label: 'General Inspection',
            actions: [
              { id: 'abd-inspect', label: 'Distension, bruising (Grey Turner / Cullen), scars, visible peristalsis', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'ruq',
            label: 'Right Upper Quadrant',
            actions: [
              { id: 'ruq-auscultate', label: 'Bowel sounds', technique: 'auscultate', icon: Stethoscope },
              { id: 'ruq-palpate', label: 'Tenderness, guarding, hepatomegaly, Murphy sign', technique: 'palpate', icon: Hand },
              { id: 'ruq-percuss', label: 'Percussion — liver span, shifting dullness', technique: 'percuss', icon: Activity },
            ],
          },
          {
            id: 'luq',
            label: 'Left Upper Quadrant',
            actions: [
              { id: 'luq-auscultate', label: 'Bowel sounds', technique: 'auscultate', icon: Stethoscope },
              { id: 'luq-palpate', label: 'Tenderness, splenomegaly', technique: 'palpate', icon: Hand },
              { id: 'luq-percuss', label: 'Percussion', technique: 'percuss', icon: Activity },
            ],
          },
          {
            id: 'rlq',
            label: 'Right Lower Quadrant',
            actions: [
              { id: 'rlq-auscultate', label: 'Bowel sounds', technique: 'auscultate', icon: Stethoscope },
              { id: 'rlq-palpate', label: 'Tenderness, rebound (appendicitis), Rovsing sign', technique: 'palpate', icon: Hand },
              { id: 'rlq-percuss', label: 'Percussion', technique: 'percuss', icon: Activity },
            ],
          },
          {
            id: 'llq',
            label: 'Left Lower Quadrant',
            actions: [
              { id: 'llq-auscultate', label: 'Bowel sounds', technique: 'auscultate', icon: Stethoscope },
              { id: 'llq-palpate', label: 'Tenderness, diverticular signs', technique: 'palpate', icon: Hand },
              { id: 'llq-percuss', label: 'Percussion', technique: 'percuss', icon: Activity },
            ],
          },
        ],
      };

    case 'pelvis':
      return {
        title: 'Pelvis Assessment',
        icon: Activity,
        subRegions: [
          {
            id: 'pelvis-stability',
            label: 'Pelvic Stability',
            actions: [
              { id: 'pelvis-inspect', label: 'Deformity, bruising, leg length discrepancy', technique: 'inspect', icon: Eye },
              { id: 'pelvis-palpate', label: 'Spring test — compress iliac crests ONCE only', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'perineum',
            label: 'Perineum',
            actions: [
              { id: 'perineum-inspect', label: 'Bleeding, priapism (spinal injury sign)', technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    case 'right-arm':
      return {
        title: 'Right Arm Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'right-upper',
            label: 'Right Arm',
            actions: [
              { id: 'rarm-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'rarm-palpate', label: 'Pulses, sensation, motor, compartments, crepitus', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };
    case 'left-arm':
      return {
        title: 'Left Arm Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'left-upper',
            label: 'Left Arm',
            actions: [
              { id: 'larm-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'larm-palpate', label: 'Pulses, sensation, motor, compartments, crepitus', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };
    case 'right-leg':
      return {
        title: 'Right Leg Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'right-lower',
            label: 'Right Leg',
            actions: [
              { id: 'rleg-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'rleg-palpate', label: 'Pulses (dorsalis pedis, posterior tibial), sensation, motor, compartments', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };
    case 'left-leg':
      return {
        title: 'Left Leg Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'left-lower',
            label: 'Left Leg',
            actions: [
              { id: 'lleg-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'lleg-palpate', label: 'Pulses, sensation, motor, compartments', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };
    // Legacy fallback: if 'extremities' is passed, show all limbs
    case 'extremities':
      return {
        title: 'Extremities Assessment',
        icon: Hand,
        subRegions: [
          {
            id: 'right-upper',
            label: 'Right Arm',
            actions: [
              { id: 'rarm-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'rarm-palpate', label: 'Pulses, sensation, motor, compartments, crepitus', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'left-upper',
            label: 'Left Arm',
            actions: [
              { id: 'larm-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'larm-palpate', label: 'Pulses, sensation, motor, compartments, crepitus', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'right-lower',
            label: 'Right Leg',
            actions: [
              { id: 'rleg-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'rleg-palpate', label: 'Pulses (dorsalis pedis, posterior tibial), sensation, motor, compartments', technique: 'palpate', icon: Hand },
            ],
          },
          {
            id: 'left-lower',
            label: 'Left Leg',
            actions: [
              { id: 'lleg-inspect', label: 'Deformity, wounds, swelling, skin colour', technique: 'inspect', icon: Eye },
              { id: 'lleg-palpate', label: 'Pulses, sensation, motor, compartments', technique: 'palpate', icon: Hand },
            ],
          },
        ],
      };

    case 'posterior-logroll':
      return {
        title: 'Posterior Assessment (Log Roll)',
        icon: Activity,
        subRegions: [
          {
            id: 'log-roll',
            label: 'Log Roll Procedure',
            actions: [
              { id: 'logroll-inspect', label: 'Maintain manual in-line C-spine. Roll on command.', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'spine',
            label: 'Spine',
            actions: [
              { id: 'spine-palpate', label: 'Each spinous process — tenderness, step deformity, swelling', technique: 'palpate', icon: Hand },
              { id: 'spine-inspect', label: 'Bruising, wounds, haematoma along spine', technique: 'inspect', icon: Eye },
            ],
          },
          {
            id: 'flanks-buttocks',
            label: 'Flanks & Buttocks',
            actions: [
              { id: 'flanks-inspect', label: 'Bruising (Grey Turner sign), wounds', technique: 'inspect', icon: Eye },
              { id: 'buttocks-inspect', label: 'Wounds, bleeding, sacral oedema', technique: 'inspect', icon: Eye },
            ],
          },
        ],
      };

    default:
      return null;
  }
}

// ============================================================================
// Finding generator — produces case-specific findings for each action
// ============================================================================

function getFindings(
  caseData: CaseScenario,
  regionId: string,
  subRegionId: string,
  actionId: string,
): string {
  // Pull from case data where possible
  const breathing = caseData.abcde?.breathing;
  const circ = caseData.abcde?.circulation;
  const disability = caseData.abcde?.disability;
  const exposure = caseData.abcde?.exposure;
  const ss = caseData.secondarySurvey;

  // Chest — lung auscultation
  if (actionId.includes('auscultate') && subRegionId.startsWith('lung-')) {
    if (breathing?.auscultation?.length) {
      return breathing.auscultation.join('. ');
    }
    const findings = breathing?.findings?.filter(f =>
      f.toLowerCase().includes('wheez') || f.toLowerCase().includes('crackle') ||
      f.toLowerCase().includes('air entry') || f.toLowerCase().includes('diminished')
    );
    if (findings?.length) return findings.join('. ');
    return 'Vesicular breath sounds. Normal air entry.';
  }

  // Chest — heart sounds
  if (actionId.startsWith('heart-')) {
    if (circ?.ecgFindings?.length) {
      return `Heart sounds: S1 S2 present. ${circ.ecgFindings[0]}`;
    }
    return 'Heart sounds: S1 S2 present. No murmurs.';
  }

  // Chest — percussion
  if (actionId.includes('percuss') && subRegionId.startsWith('lung-')) {
    if (breathing?.findings?.some(f => f.toLowerCase().includes('pneumothorax')))
      return 'Hyper-resonant percussion note';
    if (breathing?.findings?.some(f => f.toLowerCase().includes('effusion') || f.toLowerCase().includes('haemothorax')))
      return 'Dull percussion note — fluid';
    return 'Resonant percussion note — normal';
  }

  // Chest wall
  if (subRegionId === 'chest-wall') {
    const chestFindings = ss?.chest || [];
    if (chestFindings.length) return chestFindings.join('. ');
    if (actionId === 'chest-inspect') return 'Equal chest expansion. No wounds or bruising. No flail segment.';
    return 'No tenderness. No crepitus. No subcutaneous emphysema.';
  }

  // Abdomen — bowel sounds
  if (actionId.includes('auscultate') && (subRegionId === 'ruq' || subRegionId === 'luq' || subRegionId === 'rlq' || subRegionId === 'llq')) {
    const abdFindings = ss?.abdomen || [];
    if (abdFindings.some(f => f.toLowerCase().includes('absent bowel'))) return 'Absent bowel sounds';
    if (abdFindings.some(f => f.toLowerCase().includes('hyperactive'))) return 'Hyperactive bowel sounds — high-pitched, frequent';
    if (abdFindings.some(f => f.toLowerCase().includes('tinkling'))) return 'Tinkling bowel sounds — suggests obstruction';
    return 'Normal bowel sounds present';
  }

  // Abdomen — palpation
  if (actionId.includes('palpate') && (subRegionId === 'ruq' || subRegionId === 'luq' || subRegionId === 'rlq' || subRegionId === 'llq')) {
    const abdFindings = ss?.abdomen || [];
    if (abdFindings.length) return abdFindings.join('. ');
    return 'Soft, non-tender. No guarding or rigidity.';
  }

  // Abdomen — general inspection
  if (subRegionId === 'abd-general') {
    const abdFindings = ss?.abdomen || [];
    const inspectFindings = abdFindings.filter(f =>
      f.toLowerCase().includes('distend') || f.toLowerCase().includes('bruis') ||
      f.toLowerCase().includes('scar') || f.toLowerCase().includes('visible')
    );
    if (inspectFindings.length) return inspectFindings.join('. ');
    return 'Abdomen not distended. No bruising or scars. No visible peristalsis.';
  }

  // Head
  if (regionId === 'head') {
    const headFindings = ss?.head || [];
    if (subRegionId === 'pupils') {
      const pupils = disability?.pupils;
      return typeof pupils === 'string' ? pupils : Array.isArray(pupils) ? pupils.join('. ') : 'Equal and reactive';
    }
    if (subRegionId === 'ears') {
      const earFindings = ss?.headDetailed?.ears || [];
      return earFindings.length ? earFindings.join('. ') : 'No Battle sign. No CSF otorrhoea. Canals clear.';
    }
    if (headFindings.length) return headFindings.join('. ');
    return 'No wounds. No depressions. No haematoma.';
  }

  // Face / airway
  if (regionId === 'face') {
    if (subRegionId === 'mouth-airway') {
      const airway = caseData.abcde?.airway;
      if (actionId === 'mouth-inspect') {
        if (airway?.findings?.length) return airway.findings.join('. ');
        return airway?.patent ? 'Airway patent. No blood, vomit, or foreign body.' : 'AIRWAY COMPROMISED — blood/secretions present.';
      }
      // airway listen
      if (airway?.findings?.some(f => f.toLowerCase().includes('stridor'))) return 'Stridor audible — upper airway obstruction';
      if (airway?.findings?.some(f => f.toLowerCase().includes('gurgling'))) return 'Gurgling — fluid in airway. Suction required.';
      if (airway?.findings?.some(f => f.toLowerCase().includes('snoring'))) return 'Snoring — partial obstruction by tongue. Reposition.';
      return 'No abnormal airway sounds.';
    }
    if (subRegionId === 'facial-symmetry') {
      const faceFindings = ss?.headDetailed?.face || [];
      if (faceFindings.length) return faceFindings.join('. ');
      return 'Face symmetrical. No droop.';
    }
    const noseFindings = ss?.headDetailed?.nose || [];
    if (noseFindings.length) return noseFindings.join('. ');
    return 'No CSF rhinorrhoea. No epistaxis.';
  }

  // Neck
  if (regionId === 'neck-cspine') {
    const neckFindings = ss?.neck || [];
    if (subRegionId === 'jvp') {
      const jvdFinding = neckFindings.find(f => f.toLowerCase().includes('jvd') || f.toLowerCase().includes('jugular'));
      return jvdFinding || 'No JVD. Normal jugular venous pressure.';
    }
    if (subRegionId === 'trachea') {
      const tracheaFinding = neckFindings.find(f => f.toLowerCase().includes('trachea'));
      return tracheaFinding || 'Trachea central and midline.';
    }
    if (neckFindings.length) return neckFindings.join('. ');
    return 'No midline tenderness. No step deformity. No subcutaneous emphysema.';
  }

  // Pelvis
  if (regionId === 'pelvis') {
    const pelvisFindings = ss?.pelvis || [];
    if (pelvisFindings.length) return pelvisFindings.join('. ');
    return 'Pelvis stable on spring test. No deformity.';
  }

  // Extremities (individual limb IDs or legacy 'extremities')
  if (regionId === 'extremities' || regionId === 'right-arm' || regionId === 'left-arm' || regionId === 'right-leg' || regionId === 'left-leg') {
    const extFindings = ss?.extremities || [];
    if (extFindings.length) return extFindings.join('. ');
    return 'No deformity. Pulses present. Sensation and motor intact.';
  }

  // Posterior
  if (regionId === 'posterior-logroll') {
    const postFindings = ss?.posterior || [];
    if (postFindings.length) return postFindings.join('. ');
    return 'No spinal tenderness. No step deformity. No bruising.';
  }

  return 'No abnormalities detected.';
}

// ============================================================================
// Component
// ============================================================================

export function RegionAssessmentPanel({
  regionId,
  caseData,
  onClose,
  onFindingRevealed,
  revealedFindings,
}: RegionAssessmentPanelProps) {
  const config = useMemo(() => getRegionConfig(regionId), [regionId]);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  if (!config) return null;

  const Icon = config.icon;
  const totalActions = config.subRegions.reduce((sum, sr) => sum + sr.actions.length, 0);
  const completedActions = config.subRegions.reduce((sum, sr) =>
    sum + sr.actions.filter(a => revealedFindings.has(`${regionId}:${sr.id}:${a.id}`)).length, 0);

  return (
    <Card className="border-2 border-blue-300 dark:border-blue-700 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-b border-blue-200/50">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
              <Icon className="h-4 w-4 text-blue-500" />
            </div>
            {config.title}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={completedActions === totalActions ? 'default' : 'secondary'}
              className={`text-[9px] ${completedActions === totalActions ? 'bg-green-500' : ''}`}>
              {completedActions}/{totalActions}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-1.5">
        {config.subRegions.map(subRegion => {
          const isExpanded = expandedSub === subRegion.id;
          const subCompleted = subRegion.actions.filter(a =>
            revealedFindings.has(`${regionId}:${subRegion.id}:${a.id}`)
          ).length;

          return (
            <div key={subRegion.id} className="rounded-xl border border-border/50 overflow-hidden">
              {/* Sub-region header */}
              <button
                onClick={() => setExpandedSub(isExpanded ? null : subRegion.id)}
                className="flex items-center gap-2 w-full text-left p-2 hover:bg-muted/40 transition-colors"
              >
                <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <span className="text-xs font-semibold flex-1">{subRegion.label}</span>
                {subCompleted > 0 && (
                  <Badge variant="outline" className={`text-[8px] py-0 h-4 ${subCompleted === subRegion.actions.length ? 'bg-green-50 text-green-600 border-green-200' : ''}`}>
                    {subCompleted}/{subRegion.actions.length}
                  </Badge>
                )}
              </button>

              {/* Exam actions */}
              {isExpanded && (
                <div className="px-2 pb-2 space-y-1 animate-in fade-in duration-200">
                  {subRegion.actions.map(action => {
                    const findingKey = `${regionId}:${subRegion.id}:${action.id}`;
                    const isRevealed = revealedFindings.has(findingKey);
                    const TechIcon = TECHNIQUE_ICONS[action.technique] || Eye;

                    return (
                      <div key={action.id}>
                        <button
                          onClick={() => {
                            if (!isRevealed) {
                              onFindingRevealed(regionId, subRegion.id, action.id);
                            }
                          }}
                          disabled={isRevealed}
                          className={`flex items-center gap-2 w-full text-left p-2 rounded-lg border text-xs transition-all ${
                            isRevealed
                              ? 'bg-green-50/80 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                              : TECHNIQUE_COLORS[action.technique]
                          }`}
                        >
                          <TechIcon className="h-3.5 w-3.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{TECHNIQUE_LABELS[action.technique]}</span>
                            <span className="text-muted-foreground ml-1.5">{action.label}</span>
                          </div>
                          {!isRevealed && (
                            <Badge variant="outline" className="text-[8px] py-0 shrink-0">
                              Perform
                            </Badge>
                          )}
                        </button>

                        {/* Revealed finding */}
                        {isRevealed && (
                          <div className="ml-6 mt-1 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50 text-xs text-green-800 dark:text-green-300 animate-in fade-in duration-300">
                            {getFindings(caseData, regionId, subRegion.id, action.id)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
