import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // HEM3903 Submission Schedule
  // Assessments:
  // - Case Presentation: 10%
  // - Case Reflection (Obstetric): 20%
  // - Case Reflection (Pediatric): 20%
  // - PCR #1: 5%
  // - PCR #2: 5%
  // - PCR #3: 5%
  // - PCR #4: 5%
  // - Skew Book Log: 20% (Initial 5% + Mid 5% + Final 10%)
  // - Clinical Practice Integration Attendance: 10%
  // Total: 100%

  const hem3903 = await prisma.module.upsert({
    where: { code: 'HEM3903' },
    update: {
      submissionSchedule: {
        requirements: {
          casePresentation: 1,
          caseReflections: 2,
          pcrs: 4,
          skewBookLog: 1,
          skewBookEvaluations: 3,
          attendanceTracking: true
        },
        assessmentWeights: {
          casePresentation: 10,
          caseReflectionObstetric: 20,
          caseReflectionPediatric: 20,
          pcr1: 5,
          pcr2: 5,
          pcr3: 5,
          pcr4: 5,
          skewBookInitial: 5,
          skewBookMid: 5,
          skewBookFinal: 10,
          attendance: 10
        },
        timeline: [
          {
            date: '2025-10-04',
            time: '23:59',
            items: [
              {
                type: 'skew_book_evaluation',
                number: 1,
                title: 'Initial Skew Book Evaluation',
                description: 'First evaluation of skew book/log book (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📖'
              }
            ]
          },
          {
            date: '2025-10-11',
            time: '23:59',
            items: [
              {
                type: 'case_presentation',
                number: 1,
                title: 'Case Presentation',
                description: 'Comprehensive case presentation submission (10% of final grade)',
                mandatory: true,
                weight: 10,
                emoji: '🎤'
              },
              {
                type: 'pcr',
                number: 1,
                title: 'PCR #1',
                description: 'First Patient Care Report (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-10-18',
            time: '23:59',
            items: [
              {
                type: 'case_reflection',
                number: 1,
                title: 'Case Reflection #1 (Obstetric)',
                description: 'Obstetric case reflection submission (20% of final grade)',
                mandatory: true,
                weight: 20,
                emoji: '📝'
              },
              {
                type: 'pcr',
                number: 2,
                title: 'PCR #2',
                description: 'Second Patient Care Report (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-10-25',
            time: '23:59',
            items: [
              {
                type: 'pcr',
                number: 3,
                title: 'PCR #3',
                description: 'Third Patient Care Report (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-11-01',
            time: '23:59',
            items: [
              {
                type: 'skew_book_evaluation',
                number: 2,
                title: 'Mid Skew Book Evaluation',
                description: 'Mid-term evaluation of skew book/log book (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📖'
              },
              {
                type: 'case_reflection',
                number: 2,
                title: 'Case Reflection #2 (Pediatric)',
                description: 'Pediatric case reflection submission (20% of final grade)',
                mandatory: true,
                weight: 20,
                emoji: '📝'
              },
              {
                type: 'pcr',
                number: 4,
                title: 'PCR #4',
                description: 'Fourth Patient Care Report (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-11-08',
            time: '23:59',
            items: [
              {
                type: 'skew_book_evaluation',
                number: 3,
                title: 'Final Skew Book Evaluation',
                description: 'Final evaluation of skew book/log book (10% of final grade)',
                mandatory: true,
                weight: 10,
                emoji: '📖'
              },
              {
                type: 'skew_book_log',
                number: 1,
                title: 'Final Skew Book/Log Book Submission',
                description: 'Complete skew book with all entries and documentation (20% total)',
                mandatory: true,
                weight: 20,
                emoji: '📚'
              },
              {
                type: 'attendance',
                number: 1,
                title: 'Clinical Practice Integration Attendance',
                description: 'Final attendance record for clinical practice (10% of final grade)',
                mandatory: true,
                weight: 10,
                emoji: '✅'
              }
            ]
          }
        ],
        criticalDeadlines: [
          { title: 'Initial Evaluation', date: '2025-10-04' },
          { title: 'Mid Evaluation', date: '2025-11-01' },
          { title: 'Final Deadline', date: '2025-11-08' }
        ]
      }
    },
    create: {
      code: 'HEM3903',
      name: 'Ambulance Practicum III',
      description: 'Advanced ambulance practicum and emergency response with comprehensive clinical assessments',
      totalCredits: 4,
      submissionSchedule: {
        requirements: {
          casePresentation: 1,
          caseReflections: 2,
          pcrs: 4,
          skewBookLog: 1,
          skewBookEvaluations: 3,
          attendanceTracking: true
        },
        assessmentWeights: {
          casePresentation: 10,
          caseReflectionObstetric: 20,
          caseReflectionPediatric: 20,
          pcr1: 5,
          pcr2: 5,
          pcr3: 5,
          pcr4: 5,
          skewBookInitial: 5,
          skewBookMid: 5,
          skewBookFinal: 10,
          attendance: 10
        },
        timeline: [
          {
            date: '2025-10-04',
            time: '23:59',
            items: [
              {
                type: 'skew_book_evaluation',
                number: 1,
                title: 'Initial Skew Book Evaluation',
                description: 'First evaluation of skew book/log book (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📖'
              }
            ]
          },
          {
            date: '2025-10-11',
            time: '23:59',
            items: [
              {
                type: 'case_presentation',
                number: 1,
                title: 'Case Presentation',
                description: 'Comprehensive case presentation submission (10% of final grade)',
                mandatory: true,
                weight: 10,
                emoji: '🎤'
              },
              {
                type: 'pcr',
                number: 1,
                title: 'PCR #1',
                description: 'First Patient Care Report (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-10-18',
            time: '23:59',
            items: [
              {
                type: 'case_reflection',
                number: 1,
                title: 'Case Reflection #1 (Obstetric)',
                description: 'Obstetric case reflection submission (20% of final grade)',
                mandatory: true,
                weight: 20,
                emoji: '📝'
              },
              {
                type: 'pcr',
                number: 2,
                title: 'PCR #2',
                description: 'Second Patient Care Report (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-10-25',
            time: '23:59',
            items: [
              {
                type: 'pcr',
                number: 3,
                title: 'PCR #3',
                description: 'Third Patient Care Report (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-11-01',
            time: '23:59',
            items: [
              {
                type: 'skew_book_evaluation',
                number: 2,
                title: 'Mid Skew Book Evaluation',
                description: 'Mid-term evaluation of skew book/log book (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📖'
              },
              {
                type: 'case_reflection',
                number: 2,
                title: 'Case Reflection #2 (Pediatric)',
                description: 'Pediatric case reflection submission (20% of final grade)',
                mandatory: true,
                weight: 20,
                emoji: '📝'
              },
              {
                type: 'pcr',
                number: 4,
                title: 'PCR #4',
                description: 'Fourth Patient Care Report (5% of final grade)',
                mandatory: true,
                weight: 5,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-11-08',
            time: '23:59',
            items: [
              {
                type: 'skew_book_evaluation',
                number: 3,
                title: 'Final Skew Book Evaluation',
                description: 'Final evaluation of skew book/log book (10% of final grade)',
                mandatory: true,
                weight: 10,
                emoji: '📖'
              },
              {
                type: 'skew_book_log',
                number: 1,
                title: 'Final Skew Book/Log Book Submission',
                description: 'Complete skew book with all entries and documentation (20% total)',
                mandatory: true,
                weight: 20,
                emoji: '📚'
              },
              {
                type: 'attendance',
                number: 1,
                title: 'Clinical Practice Integration Attendance',
                description: 'Final attendance record for clinical practice (10% of final grade)',
                mandatory: true,
                weight: 10,
                emoji: '✅'
              }
            ]
          }
        ],
        criticalDeadlines: [
          { title: 'Initial Evaluation', date: '2025-10-04' },
          { title: 'Mid Evaluation', date: '2025-11-01' },
          { title: 'Final Deadline', date: '2025-11-08' }
        ]
      }
    }
  });

  console.log('Created/Updated HEM3903 module:', hem3903);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
