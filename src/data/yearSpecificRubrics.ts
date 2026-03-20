/**
 * Year-Specific Assessment Rubrics
 *
 * Defines expectations and assessment criteria for each year level
 * with emphasis on appropriate skills for each stage of learning.
 */

import type {
  YearLevelRubric,
  YearSpecificExpectations,
  StudentYear,
  QuickAssessmentTag
} from '@/types';

// ============================================================================
// QUICK ASSESSMENT TAGS - One-click instructor feedback
// ============================================================================

export const quickAssessmentTags: QuickAssessmentTag[] = [
  // Critical misses - applies to all years
  {
    id: 'critical-scene-safety',
    label: '⚠️ Scene Safety Missed',
    category: 'critical',
    description: 'Failed to assess scene safety before approach',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma']
  },
  {
    id: 'critical-bSI',
    label: '⚠️ No BSI/PPE',
    category: 'critical',
    description: 'Did not don gloves/appropriate PPE',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma']
  },
  {
    id: 'critical-mechanism',
    label: '⚠️ Mechanism Missed',
    category: 'critical',
    description: 'Failed to identify mechanism of injury',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma']
  },

  // 1st Year Specific - Focus on basics and communication
  {
    id: 'y1-no-introduction',
    label: 'No Introduction',
    category: 'negative',
    description: 'Did not introduce self to patient',
    yearLevels: ['1st-year', 'diploma']
  },
  {
    id: 'y1-no-consent',
    label: 'No Consent',
    category: 'negative',
    description: 'Did not ask permission before touching',
    yearLevels: ['1st-year', 'diploma']
  },
  {
    id: 'y1-rushed-assessment',
    label: 'Too Fast',
    category: 'instruction',
    description: 'Rushed through assessment, missed details',
    yearLevels: ['1st-year', 'diploma']
  },
  {
    id: 'y1-good-history',
    label: '✓ Good History Taking',
    category: 'positive',
    description: 'Obtained thorough SAMPLE history',
    yearLevels: ['1st-year', '2nd-year', 'diploma']
  },
  {
    id: 'y1-good-opener',
    label: '✓ Good Opener',
    category: 'positive',
    description: 'Used appropriate opening and built rapport',
    yearLevels: ['1st-year', '2nd-year', 'diploma']
  },
  {
    id: 'y1-no-opqrs',
    label: 'Missing OPQRS',
    category: 'instruction',
    description: 'Did not ask OPQRS for pain assessment',
    yearLevels: ['1st-year', '2nd-year', 'diploma']
  },

  // 2nd Year Specific - Focus on systematic assessment
  {
    id: 'y2-systematic',
    label: '✓ Systematic ABCDE',
    category: 'positive',
    description: 'Followed ABCDE systematically',
    yearLevels: ['2nd-year', '3rd-year']
  },
  {
    id: 'y2-vitals-missed',
    label: 'Vitals Missed',
    category: 'instruction',
    description: 'Incomplete set of vital signs',
    yearLevels: ['2nd-year']
  },
  {
    id: 'y2-no-gcs',
    label: 'No GCS Documented',
    category: 'instruction',
    description: 'Did not assess and document GCS',
    yearLevels: ['2nd-year']
  },
  {
    id: 'y2-poor-priority',
    label: 'Priority Issues',
    category: 'instruction',
    description: 'Focused on wrong priorities',
    yearLevels: ['2nd-year']
  },
  {
    id: 'y2-good-documentation',
    label: '✓ Good Documentation',
    category: 'positive',
    description: 'Clear, organized documentation',
    yearLevels: ['2nd-year', '3rd-year']
  },

  // 3rd Year Specific - Focus on clinical reasoning
  {
    id: 'y3-clinical-reasoning',
    label: '✓ Good Clinical Reasoning',
    category: 'positive',
    description: 'Demonstrated sound clinical reasoning',
    yearLevels: ['3rd-year', '4th-year']
  },
  {
    id: 'y3-pattern-recognition',
    label: '✓ Pattern Recognition',
    category: 'positive',
    description: 'Identified key patterns in presentation',
    yearLevels: ['3rd-year', '4th-year']
  },
  {
    id: 'y3-treatment-delay',
    label: 'Treatment Delay',
    category: 'instruction',
    description: 'Unnecessary delay in initiating treatment',
    yearLevels: ['3rd-year']
  },
  {
    id: 'y3-reconsidered',
    label: '✓ Reconsidered Dx',
    category: 'positive',
    description: 'Willing to reconsider when new info emerged',
    yearLevels: ['3rd-year', '4th-year']
  },

  // 4th Year Specific - Focus on leadership and complex cases
  {
    id: 'y4-leadership',
    label: '✓ Good Leadership',
    category: 'positive',
    description: 'Effectively led the team',
    yearLevels: ['4th-year']
  },
  {
    id: 'y4-communication',
    label: '✓ Clear Communication',
    category: 'positive',
    description: 'Clear and professional communication throughout',
    yearLevels: ['4th-year']
  },
  {
    id: 'y4-resource-use',
    label: '✓ Efficient Resource Use',
    category: 'positive',
    description: 'Appropriate use of available resources',
    yearLevels: ['4th-year']
  },

  // General positive feedback
  {
    id: 'good-safety',
    label: '✓ Safety Conscious',
    category: 'positive',
    description: 'Demonstrated good safety awareness',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma']
  },
  {
    id: 'good-communication',
    label: '✓ Good Communication',
    category: 'positive',
    description: 'Clear and effective communication',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma']
  },
  {
    id: 'good-teamwork',
    label: '✓ Team Player',
    category: 'positive',
    description: 'Worked well with others',
    yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma']
  }
];

