import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock profile data based on user role
    const mockProfile = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      image: session.user.image,
      phone: session.user.role === 'ADMIN' ? '+1 (555) 100-0001' :
             session.user.role === 'LECTURER' ? '+1 (555) 200-0001' : 
             '+1 (555) 300-0001',
      location: 'New York, NY',
      bio: `Dedicated healthcare professional with expertise in ${session.user.role?.toLowerCase()} responsibilities.`,
      title: session.user.role === 'ADMIN' ? 'System Administrator' : 
             session.user.role === 'LECTURER' ? 'Senior Paramedic Instructor' : 
             'Paramedic Student',
      department: session.user.role === 'ADMIN' ? 'Information Technology' :
                  session.user.role === 'LECTURER' ? 'Emergency Medical Services' :
                  'Student Affairs',
      studentId: session.user.role === 'STUDENT' ? 'STU2024001' : undefined,
      employeeId: session.user.role !== 'STUDENT' ? 'EMP2024001' : undefined,
      registrationDate: '2024-01-15',
      lastLogin: new Date().toISOString(),
      credentials: {
        certifications: session.user.role === 'ADMIN' ? 
          ['Certified Information Systems Manager', 'Healthcare IT Security Certification', 'Project Management Professional (PMP)'] :
          session.user.role === 'LECTURER' ? 
          ['Advanced Life Support (ALS)', 'Pediatric Advanced Life Support (PALS)', 'Basic Life Support (BLS)', 'Emergency Medical Instructor Certification', 'Advanced Cardiac Life Support (ACLS)'] :
          ['Basic Life Support (BLS)', 'CPR Certification', 'First Aid Certification', 'Student Paramedic Registration'],
        qualifications: session.user.role === 'ADMIN' ? 
          ['Master of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Healthcare Information Management Certificate'] :
          session.user.role === 'LECTURER' ? 
          ['Master of Science in Emergency Medical Services', 'Bachelor of Science in Paramedicine', 'Teaching Qualification in Health Sciences', 'Advanced Paramedic Diploma'] :
          ['Currently enrolled in Bachelor of Paramedicine', 'High School Diploma', 'Emergency Medical Technician Certificate'],
        experience: session.user.role === 'ADMIN' ? 
          '8+ years in healthcare IT systems management, specializing in medical training platforms and student information systems' :
          session.user.role === 'LECTURER' ? 
          '12+ years as practicing paramedic in urban emergency services, 5+ years in emergency medical education and curriculum development' :
          'Currently in 2nd year of paramedicine program with 200+ hours of clinical placement experience',
        licenses: session.user.role === 'ADMIN' ? 
          ['Healthcare Information Security License #HIS-2024-001', 'IT Systems Administrator License #ITSA-2024-001'] :
          session.user.role === 'LECTURER' ? 
          ['Paramedic License #PM-NY-12345', 'Emergency Medical Instructor License #EMI-NY-6789', 'Advanced Life Support Provider License #ALS-NY-9876'] :
          ['Student Paramedic Registration #SPR-NY-2024-001', 'Healthcare Student License #HSL-NY-2024-001']
      },
      stats: session.user.role === 'ADMIN' ? 
        { totalUsers: 157, totalSkills: 89, systemUptime: '99.8%', activeInstructors: 12 } :
        session.user.role === 'LECTURER' ? 
        { studentsSupervised: 45, coursesCompleted: 23, totalSkills: 89, averageStudentRating: 4.8 } :
        { totalSkills: 89, completedSkills: 34, coursesCompleted: 12, currentGPA: 3.7, clinicalHours: 245 }
    };

    return NextResponse.json(mockProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, location, bio, title, department } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Mock update - in real implementation, this would update the database
    const updatedProfile = {
      id: session.user.id,
      name,
      email,
      phone,
      location,
      bio,
      title,
      department,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}