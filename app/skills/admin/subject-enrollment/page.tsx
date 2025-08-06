'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  Search, 
  GraduationCap,
  Award,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface Subject {
  id: number;
  code: string;
  name: string;
  level: string;
  description: string;
  isActive: boolean;
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
}

interface Enrollment {
  id: string;
  userId: string;
  subjectId: number;
  enrolledAt: string;
  isActive: boolean;
  user: Student;
  subject: Subject;
}

export default function SubjectEnrollmentPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enrollment form state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch subjects, students, and enrollments in parallel
      const [subjectsRes, studentsRes, enrollmentsRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/students'),
        fetch('/api/admin/subject-enrollment')
      ]);

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || []);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);
      }

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setEnrollments(enrollmentsData.enrollments || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudent || !selectedSubject) {
      alert('Please select both a student and a subject');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch('/api/admin/subject-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          subjectId: parseInt(selectedSubject),
          action: 'enroll'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Student enrolled successfully! Access granted to ${result.enrollment.skillsEnrolled} skills.`);
        setSelectedStudent('');
        setSelectedSubject('');
        fetchData(); // Refresh data
      } else {
        alert(result.error || 'Failed to enroll student');
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Failed to enroll student');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenrollStudent = async (enrollment: Enrollment) => {
    if (!confirm(`Are you sure you want to unenroll ${enrollment.user.name} from ${enrollment.subject.name}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/subject-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: enrollment.userId,
          subjectId: enrollment.subjectId,
          action: 'unenroll'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Student unenrolled successfully');
        fetchData(); // Refresh data
      } else {
        alert(result.error || 'Failed to unenroll student');
      }
    } catch (error) {
      console.error('Error unenrolling student:', error);
      alert('Failed to unenroll student');
    }
  };

  // Filter data based on search
  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate statistics
  const stats = {
    totalEnrollments: enrollments.length,
    totalStudents: new Set(enrollments.map(e => e.userId)).size,
    totalSubjects: subjects.length,
    enrollmentsBySubject: subjects.map(subject => ({
      ...subject,
      enrollmentCount: enrollments.filter(e => e.subjectId === subject.id && e.isActive).length
    }))
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-3xl" />
            <div className="relative">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-2xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Subject Enrollment Management
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                    Manage student enrollment in paramedic training subjects with automatic skill access
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalStudents}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Enrolled Students</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalSubjects}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Active Subjects</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalEnrollments}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Enrollments</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.enrollmentsBySubject.reduce((sum, s) => sum + s.enrollmentCount, 0)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Active Enrollments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="enroll" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Enroll Student</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Subjects</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    placeholder="Search enrollments by student name, ID, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl"
                  />
                </div>
              </div>

              {/* Enrollments List */}
              <div className="space-y-4">
                {filteredEnrollments.length === 0 ? (
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-12 shadow-xl text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No enrollments found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? 'Try adjusting your search terms.' : 'Start by enrolling students in subjects.'}
                    </p>
                  </div>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{enrollment.user.name}</CardTitle>
                              <CardDescription>
                                Student ID: {enrollment.user.studentId} • {enrollment.user.email}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={enrollment.isActive ? 
                              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }>
                              {enrollment.isActive ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <X className="h-3 w-3 mr-1" />
                              )}
                              {enrollment.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {enrollment.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnenrollStudent(enrollment)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Unenroll
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {enrollment.subject.code}: {enrollment.subject.name}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Level: {enrollment.subject.level} • Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                            {enrollment.subject.level}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Enroll Student Tab */}
          <TabsContent value="enroll">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Enroll Student in Subject</span>
                </CardTitle>
                <CardDescription>
                  Select a student and subject to automatically enroll them with access to all subject skills.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Student</label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl">
                        <SelectValue placeholder="Choose a student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.studentId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl">
                        <SelectValue placeholder="Choose a subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.code}: {subject.name} ({subject.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleEnrollStudent}
                    disabled={enrolling || !selectedStudent || !selectedSubject}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-xl"
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Enroll Student
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.enrollmentsBySubject.map((subject) => (
                <Card key={subject.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                        {subject.level}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {subject.enrollmentCount} enrolled
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{subject.code}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {subject.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Status:</span>
                        <span className={subject.isActive ? 
                          'text-green-600 font-medium' : 
                          'text-red-600 font-medium'
                        }>
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Level:</span>
                        <span className="font-medium">{subject.level}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}