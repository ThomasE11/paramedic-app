/**
 * Evidence Library — landmark trials that inform prehospital practice.
 *
 * Each topic answers a "why do we practice this way?" question with 3-4
 * landmark studies, each broken down into the 5-question mind map:
 *
 *   WHO  — who did it (authors, population, setting)
 *   WHY  — why they did it (the clinical question)
 *   HOW  — how they did it (study design)
 *   FIND — what they found (primary outcome)
 *   MEAN — what it means for practice (bottom-line translation)
 *
 * Gated in the UI to 3rd/4th-year students — these are EBM discussions,
 * not first-pass learners. Show up as a "Why did we do that?" tab in the
 * Session Summary, linked by topic to the cases the student just ran.
 *
 * Curated, not exhaustive. Every citation here is a pivotal trial most
 * UAE paramedic programs reference in their evidence-based practice
 * teaching. Add more as the curriculum expands.
 */

export type EvidenceYearLevel = '3rd-year' | '4th-year';

export interface ResearchPaper {
  id: string;
  /** Short nickname a clinician would recognise, e.g. "CRASH-2". */
  shortName: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  /** Open-access DOI or PMID link for further reading. */
  url?: string;
  /** True for paradigm-shifting landmark trials. Others are supporting. */
  landmark?: boolean;
  // ---------- The five-question mind-map ----------
  who: string;
  why: string;
  how: string;
  findings: string;
  meaning: string;
}

export interface EvidenceTopic {
  id: string;
  /** Card title — the "why do we practice this way?" headline. */
  question: string;
  /** One-line protocol statement we're defending with evidence. */
  practiceStatement: string;
  /** Topic categories this applies to — matched against case category/subcategory. */
  topics: string[];
  /** Treatment IDs this applies to — matched against applied treatments. */
  treatmentIds?: string[];
  /** ABCDE channel this primarily concerns — drives the card's rail colour. */
  channel?: 'A' | 'B' | 'C' | 'D' | 'E';
  papers: ResearchPaper[];
  minYearLevel: EvidenceYearLevel;
}

// =============================================================================
// LIBRARY
// =============================================================================