// ============================================================================
// YEAR-SPECIFIC EXPECTATIONS
// ============================================================================

export const yearSpecificExpectations: Record<StudentYear, YearSpecificExpectations> = {
  '1st-year': {
    yearLevel: '1st-year',
    focusAreas: [
      'Scene safety and BSI',
      'Introduction and consent',
      'Basic communication with patient',
      'SAMPLE history taking',
      'OPQRS pain assessment',
      'Basic vital signs (BP, HR, RR, SpO2)',
      'Level of consciousness (AVPU)',
      'Documentation basics'
    ],
    assessmentEmphasis: {
      primarySurvey: [
        'Scene safety assessment',
        'BSI application',
        'General impression',
        'Level of consciousness (AVPU)',
        'Basic airway assessment',
        'Breathing rate and effort',
        'Pulse rate and character',
        'Skin assessment'
      ],
      historyTaking: [
        'Proper introduction',
        'Consent for assessment',
        'SAMPLE history complete',
        'OPQRS for present complaint',
        'Current medications',
        'Allergies',
        'Events leading to call'
      ],
      secondarySurvey: [
        'Head to toe examination',
        'Identify obvious injuries/abnormalities',
        'Basic documentation'
      ],
      documentation: [
        'Patient demographics',
        'Vital signs recorded',
        'History documented',
        'Basic findings noted'
      ]
    },
    skillsExpected: [
      'Approach patient safely',
      'Introduce self and role',
      'Obtain consent',
      'Take basic vital signs',
      'Assess level of consciousness',
      'Obtain SAMPLE history',
      'Perform basic head-to-toe exam',
      'Document basic findings'
    ],
    skillsIntroduced: [
      'Scene size-up concepts',
      'BSI/PPE use',
      'Primary survey components',
      'Vital signs equipment',
      'History taking frameworks',
      'Basic documentation'
    ],
    commonOmissions: [
      'Forgetting to introduce self',
      'Not asking for consent',
      'Missing SAMPLE components',
      'Inadequate scene safety check',
      'Not documenting findings',
      'Rushing through assessment',
      'Not explaining actions to patient'
    ],
    teachingPriorities: [
      'Build confidence in patient interaction',
      'Emphasize safety first',
      'Develop systematic approach',
      'Practice history taking',
      'Clear documentation habits'
    ]
  },

  '2nd-year': {
    yearLevel: '2nd-year',
    focusAreas: [
      'Systematic ABCDE approach',
      'Complete vital signs set',
      'GCS assessment',
      'Blood glucose assessment',
      'Secondary survey technique',
      'Documentation accuracy',
      'Identifying red flags',
      'Basic clinical reasoning'
    ],
    assessmentEmphasis: {
      primarySurvey: [
        'Systematic ABCDE',
        'Airway patency assessment',
        'Breathing - rate, rhythm, depth, SpO2',
        'Circulation - pulse, BP, capillary refill, skin',
        'Disability - AVPU, GCS, pupils, glucose',
        'Exposure - temperature, full examination'
      ],
      historyTaking: [
        'SAMPLE detailed',
        'Past medical history relevant',
        'Medication reconciliation',
        'Allergy detail',
        'Timeline of events'
      ],
      secondarySurvey: [
        'Systematic head-to-toe',
        'Inspect, palpate, auscultate',
        'Identify all injuries/abnormalities',
        'Compare bilateral findings'
      ],
      documentation: [
        'Times recorded',
        'All findings documented',
        'Changes noted',
        'Treatment documented',
        'Vital signs trend'
      ]
    },
    skillsExpected: [
      'Complete ABCDE assessment',
      'GCS calculation and documentation',
      'Blood glucose testing',
      'Full secondary survey',
      'Identify abnormal findings',
      'Basic interpretation of vital signs',
      'Complete documentation',
      'Recognize red flags'
    ],
    skillsIntroduced: [
      'GCS assessment',
      'Blood glucose testing',
      'Detailed secondary survey',
      'Pulse oximetry interpretation',
      'ECG lead placement',
      'Basic airway adjuncts'
    ],
    commonOmissions: [
      'Incomplete ABCDE (skipping sections)',
      'Not checking blood glucose',
      'Inaccurate GCS calculation',
      'Incomplete secondary survey',
      'Not documenting times',
      'Missing trends in vitals'
    ],
    teachingPriorities: [
      'Reinforce systematic ABCDE',
      'Improve assessment efficiency',
      'Develop pattern recognition',
      'Enhance documentation',
      'Build clinical reasoning foundation'
    ]
  },

  '3rd-year': {
    yearLevel: '3rd-year',
    focusAreas: [
      'Clinical reasoning and differential diagnosis',
      'Advanced airway management',
      'IV access and medication administration',
      'ECG interpretation basics',
      'Cardiac monitoring',
      'Team communication',
      'Handover structure',
      'Treatment prioritization'
    ],
    assessmentEmphasis: {
      primarySurvey: [
        'Rapid but systematic ABCDE',
        'Identify life threats immediately',
        'Initiate treatments concurrently',
        'Reassess after interventions'
      ],
      historyTaking: [
        'Focused history based on presentation',
        'Relevant medications and effects',
        'Past history of relevance',
        'Differential diagnosis considerations'
      ],
      secondarySurvey: [
        'Focused based on mechanism',
        'Identify associated injuries',
        'Findings correlated with history'
      ],
      documentation: [
        'Medical decision making documented',
        'Rationale for treatments',
        'Response to interventions',
        'Ongoing assessments'
      ]
    },
    skillsExpected: [
      'Rapid life threat identification',
      'Airway adjunct selection and use',
      'IV initiation',
      'Basic medication administration',
      'ECG interpretation (normal vs abnormal)',
      'Basic cardiac monitoring',
      'Structured handover',
      'Team communication'
    ],
    skillsIntroduced: [
      'Advanced airway techniques',
      'Multiple medication scenarios',
      'ECG interpretation',
      'Defibrillation',
      'Flight/pathophysiology correlation',
      'Team leadership basics'
    ],
    commonOmissions: [
      'Not reassessing after interventions',
      'Missing ECG changes',
      'Inadequate pain reassessment',
      'Poor handover structure',
      'Not documenting clinical reasoning',
      'Treatment delays'
    ],
    teachingPriorities: [
      'Develop clinical reasoning',
      'Improve decision speed',
      'Enhance team communication',
      'Practice leadership skills',
      'Complex case management'
    ]
  },

  '4th-year': {
    yearLevel: '4th-year',
    focusAreas: [
      'Complex clinical decision making',
      'Advanced cardiac/respiratory management',
      'Multiple patient prioritization',
      'Team leadership and delegation',
      'Resource management',
      'Critical thinking under pressure',
      'Advanced procedures',
      'Comprehensive handover'
    ],
    assessmentEmphasis: {
      primarySurvey: [
        'Simultaneous assessment and treatment',
        'Advanced life support integration',
        'Dynamic reassessment',
        'Anticipating deterioration'
      ],
      historyTaking: [
        'Efficient focused history',
        'Information synthesis',
        'Identifying key decision points'
      ],
      secondarySurvey: [
        'Efficient or deferred as appropriate',
        'High-yield assessment focus',
        'Integration with primary findings'
      ],
      documentation: [
        'Comprehensive medical record',
        'Rationale for all decisions',
        'Legal documentation standards'
      ]
    },
    skillsExpected: [
      'Lead complex resuscitations',
      'Advanced cardiac monitoring',
      'Multiple medication management',
      'Advanced airway management',
      'Scene command and delegation',
      'Triage multiple patients',
      'Advanced procedures (if within scope)',
      'Comprehensive structured handover'
    ],
    skillsIntroduced: [
      'Complex scene management',
      'Multi-patient coordination',
      'Advanced interpretation',
      'Protocol deviation with justification',
      'Quality improvement mindset'
    ],
    commonOmissions: [
      'Inadequate delegation',
      'Becoming task-focused vs big picture',
      'Not reassessing team members',
      'Incomplete handovers',
      'Failure to call for resources early',
      'Documentation under stress'
    ],
    teachingPriorities: [
      'Leadership under pressure',
      'Complex decision making',
      'Resource optimization',
      'Professional communication',
      'Self-assessment and improvement'
    ]
  },

  'diploma': {
    yearLevel: 'diploma',
    focusAreas: [
      'All aspects of paramedic practice',
      'Independent decision making',
      'Clinical excellence',
      'Leadership and mentorship',
      'Quality improvement',
      'Protocol adaptation',
      'Complex scene management',
      'Professional standards'
    ],
    assessmentEmphasis: {
      primarySurvey: [
        'Expert-level simultaneous assessment/treatment',
        'Anticipatory management',
        'Flawless execution of basics',
        'Dynamic adaptation'
      ],
      historyTaking: [
        'Efficient and targeted',
        'Information synthesis',
        'Differential refinement'
      ],
      secondarySurvey: [
        'Appropriate to situation',
        'No missed significant findings',
        'Integrated clinical picture'
      ],
      documentation: [
        'Professional standard',
        'Legally defensible',
        'Quality documentation'
      ]
    },
    skillsExpected: [
      'Independent practice ready',
      'Expert clinical reasoning',
      'Advanced procedures within scope',
      'Scene command in complex situations',
      'Mentor junior colleagues',
      'Quality improvement initiatives',
      'Protocol adaptation with justification'
    ],
    skillsIntroduced: [
      'Transition to practice',
      'Continuing professional development',
      'Specialized areas of practice',
      'Research and evidence-based practice'
    ],
    commonOmissions: [
      'Overconfidence in skills',
      'Failure to reassess',
      'Rigidity in approach',
      'Poor delegation',
      'Inadequate communication'
    ],
    teachingPriorities: [
      'Prepare for independent practice',
      'Develop professional identity',
      'Quality mindset',
      'Lifelong learning habits',
      'Specialized interest areas'
    ]
  }
};

