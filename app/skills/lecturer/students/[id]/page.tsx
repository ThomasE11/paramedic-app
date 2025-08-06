'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  BarChart2, 
  MessageSquare, 
  FileCheck, 
  ArrowLeft,
  Calendar,
  Mail,
  Clock,
  Award,
  Target,
  Star,
  TrendingUp,
  BookOpen,
  Brain
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  createdAt: string;
  enrolledSubjects: string[];
  progress: {
    totalSkills: number;
    completedSkills: number;
    masteredSkills: number;
    inProgressSkills: number;
    totalTime: number;
    avgScore: number;
    completionRate: number;
  };
  reflections: {
    count: number;
    avgRating: number;
    recent: Array<{
      id: string;
      content: string;
      rating: number;
      skillName: string;
      createdAt: string;
    }>;
  };
  subjects: Array<{
    code: string;
    name: string;
    level: string;
    enrolledDate: string;
    progress: number;
  }>;
}

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStudent: Student = {
        id: studentId,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        studentId: 'STU001',
        createdAt: '2024-01-15T00:00:00Z',
        enrolledSubjects: ['Basic Life Support', 'Advanced Life Support', 'Patient Assessment'],
        progress: {
          totalSkills: 15,
          completedSkills: 8,
          masteredSkills: 3,
          inProgressSkills: 5,
          totalTime: 1200, // minutes
          avgScore: 82.5,
          completionRate: 53.3
        },
        reflections: {
          count: 12,
          avgRating: 4.2,
          recent: [
            {
              id: 'ref-1',
              content: 'Today I practiced CPR and felt much more confident...',
              rating: 4,
              skillName: 'CPR Adult',
              createdAt: '2024-12-15T00:00:00Z'
            },
            {
              id: 'ref-2',
              content: 'AED practice went well. I was able to follow all prompts...',
              rating: 5,
              skillName: 'AED Use',
              createdAt: '2024-12-14T00:00:00Z'
            }
          ]
        },
        subjects: [
          {
            code: 'BLS-101',
            name: 'Basic Life Support',
            level: 'Foundation',
            enrolledDate: '2024-01-15',
            progress: 75
          },
          {
            code: 'ALS-201',
            name: 'Advanced Life Support',
            level: 'Advanced',
            enrolledDate: '2024-02-01',
            progress: 45
          },
          {
            code: 'PA-101',
            name: 'Patient Assessment',
            level: 'Foundation',
            enrolledDate: '2024-01-20',
            progress: 60
          }
        ]
      };
      
      setStudent(mockStudent);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Student not found</h3>
            <p className="text-muted-foreground text-center">
              The student you're looking for doesn't exist or you don't have permission to view their data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'from-emerald-500 to-emerald-600';
    if (rate >= 60) return 'from-blue-500 to-blue-600';
    if (rate >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Link href="/lecturer/students">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Student Profile</h1>
      </div>

      {/* Enhanced Student Header Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50/30">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getProgressColor(student.progress.completionRate)} flex items-center justify-center shadow-lg border-4 border-white/20`}>
              <span className="text-white font-bold text-2xl">
                {getInitials(student.name)}
              </span>
            </div>

            {/* Student Info */}
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold mb-2">{student.name}</CardTitle>
              <div className="flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">{student.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
                    {student.studentId}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Enrolled {new Date(student.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {student.progress.completionRate.toFixed(0)}%
              </div>
              <div className="text-blue-100 text-sm">Overall Progress</div>
              <div className="mt-2">
                <Badge className="bg-white/20 border-white/30 text-white">
                  {student.progress.completedSkills}/{student.progress.totalSkills} Skills
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Quick Stats Bar */}
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">{Math.round(student.progress.totalTime / 60)}h</div>
              <div className="text-sm text-blue-600">Practice Time</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">{student.progress.masteredSkills}</div>
              <div className="text-sm text-purple-600">Mastered</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">{student.progress.avgScore.toFixed(1)}%</div>
              <div className="text-sm text-green-600">Avg Score</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-800">{student.reflections.avgRating.toFixed(1)}</div>
              <div className="text-sm text-yellow-600">Avg Rating</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
              <Brain className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-800">{student.reflections.count}</div>
              <div className="text-sm text-indigo-600">Reflections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="details" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center space-x-2">
            <FileCheck className="h-4 w-4" />
            <span>Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrolled Subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Enrolled Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.subjects.map((subject, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-600">{subject.code} • {subject.level}</p>
                      </div>
                      <Badge variant="outline">{subject.progress}%</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{subject.progress}% Complete</span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Enrolled: {new Date(subject.enrolledDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Reflections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Recent Reflections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.reflections.recent.map((reflection) => (
                  <div key={reflection.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{reflection.skillName}</h4>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < reflection.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {reflection.content}
                    </p>
                    <div className="text-xs text-gray-500">
                      {new Date(reflection.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Reflections
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Comprehensive Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Available</h3>
                <p className="text-gray-600 mb-4">
                  Access detailed performance insights, learning patterns, and recommendations.
                </p>
                <Link href={`/lecturer/students/${student.id}/analytics`}>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                    View Full Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="h-5 w-5 mr-2" />
                Student Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Submissions Management</h3>
                <p className="text-gray-600 mb-4">
                  View and manage student submissions, provide feedback, and track completion.
                </p>
                <Link href={`/lecturer/students/${student.id}/submissions`}>
                  <Button className="bg-gradient-to-r from-green-600 to-green-700">
                    View Submissions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Message Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Direct Communication</h3>
                <p className="text-gray-600 mb-4">
                  Send messages, provide feedback, and maintain communication with the student.
                </p>
                <Link href={`/lecturer/students/${student.id}/messages`}>
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
                    Open Messages
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}