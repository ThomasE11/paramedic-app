import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create HEM 3923 module with submission schedule
  const hem3923 = await prisma.module.upsert({
    where: { code: 'HEM3923' },
    update: {
      submissionSchedule: {
        requirements: {
          casePresentation: 1,
          caseReflections: 3,
          pcrs: 2,
          logbookReviewPoints: 3,
          finalLogbook: 1
        },
        timeline: [
          {
            date: '2025-10-04',
            time: '23:59',
            items: [
              {
                type: 'logbook_review',
                number: 1,
                title: 'Logbook Review Point #1',
                description: 'First mandatory logbook review checkpoint',
                mandatory: true,
                emoji: '🔴'
              },
              {
                type: 'case_reflection',
                number: 1,
                title: 'Case Reflection #1',
                description: 'First case reflection submission',
                mandatory: true,
                emoji: '📝'
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
                description: 'Comprehensive case presentation submission',
                mandatory: true,
                emoji: '🎤'
              }
            ]
          },
          {
            date: '2025-10-18',
            time: '23:59',
            items: [
              {
                type: 'pcr',
                number: 1,
                title: 'PCR #1',
                description: 'First Patient Care Report',
                mandatory: true,
                emoji: '📋'
              },
              {
                type: 'case_reflection',
                number: 2,
                title: 'Case Reflection #2',
                description: 'Second case reflection submission',
                mandatory: true,
                emoji: '📝'
              }
            ]
          },
          {
            date: '2025-10-25',
            time: '23:59',
            items: [
              {
                type: 'pcr',
                number: 2,
                title: 'PCR #2',
                description: 'Second Patient Care Report',
                mandatory: true,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-11-01',
            time: '23:59',
            items: [
              {
                type: 'logbook_review',
                number: 2,
                title: 'Logbook Review Point #2',
                description: 'Second mandatory logbook review checkpoint',
                mandatory: true,
                emoji: '🔴'
              },
              {
                type: 'case_reflection',
                number: 3,
                title: 'Case Reflection #3',
                description: 'Final case reflection submission',
                mandatory: true,
                emoji: '📝'
              }
            ]
          },
          {
            date: '2025-11-08',
            time: '23:59',
            items: [
              {
                type: 'logbook_review',
                number: 3,
                title: 'Logbook Review Point #3',
                description: 'Final mandatory logbook review checkpoint',
                mandatory: true,
                emoji: '🔴'
              },
              {
                type: 'final_logbook',
                number: 1,
                title: 'Final Logbook Submission',
                description: 'Complete logbook with all entries and reflections',
                mandatory: true,
                emoji: '📚'
              }
            ]
          }
        ],
        criticalDeadlines: [
          { title: 'Review Point 1', date: '2025-10-04' },
          { title: 'Review Point 2', date: '2025-11-01' },
          { title: 'Final Deadline', date: '2025-11-08' }
        ]
      }
    },
    create: {
      code: 'HEM3923',
      name: 'Advanced Practice Medical or Trauma Case',
      description: 'Clinical Practice course focusing on case presentations, reflections, PCRs, and logbook documentation',
      totalCredits: 3,
      submissionSchedule: {
        requirements: {
          casePresentation: 1,
          caseReflections: 3,
          pcrs: 2,
          logbookReviewPoints: 3,
          finalLogbook: 1
        },
        timeline: [
          {
            date: '2025-10-04',
            time: '23:59',
            items: [
              {
                type: 'logbook_review',
                number: 1,
                title: 'Logbook Review Point #1',
                description: 'First mandatory logbook review checkpoint',
                mandatory: true,
                emoji: '🔴'
              },
              {
                type: 'case_reflection',
                number: 1,
                title: 'Case Reflection #1',
                description: 'First case reflection submission',
                mandatory: true,
                emoji: '📝'
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
                description: 'Comprehensive case presentation submission',
                mandatory: true,
                emoji: '🎤'
              }
            ]
          },
          {
            date: '2025-10-18',
            time: '23:59',
            items: [
              {
                type: 'pcr',
                number: 1,
                title: 'PCR #1',
                description: 'First Patient Care Report',
                mandatory: true,
                emoji: '📋'
              },
              {
                type: 'case_reflection',
                number: 2,
                title: 'Case Reflection #2',
                description: 'Second case reflection submission',
                mandatory: true,
                emoji: '📝'
              }
            ]
          },
          {
            date: '2025-10-25',
            time: '23:59',
            items: [
              {
                type: 'pcr',
                number: 2,
                title: 'PCR #2',
                description: 'Second Patient Care Report',
                mandatory: true,
                emoji: '📋'
              }
            ]
          },
          {
            date: '2025-11-01',
            time: '23:59',
            items: [
              {
                type: 'logbook_review',
                number: 2,
                title: 'Logbook Review Point #2',
                description: 'Second mandatory logbook review checkpoint',
                mandatory: true,
                emoji: '🔴'
              },
              {
                type: 'case_reflection',
                number: 3,
                title: 'Case Reflection #3',
                description: 'Final case reflection submission',
                mandatory: true,
                emoji: '📝'
              }
            ]
          },
          {
            date: '2025-11-08',
            time: '23:59',
            items: [
              {
                type: 'logbook_review',
                number: 3,
                title: 'Logbook Review Point #3',
                description: 'Final mandatory logbook review checkpoint',
                mandatory: true,
                emoji: '🔴'
              },
              {
                type: 'final_logbook',
                number: 1,
                title: 'Final Logbook Submission',
                description: 'Complete logbook with all entries and reflections',
                mandatory: true,
                emoji: '📚'
              }
            ]
          }
        ],
        criticalDeadlines: [
          { title: 'Review Point 1', date: '2025-10-04' },
          { title: 'Review Point 2', date: '2025-11-01' },
          { title: 'Final Deadline', date: '2025-11-08' }
        ]
      }
    }
  });

  console.log('Created/Updated HEM 3923 module:', hem3923);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