// ============================================================================
// ASSESSMENT RUBRICS BY YEAR
// ============================================================================

export const yearLevelRubrics: Record<StudentYear, YearLevelRubric> = {
  '1st-year': {
    yearLevel: '1st-year',
    domains: [
      {
        domain: 'Safety and Professionalism',
        description: 'Scene safety, BSI, patient consent, and professional approach',
        weight: 30,
        criteria: {
          excellent: 'Consistently checks scene safety, uses BSI, obtains consent, professional demeanor',
          satisfactory: 'Checks scene safety, uses BSI, introduces self, generally professional',
          needsImprovement: 'Inconsistent safety checks, BSI, or consent',
          unsafe: 'Misses scene safety, no BSI, unsafe approach - FAIL'
        }
      },
      {
        domain: 'Communication',
        description: 'Introduction, patient interaction, information gathering',
        weight: 30,
        criteria: {
          excellent: 'Excellent rapport, clear communication, thorough SAMPLE/OPQRS',
          satisfactory: 'Good communication, adequate history taking',
          needsImprovement: 'Basic communication, incomplete history',
          unsafe: 'Poor communication, missing critical history'
        }
      },
      {
        domain: 'Assessment Skills',
        description: 'Primary survey components, vital signs, basic examination',
        weight: 25,
        criteria: {
          excellent: 'Systematic approach, accurate vitals, thorough basic exam',
          satisfactory: 'Adequate assessment, most vitals obtained',
          needsImprovement: 'Disorganized assessment, missing vitals',
          unsafe: 'Inadequate assessment, critical findings missed'
        }
      },
      {
        domain: 'Documentation',
        description: 'Recording findings, times, and basic information',
        weight: 15,
        criteria: {
          excellent: 'Complete, clear documentation',
          satisfactory: 'Adequate documentation',
          needsImprovement: 'Incomplete documentation',
          unsafe: 'Critical information not documented'
        }
      }
    ],
    criticalActions: [
      'Scene safety assessed before patient contact',
      'BSI/PPE applied',
      'Patient consent obtained',
      'Level of consciousness determined',
      'Vital signs obtained (BP, HR, RR, SpO2)',
      'SAMPLE history initiated'
    ],
    assessmentFocus: 'Building foundational skills in patient approach, safety, communication, and systematic assessment',
    expectationsSummary: 'First year students should focus on developing safe, systematic habits. Emphasis on proper scene approach, patient communication, and thorough history taking. Speed is less important than correctness.'
  },

  '2nd-year': {
    yearLevel: '2nd-year',
    domains: [
      {
        domain: 'Assessment Completeness',
        description: 'Systematic ABCDE, complete vitals, GCS, secondary survey',
        weight: 35,
        criteria: {
          excellent: 'Complete systematic ABCDE, full vitals including GCS/glucose, thorough secondary survey',
          satisfactory: 'Good ABCDE approach, adequate vitals, reasonable secondary survey',
          needsImprovement: 'Incomplete ABCDE, missing vitals, limited secondary survey',
          unsafe: 'Critical assessment components missed'
        }
      },
      {
        domain: 'History Taking',
        description: 'Complete SAMPLE, medication detail, relevant past history',
        weight: 20,
        criteria: {
          excellent: 'Comprehensive history, all medications understood, relevant past history',
          satisfactory: 'Complete SAMPLE, basic medication history',
          needsImprovement: 'Incomplete history, missing SAMPLE components',
          unsafe: 'Critical history elements missed'
        }
      },
      {
        domain: 'Documentation',
        description: 'Complete, accurate, timely documentation',
        weight: 20,
        criteria: {
          excellent: 'Complete documentation with times, trends noted',
          satisfactory: 'Adequate documentation',
          needsImprovement: 'Incomplete documentation',
          unsafe: 'Critical findings not documented'
        }
      },
      {
        domain: 'Clinical Reasoning',
        description: 'Recognizing abnormalities, basic differential consideration',
        weight: 15,
        criteria: {
          excellent: 'Recognizes patterns, considers differentials',
          satisfactory: 'Identifies obvious abnormalities',
          needsImprovement: 'Misses important findings',
          unsafe: 'Fails to recognize critical abnormalities'
        }
      },
      {
        domain: 'Procedural Skills',
        description: 'Vital signs, glucose testing, basic airway adjuncts',
        weight: 10,
        criteria: {
          excellent: 'All procedures performed correctly',
          satisfactory: 'Adequate procedural skills',
          needsImprovement: 'Some procedural difficulties',
          unsafe: 'Unsafe procedures - FAIL'
        }
      }
    ],
    criticalActions: [
      'Complete ABCDE assessment performed',
      'GCS calculated and documented',
      'Blood glucose checked when indicated',
      'Full set of vitals including BP, HR, RR, SpO2, temperature',
      'SAMPLE history complete',
      'Secondary survey performed',
      'Findings documented with times'
    ],
    assessmentFocus: 'Developing systematic assessment habits, complete documentation, and basic clinical reasoning',
    expectationsSummary: 'Second year students should demonstrate systematic ABCDE assessment, complete vital signs including GCS, and thorough documentation. Beginning clinical reasoning with pattern recognition.'
  },

  '3rd-year': {
    yearLevel: '3rd-year',
    domains: [
      {
        domain: 'Clinical Reasoning',
        description: 'Differential diagnosis, treatment prioritization, anticipating deterioration',
        weight: 30,
        criteria: {
          excellent: 'Strong clinical reasoning, considers differentials, anticipates changes',
          satisfactory: 'Adequate clinical reasoning, appropriate priorities',
          needsImprovement: 'Basic reasoning, some prioritization issues',
          unsafe: 'Poor clinical reasoning, dangerous decisions - FAIL'
        }
      },
      {
        domain: 'Assessment and Treatment Integration',
        description: 'Simultaneous assessment and treatment, appropriate interventions',
        weight: 25,
        criteria: {
          excellent: 'Seamless integration, efficient, appropriate treatments',
          satisfactory: 'Good balance of assessment and treatment',
          needsImprovement: 'Delays in treatment, or assessment suffers',
          unsafe: 'Wrong treatment priorities, dangerous delays'
        }
      },
      {
        domain: 'Team Communication',
        description: 'Clear communication, structured handover, team interaction',
        weight: 20,
        criteria: {
          excellent: 'Excellent communication, structured handover, good teamwork',
          satisfactory: 'Clear communication, adequate handover',
          needsImprovement: 'Communication gaps, unstructured handover',
          unsafe: 'Poor communication, handover omissions'
        }
      },
      {
        domain: 'Procedural Skills',
        description: 'IV access, medications, airway adjuncts, ECG',
        weight: 15,
        criteria: {
          excellent: 'All procedures proficient',
          satisfactory: 'Adequate procedural skills',
          needsImprovement: 'Some procedural difficulties',
          unsafe: 'Unsafe procedures - FAIL'
        }
      },
      {
        domain: 'Documentation',
        description: 'Complete documentation including clinical reasoning',
        weight: 10,
        criteria: {
          excellent: 'Comprehensive with rationale',
          satisfactory: 'Complete documentation',
          needsImprovement: 'Incomplete documentation',
          unsafe: 'Critical elements missing'
        }
      }
    ],
    criticalActions: [
      'Life threats identified and treated immediately',
      'Appropriate vascular access obtained',
      'Medications administered correctly',
      'ECG obtained and interpreted when indicated',
      'Patient reassessed after interventions',
      'Structured handover provided',
      'Clinical reasoning documented'
    ],
    assessmentFocus: 'Developing clinical reasoning, integrating assessment with treatment, team communication',
    expectationsSummary: 'Third year students should demonstrate sound clinical reasoning, integrate assessment with treatment, communicate effectively with team, and manage most common emergencies.'
  },

  '4th-year': {
    yearLevel: '4th-year',
    domains: [
      {
        domain: 'Clinical Decision Making',
        description: 'Complex case management, differential diagnosis, treatment adaptation',
        weight: 30,
        criteria: {
          excellent: 'Excellent decision making, adapts to changing situation',
          satisfactory: 'Good clinical decisions, appropriate management',
          needsImprovement: 'Some questionable decisions',
          unsafe: 'Poor clinical judgment - FAIL'
        }
      },
      {
        domain: 'Leadership and Team Management',
        description: 'Scene command, delegation, resource coordination',
        weight: 25,
        criteria: {
          excellent: 'Effective leader, optimal delegation, resourceful',
          satisfactory: 'Adequate leadership, reasonable delegation',
          needsImprovement: 'Ineffective leadership, poor delegation',
          unsafe: 'Chaotic scene management - FAIL'
        }
      },
      {
        domain: 'Communication',
        description: 'Team communication, patient communication, handover, documentation',
        weight: 20,
        criteria: {
          excellent: 'Excellent all-around communication',
          satisfactory: 'Clear communication',
          needsImprovement: 'Communication gaps',
          unsafe: 'Critical communication failures'
        }
      },
      {
        domain: 'Procedural Excellence',
        description: 'Advanced procedures, medication management',
        weight: 15,
        criteria: {
          excellent: 'Proficient in all procedures',
          satisfactory: 'Competent in required procedures',
          needsImprovement: 'Some procedural difficulties',
          unsafe: 'Unsafe procedures - FAIL'
        }
      },
      {
        domain: 'Professional Standards',
        description: 'Documentation, ethics, quality mindset',
        weight: 10,
        criteria: {
          excellent: 'Exemplary professionalism',
          satisfactory: 'Meets professional standards',
          needsImprovement: 'Some professional concerns',
          unsafe: 'Unprofessional conduct - FAIL'
        }
      }
    ],
    criticalActions: [
      'Appropriate scene command established',
      'Resources requested appropriately',
      'Team members deployed effectively',
      'Clinical decisions justified and documented',
      'Complex cases managed systematically',
      'Comprehensive handover provided',
      'Quality improvement mindset demonstrated'
    ],
    assessmentFocus: 'Leadership, complex case management, team coordination, professional practice',
    expectationsSummary: 'Fourth year students should demonstrate leadership capabilities, manage complex scenarios effectively, coordinate team resources, and practice at a professional standard ready for independent practice.'
  },

  'diploma': {
    yearLevel: 'diploma',
    domains: [
      {
        domain: 'Independent Practice',
        description: 'Autonomous decision making, comprehensive care, professional judgment',
        weight: 35,
        criteria: {
          excellent: 'Ready for independent practice, expert judgment',
          satisfactory: 'Approaching independent practice standard',
          needsImprovement: 'Not yet ready for independent practice',
          unsafe: 'Unsuitable for independent practice - FAIL'
        }
      },
      {
        domain: 'Leadership and Resource Management',
        description: 'Scene command, complex resource coordination, mentorship',
        weight: 25,
        criteria: {
          excellent: 'Expert leader, optimizes resources',
          satisfactory: 'Competent leader',
          needsImprovement: 'Leadership gaps',
          unsafe: 'Cannot lead effectively - FAIL'
        }
      },
      {
        domain: 'Clinical Excellence',
        description: 'Advanced clinical skills, evidence-based practice',
        weight: 25,
        criteria: {
          excellent: 'Exceptional clinician',
          satisfactory: 'Competent clinician',
          needsImprovement: 'Clinical deficiencies',
          unsafe: 'Unsafe practice - FAIL'
        }
      },
      {
        domain: 'Professional Practice',
        description: 'Ethics, documentation, quality improvement, communication',
        weight: 15,
        criteria: {
          excellent: 'Exemplary professional',
          satisfactory: 'Meets standards',
          needsImprovement: 'Professional concerns',
          unsafe: 'Unprofessional - FAIL'
        }
      }
    ],
    criticalActions: [
      'Demonstrates readiness for independent practice',
      'Makes autonomous clinical decisions safely',
      'Leads complex scene management',
      'Mentors junior colleagues',
      'Engages in quality improvement',
      'Maintains professional standards'
    ],
    assessmentFocus: 'Readiness for independent paramedic practice at a professional standard',
    expectationsSummary: 'Diploma students should demonstrate readiness for independent paramedic practice with expert clinical judgment, leadership capabilities, and commitment to professional standards and continuous improvement.'
  }
};

export default { yearSpecificExpectations, yearLevelRubrics, quickAssessmentTags };
