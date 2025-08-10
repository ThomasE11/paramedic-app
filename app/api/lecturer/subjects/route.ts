
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { allProcessedSkills, getSkillsByCategory } from '@/lib/comprehensive-skills-updated';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate subjects based on comprehensive skills system
    const blsSkills = getSkillsByCategory('bls');
    const alsSkills = getSkillsByCategory('als');
    const pediatricSkills = getSkillsByCategory('pediatric');
    const traumaSkills = getSkillsByCategory('trauma');
    const medicalSkills = getSkillsByCategory('medical');
    
    const mockSubjects = [
      {
        id: 'subject-1',
        code: 'BLS101',
        name: 'Basic Life Support',
        level: 'BEGINNER',
        description: 'Fundamental life support skills',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
        skills: blsSkills.map((skill, index) => ({
          id: `subject-skill-bls-${index + 1}`,
          subjectId: 'subject-1',
          skillId: skill.id,
          isRequired: true,
          skill: {
            id: skill.id,
            name: skill.name,
            difficultyLevel: skill.difficultyLevel,
            isCritical: skill.isCritical || false,
          }
        })),
        users: [
          {
            id: 'user-subject-1',
            userId: 'student-1',
            subjectId: 'subject-1',
            isActive: true,
            user: {
              id: 'student-1',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@example.com',
              studentId: 'STU001',
            }
          },
          {
            id: 'user-subject-2',
            userId: 'student-2',
            subjectId: 'subject-1',
            isActive: true,
            user: {
              id: 'student-2',
              name: 'Michael Chen',
              email: 'michael.chen@example.com',
              studentId: 'STU002',
            }
          }
        ],
        _count: {
          skills: blsSkills.length,
          users: 2,
        }
      },
      {
        id: 'subject-2',
        code: 'ALS201',
        name: 'Advanced Life Support',
        level: 'ADVANCED',
        description: 'Advanced emergency medical procedures',
        isActive: true,
        createdAt: new Date('2024-01-16').toISOString(),
        updatedAt: new Date('2024-01-16').toISOString(),
        skills: alsSkills.map((skill, index) => ({
          id: `subject-skill-als-${index + 1}`,
          subjectId: 'subject-2',
          skillId: skill.id,
          isRequired: true,
          skill: {
            id: skill.id,
            name: skill.name,
            difficultyLevel: skill.difficultyLevel,
            isCritical: skill.isCritical || false,
          }
        })),
        users: [
          {
            id: 'user-subject-3',
            userId: 'student-3',
            subjectId: 'subject-2',
            isActive: true,
            user: {
              id: 'student-3',
              name: 'Emma Rodriguez',
              email: 'emma.rodriguez@example.com',
              studentId: 'STU003',
            }
          }
        ],
        _count: {
          skills: alsSkills.length,
          users: 1,
        }
      },
      {
        id: 'subject-3',
        code: 'PEDS301',
        name: 'Pediatric Emergency Care',
        level: 'INTERMEDIATE',
        description: 'Specialized care for pediatric patients',
        isActive: true,
        createdAt: new Date('2024-01-17').toISOString(),
        updatedAt: new Date('2024-01-17').toISOString(),
        skills: pediatricSkills.map((skill, index) => ({
          id: `subject-skill-peds-${index + 1}`,
          subjectId: 'subject-3',
          skillId: skill.id,
          isRequired: true,
          skill: {
            id: skill.id,
            name: skill.name,
            difficultyLevel: skill.difficultyLevel,
            isCritical: skill.isCritical || false,
          }
        })),
        users: [],
        _count: {
          skills: pediatricSkills.length,
          users: 0,
        }
      },
      {
        id: 'subject-4',
        code: 'TRAUMA401',
        name: 'Trauma Management',
        level: 'INTERMEDIATE',
        description: 'Trauma assessment and management skills',
        isActive: true,
        createdAt: new Date('2024-01-18').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString(),
        skills: traumaSkills.map((skill, index) => ({
          id: `subject-skill-trauma-${index + 1}`,
          subjectId: 'subject-4',
          skillId: skill.id,
          isRequired: true,
          skill: {
            id: skill.id,
            name: skill.name,
            difficultyLevel: skill.difficultyLevel,
            isCritical: skill.isCritical || false,
          }
        })),
        users: [],
        _count: {
          skills: traumaSkills.length,
          users: 0,
        }
      },
      {
        id: 'subject-5',
        code: 'MED501',
        name: 'Medical Procedures',
        level: 'INTERMEDIATE',
        description: 'General medical procedures and assessments',
        isActive: true,
        createdAt: new Date('2024-01-19').toISOString(),
        updatedAt: new Date('2024-01-19').toISOString(),
        skills: medicalSkills.map((skill, index) => ({
          id: `subject-skill-med-${index + 1}`,
          subjectId: 'subject-5',
          skillId: skill.id,
          isRequired: true,
          skill: {
            id: skill.id,
            name: skill.name,
            difficultyLevel: skill.difficultyLevel,
            isCritical: skill.isCritical || false,
          }
        })),
        users: [],
        _count: {
          skills: medicalSkills.length,
          users: 0,
        }
      }
    ];

    return NextResponse.json(mockSubjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, name, level, description } = body;

    // Validation
    if (!code || !name || !level) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, and level are required' },
        { status: 400 }
      );
    }

    // Validate HEM code format (HEM followed by 4 digits)
    const hemCodeRegex = /^HEM\d{4}$/;
    if (!hemCodeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Code must be in format HEMxxxx (e.g., HEM1234)' },
        { status: 400 }
      );
    }

    // Mock check if code already exists
    const existingCodes = ['BLS101', 'ALS201', 'PEDS301'];
    if (existingCodes.includes(code.toUpperCase())) {
      return NextResponse.json(
        { error: 'Subject code already exists' },
        { status: 409 }
      );
    }

    // Validate level
    const validLevels = ['EMT-Basic', 'Paramedic', 'Advanced Paramedic', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level. Must be one of: EMT-Basic, Paramedic, Advanced Paramedic, BEGINNER, INTERMEDIATE, ADVANCED' },
        { status: 400 }
      );
    }

    // Mock create the subject
    const newSubject = {
      id: `subject-${Date.now()}`,
      code: code.toUpperCase(),
      name: name.trim(),
      level,
      description: description?.trim() || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      skills: [],
      users: [],
      _count: {
        skills: 0,
        users: 0,
      }
    };

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
