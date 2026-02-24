/**
 * Case Testing and Feedback System
 *
 * Provides a structured framework for:
 * - Testing cases with students/instructors
 * - Collecting feedback on case quality
 * - Tracking case revisions and improvements
 * - Maintaining case version history
 */

import type { CaseTestResult, CaseFeedback } from '@/types';

// ============================================================================
// CASE TESTING TEMPLATES
// ============================================================================

export interface CaseTestingTemplate {
  id: string;
  name: string;
  testerRole: 'instructor' | 'peer' | 'student';
  categories: {
    category: string;
    questions: string[];
  }[];
}

export const caseTestingTemplates: Record<string, CaseTestingTemplate> = {
  instructor: {
    id: 'instructor-review',
    name: 'Instructor Case Review',
    testerRole: 'instructor',
    categories: [
      {
        category: 'Clinical Accuracy',
        questions: [
          'Are the vital signs realistic for the presentation?',
          'Is the most likely diagnosis supported by findings?',
          'Are the red flags appropriately highlighted?',
          'Is the management pathway appropriate for the year level?',
          'Are the teaching points accurate and evidence-based?'
        ]
      },
      {
        category: 'Educational Value',
        questions: [
          'Does the case meet the stated learning objectives?',
          'Is the case complexity appropriate for the year level?',
          'Are the checklist items clearly defined?',
          'Do common pitfalls reflect actual student performance?',
          'Is the case engaging and realistic?'
        ]
      },
      {
        category: 'Technical Quality',
        questions: [
          'Is the dispatch information complete?',
          'Are the ABCDE findings consistent?',
          'Is the history complete and realistic?',
          'Are the visual resources accurate and accessible?',
          'Is the documentation clear and error-free?'
        ]
      }
    ]
  },
  peer: {
    id: 'peer-review',
    name: 'Peer Instructor Review',
    testerRole: 'instructor',
    categories: [
      {
        category: 'Content Review',
        questions: [
          'Is the case scenario medically accurate?',
          'Are the assessment findings consistent?',
          'Is the management appropriate for UAE scope?',
          'Are the medications/doses correct?',
          'Are references current and relevant?'
        ]
      },
      {
        category: 'Teaching Effectiveness',
        questions: [
          'Will this case effectively teach the intended skills?',
          'Are the expectations clearly communicated?',
          'Is the feedback actionable?',
          'Are the teaching points memorable?',
          'Would you use this case in your teaching?'
        ]
      }
    ]
  },
  student: {
    id: 'student-feedback',
    name: 'Student Feedback',
    testerRole: 'student',
    categories: [
      {
        category: 'Learning Experience',
        questions: [
          'Was the case scenario clear and understandable?',
          'Did you feel prepared for this case?',
          'Was the feedback helpful?',
          'What did you learn from this case?',
          'What would improve this case?'
        ]
      },
      {
        category: 'Realism',
        questions: [
          'Did the case feel realistic?',
          'Were the patient presentation and responses believable?',
          'Was the scene description accurate?',
          'Were the resources (images, videos) helpful?'
        ]
      }
    ]
  }
};

// ============================================================================
// FEEDBACK CATEGORIES AND PRIORITIES
// ============================================================================

export const feedbackCategories = [
  { id: 'clinical', name: 'Clinical Accuracy', description: 'Medical accuracy and consistency' },
  { id: 'scope', name: 'Scope of Practice', description: 'Appropriate for UAE paramedic scope' },
  { id: 'clarity', name: 'Clarity', description: 'Clear and understandable' },
  { id: 'relevance', name: 'Relevance', description: 'Appropriate for year level and curriculum' },
  { id: 'completeness', name: 'Completeness', description: 'All required elements present' },
  { id: 'resources', name: 'Resources', description: 'Images, videos, references' },
  { id: 'assessment', name: 'Assessment Items', description: 'Checklist items and scoring' },
  { id: 'technical', name: 'Technical', description: 'Typos, formatting, broken links' },
  { id: 'cultural', name: 'Cultural', description: 'UAE cultural appropriateness' },
  { id: 'safety', name: 'Safety', description: 'Patient/provider safety considerations' }
] as const;

