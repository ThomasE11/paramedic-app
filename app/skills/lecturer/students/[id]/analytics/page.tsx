'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen, 
  MessageSquare, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Award,
  Brain,
  Lightbulb,
  Users,
  Timer,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  TrendingDown,
  AlertTriangle,
  Zap,
  Medal,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  createdAt: string;
  progress: Array<{
    id: string;
    status: string;
    timeSpentMinutes: number;
    completedCount: number;
    selfAssessmentScore: number;
    lastAttemptDate: string;
    completionDate: string;
    competencyLevel: 'NOVICE' | 'ADVANCED_BEGINNER' | 'COMPETENT' | 'PROFICIENT' | 'EXPERT';
    confidenceLevel: number;
    practiceSessionsCount: number;
    averageSessionScore: number;
    skill: {
      id: string;
      name: string;
      difficultyLevel: string;
      category: {
        id: string;
        name: string;
        colorCode: string;
      };
    };
  }>;
  reflections: Array<{
    id: string;
    content: string;
    createdAt: string;
    rating: number;
    whatWentWell: string;
    whatToImprove: string;
    futureGoals: string;
    isPrivate: boolean;
    skill: {
      id: string;
      name: string;
    };
  }>;
  feedback: Array<{
    id: string;
    lecturerName: string;
    type: 'PRACTICAL' | 'THEORETICAL' | 'GENERAL';
    rating: number;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    comments: string;
    createdAt: string;
    skillId?: string;
  }>;
}

