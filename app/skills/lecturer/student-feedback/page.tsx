
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  MessageSquare, 
  Video, 
  TrendingUp, 
  Star, 
  Calendar, 
  Clock, 
  User,
  BookOpen,
  BarChart3,
  Eye,
  Filter
} from 'lucide-react';

interface StudentFeedback {
  reflections: any[];
  videoSessions: any[];
  progressData: any[];
  summary: {
    totalReflections: number;
    totalVideoSessions: number;
    totalProgress: number;
    totalStudents: number;
    totalSkills: number;
  };
  filters: {
    students: any[];
    skills: any[];
  };
  pagination: {
    currentPage: number;
    limit: number;
    hasMore: boolean;
  };
}

export default function StudentFeedbackDashboard() {
  const [feedbackData, setFeedbackData] = useState<StudentFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReflection, setSelectedReflection] = useState<any>(null);
  const [selectedVideoSession, setSelectedVideoSession] = useState<any>(null);

  useEffect(() => {
    fetchFeedbackData();
  }, [selectedStudentId, selectedSkillId]);

  const fetchFeedbackData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStudentId && selectedStudentId !== 'all') params.append('studentId', selectedStudentId);
      if (selectedSkillId && selectedSkillId !== 'all') params.append('skillId', selectedSkillId);
      
      const response = await fetch(`/api/lecturer/student-feedback?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeedbackData(data);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      // Set empty data structure if API fails
      setFeedbackData({
        reflections: [],
        videoSessions: [],
        progressData: [],
        summary: {
          totalReflections: 0,
          totalVideoSessions: 0,
          totalProgress: 0,
          totalStudents: 0,
          totalSkills: 0,
        },
        filters: {
          students: [],
          skills: [],
        },
        pagination: {
          currentPage: 1,
          limit: 20,
          hasMore: false,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'MASTERED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'PROCESSING': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!feedbackData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Failed to load feedback data</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border/50">
        <h1 className="text-3xl font-bold text-foreground">Student Feedback Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive view of student reflections, AI analysis, and progress data
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
              Reflections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {feedbackData.summary.totalReflections}
            </div>
            <p className="text-xs text-muted-foreground">Total submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Video className="h-4 w-4 mr-2 text-purple-600" />
              Video Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {feedbackData.summary.totalVideoSessions}
            </div>
            <p className="text-xs text-muted-foreground">AI analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Progress Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {feedbackData.summary.totalProgress}
            </div>
            <p className="text-xs text-muted-foreground">Practice sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <User className="h-4 w-4 mr-2 text-orange-600" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {feedbackData.summary.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-red-600" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {feedbackData.summary.totalSkills}
            </div>
            <p className="text-xs text-muted-foreground">Available skills</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {feedbackData.filters.students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.studentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {feedbackData.filters.skills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id.toString()}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedStudentId('');
                setSelectedSkillId('');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="reflections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reflections">Student Reflections</TabsTrigger>
          <TabsTrigger value="video-analysis">AI Video Analysis</TabsTrigger>
          <TabsTrigger value="progress">Progress Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="reflections" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {feedbackData.reflections.map((reflection) => (
              <Card key={reflection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{reflection.user.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <span>{reflection.user.studentId}</span>
                          <span>•</span>
                          <span>{reflection.skill.name}</span>
                          <span>•</span>
                          <span>{formatDate(reflection.createdAt)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(reflection.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Reflection Details</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-96">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Student: {reflection.user.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Skill: {reflection.skill.name} • {formatDate(reflection.createdAt)}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Overall Reflection</h4>
                                <p className="text-sm">{reflection.content}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">What Went Well</h4>
                                <p className="text-sm">{reflection.whatWentWell}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Areas for Improvement</h4>
                                <p className="text-sm">{reflection.whatToimprove}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Future Goals</h4>
                                <p className="text-sm">{reflection.futureGoals}</p>
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: reflection.skill.category.colorCode }}
                      />
                      <Badge variant="secondary">{reflection.skill.category.name}</Badge>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{reflection.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {feedbackData.reflections.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reflections found</h3>
                <p className="text-muted-foreground text-center">
                  No student reflections match your current filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="video-analysis" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {feedbackData.videoSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Video className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{session.user.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <span>{session.user.studentId}</span>
                          <span>•</span>
                          <span>{session.skill.name}</span>
                          <span>•</span>
                          <span>{formatDate(session.createdAt)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.analysisResults.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Analysis
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>AI Analysis Results</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-96">
                              {session.analysisResults.map((result: any) => (
                                <div key={result.id} className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Performance Scores</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Overall</p>
                                        <p className="text-lg font-semibold">{result.overallScore.toFixed(1)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Technique</p>
                                        <p className="text-lg font-semibold">{result.techniqueScore.toFixed(1)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Sequence</p>
                                        <p className="text-lg font-semibold">{result.sequenceScore.toFixed(1)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Timing</p>
                                        <p className="text-lg font-semibold">{result.timingScore.toFixed(1)}%</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">AI Feedback</h4>
                                    <p className="text-sm">{result.overallFeedback}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Strengths</h4>
                                    <ul className="text-sm space-y-1">
                                      {result.strengths.map((strength: string, index: number) => (
                                        <li key={index} className="flex items-center space-x-2">
                                          <span className="text-green-600">•</span>
                                          <span>{strength}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Areas for Improvement</h4>
                                    <ul className="text-sm space-y-1">
                                      {result.areasForImprovement.map((area: string, index: number) => (
                                        <li key={index} className="flex items-center space-x-2">
                                          <span className="text-orange-600">•</span>
                                          <span>{area}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: session.skill.category.colorCode }}
                      />
                      <Badge variant="secondary">{session.skill.category.name}</Badge>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(session.videoDuration / 60)}:{(session.videoDuration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    {session.analysisResults.length > 0 && (
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Overall Score: </span>
                          <span className="font-semibold text-blue-600">
                            {session.analysisResults[0].overallScore.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Technique: </span>
                          <span className="font-semibold text-green-600">
                            {session.analysisResults[0].techniqueScore.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {feedbackData.videoSessions.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No video sessions found</h3>
                <p className="text-muted-foreground text-center">
                  No AI video analysis sessions match your current filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {feedbackData.progressData.map((progress) => (
              <Card key={progress.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{progress.user.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <span>{progress.user.studentId}</span>
                          <span>•</span>
                          <span>{progress.skill.name}</span>
                          <span>•</span>
                          <span>{formatDate(progress.updatedAt)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(progress.status)}>
                        {progress.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: progress.skill.category.colorCode }}
                      />
                      <Badge variant="secondary">{progress.skill.category.name}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Attempts</p>
                        <p className="font-semibold">{progress.attempts}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Time Spent</p>
                        <p className="font-semibold">{Math.round(progress.timeSpentMinutes / 60)}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed Steps</p>
                        <p className="font-semibold">{progress.completedSteps.length}</p>
                      </div>
                    </div>
                    {progress.instructorNotes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Instructor Notes:</p>
                        <p className="text-sm">{progress.instructorNotes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {feedbackData.progressData.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No progress data found</h3>
                <p className="text-muted-foreground text-center">
                  No student progress data matches your current filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