export const feedbackPriorities = [
  { id: 'critical', name: 'Critical', description: 'Must fix before next use', color: 'text-red-600 bg-red-50' },
  { id: 'high', name: 'High', description: 'Important to fix soon', color: 'text-orange-600 bg-orange-50' },
  { id: 'medium', name: 'Medium', description: 'Should fix in next revision', color: 'text-yellow-600 bg-yellow-50' },
  { id: 'low', name: 'Low', description: 'Nice to have improvements', color: 'text-blue-600 bg-blue-50' }
] as const;

// ============================================================================
// COMMON FEEDBACK ITEMS
// ============================================================================

export const commonFeedbackItems = {
  clinical: [
    'Vital signs inconsistent with presentation',
    'Differential diagnosis missing important considerations',
    'Management pathway not appropriate for year level',
    'Medication dosages incorrect',
    'Assessment findings incomplete or unrealistic',
    'Missing critical action in checklist',
    'Teaching points not evidence-based'
  ],
  scope: [
    'Intervention outside UAE paramedic scope',
    'Medication not available in UAE protocols',
    'Procedure requires higher certification level',
    'Documentation requirements not aligned with local standards'
  ],
  clarity: [
    'Dispatch information unclear',
    'Checklist item description ambiguous',
    'Teaching point confusing or unclear',
    'Expected finding not clearly stated',
    'Instructions for instructor missing'
  ],
  relevance: [
    'Case too complex for stated year level',
    'Case too simple for stated year level',
    'Skills not yet taught at this level',
    'Content doesn\'t match learning objectives',
    'Cultural context not appropriate'
  ],
  completeness: [
    'Missing SAMPLE history elements',
    'Secondary survey incomplete',
    'Vital signs missing required elements',
    'No visual resources provided',
    'References not included'
  ],
  resources: [
    'Image link broken',
    'Video not accessible',
    'Reference link outdated',
    'Need additional visual resources',
    'ECG not available for cardiac case'
  ],
  assessment: [
    'Checklist item has no points assigned',
    'Critical item not marked as critical',
    'Common pitfall not listed',
    'Rationale missing for important items',
    'Year level mapping incorrect'
  ],
  technical: [
    'Typo in case title',
    'Formatting inconsistent',
    'Broken internal link',
    'Duplicate checklist item',
    'Version number not updated'
  ],
  cultural: [
    'Gender considerations not addressed',
    'Family involvement not appropriate',
    'Religious considerations missing',
    'Language barriers not addressed',
    'Cultural practice misrepresented'
  ],
  safety: [
    'Scene safety not adequately addressed',
    'BSI not emphasized',
    'Dangerous protocol suggested',
    'Missing safety warning in teaching points',
    'Patient safety risk not highlighted'
  ]
};

// ============================================================================
// CASE VERSION HISTORY TRACKING
// ============================================================================

export interface CaseChangeLog {
  version: number;
  date: string;
  author: string;
  changes: {
    type: 'added' | 'modified' | 'removed' | 'fixed';
    section: string;
    description: string;
  }[];
  feedback: string[];
  approvedBy: string[];
}

export function createCaseChangeLog(
  previousVersion: CaseChangeLog | null,
  changes: CaseChangeLog['changes'],
  author: string,
  feedback: string[]
): CaseChangeLog {
  return {
    version: (previousVersion?.version ?? 0) + 1,
    date: new Date().toISOString(),
    author,
    changes,
    feedback,
    approvedBy: []
  };
}

// ============================================================================
// FEEDBACK SUBMISSION
// ============================================================================