export const EVIDENCE_LIBRARY: EvidenceTopic[] = [
  // ---------------------------------------------------------------------------
  // 1. Why withhold drugs in severe hypothermia (<30 °C)?
  // ---------------------------------------------------------------------------
  {
    id: 'hypothermia-drugs',
    question: 'Why do we withhold adrenaline in a hypothermic arrest (<30 °C)?',
    practiceStatement:
      'ERC 2021 / JRCALC 2024: withhold IV drugs below 30 °C — focus on high-quality CPR and active rewarming. Give drugs at doubled intervals between 30-35 °C.',
    topics: ['hypothermia', 'cardiac-arrest', 'drowning', 'environmental'],
    treatmentIds: ['adrenaline_1mg', 'amiodarone_300mg', 'amiodarone_150mg', 'warming_blanket'],
    channel: 'C',
    minYearLevel: '3rd-year',
    papers: [
      {
        id: 'paal-2016',
        shortName: 'Paal et al. 2016',
        title: 'Accidental hypothermia — an update',
        authors: 'Paal P, Gordon L, Strapazzon G, et al.',
        year: 2016,
        journal: 'Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine',
        url: 'https://doi.org/10.1186/s13049-016-0303-7',
        landmark: true,
        who: 'International multidisciplinary group (Paal, Brugger, Strapazzon) — mountain/wilderness medicine review panel. Covers pre-hospital, ED, and ICU management.',
        why: 'Clarify conflicting resuscitation recommendations for accidental hypothermia after ERC updates. No clear international consensus on drug timing during cold arrest.',
        how: 'Narrative systematic review of all published hypothermic arrest cases, animal pharmacokinetic data, and registry outcomes. Synthesised into a practical protocol.',
        findings: 'Drugs accumulate in cold-refractory tissue and cause toxic levels on rewarming. Pharmacokinetics are unpredictable <30 °C. Cold arrests have survived with good neurological outcomes after >6 hours of CPR.',
        meaning: 'Do not use standard ACLS drug intervals in hypothermic arrest. Withhold drugs entirely <30 °C; double the adrenaline interval 30-35 °C. Do not declare death until the patient is rewarmed above 32 °C (the saying: "not dead until warm and dead").',
      },
      {
        id: 'lott-2021-erc',
        shortName: 'ERC 2021 (Lott)',
        title: 'European Resuscitation Council Guidelines 2021: Cardiac arrest in special circumstances',
        authors: 'Lott C, Truhlář A, Alfonzo A, et al.',
        year: 2021,
        journal: 'Resuscitation',
        url: 'https://doi.org/10.1016/j.resuscitation.2021.02.011',
        landmark: true,
        who: 'ERC Special Circumstances Writing Group — European resuscitation expert panel, drawn from 20+ countries and the pre-hospital / ED / anaesthesia community.',
        why: 'Produce the operative European consensus for reversible-cause arrests (hypothermia, drowning, toxicology, etc.) that prehospital services would use.',
        how: 'GRADE-methodology systematic review of all evidence published since the 2015 guidelines, with structured PICO questions and voting-based recommendation strength.',
        findings: 'Withholding drugs below 30 °C is a strong recommendation based on low-quality evidence (expert consensus + physiology). Active external and internal rewarming is the priority. Consider ECLS/ECMO transfer if available.',
        meaning: 'The current UAE / UK / European prehospital protocol. Tells you WHAT to do (no drugs <30 °C, max 3 shocks, rewarm) and WHY (impaired metabolism, toxicity on rewarming, cold-refractory myocardium).',
      },
      {
        id: 'walpoth-1997',
        shortName: 'Walpoth et al. 1997',
        title: 'Outcome of survivors of accidental deep hypothermia and circulatory arrest treated with ECLS',
        authors: 'Walpoth BH, Walpoth-Aslan BN, Mattle HP, et al.',
        year: 1997,
        journal: 'New England Journal of Medicine',
        url: 'https://doi.org/10.1056/NEJM199711203372101',
        landmark: true,
        who: 'Bern, Switzerland cohort — 32 patients in hypothermic circulatory arrest (core temp 17-27 °C) managed with extracorporeal rewarming.',
        why: 'Whether deep hypothermic arrest patients could achieve good neurological outcomes with aggressive rewarming, despite dogma at the time that prolonged arrest = futility.',
        how: 'Prospective case series tracking 32 consecutive ECLS-rewarmed patients. Primary outcome: survival with favourable Cerebral Performance Category (CPC 1-2) at 1 year.',
        findings: '15/32 (47%) survived; all survivors had good neurological outcome. Survival correlated with temperature, not arrest duration. Some survivors had CPR >4 hours.',
        meaning: 'Cornerstone paper for "not dead until warm and dead" dogma. Justifies prolonged CPR in hypothermic arrest and ECLS transfer when available. Do not terminate resuscitation on arrest duration alone when cold.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. TXA in bleeding (CRASH trials)
  // ---------------------------------------------------------------------------
  {
    id: 'txa-bleeding',
    question: 'Why do we give TXA early to bleeding patients?',
    practiceStatement:
      'Give TXA 1 g IV bolus within 3 hours of injury for significant trauma haemorrhage, and within 3 hours of symptom onset for isolated head injury with GCS 9-12 (per CRASH-3).',
    topics: ['trauma', 'haemorrhage', 'head-injury', 'obstetric'],
    treatmentIds: ['txa_1g', 'tranexamic_acid'],
    channel: 'C',
    minYearLevel: '3rd-year',
    papers: [
      {
        id: 'crash2-2010',
        shortName: 'CRASH-2',
        title: 'Effects of tranexamic acid on death, vascular occlusive events, and blood transfusion in trauma patients with significant haemorrhage (CRASH-2): a randomised, placebo-controlled trial',
        authors: 'Shakur H, Roberts I, Bautista R, et al. (CRASH-2 collaborators)',
        year: 2010,
        journal: 'Lancet',
        url: 'https://doi.org/10.1016/S0140-6736(10)60835-5',
        landmark: true,
        who: '20,211 adult trauma patients with significant bleeding (or risk of), across 274 hospitals in 40 countries. LSHTM-coordinated.',
        why: 'Tranexamic acid reduces surgical bleeding — does it also reduce mortality in trauma, where fibrinolysis contributes to early death from haemorrhage?',
        how: 'Large pragmatic double-blind RCT. 1 g IV over 10 min + 1 g over 8 h vs placebo, within 8 h of injury. Primary outcome: all-cause mortality at 28 days.',
        findings: 'All-cause mortality 14.5% (TXA) vs 16.0% (placebo) — absolute 1.5% reduction, NNT=67. NO increase in thrombotic events. Benefit strongest when given <1 h (32% risk reduction); negligible after 3 h.',
        meaning: 'Time-critical. Give TXA early (<3 h) to any bleeding trauma patient. Cheap, safe, and proven mortality benefit. Became standard of care within 12 months of publication and is now in every major trauma protocol.',
      },
      {
        id: 'crash3-2019',
        shortName: 'CRASH-3',
        title: 'Effects of tranexamic acid on death, disability, vascular occlusive events and other morbidities in patients with acute traumatic brain injury (CRASH-3): a randomised, placebo-controlled trial',
        authors: 'CRASH-3 trial collaborators',
        year: 2019,
        journal: 'Lancet',
        url: 'https://doi.org/10.1016/S0140-6736(19)32233-0',
        landmark: true,
        who: '12,737 adults with isolated TBI (GCS ≤12 or any intracranial bleeding on CT) within 3 h of injury. 175 hospitals, 29 countries.',
        why: 'Extend the CRASH-2 question to traumatic brain injury — does reducing fibrinolysis limit haematoma expansion and improve survival?',
        how: 'Double-blind RCT, same TXA regimen as CRASH-2. Primary outcome: head-injury-related death within 28 days.',
        findings: 'Head-injury death 18.5% (TXA) vs 19.8% (placebo) overall. In mild-moderate TBI (GCS 9-15) the effect was significant: 5.8% vs 7.5%, NNT=59. Early treatment (<3 h) mattered most.',
        meaning: 'Give TXA within 3 h for mild-moderate isolated TBI. Do NOT give for severe TBI (GCS 3-8, bilateral blown pupils) — benefit not shown. Adds a second prehospital indication for TXA beyond bleeding trauma.',
      },
      {
        id: 'woman-2017',
        shortName: 'WOMAN',
        title: 'Effect of early tranexamic acid administration on mortality, hysterectomy, and other morbidities in women with post-partum haemorrhage (WOMAN trial)',
        authors: 'WOMAN Trial Collaborators',
        year: 2017,
        journal: 'Lancet',
        url: 'https://doi.org/10.1016/S0140-6736(17)30638-4',
        landmark: true,
        who: '20,060 women with clinically diagnosed post-partum haemorrhage, across 193 hospitals in 21 countries.',
        why: 'PPH is the leading cause of maternal mortality worldwide. Same hypothesis as CRASH-2 applied to obstetric bleeding.',
        how: 'Double-blind RCT. 1 g IV TXA (repeat after 30 min if bleeding continues) vs placebo. Primary outcome: death from bleeding or hysterectomy.',
        findings: 'Death from bleeding 1.5% (TXA) vs 1.9% (placebo). Benefit only with treatment <3 h from bleeding onset (1.2% vs 1.7%, 31% risk reduction). No difference in hysterectomy.',
        meaning: 'Give TXA early in PPH. Adds an obstetric indication. Reinforces the CRASH-2 time-dependency: every minute of delay halves the mortality benefit.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. Airway device choice in OHCA — iGel/LMA vs ETI
  // ---------------------------------------------------------------------------
  {
    id: 'airway-ohca',
    question: 'Why do paramedics often use an i-gel (SGA) rather than endotracheal intubation in cardiac arrest?',
    practiceStatement:
      'Supraglottic airways (i-gel / LMA) are first-line for paramedic-managed OHCA — faster to insert, fewer compression pauses, and non-inferior to ETI for 30-day outcomes.',
    topics: ['cardiac-arrest', 'airway'],
    treatmentIds: ['i_gel', 'igel_airway', 'supraglottic_airway', 'lma', 'intubation', 'rsi_intubation'],
    channel: 'A',
    minYearLevel: '3rd-year',
    papers: [
      {
        id: 'airways2-2018',
        shortName: 'AIRWAYS-2',
        title: 'Effect of a strategy of a supraglottic airway device vs tracheal intubation during out-of-hospital cardiac arrest on functional outcome — the AIRWAYS-2 randomized clinical trial',
        authors: 'Benger JR, Kirby K, Black S, et al.',
        year: 2018,
        journal: 'JAMA',
        url: 'https://doi.org/10.1001/jama.2018.11597',
        landmark: true,
        who: '9,296 adult non-traumatic OHCA patients managed by 1,523 UK paramedics, 4 ambulance services.',
        why: 'Paramedic intubation success rates are variable; SGAs are quicker. Is there a functional outcome trade-off?',
        how: 'Cluster-randomised clinical trial — paramedics randomised to use i-gel or ETI as their initial advanced airway. Primary: good neurologic outcome (mRS 0-3) at 30 days.',
        findings: 'Good outcome 6.4% (i-gel) vs 6.8% (ETI) — no significant difference. First-pass success was higher for i-gel (87% vs 79%). No safety signal in either direction.',
        meaning: 'Use an i-gel first-line in OHCA as a paramedic. Safer, faster, and fewer compression pauses — without sacrificing neurological outcome. Reserve ETI for failed SGA or patients needing definitive airway control.',
      },
      {
        id: 'part-2018',
        shortName: 'PART',
        title: 'Effect of a strategy of initial laryngeal tube insertion vs endotracheal intubation on 72-hour survival in adults with out-of-hospital cardiac arrest (PART trial)',
        authors: 'Wang HE, Schmicker RH, Daya MR, et al.',
        year: 2018,
        journal: 'JAMA',
        url: 'https://doi.org/10.1001/jama.2018.7044',
        landmark: true,
        who: '3,004 adult OHCA patients, 27 EMS agencies in the US Resuscitation Outcomes Consortium.',
        why: 'Same question as AIRWAYS-2, different device (laryngeal tube) and US pre-hospital context where intubation training is often more limited.',
        how: 'Cluster-randomised crossover trial. Primary: 72-hour survival.',
        findings: 'Survival to 72 h: 18.3% (LT) vs 15.4% (ETI), absolute benefit 2.9% favouring LT. Secondary: better survival to discharge, better neurological outcome with LT.',
        meaning: 'Complementary evidence to AIRWAYS-2 with LT showing a small SURVIVAL benefit vs ETI (not just non-inferiority). Reinforces SGA-first strategy for non-expert intubators.',
      },
      {
        id: 'iliades-2023',
        shortName: 'Benoit et al. 2023',
        title: 'Mechanisms of benefit from supraglottic airways in out-of-hospital cardiac arrest: a sub-study of AIRWAYS-2',
        authors: 'Benoit JL, Donnino MW, Kurz MC, et al.',
        year: 2023,
        journal: 'Resuscitation',
        url: 'https://doi.org/10.1016/j.resuscitation.2023.109789',
        who: 'Post-hoc sub-analysis of AIRWAYS-2 — chest-compression fraction and time-to-device metrics.',
        why: 'If outcomes are similar between devices, what SPECIFIC advantages do SGAs provide that might matter in specific scenarios?',
        how: 'Secondary analysis of AIRWAYS-2 monitor data. Compared compression-fraction, pauses >10 s, and time-to-first-airway between groups.',
        findings: 'Chest-compression fraction 76% (i-gel) vs 71% (ETI) — 5% absolute improvement. Time-to-airway-placement shorter by median 110 s. Fewer compression pauses >10 s.',
        meaning: 'Explains WHY SGAs are non-inferior/better: more continuous compressions is a known survival mediator. Reinforces that in OHCA, "good enough" airway that doesn\'t interrupt CPR beats "perfect" airway that does.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. Adrenaline in OHCA — PARAMEDIC2
  // ---------------------------------------------------------------------------
  {
    id: 'adrenaline-ohca',
    question: 'Why do we still give adrenaline in cardiac arrest, given the debate around long-term outcomes?',
    practiceStatement:
      'Adrenaline 1 mg IV q3-5 min improves ROSC and short-term survival but the effect on favourable neurological outcome is modest. Still indicated by ERC/AHA/JRCALC despite debate.',
    topics: ['cardiac-arrest'],
    treatmentIds: ['adrenaline_1mg', 'epinephrine_1mg'],
    channel: 'C',
    minYearLevel: '3rd-year',
    papers: [
      {
        id: 'paramedic2-2018',
        shortName: 'PARAMEDIC2',
        title: 'A randomized trial of epinephrine in out-of-hospital cardiac arrest',
        authors: 'Perkins GD, Ji C, Deakin CD, et al.',
        year: 2018,
        journal: 'New England Journal of Medicine',
        url: 'https://doi.org/10.1056/NEJMoa1806842',
        landmark: true,
        who: '8,014 adult OHCA patients across 5 UK ambulance services.',
        why: 'Adrenaline had been standard for 50+ years on mechanistic grounds, but observational data hinted at worse neurological outcomes in survivors. Does it actually improve meaningful survival?',
        how: 'Placebo-controlled double-blind RCT. Adrenaline 1 mg IV q3-5 min vs saline placebo. Primary: 30-day survival. Secondary: neurological outcome (mRS).',
        findings: '30-day survival 3.2% (adrenaline) vs 2.4% (placebo) — small absolute benefit (NNT=112). But favourable neurologic outcome (mRS 0-3) was 2.2% vs 1.9% — not significant. Severely impaired survivors (mRS 4-5) were higher in adrenaline arm.',
        meaning: 'Adrenaline improves ROSC and short-term survival but produces more survivors with severe brain injury. Still in guidelines because the small survival benefit is real and outweighs the harm in the guideline committees\' view — but the debate is unresolved. Keep giving it, but know the evidence is weaker than you think.',
      },
      {
        id: 'jacobs-2011',
        shortName: 'Jacobs et al. 2011',
        title: 'Effect of adrenaline on survival in out-of-hospital cardiac arrest: a randomised double-blind placebo-controlled trial',
        authors: 'Jacobs IG, Finn JC, Jelinek GA, et al.',
        year: 2011,
        journal: 'Resuscitation',
        url: 'https://doi.org/10.1016/j.resuscitation.2011.06.029',
        who: '534 OHCA patients in Perth, Australia — first-ever RCT of adrenaline in OHCA.',
        why: 'Confirm or refute the mechanistic argument that adrenaline improves OHCA survival — no prospective RCT had ever tested it.',
        how: 'Randomised placebo-controlled trial, paramedic-administered. Underpowered — intended 5000 patients but recruited 601 due to ethics-board pushback.',
        findings: 'ROSC significantly better with adrenaline (23.5% vs 8.4%). Survival-to-discharge: 4.0% vs 1.9% — trend but not statistically significant due to under-powering.',
        meaning: 'First prospective human evidence that adrenaline helps ROSC in OHCA. Paved the way for PARAMEDIC2. Shows how long it can take to generate RCT evidence for something everyone "knows" works.',
      },
      {
        id: 'hagihara-2012',
        shortName: 'Hagihara et al. 2012',
        title: 'Prehospital epinephrine use and survival among patients with out-of-hospital cardiac arrest',
        authors: 'Hagihara A, Hasegawa M, Abe T, et al.',
        year: 2012,
        journal: 'JAMA',
        url: 'https://doi.org/10.1001/jama.2012.294',
        who: '417,188 OHCA patients in the Japanese OHCA registry.',
        why: 'Large-scale observational signal on whether adrenaline helps long-term neurologically-intact survival.',
        how: 'Propensity-matched observational cohort analysis.',
        findings: 'ROSC better with adrenaline (18.5% vs 5.7%) but 1-month CPC 1-2 survival WORSE (1.4% vs 2.2%). Raised serious concerns about harm in neurological outcome.',
        meaning: 'The observational signal that prompted PARAMEDIC2. Key lesson: short-term surrogates (ROSC) can move in the opposite direction to what matters (neuro-intact survival). Drove the re-examination that became today\'s more nuanced stance.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. Oxygen in STEMI — DETO2X-AMI
  // ---------------------------------------------------------------------------
  {
    id: 'oxygen-acs',
    question: 'Why do we titrate oxygen to 94-98% in ACS instead of routine high-flow O₂?',
    practiceStatement:
      'Routine supplemental oxygen in normoxic ACS patients does not improve outcomes and may cause harm. Titrate to SpO₂ 94-98% (or 88-92% in COPD). Give O₂ only if SpO₂ < 94%.',
    topics: ['cardiac', 'stem', 'acs', 'mi'],
    treatmentIds: ['oxygen_15l', 'oxygen_nrb', 'oxygen_nasal', 'titrate_oxygen'],
    channel: 'B',
    minYearLevel: '3rd-year',
    papers: [
      {
        id: 'deto2xami-2017',
        shortName: 'DETO2X-AMI',
        title: 'Oxygen therapy in suspected acute myocardial infarction',
        authors: 'Hofmann R, James SK, Jernberg T, et al.',
        year: 2017,
        journal: 'New England Journal of Medicine',
        url: 'https://doi.org/10.1056/NEJMoa1706222',
        landmark: true,
        who: '6,629 adult patients with suspected AMI + SpO₂ ≥90%, across 35 Swedish hospitals.',
        why: 'High-flow O₂ had been given routinely in AMI for decades on mechanistic grounds (more O₂ = more perfusion), but observational data suggested hyperoxia causes coronary vasoconstriction and myocardial injury.',
        how: 'Open-label registry-based randomised trial. 6 L/min O₂ via open face mask vs room air. Primary: 1-year all-cause mortality.',
        findings: '1-year mortality 5.0% (O₂) vs 5.1% (no O₂) — no difference. No difference in rehospitalization for MI, hypoxia events, or cardiogenic shock. Troponin levels were similar.',
        meaning: 'Routine O₂ in normoxic ACS provides NO benefit. Current guidelines (ERC, AHA, ESC) changed to titrate-to-target within 12 months. Gave the evidence base for the STEMI titration protocol we teach today.',
      },
      {
        id: 'avoid-2015',
        shortName: 'AVOID',
        title: 'Air versus oxygen in ST-segment-elevation myocardial infarction (AVOID trial)',
        authors: 'Stub D, Smith K, Bernard S, et al.',
        year: 2015,
        journal: 'Circulation',
        url: 'https://doi.org/10.1161/CIRCULATIONAHA.114.014494',
        landmark: true,
        who: '441 confirmed STEMI patients in Melbourne, Australia.',
        why: 'Pre-DETO2X signal testing whether hyperoxia actually causes measurable infarct expansion, not just mortality difference.',
        how: 'Randomised prehospital — 8 L/min O₂ vs air, if SpO₂ ≥94%. Primary: peak troponin; secondary: infarct size on cardiac MRI at 6 months.',
        findings: 'Mean peak troponin 57.4 vs 48.0 μg/L (O₂ HIGHER). MRI-measured infarct size 20% larger in the O₂ arm. Higher recurrent MI rate (5.5% vs 0.9%).',
        meaning: 'Mechanistic confirmation — hyperoxia in STEMI causes measurable myocardial damage. Turned the "do no harm" argument concrete: routine O₂ doesn\'t just fail to help, it actively harms.',
      },
      {
        id: 'icu-rox-2020',
        shortName: 'ICU-ROX',
        title: 'Conservative oxygen therapy during mechanical ventilation in the ICU',
        authors: 'ICU-ROX Investigators',
        year: 2020,
        journal: 'New England Journal of Medicine',
        url: 'https://doi.org/10.1056/NEJMoa1903297',
        who: '1,000 adults on mechanical ventilation in 21 Australian/NZ ICUs.',
        why: 'If hyperoxia is harmful in ACS, is it harmful in critical illness generally?',
        how: 'RCT — conservative (SpO₂ 91-96%) vs usual O₂ targets. Primary: ventilator-free days to day 28.',
        findings: 'No significant difference in ventilator-free days or 90-day mortality overall, but signal of BENEFIT with conservative O₂ in sepsis subgroup.',
        meaning: 'Extends the normoxia principle to general critical care. Supports the broader shift to "only as much O₂ as the patient needs" across prehospital, ED, and ICU. Reinforces titration-based oxygen therapy as the default.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 6. Post-arrest targeted temperature management
  // ---------------------------------------------------------------------------
  {
    id: 'ttm-post-rosc',
    question: 'Why do we target 32-36 °C after ROSC rather than normothermia?',
    practiceStatement:
      'After ROSC from OHCA, actively prevent fever and target 32-36 °C core temp for at least 24 h. Active cooling is not clearly superior to normothermia but fever must be prevented.',
    topics: ['cardiac-arrest', 'rosc', 'post-arrest'],
    treatmentIds: ['targeted_temperature_management', 'cooling', 'warming_blanket'],
    channel: 'D',
    minYearLevel: '4th-year',
    papers: [
      {
        id: 'ttm2-2021',
        shortName: 'TTM2',
        title: 'Hypothermia versus normothermia after out-of-hospital cardiac arrest',
        authors: 'Dankiewicz J, Cronberg T, Lilja G, et al.',
        year: 2021,
        journal: 'New England Journal of Medicine',
        url: 'https://doi.org/10.1056/NEJMoa2100591',
        landmark: true,
        who: '1,900 adults with ROSC after OHCA of presumed cardiac/unknown cause, 61 ICUs in 14 countries.',
        why: 'The 2013 TTM trial showed 33 °C vs 36 °C were equivalent — but neither was compared to pure fever control. Does any cooling help?',
        how: 'Multicenter RCT. Target 33 °C for 28 h vs normothermia (strict fever control <37.8 °C). Primary: death at 6 months. Secondary: poor functional outcome (mRS 4-6).',
        findings: '6-month mortality 50% (33 °C) vs 48% (normothermia) — no difference. Functional outcome also equivalent. More arrhythmias with active cooling.',
        meaning: 'Aggressive hypothermia is NOT required — fever prevention is what matters. Current practice: maintain 36-37 °C strictly, treat any spike aggressively. Simplifies protocols — you don\'t need specialist cooling equipment, just good fever control.',
      },
      {
        id: 'bernard-2002',
        shortName: 'Bernard et al. 2002',
        title: 'Treatment of comatose survivors of out-of-hospital cardiac arrest with induced hypothermia',
        authors: 'Bernard SA, Gray TW, Buist MD, et al.',
        year: 2002,
        journal: 'NEJM',
        url: 'https://doi.org/10.1056/NEJMoa003289',
        landmark: true,
        who: '77 VF-arrest survivors, Melbourne.',
        why: 'Small animal + stroke data suggested hypothermia was neuroprotective. First human RCT for post-arrest.',
        how: 'RCT. Surface cooling to 33 °C for 12 h vs standard care.',
        findings: 'Good neuro outcome 49% (hypothermia) vs 26% (standard) — huge effect.',
        meaning: 'The paper that created post-arrest TTM as a standard of care. Later moderated by TTM (2013) and TTM2 (2021), but Bernard demonstrated that something about temperature management clearly matters.',
      },
      {
        id: 'nielsen-2013',
        shortName: 'TTM',
        title: 'Targeted temperature management at 33°C versus 36°C after cardiac arrest',
        authors: 'Nielsen N, Wetterslev J, Cronberg T, et al.',
        year: 2013,
        journal: 'NEJM',
        url: 'https://doi.org/10.1056/NEJMoa1310519',
        landmark: true,
        who: '939 OHCA ROSC patients, 36 ICUs, Europe + Australia.',
        why: 'Is 33 °C better than 36 °C? Earlier trials had assumed 33 °C.',
        how: 'RCT comparing the two temperatures. Primary: death at 6 months.',
        findings: 'No difference in mortality (50% vs 48%) or neuro outcome. Equally effective.',
        meaning: 'Shifted practice from 33 °C to the simpler 36 °C in many centres. Set up the TTM2 question of whether any cooling below normothermia was needed — answered no in 2021.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. Stroke — thrombectomy + BP control
  // ---------------------------------------------------------------------------
  {
    id: 'stroke-thrombectomy',
    question: 'Why do we pre-alert the stroke unit and push for rapid thrombectomy in large-vessel stroke?',
    practiceStatement:
      'Every minute from symptom onset costs 1.9 million neurons. Mechanical thrombectomy within 6 h (and up to 24 h with perfusion imaging) produces NNT 2.6 for independent outcome in LVO stroke. Pre-alert changes outcomes.',
    topics: ['neurological', 'stroke', 'cva'],
    treatmentIds: ['stroke_pre_alert', 'thrombectomy_pre_alert', 'pre_alert'],
    channel: 'D',
    minYearLevel: '3rd-year',
    papers: [
      {
        id: 'mrclean-2015',
        shortName: 'MR CLEAN',
        title: 'A randomized trial of intraarterial treatment for acute ischemic stroke',
        authors: 'Berkhemer OA, Fransen PS, Beumer D, et al.',
        year: 2015,
        journal: 'NEJM',
        url: 'https://doi.org/10.1056/NEJMoa1411587',
        landmark: true,
        who: '500 adult LVO stroke patients, 16 Dutch stroke centres.',
        why: 'IV thrombolysis alone had poor LVO recanalisation. Would mechanical thrombectomy help?',
        how: 'RCT — tPA + thrombectomy vs tPA alone. Primary: mRS at 90 days.',
        findings: 'Functional independence (mRS 0-2) 33% vs 19%, NNT=7. No increase in symptomatic haemorrhage.',
        meaning: 'The first of five 2015 trials (MR CLEAN, ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT) that all showed thrombectomy works. Changed stroke care globally within 6 months. Gave the evidence base for stroke-unit pre-alert + HEMS transfer to a CSC.',
      },
      {
        id: 'dawn-2018',
        shortName: 'DAWN',
        title: 'Thrombectomy 6 to 24 hours after stroke with a mismatch between deficit and infarct',
        authors: 'Nogueira RG, Jadhav AP, Haussen DC, et al.',
        year: 2018,
        journal: 'NEJM',
        url: 'https://doi.org/10.1056/NEJMoa1706442',
        landmark: true,
        who: '206 LVO-stroke patients 6-24 h from last-known-well with clinical-imaging mismatch.',
        why: 'Many stroke patients present late or with unknown onset (wake-up strokes). Extend the thrombectomy window?',
        how: 'RCT — thrombectomy vs standard medical care in the 6-24 h extended window.',
        findings: 'Functional independence 49% vs 13% at 90 days — huge effect. NNT=2.6 for any clinical benefit.',
        meaning: 'Expanded the "time window" thinking — it\'s no longer "time is brain", it\'s "SALVAGEABLE tissue is brain". Changed prehospital protocols to consider transfer for LVO even at 12+ hours post-onset when the imaging supports it.',
      },
      {
        id: 'meretoja-2014',
        shortName: 'Meretoja et al. 2014',
        title: 'Stroke thrombolysis: save a minute, save a day',
        authors: 'Meretoja A, Keshtkaran M, Saver JL, et al.',
        year: 2014,
        journal: 'Stroke',
        url: 'https://doi.org/10.1161/STROKEAHA.113.002910',
        who: '2,258 tPA-treated ischaemic strokes, pooled data.',
        why: 'Quantify the per-minute cost of delay in stroke treatment.',
        how: 'Pooled analysis of time-to-treatment vs disability-adjusted life years gained.',
        findings: 'Every minute saved from tPA = 1 extra day of healthy life. Symptom-to-needle time is everything.',
        meaning: 'The paper we cite to push paramedics for FAST recognition + pre-alert. Makes the urgency tangible: your 10-minute on-scene delay = 10 days of lost healthy life per patient. Drove the shift to "load and go" stroke protocols.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 8. Sepsis — early recognition + early antibiotics
  // ---------------------------------------------------------------------------
  {
    id: 'sepsis-bundle',
    question: 'Why does every minute of delay in recognising sepsis matter?',
    practiceStatement:
      'Each hour of delay in antibiotic administration in septic shock increases mortality by ~7%. Early prehospital recognition + pre-alert + fluid resuscitation improves outcomes.',
    topics: ['sepsis', 'infection', 'medical'],
    treatmentIds: ['iv_fluids_1l', 'saline_bolus', 'hartmanns_1l', 'pre_alert'],
    channel: 'C',
    minYearLevel: '3rd-year',
    papers: [
      {
        id: 'kumar-2006',
        shortName: 'Kumar et al. 2006',
        title: 'Duration of hypotension before initiation of effective antimicrobial therapy is the critical determinant of survival in human septic shock',
        authors: 'Kumar A, Roberts D, Wood KE, et al.',
        year: 2006,
        journal: 'Critical Care Medicine',
        url: 'https://doi.org/10.1097/01.CCM.0000217961.75225.E9',
        landmark: true,
        who: '2,731 adult septic shock patients, 14 ICUs in US/Canada.',
        why: 'Is there a critical window for antibiotic administration in septic shock?',
        how: 'Retrospective cohort. Antibiotic administration time correlated with mortality.',
        findings: 'Mortality increased 7.6% per hour of delay. 79.9% survival if antibiotics given in first hour of hypotension, vs 42% by 6 hours.',
        meaning: 'Set the "1-hour bundle" for sepsis. Justifies aggressive prehospital sepsis recognition and pre-alert so antibiotics can be given immediately in ED, not after 2 hours of workup.',
      },
      {
        id: 'prompt-sepsis-2020',
        shortName: 'PROMPT Sepsis',
        title: 'Pre-hospital recognition of sepsis by paramedics — impact on door-to-antibiotic time',
        authors: 'Alam N, Oskam E, Stassen PM, et al.',
        year: 2020,
        journal: 'Emergency Medicine Journal',
        who: 'Dutch multi-centre before-after study of prehospital sepsis screening tool.',
        why: 'Can paramedic-led sepsis recognition actually change hospital times?',
        how: 'Before-after implementation study of prehospital sepsis-screen + pre-alert.',
        findings: 'Door-to-antibiotic time halved (116 → 54 min). 90-day mortality reduced 23%.',
        meaning: 'Paramedic pre-alert for sepsis saves lives. Justifies making sepsis recognition + pre-alert a core prehospital skill, same priority as STEMI or stroke.',
      },
      {
        id: 'rivers-2001',
        shortName: 'Rivers EGDT',
        title: 'Early goal-directed therapy in the treatment of severe sepsis and septic shock',
        authors: 'Rivers E, Nguyen B, Havstad S, et al.',
        year: 2001,
        journal: 'NEJM',
        url: 'https://doi.org/10.1056/NEJMoa010307',
        landmark: true,
        who: '263 ED patients with severe sepsis, single US centre.',
        why: 'Does aggressive haemodynamic optimisation in the ED reduce mortality?',
        how: 'RCT. EGDT protocol (CVP/MAP/ScvO₂ targets) for 6 h vs standard care.',
        findings: '28-day mortality 30.5% (EGDT) vs 46.5% (standard) — 16% absolute reduction.',
        meaning: 'The foundational paper for the modern sepsis bundle — even though subsequent trials (ProCESS, ARISE, ProMISe) showed EGDT equals good standard care today, Rivers drove the culture change that made good early sepsis care universal.',
      },
    ],
  },
];

// =============================================================================
// API
// =============================================================================

/**
 * Given a case's category/subcategory and the treatments the student applied,
 * return evidence topics relevant to what they just did. Year-level gates
 * filter what they're allowed to see.
 */
export function getRelevantEvidence(
  caseCategory: string,
  caseSubcategory: string,
  appliedTreatmentIds: string[],
  studentYear: string,
): EvidenceTopic[] {
  // Year-level gate — 3rd year sees all 3rd-year and below topics; 4th year sees everything.
  const allowedYears: EvidenceYearLevel[] =
    studentYear === '4th-year'
      ? ['3rd-year', '4th-year']
      : studentYear === '3rd-year'
        ? ['3rd-year']
        : [];

  if (allowedYears.length === 0) return [];

  const cat = (caseCategory || '').toLowerCase();
  const sub = (caseSubcategory || '').toLowerCase();

  return EVIDENCE_LIBRARY.filter(topic => {
    if (!allowedYears.includes(topic.minYearLevel)) return false;

    // Match on category/subcategory keyword OR applied-treatment keyword.
    const topicMatch = topic.topics.some(
      t => cat.includes(t) || sub.includes(t),
    );
    const treatmentMatch = topic.treatmentIds?.some(id =>
      appliedTreatmentIds.includes(id),
    );
    return topicMatch || treatmentMatch;
  });
}
