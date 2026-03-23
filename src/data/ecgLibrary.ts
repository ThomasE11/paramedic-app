/**
 * ECG Library - Integration with Life in the Fast Lane
 *
 * This module provides comprehensive ECG interpretations and cases.
 * ECGs are categorized by pathology with detailed findings and clinical context.
 *
 * Reference: LITFL (Life in the Fast Lane) ECG Library
 * https://litfl.com/ecg-library/
 */

export interface ECGFinding {
  location: string;
  description: string;
  significance: 'critical' | 'important' | 'supportive';
}

export interface ECGInterpretation {
  rhythm: string;
  rate: number;
  axis: string;
  prInterval: string;
  qrsDuration: string;
  qtInterval: string;
  stSegment: string;
  tWave: string;
  other: string[];
}

export interface ECGCase {
  id: string;
  title: string;
  category: 'STEMI' | 'NSTEMI' | 'Arrhythmia' | 'Conduction' | 'Metabolic' | 'Toxic' | 'Normal';
  image?: string; // URL to ECG image
  interpretation: ECGInterpretation;
  keyFindings: ECGFinding[];
  clinicalContext: string;
  differentials: string[];
  teachingPoints: string[];
  pitfalls: string[];
  associatedConditions: string[];
  litflLink?: string;
}