export interface FeedbackSubmission {
  caseId: string;
  caseTitle: string;
  testerName: string;
  testerRole: 'instructor' | 'peer' | 'student';
  date: string;
  ratings: {
    clinicalAccuracy: number;
    educationalValue: number;
    technicalQuality: number;
    overall: number;
  };
  feedback: {
    category: string;
    priority: string;
    description: string;
    suggestion?: string;
  }[];
  comments: string;
  wouldUseAgain: boolean;
  wouldRecommend: boolean;
}

export function submitFeedback(feedback: FeedbackSubmission): CaseFeedback {
  return {
    caseId: feedback.caseId,
    timestamp: feedback.date,
    feedbackType: 'improvement',
    category: feedback.ratings.overall < 3 ? 'critical' : feedback.ratings.overall < 4 ? 'content' : 'clarity',
    description: feedback.comments,
    priority: feedback.ratings.overall < 3 ? 'high' : feedback.ratings.overall < 4 ? 'medium' : 'low',
    status: 'open'
  };
}

// ============================================================================
// CASE TESTING WORKFLOW
// ============================================================================

export const testingWorkflow = {
  phases: [
    {
      name: 'Initial Review',
      description: 'Review case for obvious errors and completeness',
      checklist: [
        'All required fields present',
        'No typos or formatting errors',
        'Vital signs consistent',
        'Links and resources working'
      ]
    },
    {
      name: 'Content Validation',
      description: 'Validate clinical accuracy and appropriateness',
      checklist: [
        'Medical accuracy verified',
        'Scope of practice appropriate',
        'Year level appropriate',
        'Management pathway correct',
        'Teaching points evidence-based'
      ]
    },
    {
      name: 'Educational Review',
      description: 'Assess educational value and effectiveness',
      checklist: [
        'Learning objectives clear',
        'Checklist items well-defined',
        'Common pitfalls realistic',
        'Teaching points valuable',
        'Resources helpful'
      ]
    },
    {
      name: 'Student Testing',
      description: 'Test with actual students',
      checklist: [
        'Students understand the case',
        'Case flows logically',
        'Assessment works as intended',
        'Feedback is actionable',
        'Learning objectives met'
      ]
    },
    {
      name: 'Final Approval',
      description: 'Final review and approval',
      checklist: [
        'All feedback addressed',
        'Version updated',
        'References current',
        'Ready for production use'
      ]
    }
  ]
};

// ============================================================================
// CASE METRICS AND ANALYTICS
// ============================================================================

export interface CaseMetrics {
  caseId: string;
  totalTests: number;
  averageRating: number;
  averageRatingByCategory: Record<string, number>;
  commonIssues: { issue: string; count: number }[];
  improvementSuggestions: string[];
  lastTestDate: string;
  lastTestResult: 'approved' | 'needs-work' | 'rejected';
}

export function calculateCaseMetrics(testResults: CaseTestResult[]): CaseMetrics {
  if (testResults.length === 0) {
    throw new Error('No test results available');
  }

  const averageRating = testResults.reduce((sum, t) => sum + (t.difficultyRating + t.clarityRating + t.relevanceRating) / 3, 0) / testResults.length;

  const issueCounts: Record<string, number> = {};
  testResults.forEach(t => {
    t.issues.forEach(issue => {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });
  });

  const commonIssues = Object.entries(issueCounts)
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const allSuggestions = testResults.flatMap(t => t.suggestions);

  return {
    caseId: testResults[0].caseId,
    totalTests: testResults.length,
    averageRating,
    averageRatingByCategory: {},
    commonIssues,
    improvementSuggestions: [...new Set(allSuggestions)],
    lastTestDate: testResults[testResults.length - 1].date,
    lastTestResult: testResults[testResults.length - 1].approved ? 'approved' : 'needs-work'
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  caseTestingTemplates,
  feedbackCategories,
  feedbackPriorities,
  commonFeedbackItems,
  testingWorkflow,
  createCaseChangeLog,
  submitFeedback,
  calculateCaseMetrics
};
