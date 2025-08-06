
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Filter,
  Eye,
  MessageCircle,
  Send,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SubmissionData {
  submissions: any[];
  summary: {
    total: number;
    reflections: number;
    videoSessions: number;
    progressUpdates: number;
  };
  filters: {
    students: any[];
    skills: any[];
  };
  pagination: {
    currentPage: number;
    limit: number;
    hasMore: boolean;
    totalPages: number;
  };
}

export default function StudentSubmissionsPage() {
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedStudentId, selectedSkillId, selectedType, selectedStatus, sortBy, sortOrder, currentPage]);

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        sortBy,
        sortOrder,
      });
      
      if (selectedStudentId && selectedStudentId !== 'all') params.append('studentId', selectedStudentId);
      if (selectedSkillId && selectedSkillId !== 'all') params.append('skillId', selectedSkillId);
      if (selectedType && selectedType !== 'all') params.append('type', selectedType);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);
      
      const response = await fetch(`/api/lecturer/student-submissions?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSubmissionData(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      // Set empty data structure if API fails
      setSubmissionData({
        submissions: [],
        summary: {
          total: 0,
          reflections: 0,
          videoSessions: 0,
          progressUpdates: 0,
        },
        filters: {
          students: [],
          skills: [],
        },
        pagination: {
          currentPage: 1,
          limit: 20,
          hasMore: false,
          totalPages: 1,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!selectedSubmission || !comment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await fetch('/api/lecturer/instructor-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          submissionType: selectedSubmission.type,
          comment: comment.trim(),
        }),
      });
      
      setComment('');
      // Refresh submissions to show updated data
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reflection': return <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'video': return <Video className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'progress': return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      default: return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'mastered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const filteredSubmissions = submissionData?.submissions?.filter(submission => {
    if (!searchTerm) return true;
    return (
      submission.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Failed to load submissions</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border/50">
        <h1 className="text-3xl font-bold text-foreground">Student Submissions</h1>
        <p className="text-muted-foreground mt-2">
          Review student reflections, video analyses, and progress updates
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {submissionData.summary.total}
            </div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
              Reflections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {submissionData.summary.reflections}
            </div>
            <p className="text-xs text-muted-foreground">Student reflections</p>
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
              {submissionData.summary.videoSessions}
            </div>
            <p className="text-xs text-muted-foreground">AI analyzed videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-600" />
              Progress Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {submissionData.summary.progressUpdates}
            </div>
            <p className="text-xs text-muted-foreground">Completed skills</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Submission type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reflections">Reflections</SelectItem>
                <SelectItem value="video">Video Sessions</SelectItem>
                <SelectItem value="progress">Progress Updates</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {submissionData.filters.students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
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
                {submissionData.filters.skills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id.toString()}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="name">Student Name</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedType('all');
                setSelectedStudentId('all');
                setSelectedSkillId('all');
                setSelectedStatus('all');
                setSearchTerm('');
                setSortBy('createdAt');
                setSortOrder('desc');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <Card key={`${submission.type}-${submission.id}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getTypeIcon(submission.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{submission.user.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{submission.user.studentId}</span>
                      <span>•</span>
                      <span>{submission.skill.name}</span>
                      <span>•</span>
                      <span>{formatDate(submission.submissionDate)}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {submission.type}
                  </Badge>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status.replace('_', ' ')}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          {getTypeIcon(submission.type)}
                          <span>{submission.title}</span>
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[600px]">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {submission.type}
                            </Badge>
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(submission.submissionDate)}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Student: {submission.user.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ID: {submission.user.studentId} • Email: {submission.user.email}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Skill</h4>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: submission.skill.category.colorCode }}
                              />
                              <span className="text-sm">{submission.skill.name}</span>
                              <Badge variant="secondary">{submission.skill.category.name}</Badge>
                            </div>
                          </div>

                          {submission.type === 'reflection' && (
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium mb-2">Overall Rating</h4>
                                <div className="flex items-center space-x-1">
                                  {[...Array(submission.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({submission.rating}/5)
                                  </span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Overall Reflection</h4>
                                <p className="text-sm whitespace-pre-wrap">{submission.content}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">What Went Well</h4>
                                <p className="text-sm whitespace-pre-wrap">{submission.whatWentWell}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Areas for Improvement</h4>
                                <p className="text-sm whitespace-pre-wrap">{submission.whatToimprove}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Future Goals</h4>
                                <p className="text-sm whitespace-pre-wrap">{submission.futureGoals}</p>
                              </div>
                            </div>
                          )}

                          {submission.type === 'video' && (
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium mb-2">Video Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Duration</p>
                                    <p className="font-medium">
                                      {Math.floor(submission.videoDuration / 60)}:{(submission.videoDuration % 60).toString().padStart(2, '0')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(submission.status)}>
                                      {submission.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {submission.analysisResults && submission.analysisResults.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">AI Analysis Results</h4>
                                  {submission.analysisResults.map((result: any) => (
                                    <div key={result.id} className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Overall Score</p>
                                          <p className="text-lg font-semibold text-blue-600">{result.overallScore.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Technique Score</p>
                                          <p className="text-lg font-semibold text-green-600">{result.techniqueScore.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Sequence Score</p>
                                          <p className="text-lg font-semibold text-purple-600">{result.sequenceScore.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Timing Score</p>
                                          <p className="text-lg font-semibold text-orange-600">{result.timingScore.toFixed(1)}%</p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground mb-1">AI Feedback</p>
                                        <p className="text-sm">{result.overallFeedback}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground mb-1">Strengths</p>
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
                                        <p className="text-sm text-muted-foreground mb-1">Areas for Improvement</p>
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
                                </div>
                              )}
                            </div>
                          )}

                          {submission.type === 'progress' && (
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium mb-2">Progress Information</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Attempts</p>
                                    <p className="font-medium">{submission.attempts}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Time Spent</p>
                                    <p className="font-medium">{Math.round(submission.timeSpentMinutes / 60)}h {submission.timeSpentMinutes % 60}m</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Completed Steps</p>
                                    <p className="font-medium">{submission.completedSteps?.length || 0}</p>
                                  </div>
                                </div>
                              </div>
                              {submission.instructorNotes && (
                                <div>
                                  <h4 className="font-medium mb-2">Previous Instructor Notes</h4>
                                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                                    {submission.instructorNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Instructor Comment Section */}
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-3 flex items-center">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Add Instructor Feedback
                            </h4>
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Add your feedback for the student..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="min-h-[80px]"
                              />
                              <Button 
                                onClick={submitComment}
                                disabled={!comment.trim() || isSubmittingComment}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {isSubmittingComment ? 'Sending...' : 'Send Feedback'}
                              </Button>
                            </div>
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
                    style={{ backgroundColor: submission.skill.category.colorCode }}
                  />
                  <Badge variant="secondary">{submission.skill.category.name}</Badge>
                </div>
                <div className="text-sm text-foreground">
                  {submission.type === 'reflection' && (
                    <div className="flex items-center space-x-2">
                      <span>Rating:</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(submission.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  )}
                  {submission.type === 'video' && submission.analysisResults?.length > 0 && (
                    <div className="flex items-center space-x-4">
                      <span>Overall Score: {submission.analysisResults[0].overallScore.toFixed(1)}%</span>
                      <span>Technique: {submission.analysisResults[0].techniqueScore.toFixed(1)}%</span>
                    </div>
                  )}
                  {submission.type === 'progress' && (
                    <div className="flex items-center space-x-4">
                      <span>{submission.attempts} attempts</span>
                      <span>{Math.round(submission.timeSpentMinutes / 60)}h practiced</span>
                    </div>
                  )}
                </div>
                {submission.instructorNotes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Instructor Notes: </span>
                    <span className="line-clamp-1">{submission.instructorNotes}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {submissionData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {submissionData.pagination.currentPage} of {submissionData.pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(submissionData.pagination.totalPages, prev + 1))}
              disabled={currentPage === submissionData.pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {filteredSubmissions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No submissions found</h3>
            <p className="text-muted-foreground text-center">
              {submissionData.submissions.length === 0
                ? "No student submissions available yet."
                : "No submissions match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
