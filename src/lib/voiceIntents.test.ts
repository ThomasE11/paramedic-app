import { describe, expect, it } from 'vitest';
import { buildVoiceIntents, type VoicePhase } from './voiceIntents';
import type { Treatment } from '@/data/enhancedTreatmentEffects';
import type { CaseScenario } from '@/types';

// Minimal case stub — buildVoiceIntents only reads the shape, not the content.
const CASE = { id: 't', title: 'Test', category: 'cardiac' } as unknown as CaseScenario;

function tx(id: string, name: string, category: Treatment['category']): Treatment {
  return {
    id, name, category,
    description: '', onset: 'moderate', onsetTimeSeconds: 5, durationSeconds: 30,
    icon: '', color: '', effects: [],
  };
}

const DRUG = tx('adrenaline_1mg', 'Adrenaline', 'medication');
const OXYGEN = tx('oxygen_nonrebreather', 'Oxygen', 'breathing');
const TREATMENTS = [DRUG, OXYGEN];

const all = (phase: VoicePhase) => buildVoiceIntents(CASE, TREATMENTS, phase);

describe('buildVoiceIntents', () => {
  it('resolves natural-language verb aliases for drug administration', () => {
    const drug = all('treatment').find(i => i.id === 'treatment:adrenaline_1mg')!;
    expect(drug.phrase).toContain('give adrenaline');
    expect(drug.phrase).toContain('administer adrenaline');
    expect(drug.phrase).toContain('push adrenaline');
  });

  it('resolves examine/assess/look-at aliases for regions', () => {
    const chest = all('scene').find(i => i.id === 'assess:chest')!;
    expect(chest.phrase).toContain('assess chest');
    expect(chest.phrase).toContain('examine chest');
    expect(chest.phrase).toContain('look at chest');
  });

  it('derives treatment intents from the available treatments', () => {
    const ids = all('treatment').filter(i => i.action.type === 'treatment').map(i => i.action.payload && 'treatmentId' in i.action.payload ? i.action.payload.treatmentId : '');
    expect(ids).toContain('adrenaline_1mg');
    expect(ids).toContain('oxygen_nonrebreather');
  });

  it('excludes harmful treatments from the registry', () => {
    const intents = buildVoiceIntents(CASE, TREATMENTS, 'treatment', {
      isHarmful: t => t.id === 'adrenaline_1mg',
    });
    expect(intents.some(i => i.id === 'treatment:adrenaline_1mg')).toBe(false);
    expect(intents.some(i => i.id === 'treatment:oxygen_nonrebreather')).toBe(true);
  });

  it('filters intents by phase — treatments only in the treatment phase', () => {
    expect(all('scene').some(i => i.action.type === 'treatment')).toBe(false);
    expect(all('treatment').some(i => i.action.type === 'treatment')).toBe(true);
    // Debrief offers nothing actionable.
    expect(all('debrief')).toHaveLength(0);
  });

  it('flags drug administration as requiresConfirm, non-drugs as not', () => {
    const drug = all('treatment').find(i => i.id === 'treatment:adrenaline_1mg')!;
    const o2 = all('treatment').find(i => i.id === 'treatment:oxygen_nonrebreather')!;
    expect(drug.requiresConfirm).toBe(true);
    expect(o2.requiresConfirm).toBe(false);
  });

  it('includes navigation intents for bag, monitor, and anatomy', () => {
    const nav = all('treatment').filter(i => i.action.type === 'nav');
    const targets = nav.map(i => i.action.type === 'nav' ? `${i.action.payload.target}:${i.action.payload.open}` : '');
    expect(targets).toContain('jump-bag:true');
    expect(targets).toContain('monitor:true');
    expect(targets).toContain('anatomy:true');
    expect(targets).toContain('jump-bag:false');
  });

  it('covers every secondary-survey region with an assessment intent', () => {
    const ids = new Set(all('scene').map(i => i.id));
    for (const region of ['head', 'face', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'right-arm', 'left-arm', 'right-leg', 'left-leg', 'posterior-logroll']) {
      expect(ids.has(`assess:${region}`)).toBe(true);
    }
  });

  it('keeps phrases unique within every intent', () => {
    for (const i of all('treatment')) {
      expect(new Set(i.phrase).size).toBe(i.phrase.length);
    }
  });
});