export default function StudentAnalytics() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      // Mock enhanced student data for comprehensive analytics
      const mockStudentData: Student = {
        id: studentId,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        studentId: 'STU001',
        createdAt: '2024-01-15T00:00:00Z',
        progress: [
          {
            id: 'prog-1',
            status: 'MASTERED',
            timeSpentMinutes: 180,
            completedCount: 5,
            selfAssessmentScore: 92,
            lastAttemptDate: '2024-12-15T00:00:00Z',
            completionDate: '2024-12-10T00:00:00Z',
            competencyLevel: 'EXPERT',
            confidenceLevel: 95,
            practiceSessionsCount: 8,
            averageSessionScore: 88,
            skill: {
              id: 'skill-1',
              name: 'CPR Adult',
              difficultyLevel: 'BEGINNER',
              category: { id: 'bls-1', name: 'Basic Life Support', colorCode: '#3B82F6' }
            }
          },
          {
            id: 'prog-2',
            status: 'COMPLETED',
            timeSpentMinutes: 145,
            completedCount: 3,
            selfAssessmentScore: 85,
            lastAttemptDate: '2024-12-14T00:00:00Z',
            completionDate: '2024-12-12T00:00:00Z',
            competencyLevel: 'PROFICIENT',
            confidenceLevel: 82,
            practiceSessionsCount: 6,
            averageSessionScore: 80,
            skill: {
              id: 'skill-2',
              name: 'AED Use',
              difficultyLevel: 'BEGINNER',
              category: { id: 'bls-1', name: 'Basic Life Support', colorCode: '#3B82F6' }
            }
          },
          {
            id: 'prog-3',
            status: 'IN_PROGRESS',
            timeSpentMinutes: 95,
            completedCount: 2,
            selfAssessmentScore: 68,
            lastAttemptDate: '2024-12-16T00:00:00Z',
            completionDate: '',
            competencyLevel: 'ADVANCED_BEGINNER',
            confidenceLevel: 65,
            practiceSessionsCount: 4,
            averageSessionScore: 70,
            skill: {
              id: 'skill-3',
              name: 'IV Insertion',
              difficultyLevel: 'INTERMEDIATE',
              category: { id: 'als-1', name: 'Advanced Life Support', colorCode: '#EF4444' }
            }
          },
          {
            id: 'prog-4',
            status: 'IN_PROGRESS',
            timeSpentMinutes: 60,
            completedCount: 1,
            selfAssessmentScore: 55,
            lastAttemptDate: '2024-12-13T00:00:00Z',
            completionDate: '',
            competencyLevel: 'NOVICE',
            confidenceLevel: 45,
            practiceSessionsCount: 3,
            averageSessionScore: 58,
            skill: {
              id: 'skill-4',
              name: 'Intubation',
              difficultyLevel: 'ADVANCED',
              category: { id: 'als-1', name: 'Advanced Life Support', colorCode: '#EF4444' }
            }
          },
          {
            id: 'prog-5',
            status: 'NOT_STARTED',
            timeSpentMinutes: 0,
            completedCount: 0,
            selfAssessmentScore: 0,
            lastAttemptDate: '',
            completionDate: '',
            competencyLevel: 'NOVICE',
            confidenceLevel: 0,
            practiceSessionsCount: 0,
            averageSessionScore: 0,
            skill: {
              id: 'skill-5',
              name: 'Medication Administration',
              difficultyLevel: 'INTERMEDIATE',
              category: { id: 'pharm-1', name: 'Pharmacology', colorCode: '#10B981' }
            }
          },
          {
            id: 'prog-6',
            status: 'COMPLETED',
            timeSpentMinutes: 120,
            completedCount: 4,
            selfAssessmentScore: 78,
            lastAttemptDate: '2024-12-11T00:00:00Z',
            completionDate: '2024-12-09T00:00:00Z',
            competencyLevel: 'COMPETENT',
            confidenceLevel: 75,
            practiceSessionsCount: 5,
            averageSessionScore: 76,
            skill: {
              id: 'skill-6',
              name: 'Vital Signs Assessment',
              difficultyLevel: 'BEGINNER',
              category: { id: 'assess-1', name: 'Patient Assessment', colorCode: '#8B5CF6' }
            }
          }
        ],
        reflections: [
          {
            id: 'ref-1',
            content: 'Today I practiced CPR and felt much more confident. My compression depth has improved significantly.',
            createdAt: '2024-12-15T00:00:00Z',
            rating: 4,
            whatWentWell: 'Consistent compression depth and proper hand positioning',
            whatToImprove: 'Need to work on maintaining rate during longer sessions',
            futureGoals: 'Practice endurance training for extended CPR scenarios',
            isPrivate: false,
            skill: { id: 'skill-1', name: 'CPR Adult' }
          },
          {
            id: 'ref-2',
            content: 'AED practice went well. I was able to follow all prompts correctly.',
            createdAt: '2024-12-14T00:00:00Z',
            rating: 5,
            whatWentWell: 'Perfect pad placement and clear voice commands',
            whatToImprove: 'Could be faster in initial assessment',
            futureGoals: 'Practice with different AED models',
            isPrivate: false,
            skill: { id: 'skill-2', name: 'AED Use' }
          },
          {
            id: 'ref-3',
            content: 'IV insertion was challenging today. Had difficulty with vein access.',
            createdAt: '2024-12-13T00:00:00Z',
            rating: 3,
            whatWentWell: 'Good sterile technique and patient communication',
            whatToImprove: 'Palpation skills and needle angle',
            futureGoals: 'Practice on different vein types and sizes',
            isPrivate: true,
            skill: { id: 'skill-3', name: 'IV Insertion' }
          },
          {
            id: 'ref-4',
            content: 'Vital signs assessment practice helped me understand normal ranges better.',
            createdAt: '2024-12-10T00:00:00Z',
            rating: 4,
            whatWentWell: 'Accurate measurements and proper technique',
            whatToImprove: 'Speed of assessment could be improved',
            futureGoals: 'Practice rapid assessment scenarios',
            isPrivate: false,
            skill: { id: 'skill-6', name: 'Vital Signs Assessment' }
          }
        ],
        feedback: [
          {
            id: 'feed-1',
            lecturerName: 'Dr. Sarah Wilson',
            type: 'PRACTICAL',
            rating: 4,
            strengths: ['Excellent compression technique', 'Good situational awareness', 'Follows protocols well'],
            improvements: ['Work on endurance', 'Practice with distractions'],
            recommendations: ['Additional practice sessions', 'Peer learning opportunities'],
            comments: 'Great improvement in CPR technique. Shows dedication to learning.',
            createdAt: '2024-12-15T00:00:00Z',
            skillId: 'skill-1'
          },
          {
            id: 'feed-2',
            lecturerName: 'Prof. Michael Chen',
            type: 'GENERAL',
            rating: 5,
            strengths: ['Punctual and prepared', 'Asks thoughtful questions', 'Helps other students'],
            improvements: ['Could be more assertive in team scenarios'],
            recommendations: ['Consider leadership roles in group exercises'],
            comments: 'Exemplary student with great potential for leadership.',
            createdAt: '2024-12-10T00:00:00Z'
          },
          {
            id: 'feed-3',
            lecturerName: 'Dr. Emily Rodriguez',
            type: 'PRACTICAL',
            rating: 3,
            strengths: ['Good sterile technique', 'Patient communication skills'],
            improvements: ['Vein palpation technique', 'Confidence in needle insertion'],
            recommendations: ['Additional IV practice sessions', 'Anatomy review'],
            comments: 'Shows promise but needs more practice with advanced procedures.',
            createdAt: '2024-12-13T00:00:00Z',
            skillId: 'skill-3'
          }
        ]
      };
      
      setStudent(mockStudentData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDetailedAnalytics = () => {
    if (!student) return null;

    const totalSkills = student.progress.length;
    const completedSkills = student.progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length;
    const inProgressSkills = student.progress.filter(p => p.status === 'IN_PROGRESS').length;
    const notStartedSkills = student.progress.filter(p => p.status === 'NOT_STARTED').length;
    const masteredSkills = student.progress.filter(p => p.status === 'MASTERED').length;
    
    const totalTime = student.progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
    const totalSessions = student.progress.reduce((sum, p) => sum + (p.practiceSessionsCount || 0), 0);
    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
    
    // Competency Analysis
    const competencyLevels = student.progress.reduce((acc, p) => {
      const level = p.competencyLevel || 'NOVICE';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Confidence Analysis
    const avgConfidence = student.progress.filter(p => p.confidenceLevel)
      .reduce((sum, p) => sum + p.confidenceLevel, 0) / Math.max(student.progress.filter(p => p.confidenceLevel).length, 1);
    
    const skillsByCategory = student.progress.reduce((acc, p) => {
      const category = p.skill.category.name;
      if (!acc[category]) {
        acc[category] = { 
          total: 0, completed: 0, inProgress: 0, notStarted: 0, mastered: 0,
          avgTime: 0, avgScore: 0, avgConfidence: 0, totalTime: 0, skillCount: 0
        };
      }
      acc[category].total++;
      acc[category].totalTime += p.timeSpentMinutes;
      acc[category].avgScore += p.selfAssessmentScore || 0;
      acc[category].avgConfidence += p.confidenceLevel || 0;
      acc[category].skillCount++;
      
      if (p.status === 'COMPLETED') acc[category].completed++;
      else if (p.status === 'MASTERED') { acc[category].mastered++; acc[category].completed++; }
      else if (p.status === 'IN_PROGRESS') acc[category].inProgress++;
      else acc[category].notStarted++;
      return acc;
    }, {} as Record<string, any>);

    // Calculate category averages
    Object.keys(skillsByCategory).forEach(category => {
      const data = skillsByCategory[category];
      data.avgTime = data.totalTime / Math.max(data.total, 1);
      data.avgScore = data.avgScore / Math.max(data.skillCount, 1);
      data.avgConfidence = data.avgConfidence / Math.max(data.skillCount, 1);
    });

    const skillsByDifficulty = student.progress.reduce((acc, p) => {
      const difficulty = p.skill.difficultyLevel;
      if (!acc[difficulty]) {
        acc[difficulty] = { total: 0, completed: 0, avgTime: 0, avgScore: 0, avgConfidence: 0, masteryRate: 0 };
      }
      acc[difficulty].total++;
      if (p.status === 'COMPLETED' || p.status === 'MASTERED') {
        acc[difficulty].completed++;
        acc[difficulty].avgTime += p.timeSpentMinutes;
        acc[difficulty].avgScore += p.selfAssessmentScore || 0;
        acc[difficulty].avgConfidence += p.confidenceLevel || 0;
        if (p.status === 'MASTERED') acc[difficulty].masteryRate++;
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate difficulty averages
    Object.keys(skillsByDifficulty).forEach(difficulty => {
      const completed = skillsByDifficulty[difficulty].completed;
      if (completed > 0) {
        skillsByDifficulty[difficulty].avgTime = skillsByDifficulty[difficulty].avgTime / completed;
        skillsByDifficulty[difficulty].avgScore = skillsByDifficulty[difficulty].avgScore / completed;
        skillsByDifficulty[difficulty].avgConfidence = skillsByDifficulty[difficulty].avgConfidence / completed;
        skillsByDifficulty[difficulty].masteryRate = (skillsByDifficulty[difficulty].masteryRate / skillsByDifficulty[difficulty].total) * 100;
      }
    });

    // Reflection Analysis
    const reflectionAnalysis = {
      totalReflections: student.reflections.length,
      avgRating: student.reflections.reduce((sum, r) => sum + (r.rating || 0), 0) / Math.max(student.reflections.length, 1),
      privateReflections: student.reflections.filter(r => r.isPrivate).length,
      reflectionFrequency: student.reflections.length / Math.max(completedSkills, 1),
      recentReflections: student.reflections
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    };

    // Instructor Feedback Analysis
    const feedbackAnalysis = {
      totalFeedback: student.feedback?.length || 0,
      avgRating: student.feedback?.reduce((sum, f) => sum + f.rating, 0) / Math.max(student.feedback?.length || 1, 1) || 0,
      strengthsIdentified: [...new Set(student.feedback?.flatMap(f => f.strengths) || [])],
      improvementsNeeded: [...new Set(student.feedback?.flatMap(f => f.improvements) || [])],
      recommendations: [...new Set(student.feedback?.flatMap(f => f.recommendations) || [])],
      feedbackByType: student.feedback?.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };

    // Learning Patterns
    const recentActivity = student.progress
      .filter(p => p.lastAttemptDate)
      .sort((a, b) => new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime())
      .slice(0, 15);

    const learningTrends = student.progress
      .filter(p => p.completionDate)
      .sort((a, b) => new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime())
      .map(p => ({
        date: p.completionDate,
        skillName: p.skill.name,
        category: p.skill.category.name,
        timeSpent: p.timeSpentMinutes,
        score: p.selfAssessmentScore || 0,
        confidence: p.confidenceLevel || 0,
        competency: p.competencyLevel || 'NOVICE'
      }));

    // Performance Insights
    const strongCategories = Object.entries(skillsByCategory)
      .filter(([_, data]: [string, any]) => data.completed / data.total >= 0.7 && data.avgScore >= 80)
      .map(([category, _]) => category);
    
    const improvementAreas = Object.entries(skillsByCategory)
      .filter(([_, data]: [string, any]) => data.completed / data.total < 0.5 || data.avgScore < 70)
      .map(([category, data]: [string, any]) => ({ category, score: data.avgScore, completion: data.completed / data.total }));

    // System Recommendations
    const generateRecommendations = () => {
      const recommendations = [];
      
      if (avgConfidence < 60) {
        recommendations.push({
          type: 'confidence',
          priority: 'high',
          message: 'Focus on building confidence through repeated practice of mastered skills',
          action: 'Schedule additional practice sessions for completed skills'
        });
      }
      
      if (reflectionAnalysis.reflectionFrequency < 0.5) {
        recommendations.push({
          type: 'reflection',
          priority: 'medium',
          message: 'Increase reflection frequency to improve learning outcomes',
          action: 'Encourage reflection after each practice session'
        });
      }
      
      if (inProgressSkills > completedSkills * 1.5) {
        recommendations.push({
          type: 'focus',
          priority: 'high',
          message: 'Too many skills in progress simultaneously',
          action: 'Focus on completing current skills before starting new ones'
        });
      }
      
      improvementAreas.forEach(area => {
        recommendations.push({
          type: 'skill_development',
          priority: area.completion < 0.3 ? 'high' : 'medium',
          message: `Needs focused attention in ${area.category}`,
          action: `Develop targeted practice plan for ${area.category} skills`
        });
      });
      
      return recommendations;
    };

    return {
      totalSkills,
      completedSkills,
      inProgressSkills,
      notStartedSkills,
      masteredSkills,
      totalTime,
      totalSessions,
      avgSessionTime,
      avgConfidence,
      competencyLevels,
      skillsByCategory,
      skillsByDifficulty,
      reflectionAnalysis,
      feedbackAnalysis,
      recentActivity,
      learningTrends,
      strongCategories,
      improvementAreas,
      recommendations: generateRecommendations(),
      completionRate: totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0,
      masteryRate: totalSkills > 0 ? (masteredSkills / totalSkills) * 100 : 0,
      reflectionRate: student.reflections.length / Math.max(totalSkills, 1) * 100,
      avgSelfAssessment: student.progress.filter(p => p.selfAssessmentScore).length > 0 
        ? student.progress.reduce((sum, p) => sum + (p.selfAssessmentScore || 0), 0) / student.progress.filter(p => p.selfAssessmentScore).length
        : 0
    };
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
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Student not found</h3>
            <p className="text-muted-foreground text-center">
              The student you're looking for doesn't exist or you don't have permission to view their data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analytics = getDetailedAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <Link href="/lecturer/students">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Students
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comprehensive Student Analytics</h1>
              <p className="text-muted-foreground">
                Detailed performance analysis and insights for {student.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Student Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-2">
                <span>{student.email}</span>
                <span>•</span>
                <Badge variant="outline">{student.studentId}</Badge>
                <span>•</span>
                <span>Enrolled {new Date(student.createdAt).toLocaleDateString()}</span>
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {analytics?.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Completion</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {analytics?.masteryRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Mastery Rate</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="competency">Competency</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-600" />
                  Skills Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics?.completedSkills}/{analytics?.totalSkills}
                  </div>
                  <Progress value={analytics?.completionRate} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {analytics?.completionRate.toFixed(1)}% completion rate
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Award className="h-4 w-4 mr-2 text-yellow-600" />
                  Mastery Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analytics?.masteredSkills}/{analytics?.totalSkills}
                  </div>
                  <Progress value={analytics?.masteryRate} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {analytics?.masteryRate.toFixed(1)}% mastery rate
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-green-600" />
                  Practice Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((analytics?.totalTime || 0) / 60)}h
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analytics?.totalSessions} sessions
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg: {Math.round((analytics?.avgSessionTime || 0))}min/session
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics?.avgConfidence.toFixed(0)}%
                  </div>
                  <Progress value={analytics?.avgConfidence} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Average confidence level
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Skill Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                    <div>
                      <div className="font-semibold text-emerald-700">Mastered</div>
                      <div className="text-xl font-bold">{analytics?.masteredSkills}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <div>
                      <div className="font-semibold text-green-700">Completed</div>
                      <div className="text-xl font-bold">{(analytics?.completedSkills || 0) - (analytics?.masteredSkills || 0)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="font-semibold text-blue-700">In Progress</div>
                      <div className="text-xl font-bold">{analytics?.inProgressSkills}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <div>
                      <div className="font-semibold text-gray-700">Not Started</div>
                      <div className="text-xl font-bold">{analytics?.notStartedSkills}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Competency Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics?.competencyLevels || {}).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{level.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((count as number) / (analytics?.totalSkills || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Quick Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800">Strong Areas</span>
                  </div>
                  <div className="text-sm text-green-700">
                    {analytics?.strongCategories.length > 0 
                      ? analytics?.strongCategories.join(', ') 
                      : 'Building foundation skills'}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Reflection Activity</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    {analytics?.reflectionAnalysis.totalReflections} reflections submitted
                    <br />Avg rating: {analytics?.reflectionAnalysis.avgRating.toFixed(1)}/5
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-800">Focus Areas</span>
                  </div>
                  <div className="text-sm text-orange-700">
                    {analytics?.improvementAreas.length > 0
                      ? analytics?.improvementAreas.slice(0, 2).map(area => area.category).join(', ')
                      : 'All areas progressing well'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          {/* Progress by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Progress by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics?.skillsByCategory || {}).map(([category, data]: [string, any]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.completed}/{data.total} completed
                      </span>
                    </div>
                    <Progress value={(data.completed / data.total) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{data.completed} completed</span>
                      <span>{data.inProgress} in progress</span>
                      <span>{data.notStarted} not started</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress by Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Difficulty Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics?.skillsByDifficulty || {}).map(([difficulty, data]: [string, any]) => (
                  <div key={difficulty} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{difficulty}</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.completed}/{data.total} completed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {data.completed > 0 ? `${Math.round(data.avgTime)}min avg` : 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {data.completed > 0 ? `${data.avgScore.toFixed(1)}% avg score` : ''}
                        </div>
                      </div>
                    </div>
                    <Progress value={(data.completed / data.total) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competency" className="space-y-6">
          {/* Competency Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Medal className="h-5 w-5 mr-2" />
                Competency Level Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of skill competency levels across all areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(analytics?.skillsByCategory || {}).map(([category, data]: [string, any]) => (
                  <div key={category} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.completed}/{data.total} skills completed • {data.mastered} mastered
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {((data.completed / data.total) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Completion</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-green-600">{data.avgScore.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Avg Performance</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-purple-600">{data.avgConfidence.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Avg Confidence</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-orange-600">{Math.round(data.avgTime)}min</div>
                        <div className="text-xs text-muted-foreground">Avg Time</div>
                      </div>
                    </div>
                    
                    <Progress value={(data.completed / data.total) * 100} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Individual Skill Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Individual Skill Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.progress.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: skill.skill.category.colorCode }}
                      ></div>
                      <div>
                        <div className="font-medium">{skill.skill.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {skill.skill.category.name} • {skill.skill.difficultyLevel}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm font-bold">
                          {skill.competencyLevel?.replace('_', ' ') || 'NOVICE'}
                        </div>
                        <div className="text-xs text-muted-foreground">Competency</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-bold">{skill.confidenceLevel || 0}%</div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                      
                      <Badge variant={
                        skill.status === 'MASTERED' ? 'default' :
                        skill.status === 'COMPLETED' ? 'secondary' :
                        skill.status === 'IN_PROGRESS' ? 'outline' : 'destructive'
                      }>
                        {skill.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reflections" className="space-y-6">
          {/* Reflection Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Reflection Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Reflections</span>
                  <span className="font-bold text-lg">{analytics?.reflectionAnalysis.totalReflections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Rating</span>
                  <span className="font-bold text-lg">{analytics?.reflectionAnalysis.avgRating.toFixed(1)}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Private Reflections</span>
                  <span className="font-bold text-lg">{analytics?.reflectionAnalysis.privateReflections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reflection Frequency</span>
                  <span className="font-bold text-lg">{analytics?.reflectionAnalysis.reflectionFrequency.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Recent Reflections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.reflectionAnalysis.recentReflections.map((reflection) => (
                    <div key={reflection.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{reflection.skill.name}</div>
                        <div className="flex items-center space-x-1">
                          {[...Array(reflection.rating || 0)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {reflection.content}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(reflection.createdAt).toLocaleDateString()} •
                        {reflection.isPrivate ? ' Private' : ' Shared'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Instructor Feedback Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Instructor Feedback Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics?.feedbackAnalysis.totalFeedback}</div>
                  <div className="text-sm text-muted-foreground">Total Feedback</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics?.feedbackAnalysis.avgRating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics?.feedbackAnalysis.strengthsIdentified.length}</div>
                  <div className="text-sm text-muted-foreground">Strengths Noted</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{analytics?.feedbackAnalysis.improvementsNeeded.length}</div>
                  <div className="text-sm text-muted-foreground">Areas to Improve</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Identified Strengths
                  </h4>
                  <div className="space-y-2">
                    {analytics?.feedbackAnalysis.strengthsIdentified.slice(0, 5).map((strength, index) => (
                      <div key={index} className="p-2 bg-green-50 rounded text-sm border border-green-200">
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-700 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Improvement Areas
                  </h4>
                  <div className="space-y-2">
                    {analytics?.feedbackAnalysis.improvementsNeeded.slice(0, 5).map((improvement, index) => (
                      <div key={index} className="p-2 bg-orange-50 rounded text-sm border border-orange-200">
                        {improvement}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Learning Pattern Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Learning Pattern Analysis
              </CardTitle>
              <CardDescription>
                Detailed insights into learning behavior and performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Performance by Difficulty Level</h4>
                  <div className="space-y-3">
                    {Object.entries(analytics?.skillsByDifficulty || {}).map(([difficulty, data]: [string, any]) => (
                      <div key={difficulty} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{difficulty}</span>
                          <span className="text-sm text-muted-foreground">
                            {data.completed}/{data.total} completed
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <div className="font-semibold">{data.avgScore.toFixed(0)}%</div>
                            <div className="text-muted-foreground">Score</div>
                          </div>
                          <div>
                            <div className="font-semibold">{Math.round(data.avgTime)}min</div>
                            <div className="text-muted-foreground">Time</div>
                          </div>
                          <div>
                            <div className="font-semibold">{data.masteryRate.toFixed(0)}%</div>
                            <div className="text-muted-foreground">Mastery</div>
                          </div>
                        </div>
                        <Progress value={(data.completed / data.total) * 100} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Recent Learning Progression</h4>
                  <div className="space-y-3">
                    {analytics?.learningTrends.slice(-8).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{trend.skillName}</div>
                            <div className="text-xs text-muted-foreground">{trend.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{trend.score}%</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(trend.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* System Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                System-Generated Recommendations
              </CardTitle>
              <CardDescription>
                Personalized suggestions based on learning analytics and performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high' 
                        ? 'bg-red-50 border-red-500' 
                        : rec.priority === 'medium' 
                        ? 'bg-yellow-50 border-yellow-500' 
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {rec.priority === 'high' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          {rec.priority === 'medium' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                          {rec.priority === 'low' && <Lightbulb className="h-4 w-4 text-blue-600" />}
                          <Badge 
                            variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {rec.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{rec.message}</h4>
                        <p className="text-sm text-muted-foreground">{rec.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Suggested Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Immediate Actions (Next 1-2 weeks)</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {analytics?.recommendations
                      .filter(r => r.priority === 'high')
                      .slice(0, 3)
                      .map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span>•</span>
                          <span>{rec.action}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Medium-term Goals (Next month)</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {analytics?.recommendations
                      .filter(r => r.priority === 'medium')
                      .slice(0, 3)
                      .map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span>•</span>
                          <span>{rec.action}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Long-term Development</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Continue building confidence through repeated practice</li>
                    <li>• Focus on advanced skill development once fundamentals are mastered</li>
                    <li>• Maintain consistent reflection practice for deeper learning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}