export interface ECGQuiz {
  ecgId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// ============================================================================
// STEMI ECGs
// ============================================================================

export const anteriorSTEMI: ECGCase = {
  id: 'ecg-anterior-stemi',
  title: 'Acute Anterior STEMI',
  category: 'STEMI',
  interpretation: {
    rhythm: 'Sinus rhythm',
    rate: 85,
    axis: 'Normal axis',
    prInterval: '160ms (normal)',
    qrsDuration: '80ms (normal)',
    qtInterval: '420ms (normal)',
    stSegment: 'ST elevation 2-4mm in V1-V4 with reciprocal ST depression in inferior leads',
    tWave: 'Hyperacute T waves in V1-V4',
    other: ['Q waves beginning to form in V2-V3']
  },
  keyFindings: [
    { location: 'V1-V4', description: 'Convex (tombstone) ST elevation', significance: 'critical' },
    { location: 'II, III, aVF', description: 'Reciprocal ST depression', significance: 'important' },
    { location: 'V1-V4', description: 'Hyperacute T waves (broad, peaked)', significance: 'important' }
  ],
  clinicalContext: '45-year-old male with crushing central chest pain radiating to left arm and jaw. Pain started 30 minutes ago. Diaphoretic. BP 90/60, HR 110.',
  differentials: ['Early repolarization', 'Pericarditis', 'Benign T wave changes', 'Ventricular aneurysm'],
  teachingPoints: [
    'Anterior STEMI involves LAD occlusion',
    'Look for reciprocal changes in inferior leads - confirms ischemia',
    'Hyperacute T waves appear before ST elevation',
    '"Tombstone" ST elevation is classic for anterior STEMI',
    'Q waves appear within 1-2 hours - indicate transmural infarction',
    'LAD "wraparound" may also have inferior ST elevation'
  ],
  pitfalls: [
    'Missing anterior STEMI in V1-V2 only (septal)',
    'Confusing with early repolarization (look for reciprocal changes)',
    'Not recognizing "tombstone" ST segments',
    'Ignoring Q waves as "old infarct"',
    'Forgetting that ST elevation in aVR may indicate left main occlusion'
  ],
  associatedConditions: ['Cardiogenic shock', 'Ventricular arrhythmias', 'Anterior wall motion abnormality', 'LV dysfunction', 'Apical thrombus'],
  litflLink: 'https://litfl.com/anterior-stemi-ecg-library/'
};

export const inferiorSTEMI: ECGCase = {
  id: 'ecg-inferior-stemi',
  title: 'Acute Inferior STEMI',
  category: 'STEMI',
  interpretation: {
    rhythm: 'Sinus rhythm',
    rate: 65,
    axis: 'Normal axis',
    prInterval: '180ms (normal)',
    qrsDuration: '90ms (normal)',
    qtInterval: '400ms (normal)',
    stSegment: 'ST elevation 2mm in II, III, aVF with reciprocal ST depression in I, aVL',
    tWave: 'Inverted in II, III, aVF',
    other: ['ST elevation greater in III than II', 'Right-sided ECG shows V4R ST elevation']
  },
  keyFindings: [
    { location: 'II, III, aVF', description: 'ST elevation with reciprocal changes in I, aVL', significance: 'critical' },
    { location: 'III vs II', description: 'ST elevation greater in lead III than II', significance: 'critical' },
    { location: 'V4R (right-sided)', description: 'ST elevation 1mm (Right ventricular infarction)', significance: 'critical' },
    { location: 'V1-V2', description: 'ST depression (posterior involvement)', significance: 'important' }
  ],
  clinicalContext: '58-year-old male with severe epigastric pain radiating to back. Nausea and vomiting. BP 85/55, HR 55. History of hypertension and smoking.',
  differentials: ['Pericarditis', 'Early repolarization', 'Abdominal pathology (e.g., pancreatitis)', 'Lateral STEMI'],
  teachingPoints: [
    'Inferior STEMI involves RCA or LCx occlusion',
    'ST elevation greater in III than II suggests RCA occlusion',
    'ST elevation in III = II suggests LCx occlusion',
    'ALWAYS get right-sided ECG (V4R) for inferior STEMI',
    'RV infarction: Avoid nitrates and diuretics - preload dependent!',
    'Bradycardia and heart block common with inferior STEMI',
    'ST depression in V1-V2 suggests posterior extension'
  ],
  pitfalls: [
    'Giving nitrates in RV infarction (causes severe hypotension)',
    'Missing right ventricular infarction (not doing V4R)',
    'Not recognizing associated bradycardia/heart block',
    'Confusing with pericarditis (reciprocal changes present in STEMI)',
    'Missing posterior MI (ST depression in V1-V3)'
  ],
  associatedConditions: ['Right ventricular infarction', 'Bradycardia', 'AV block', 'Hypotension', 'Posterior MI', 'Vomiting (vasovagal response)'],
  litflLink: 'https://litfl.com/inferior-stemi-ecg-library/'
};

export const lateralSTEMI: ECGCase = {
  id: 'ecg-lateral-stemi',
  title: 'Acute Lateral STEMI',
  category: 'STEMI',
  interpretation: {
    rhythm: 'Sinus rhythm',
    rate: 78,
    axis: 'Normal axis',
    prInterval: '170ms (normal)',
    qrsDuration: '85ms (normal)',
    qtInterval: '410ms (normal)',
    stSegment: 'ST elevation 1.5-2mm in I, aVL, V5-V6',
    tWave: 'Inverted in lateral leads',
    other: ['Reciprocal ST depression in inferior leads']
  },
  keyFindings: [
    { location: 'I, aVL, V5-V6', description: 'ST elevation with tall T waves', significance: 'critical' },
    { location: 'II, III, aVF', description: 'Reciprocal ST depression', significance: 'important' },
    { location: 'V5-V6', description: 'ST elevation with upright T waves', significance: 'critical' }
  ],
  clinicalContext: '52-year-old female with left-sided chest pain. Diabetic with atypical presentation. Mild discomfort rather than severe pain.',
  differentials: ['Pericarditis', 'Normal variant', 'Left ventricular hypertrophy'],
  teachingPoints: [
    'Lateral STEMI involves LCx or diagonal branches of LAD',
    'High lateral (I, aVL) vs Low lateral (V5-V6) helps localize',
    'Diabetics often have atypical presentations',
    'Women may have subtle ST changes - maintain high index of suspicion',
    'LCx occlusion: look for ST depression in V1-V3 (posterior)'
  ],
  pitfalls: [
    'Missing subtle ST elevation in aVL (commonly missed)',
    'Not recognizing lateral STEMI with normal inferior leads',
    'Confusing with LVH (look for strain pattern)',
    'Dismissing atypical presentation in diabetics'
  ],
  associatedConditions: ['LCx occlusion', 'Posterior MI', 'Mitral regurgitation'],
  litflLink: 'https://litfl.com/lateral-stemi-ecg-library/'
};

export const posteriorSTEMI: ECGCase = {
  id: 'ecg-posterior-stemi',
  title: 'Acute Posterior STEMI',
  category: 'STEMI',
  interpretation: {
    rhythm: 'Sinus rhythm',
    rate: 75,
    axis: 'Normal axis',
    prInterval: '160ms (normal)',
    qrsDuration: '90ms (normal)',
    qtInterval: '420ms (normal)',
    stSegment: 'ST depression 2-3mm in V1-V3 with upright T waves',
    tWave: 'Upright and tall in V1-V3 (horizontal ST depression)',
    other: ['Prominent R waves in V1-V2', 'V7-V9 would show ST elevation']
  },
  keyFindings: [
    { location: 'V1-V3', description: 'Horizontal ST depression with tall, upright T waves', significance: 'critical' },
    { location: 'V1-V2', description: 'Prominent R waves (R/S ratio >1)', significance: 'important' },
    { location: 'V1-V3', description: 'Tall, broad R waves (posterior mirror image)', significance: 'important' }
  ],
  clinicalContext: '65-year-old male with chest pain radiating to back. Associated with inferior STEMI (II, III, aVF ST elevation).',
  differentials: ['Anterior ischemia', 'LVH with strain pattern', 'Left bundle branch block'],
  teachingPoints: [
    'Posterior STEMI is the "mirror image" of anterior STEMI',
    'ST depression in V1-V3 with UPRIGHT T waves = posterior STEMI',
    'If T waves inverted in V1-V3 = ischemia, not posterior STEMI',
    'Posterior leads V7-V9 confirm diagnosis',
    'Usually associated with inferior or lateral STEMI',
    'Posterior STEMI = LCx or RCA distal occlusion',
    'High risk of cardiogenic shock'
  ],
  pitfalls: [
    'Confusing posterior STEMI with anterior ischemia',
    'Not recognizing upright T waves in V1-V3 as key differentiator',
    'Missing posterior involvement with inferior STEMI',
    'Not obtaining posterior leads (V7-V9) when suspected',
    'Treating as "anterior NSTEMI" when it\'s actually posterior STEMI'
  ],
  associatedConditions: ['Inferior STEMI', 'Lateral STEMI', 'Cardiogenic shock', 'LCx occlusion'],
  litflLink: 'https://litfl.com/posterior-stemi-ecg-library/'
};

export const leftBundleBranchBlock: ECGCase = {
  id: 'ecg-lbbb',
  title: 'LBBB with Acute MI (Sgarbossa Criteria)',
  category: 'STEMI',
  interpretation: {
    rhythm: 'Sinus rhythm',
    rate: 90,
    axis: 'Left axis deviation',
    prInterval: '180ms (normal)',
    qrsDuration: '150ms (prolonged >120ms)',
    qtInterval: '480ms (prolonged)',
    stSegment: 'ST elevation in concordant leads, ST depression in aVR',
    tWave: 'Discordant to QRS (except in leads with concordant ST elevation)',
    other: ['Broad notched R wave in V5-V6', 'QS or rS in V1-V2']
  },
  keyFindings: [
    { location: 'I, V5-V6', description: 'Broad, notched R waves (M pattern)', significance: 'important' },
    { location: 'V1-V3', description: 'Deep S waves (no R wave or small r)', significance: 'important' },
    { location: 'Multiple leads', description: 'Appropriate discordance (ST/T opposite direction to QRS)', significance: 'supportive' },
    { location: 'V4-V6', description: 'Concordant ST elevation (Sgarbossa criteria)', significance: 'critical' }
  ],
  clinicalContext: '72-year-old female with known LBBB presenting with chest pain. Pain is typical for cardiac ischemia.',
  differentials: ['Old LBBB without MI', 'Ventricular paced rhythm', 'LVH'],
  teachingPoints: [
    'LBBB makes MI diagnosis difficult',
    'Use modified Sgarbossa criteria for diagnosis',
    'Concordant ST elevation ≥1mm = highly specific for MI',
    'ST depression/S ratio ≥0.25 in V1-V3 = MI',
    'Excessively discordant ST elevation (≥5mm) in opposite direction = MI',
    'New LBBB + chest pain = STEMI equivalent',
    'Compare with old ECG if available'
  ],
  pitfalls: [
    'Diagnosing MI based on "inappropriate discordance" alone (not reliable)',
    'Not knowing Sgarbossa criteria',
    'Assuming all ST elevation in LBBB is normal',
    'Missing new LBBB (critical finding)',
    'Not comparing with prior ECG'
  ],
  associatedConditions: ['Heart failure', 'Cardiomyopathy', 'Ischemic heart disease', 'Conduction system disease'],
  litflLink: 'https://litfl.com/lbbb-ecg-library/'
};

// ============================================================================
// ARRHYTHMIAS
// ============================================================================

export const atrialFibrillation: ECGCase = {
  id: 'ecg-af',
  title: 'Atrial Fibrillation with Rapid Ventricular Response',
  category: 'Arrhythmia',
  interpretation: {
    rhythm: 'Irregularly irregular (no P waves)',
    rate: 145,
    axis: 'Normal axis',
    prInterval: 'Cannot determine (no P waves)',
    qrsDuration: '80ms (narrow)',
    qtInterval: '360ms (normal for rate)',
    stSegment: 'Non-specific ST changes',
    tWave: 'Normal',
    other: ['Absence of P waves', 'Irregular RR intervals', 'Fibrillation waves (baseline chaos)']
  },
  keyFindings: [
    { location: 'All leads', description: 'No discernible P waves', significance: 'critical' },
    { location: 'Rhythm strip', description: 'Irregularly irregular RR intervals', significance: 'critical' },
    { location: 'Baseline', description: 'Fibrillation waves (fine or coarse)', significance: 'important' }
  ],
  clinicalContext: '68-year-old female with palpitations, shortness of breath, and fatigue. History of hypertension, diabetes, and previous stroke.',
  differentials: ['Atrial flutter with variable block', 'Multifocal atrial tachycardia', 'Sinus arrhythmia with PACs'],
  teachingPoints: [
    'AF = Irregularly irregular rhythm with NO P waves',
    'Atrial flutter with variable block can mimic AF (look for flutter waves)',
    'RVR = Rapid Ventricular Response (>100 bpm)',
    'Assess for hemodynamic stability first',
    'Duration of AF determines stroke risk and management',
    'CHA2DS2-VASc score for stroke risk',
    'Look for underlying causes: valvular disease, thyrotoxicosis, alcohol, sepsis'
  ],
  pitfalls: [
    'Missing AF due to very coarse fibrillation waves',
    'Confusing with atrial flutter (look for sawtooth waves)',
    'Not assessing for hemodynamic stability',
    'Forgetting to check for underlying causes',
    'Missing associated conditions like heart failure'
  ],
  associatedConditions: ['Thromboembolism', 'Heart failure', 'Valvular disease', 'Thyrotoxicosis', 'Alcohol holiday syndrome'],
  litflLink: 'https://litfl.com/atrial-fibrillation-ecg-library/'
};

export const atrialFlutter: ECGCase = {
  id: 'ecg-afl',
  title: 'Typical Atrial Flutter',
  category: 'Arrhythmia',
  interpretation: {
    rhythm: 'Atrial flutter with variable block',
    rate: 75,
    axis: 'Normal axis',
    prInterval: 'Cannot determine (flutter waves)',
    qrsDuration: '80ms (narrow)',
    qtInterval: '400ms (normal)',
    stSegment: 'Normal',
    tWave: 'Normal',
    other: ['Sawtooth flutter waves best seen in II, III, aVF', 'Atrial rate ~300 bpm', '2:1, 3:1, or variable AV block']
  },
  keyFindings: [
    { location: 'II, III, aVF', description: 'Sawtooth flutter waves (baseline undulation)', significance: 'critical' },
    { location: 'Rhythm', description: 'Regular atrial rate ~300 bpm', significance: 'important' },
    { location: 'V1', description: 'Sawtooth waves may be visible', significance: 'supportive' }
  ],
  clinicalContext: '55-year-old male with palpitations. No chest pain. Mild shortness of breath on exertion.',
  differentials: ['Atrial fibrillation', 'SVT', 'Sinus tachycardia with PACs'],
  teachingPoints: [
    'Atrial flutter rate typically ~300 bpm',
    '2:1 block gives ventricular rate ~150 bpm',
    'Look for sawtooth waves in inferior leads (II, III, aVF)',
    'Typical flutter: counterclockwise isthmus',
    'Atypical flutter: other re-entry circuits',
    'High risk of thromboembolism (treat as AF)',
    'Cavotricuspid isthmus ablation is curative'
  ],
  pitfalls: [
    'Missing flutter waves (can be subtle)',
    'Confusing 2:1 flutter with sinus tachycardia',
    'Not recognizing variable block',
    'Missing thromboembolic risk'
  ],
  associatedConditions: ['COPD', 'Valvular disease', 'Post-cardiac surgery', 'Heart failure'],
  litflLink: 'https://litfl.com/atrial-flutter-ecg-library/'
};

export const supraventricularTachycardia: ECGCase = {
  id: 'ecg-svt',
  title: 'AVNRT (Supraventricular Tachycardia)',
  category: 'Arrhythmia',
  interpretation: {
    rhythm: 'Narrow complex tachycardia',
    rate: 185,
    axis: 'Normal axis',
    prInterval: 'Short or not discernible',
    qrsDuration: '80ms (narrow)',
    qtInterval: '320ms (shortened by rate)',
    stSegment: 'Non-specific ST depression (rate-related)',
    tWave: 'Difficult to assess due to rate',
    other: ['Pseudo R\' in V1', 'Pseudo S in inferior leads', 'Retrograde P waves may be visible']
  },
  keyFindings: [
    { location: 'All leads', description: 'Narrow complex QRS (<120ms) at rate >150', significance: 'critical' },
    { location: 'V1', description: 'Pseudo R\' wave (retrograde P in QRS)', significance: 'important' },
    { location: 'II, III, aVF', description: 'Pseudo S wave (retrograde P)', significance: 'supportive' }
  ],
  clinicalContext: '28-year-old female with sudden onset palpitations. Lightheaded but no syncope. No chest pain. Multiple similar episodes in past.',
  differentials: ['Atrial flutter with 2:1 block', 'Sinus tachycardia', 'AVRT (WPW)', 'Atrial tachycardia'],
  teachingPoints: [
    'AVNRT is most common SVT in adults',
    'Re-entry circuit in/near AV node',
    'Look for retrograde P waves hidden in QRS',
    'Pseudo R\' in V1 or pseudo S in inferior leads',
    'Vagal maneuvers may terminate',
    'Adenosine for diagnosis and treatment',
    'Always ask about WPW and avoid AV node blockers if present'
  ],
  pitfalls: [
    'Confusing with atrial flutter (flutter waves usually visible)',
    'Not recognizing pseudo R\' or S waves',
    'Using verapamil in WPW (fatal - causes VF)',
    'Forgetting to ask about WPW diagnosis',
    'Missing underlying atrial tachycardia'
  ],
  associatedConditions: ['WPW syndrome', 'Cardiomyopathy', 'Pregnancy (hormonal changes)', 'Anxiety disorders'],
  litflLink: 'https://litfl.com/svt-ecg-library/'
};

export const ventricularTachycardia: ECGCase = {
  id: 'ecg-vt',
  title: 'Monomorphic Ventricular Tachycardia',
  category: 'Arrhythmia',
  interpretation: {
    rhythm: 'Wide complex tachycardia',
    rate: 185,
    axis: 'Left axis deviation',
    prInterval: 'Cannot determine (AV dissociation)',
    qrsDuration: '160ms (wide >120ms)',
    qtInterval: 'Cannot determine',
    stSegment: 'Cannot assess (in QRS)',
    tWave: 'Opposite direction to QRS (discordant)',
    other: ['AV dissociation visible', 'Capture beats present', 'Fusion beats present', 'Extreme axis deviation']
  },
  keyFindings: [
    { location: 'All leads', description: 'Wide QRS >120ms at rate >120', significance: 'critical' },
    { location: 'Rhythm strip', description: 'AV dissociation (P waves marching through)', significance: 'critical' },
    { location: 'V1', description: 'Positive QRS (left bundle pattern)', significance: 'supportive' },
    { location: 'Any lead', description: 'Capture beat (normal QRS in VT)', significance: 'critical' }
  ],
  clinicalContext: '65-year-old male with history of MI and LV dysfunction. Presenting with dizziness and near-syncope. Mild palpitations.',
  differentials: ['SVT with aberrancy', 'Antidromic AVRT (WPW)', 'Electrolyte abnormality'],
  teachingPoints: [
    'VT is diagnosis of exclusion in wide complex tachycardia',
    'Assume VT until proven otherwise (safest approach)',
    'AV dissociation = pathognomonic for VT',
    'Capture beats and fusion beats confirm VT',
    'Extreme axis deviation suggests VT',
    'Look for fusion beats (combined sinus and ventricular activation)',
    'Structural heart disease increases likelihood of VT',
    'Brugada and Vereckei algorithms can help differentiate'
  ],
  pitfalls: [
    'Misidentifying VT as SVT with aberrancy (dangerous)',
    'Using verapamil for VT (causes cardiac arrest)',
    'Not recognizing AV dissociation',
    'Missing capture/fusion beats',
    'Forgetting that "treat the patient, not the rhythm"'
  ],
  associatedConditions: ['Ischemic heart disease', 'Cardiomyopathy', 'Electrolyte abnormalities', 'Drug toxicity', 'Channelopathies'],
  litflLink: 'https://litfl.com/ventricular-tachycardia-ecg-library/'
};

export const torsades: ECGCase = {
  id: 'ecg-tdp',
  title: 'Torsades de Pointes',
  category: 'Arrhythmia',
  interpretation: {
    rhythm: 'Polymorphic VT with twisting QRS axis',
    rate: 250,
    axis: 'Continually changing',
    prInterval: 'Cannot determine',
    qrsDuration: 'Variable, wide',
    qtInterval: 'Prolonged in sinus rhythm (if visible)',
    stSegment: 'Cannot assess',
    tWave: 'Cannot assess',
    other: ['Twisting QRS amplitude around baseline', 'Initiated by short-long-short sequence', 'Pause-dependent initiation', 'Rate 250-350 varying']
  },
  keyFindings: [
    { location: 'All leads', description: 'Polymorphic VT with changing axis', significance: 'critical' },
    { location: 'Initiation', description: 'Short-long-short sequence with PVC on prolonged QT', significance: 'important' },
    { location: 'Rhythm strip', description: 'Long QT interval in sinus beats', significance: 'critical' }
  ],
  clinicalContext: '72-year-old female on multiple QT-prolonging medications. Found unresponsive at home. Family reports she was feeling weak and dizzy recently.',
  differentials: ['Polymorphic VT without long QT', 'VF', 'Artifact'],
  teachingPoints: [
    'Torsades = "twisting of the points"',
    'Associated with prolonged QT interval',
    'Congenital or acquired long QT',
    'Common causes: drugs (antiarrhythmics, psychotropics, antibiotics), electrolytes',
    'Initiated by early PVC (R-on-T phenomenon)',
    'MgSO4 is first-line treatment',
    'Avoid QT-prolonging drugs',
    'Overdrive pacing may be effective'
  ],
  pitfalls: [
    'Not recognizing torsades vs. other polymorphic VT',
    'Using amiodarone or other QT-prolonging drugs',
    'Not checking electrolytes (K+, Mg++)',
    'Missing drug-induced long QT',
    'Not giving magnesium sulfate'
  ],
  associatedConditions: ['Congenital long QT syndrome', 'Drug-induced QT prolongation', 'Electrolyte abnormalities', 'Stroke', 'Bradycardia'],
  litflLink: 'https://litfl.com/torsades-de-pointes-ecg-library/'
};

export const thirdDegreeBlock: ECGCase = {
  id: 'ecg-3db',
  title: 'Third Degree (Complete) Heart Block',
  category: 'Conduction',
  interpretation: {
    rhythm: 'Complete AV dissociation',
    rate: 40,
    axis: 'Normal axis',
    prInterval: 'Variable (no relationship)',
    qrsDuration: '80ms (narrow) or 140ms (wide depending on escape)',
    qtInterval: '440ms',
    stSegment: 'Normal',
    tWave: 'Normal',
    other: ['More P waves than QRS complexes', 'Atrial rate 80, Ventricular rate 40', 'PP intervals regular', 'RR intervals regular', 'No PR relationship']
  },
  keyFindings: [
    { location: 'All leads', description: 'Complete AV dissociation (P waves march through QRS)', significance: 'critical' },
    { location: 'Rhythm strip', description: 'Regular PP intervals and regular RR intervals', significance: 'important' },
    { location: 'QRS', description: 'Narrow = junctional escape, Wide = ventricular escape', significance: 'important' }
  ],
  clinicalContext: '78-year-old male with syncope. Dizzy for several days. History of hypertension and CAD.',
  differentials: ['Second degree AV block (Mobitz I or II)', 'Ventricular rhythm', 'AV dissociation from other causes'],
  teachingPoints: [
    'Complete heart block = no conduction from atria to ventricles',
    'Atrial and ventricular rhythms independent but both regular',
    'Narrow QRS = junctional escape (higher, more reliable)',
    'Wide QRS = ventricular escape (lower, unstable)',
    'May need permanent pacemaker',
    'Atropine may not work (ventricular escape)',
    'Consider transcutaneous pacing if unstable',
    'Common causes: ischemia (RCA), degenerative, drugs'
  ],
  pitfalls: [
    'Confusing with second degree block',
    'Thinking atropine will work for ventricular escape',
    'Not recognizing junctional vs ventricular escape',
    'Not preparing for pacing in unstable patients',
    'Missing underlying MI (inferior)'
  ],
  associatedConditions: ['Inferior MI', 'Degenerative conduction disease', 'Drug toxicity (beta blockers, digoxin, CCBs)', 'Myocarditis'],
  litflLink: 'https://litfl.com/heart-block-ecg-library/'
};

// ============================================================================
// METABOLIC AND TOXIC
// ============================================================================

export const hyperkalemia: ECGCase = {
  id: 'ecg-hyperkalemia',
  title: 'Severe Hyperkalemia',
  category: 'Metabolic',
  interpretation: {
    rhythm: 'Sinus rhythm',
    rate: 95,
    axis: 'Normal axis',
    prInterval: '240ms (prolonged)',
    qrsDuration: '160ms (widened)',
    qtInterval: 'Prolonged (difficult to measure)',
    stSegment: 'Cannot assess (in QRS)',
    tWave: 'Peaked T waves in multiple leads',
    other: ['Peaked T waves', 'Widened QRS', 'Prolonged PR interval', 'Absent P waves as K+ rises']
  },
  keyFindings: [
    { location: 'Multiple leads', description: 'Tall, narrow, peaked T waves (symmetrical)', significance: 'critical' },
    { location: 'All leads', description: 'Progressive QRS widening', significance: 'critical' },
    { location: 'Multiple leads', description: 'PR prolongation', significance: 'important' },
    { location: 'Rhythm strip', description: 'P waves may disappear (sinus arrest)', significance: 'important' }
  ],
  clinicalContext: '65-year-old male with renal failure. Missed dialysis for 3 days. Feeling weak and nauseated. K+ returns 7.8 mEq/L.',
  differentials: ['Acute MI (peaked T waves can mimic)', 'Left ventricular hypertrophy', 'Bundle branch block'],
  teachingPoints: [
    'ECG changes correlate with K+ level (but not always)',
    'Mild: Peaked T waves only',
    'Moderate: Prolonged PR, QRS widening, decreased P wave amplitude',
    'Severe: Sine wave pattern, absent P waves, VF risk',
    'Sine wave = pre-terminal - treat immediately',
    'Treatment: Ca gluconate (stabilize membrane), insulin+dextrose, salbutamol',
    'ECG may normalize before K+ does'
  ],
  pitfalls: [
    'Not recognizing peaked T waves',
    'Assuming normal ECG means normal K+ (false negative possible)',
    'Not recognizing sine wave pattern',
    'Delaying calcium gluconate',
    'Forgetting that renal patients are at risk'
  ],
  associatedConditions: ['Renal failure', 'Rhabdomyolysis', 'Cell lysis (tumor lysis, burns)', 'Medication effects (ACEi, spironolactone)'],
  litflLink: 'https://litfl.com/hyperkalemia-ecg-library/'
};

export const hypokalemia: ECGCase = {
  id: 'ecg-hypokalemia',
  title: 'Moderate to Severe Hypokalemia',
  category: 'Metabolic',
  interpretation: {
    rhythm: 'Sinus rhythm with frequent PVCs',
    rate: 88,
    axis: 'Normal axis',
    prInterval: '200ms (mildly prolonged)',
    qrsDuration: '100ms (prolonged for non-LBBB)',
    qtInterval: 'Prolonged (actually prolonged QU)',
    stSegment: 'Depression in multiple leads',
    tWave: 'Flattened to inverted',
    other: ['Prominent U waves', 'ST depression', 'Flattened T waves', 'PVCs', 'Possible ventricular arrhythmias']
  },
  keyFindings: [
    { location: 'Multiple leads', description: 'Prominent U waves (after T waves)', significance: 'critical' },
    { location: 'Multiple leads', description: 'ST depression', significance: 'important' },
    { location: 'Multiple leads', description: 'Flattened or inverted T waves', significance: 'important' }
  ],
  clinicalContext: '45-year-old female with vomiting and diarrhea for 5 days. Weak and dizzy. K+ 2.1 mEq/L.',
  differentials: ['Ischemia', 'Drug effects', 'Electrolyte abnormalities (hypomagnesemia, hypocalcemia)'],
  teachingPoints: [
    'U waves are the hallmark of hypokalemia',
    'U waves appear as small deflection after T wave',
    'May be difficult to see (look in V2-V3)',
    'Hypokalemia predisposes to arrhythmias',
    'PVCs, ventricular tachycardia possible',
    'Treatment: Oral or IV K+ replacement',
    'Always correct magnesium concurrently'
  ],
  pitfalls: [
    'Missing U waves or confusing with T waves',
    'Attributing ST depression to ischemia',
    'Not recognizing the arrhythmia risk',
    'Forgetting to correct magnesium',
    'Rapid IV K+ without cardiac monitoring'
  ],
  associatedConditions: ['GI losses (vomiting, diarrhea)', 'Diuretics', 'Hyperaldosteronism', 'Renal tubular defects', 'Refeeding syndrome'],
  litflLink: 'https://litfl.com/hypokalemia-ecg-library/'
};

export const digoxinToxicity: ECGCase = {
  id: 'ecg-digoxin',
  title: 'Digoxin Toxicity',
  category: 'Toxic',
  interpretation: {
    rhythm: 'Atrial fibrillation with slow ventricular response',
    rate: 45,
    axis: 'Normal axis',
    prInterval: 'Variable (AF)',
    qrsDuration: '100ms (borderline prolonged)',
    qtInterval: 'Difficult to assess',
    stSegment: 'Scooped ST depression (reverse tick)',
    tWave: 'Inverted or biphasic',
    other: ['Scooped ST depression (reverse tick sign)', 'Bidirectional VT (in severe toxicity)', 'AV block of varying degrees']
  },
  keyFindings: [
    { location: 'Multiple leads', description: '"Reverse tick" or scooped ST depression', significance: 'critical' },
    { location: 'Rhythm', description: 'Slow AF or other bradyarrhythmias', significance: 'important' },
    { location: 'Rhythm strip', description: 'AV block (1st, 2nd, or 3rd degree)', significance: 'important' }
  ],
  clinicalContext: '82-year-old female on digoxin for heart failure. Started new medication recently. Nausea, vomiting, visual changes (yellow halos).',
  differentials: ['Ischemia', 'Electrolyte abnormalities', 'Other drug toxicities'],
  teachingPoints: [
    'Digoxin has narrow therapeutic window',
    'Classic signs: GI, visual, and cardiac',
    'Reverse tick sign = scooped ST depression',
    'Any arrhythmia can occur with digoxin toxicity',
    'Bidirectional VT = pathognomonic for digoxin toxicity',
    'Risk factors: renal failure, drug interactions, electrolyte abnormalities',
    'Treatment: Digoxin-specific antibody fragments (Fab)'
  ],
  pitfalls: [
    'Not recognizing reverse tick sign',
    'Missings bidirectional VT',
    'Not checking digoxin level',
    'Not checking for drug interactions',
    'Attributing symptoms to other causes'
  ],
  associatedConditions: ['Renal failure', 'Drug interactions (amiodarone, verapamil, quinidine)', 'Electrolyte abnormalities', 'Overdose'],
  litflLink: 'https://litfl.com/digoxin-toxicity-ecg-library/'
};

export const wellensSyndrome: ECGCase = {
  id: 'ecg-wellens',
  title: 'Wellens Syndrome (LAD Critical Stenosis)',
  category: 'NSTEMI',
  interpretation: {
    rhythm: 'Sinus rhythm',
    rate: 72,
    axis: 'Normal axis',
    prInterval: '160ms (normal)',
    qrsDuration: '80ms (normal)',
    qtInterval: '400ms (normal)',
    stSegment: 'Minimal elevation or normal (pain-free)',
    tWave: 'Deeply inverted or biphasic in V2-V3',
    other: ['Biphasic T waves in V2-V3', 'Preserved R wave progression', 'Normal or minimally elevated ST']
  },
  keyFindings: [
    { location: 'V2-V3', description: 'Biphasic T waves (type 1) or deeply inverted (type 2)', significance: 'critical' },
    { location: 'V2-V4', description: 'T wave abnormalities in pain-free state', significance: 'critical' },
    { location: 'History', description: 'Recent chest pain, now pain-free with abnormal ECG', significance: 'critical' }
  ],
  clinicalContext: '52-year-old male with episodes of chest pain at rest. Now pain-free but ECG shows T wave abnormalities. This is a STEMI equivalent!',
  differentials: ['Nonspecific T wave changes', 'Myocarditis', 'Normal variant'],
  teachingPoints: [
    'Wellens = LAD critical stenosis (>50%)',
    'Type 1: Biphasic T waves in V2-V3',
    'Type 2: Deeply inverted T waves in V2-V3',
    'Patient typically pain-free when ECG taken',
    'IMPORTANT: Do NOT stress test these patients!',
    'High risk of extensive anterior MI within days to weeks',
    'Requires urgent angiography and revascularization',
    'This is a STEMI equivalent!'
  ],
  pitfalls: [
    'Discharging patient with "nonspecific T wave changes"',
    'Performing stress test (fatal mistake)',
    'Not recognizing the pattern',
    'Not appreciating the urgency',
    'Missing the history of chest pain'
  ],
  associatedConditions: ['Critical LAD stenosis', 'Impending anterior STEMI', 'Cardiogenic shock risk'],
  litflLink: 'https://litfl.com/wellens-syndrome-ecg-library/'
};

export const brugadaPattern: ECGCase = {
  id: 'ecg-brugada',
  title: 'Brugada Syndrome Type 1',
  category: 'Arrhythmia',
  interpretation: {
    rhythm: 'Sinus rhythm',
    rate: 68,
    axis: 'Normal axis',
    prInterval: '180ms (normal)',
    qrsDuration: '110ms (borderline)',
    qtInterval: '380ms (normal)',
    stSegment: 'Coved ST elevation ≥2mm in V1-V2 followed by negative T wave',
    tWave: 'Inverted in V1-V2 following ST elevation',
    other: ['Coved ST elevation in V1-V3', 'Negative T waves in same leads', 'Pseudo RBB in V1-V2']
  },
  keyFindings: [
    { location: 'V1-V3', description: 'Coved ST elevation ≥2mm', significance: 'critical' },
    { location: 'V1-V2', description: 'Negative T waves following ST elevation', significance: 'critical' },
    { location: 'V1-V3', description: 'Type 1 Brugada pattern (diagnostic)', significance: 'critical' }
  ],
  clinicalContext: '38-year-old male with family history of sudden cardiac death. Brother died at age 40 during sleep. Patient had syncopal episode recently.',
  differentials: ['Anterior STEMI', 'Pericarditis', 'Early repolarization', 'RBBB'],
  teachingPoints: [
    'Brugada syndrome = channelopathy causing sudden death',
    'Type 1: Coved ST elevation (diagnostic)',
    'Type 2: Saddleback ST elevation (not diagnostic)',
    'Type 3: ST elevation <1mm (not diagnostic)',
    'V1-V2 positioned high makes it more apparent',
    'High risk of VF and sudden death, especially during sleep',
    'Fever can precipitate arrhythmias',
    'Treatment: ICD for high-risk patients'
  ],
  pitfalls: [
    'Missing Brugada pattern, thinking it\'s anterior STEMI',
    'Not recognizing the importance of family history',
    'Dismissing as nonspecific ST changes',
    'Not advising on fever management',
    'Forgetting that placement of V1-V2 matters'
  ],
  associatedConditions: ['Sudden cardiac death', 'Ventricular fibrillation', 'Sleep-related death', 'Fever-induced arrhythmias'],
  litflLink: 'https://litfl.com/brugada-syndrome-ecg-library/'
};

export const aorticDissection: ECGCase = {
  id: 'ecg-dissection',
  title: 'Normal ECG in Aortic Dissection',
  category: 'Normal',
  interpretation: {
    rhythm: 'Sinus tachycardia',
    rate: 105,
    axis: 'Normal axis',
    prInterval: '160ms (normal)',
    qrsDuration: '90ms (normal)',
    qtInterval: '350ms (normal for rate)',
    stSegment: 'Normal',
    tWave: 'Normal',
    other: ['Normal sinus tachycardia', 'No ischemic changes', 'Normal QRS axis']
  },
  keyFindings: [
    { location: 'All leads', description: 'Normal ECG (or sinus tachycardia only)', significance: 'supportive' },
    { location: 'Clinical', description: 'Severe tearing chest pain radiating to back', significance: 'critical' },
    { location: 'Vitals', description: 'Blood pressure difference between arms', significance: 'critical' }
  ],
  clinicalContext: '62-year-old male with severe tearing chest pain radiating to back. Pain maximal at onset. BP 170/100 right arm, 140/90 left arm.',
  differentials: ['Acute MI (normal ECG does NOT rule out dissection!)', 'Pulmonary embolism', 'Aortic aneurysm'],
  teachingPoints: [
    'Aortic dissection can have COMPLETELY NORMAL ECG',
    'Normal ECG does NOT rule out dissection!',
    'ECG changes occur if dissection involves coronary ostia (usually right)',
    'Look for inferior STEMI if RCA involved',
    'Look for anterior STEMI if dissection flaps LMCA',
    'Chest X-ray: widened mediastinum',
    'CT angiogram is diagnostic',
    'High mortality if missed!'
  ],
  pitfalls: [
    'Ruling out dissection because ECG is normal',
    'Focusing on MI and missing dissection',
    'Giving thrombolytics (fatal in dissection!)',
    'Not checking blood pressure in both arms',
    'Missing the "tearing" quality of pain'
  ],
  associatedConditions: ['Marfan syndrome', 'Ehlers-Danlos', 'Bicuspid aortic valve', 'Hypertension', 'Pregnancy'],
  litflLink: 'https://litfl.com/aortic-dissection-ecg-library/'
};

// ============================================================================
// ECG LIBRARY EXPORT
// ============================================================================

export const ecgLibrary: ECGCase[] = [
  // STEMI cases
  anteriorSTEMI,
  inferiorSTEMI,
  lateralSTEMI,
  posteriorSTEMI,
  leftBundleBranchBlock,
  wellensSyndrome,

  // Arrhythmias
  atrialFibrillation,
  atrialFlutter,
  supraventricularTachycardia,
  ventricularTachycardia,
  torsades,
  thirdDegreeBlock,
  brugadaPattern,

  // Metabolic/Toxic
  hyperkalemia,
  hypokalemia,
  digoxinToxicity,

  // Normal variant
  aorticDissection
];

export const getECGById = (id: string): ECGCase | undefined => {
  return ecgLibrary.find(ecg => ecg.id === id);
};

export const getECGsByCategory = (category: string): ECGCase[] => {
  return ecgLibrary.filter(ecg => ecg.category === category);
};

export const searchECGs = (query: string): ECGCase[] => {
  const lowerQuery = query.toLowerCase();
  return ecgLibrary.filter(ecg =>
    ecg.title.toLowerCase().includes(lowerQuery) ||
    ecg.clinicalContext.toLowerCase().includes(lowerQuery) ||
    ecg.teachingPoints.some(point => point.toLowerCase().includes(lowerQuery))
  );
};

// ECG categories for filtering
export const ecgCategories = [
  { value: 'STEMI', label: 'STEMI', description: 'ST-Elevation Myocardial Infarction patterns' },
  { value: 'NSTEMI', label: 'NSTEMI', description: 'Non-STEMI and ischemia patterns' },
  { value: 'Arrhythmia', label: 'Arrhythmias', description: 'Tachyarrhythmias and bradyarrhythmias' },
  { value: 'Conduction', label: 'Conduction', description: 'AV blocks and bundle branch blocks' },
  { value: 'Metabolic', label: 'Metabolic', description: 'Electrolyte and metabolic abnormalities' },
  { value: 'Toxic', label: 'Toxicologic', description: 'Drug and toxic exposures' },
  { value: 'Normal', label: 'Normal Variants', description: 'Normal ECGs and variants' }
];
