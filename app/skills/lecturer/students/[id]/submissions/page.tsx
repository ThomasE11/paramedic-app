'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  FileCheck,
  Video,
  MessageSquare,
  Star,
  Clock,
  Calendar,
  Play,
  Download,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  TrendingUp,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface Submission {
  id: string;
  type: 'REFLECTION' | 'VIDEO' | 'PROGRESS_UPDATE';
  title: string;
  skillName: string;
  skillCategory: {
    name: string;
    colorCode: string;
  };
  content?: string;
  videoUrl?: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'NEEDS_REVISION';
  rating?: number;
  submittedAt: string;
  reviewedAt?: string;
  lecturerFeedback?: string;
  metadata: {
    duration?: number;
    fileSize?: number;
    attempts?: number;
    score?: number;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
}

export default function StudentSubmissions() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
    fetchSubmissions();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      // Mock student data
      const mockStudent: Student = {
        id: studentId,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        studentId: 'STU001'
      };
      
      setStudent(mockStudent);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // Mock submissions data
      const mockSubmissions: Submission[] = [
        {
          id: 'sub-1',
          type: 'REFLECTION',
          title: 'CPR Practice Reflection',
          skillName: 'CPR Adult',
          skillCategory: { name: 'Basic Life Support', colorCode: '#3B82F6' },
          content: 'Today I practiced CPR and felt much more confident with my technique. The compression depth has improved significantly, and I was able to maintain the correct rate throughout the session.',
          status: 'PENDING',
          submittedAt: '2024-12-19T10:30:00Z',
          metadata: {
            attempts: 3,
            score: 88
          }
        },
        {
          id: 'sub-2',
          type: 'VIDEO',
          title: 'AED Use Demonstration',
          skillName: 'AED Use',
          skillCategory: { name: 'Basic Life Support', colorCode: '#3B82F6' },
          videoUrl: '/videos/aed-demo-sarah.mp4',
          status: 'REVIEWED',
          rating: 4,
          submittedAt: '2024-12-18T14:15:00Z',
          reviewedAt: '2024-12-18T16:20:00Z',
          lecturerFeedback: 'Excellent demonstration! Your pad placement was perfect and voice commands were clear. Consider working on faster initial assessment.',
          metadata: {
            duration: 180,
            fileSize: 45000000
          }
        },
        {
          id: 'sub-3',
          type: 'PROGRESS_UPDATE',
          title: 'IV Insertion Practice Session',
          skillName: 'IV Insertion',
          skillCategory: { name: 'Advanced Life Support', colorCode: '#EF4444' },
          content: 'Attempted IV insertion 4 times today. Still struggling with vein palpation but sterile technique is improving.',
          status: 'APPROVED',
          rating: 3,
          submittedAt: '2024-12-17T09:45:00Z',
          reviewedAt: '2024-12-17T11:30:00Z',
          lecturerFeedback: 'Good progress on sterile technique. Schedule additional practice sessions for palpation skills.',
          metadata: {
            attempts: 4,
            score: 65
          }
        },
        {
          id: 'sub-4',
          type: 'REFLECTION',
          title: 'Vital Signs Assessment',
          skillName: 'Vital Signs Assessment',
          skillCategory: { name: 'Patient Assessment', colorCode: '#8B5CF6' },
          content: 'Today\'s vital signs practice went well. I was able to take accurate measurements and understand normal ranges better.',
          status: 'NEEDS_REVISION',
          rating: 2,
          submittedAt: '2024-12-16T13:20:00Z',
          reviewedAt: '2024-12-16T15:45:00Z',
          lecturerFeedback: 'Please provide more detail about specific techniques used and areas for improvement. Include numerical values where possible.',
          metadata: {
            attempts: 2,
            score: 72
          }
        }
      ];
      
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission || !feedback.trim()) return;

    try {
      // Update submission with feedback
      const updatedSubmissions = submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? { 
              ...sub, 
              status: 'REVIEWED' as const,
              rating,
              lecturerFeedback: feedback,
              reviewedAt: new Date().toISOString()
            }
          : sub
      );
      
      setSubmissions(updatedSubmissions);
      setSelectedSubmission(null);
      setFeedback('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-300';
      case 'NEEDS_REVISION': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      case 'REVIEWED': return <Eye className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'NEEDS_REVISION': return <XCircle className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REFLECTION': return <MessageSquare className="h-4 w-4" />;
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'PROGRESS_UPDATE': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filterType !== 'all' && submission.type !== filterType) return false;
    if (filterStatus !== 'all' && submission.status !== filterStatus) return false;
    return true;
  });

  const submissionStats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'PENDING').length,
    reviewed: submissions.filter(s => s.status === 'REVIEWED').length,
    approved: submissions.filter(s => s.status === 'APPROVED').length,
    needsRevision: submissions.filter(s => s.status === 'NEEDS_REVISION').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/lecturer/students/${studentId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Student
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Submissions</h1>
            <p className="text-muted-foreground">
              Review and provide feedback on {student?.name}'s submissions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileCheck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{submissionStats.total}</div>
            <div className="text-sm text-blue-600">Total Submissions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-800">{submissionStats.pending}</div>
            <div className="text-sm text-yellow-600">Pending Review</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{submissionStats.reviewed}</div>
            <div className="text-sm text-blue-600">Reviewed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{submissionStats.approved}</div>
            <div className="text-sm text-green-600">Approved</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-800">{submissionStats.needsRevision}</div>
            <div className="text-sm text-red-600">Needs Revision</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="REFLECTION">Reflections</SelectItem>
                  <SelectItem value="VIDEO">Videos</SelectItem>
                  <SelectItem value="PROGRESS_UPDATE">Progress Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="NEEDS_REVISION">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Submissions ({filteredSubmissions.length})</h2>
          
          {filteredSubmissions.map((submission) => (
            <Card 
              key={submission.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedSubmission?.id === submission.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => setSelectedSubmission(submission)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: submission.skillCategory.colorCode }}
                    />
                    <div>
                      <CardTitle className="text-lg">{submission.title}</CardTitle>
                      <p className="text-sm text-gray-600">{submission.skillName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(submission.type)}
                      <span>{submission.type.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {submission.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{submission.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submission Details & Feedback */}
        <div className="sticky top-6">
          {selectedSubmission ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Review Submission</span>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    {selectedSubmission.status.replace('_', ' ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Submission Content */}
                <div>
                  <h4 className="font-medium mb-2">{selectedSubmission.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedSubmission.skillName} • {selectedSubmission.skillCategory.name}
                  </p>
                  
                  {selectedSubmission.type === 'VIDEO' ? (
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <Video className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-3">Video Submission</p>
                      <div className="flex justify-center space-x-2">
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      {selectedSubmission.metadata.duration && (
                        <p className="text-xs text-gray-500 mt-2">
                          Duration: {Math.round(selectedSubmission.metadata.duration / 60)}:{(selectedSubmission.metadata.duration % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm leading-relaxed">{selectedSubmission.content}</p>
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <p className="text-gray-600">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                    </div>
                    {selectedSubmission.metadata.score && (
                      <div>
                        <span className="font-medium">Score:</span>
                        <p className="text-gray-600">{selectedSubmission.metadata.score}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Existing Feedback */}
                {selectedSubmission.lecturerFeedback && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Previous Feedback</span>
                      {selectedSubmission.rating && (
                        <div className="flex items-center space-x-1 ml-auto">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < selectedSubmission.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-blue-700">{selectedSubmission.lecturerFeedback}</p>
                    {selectedSubmission.reviewedAt && (
                      <p className="text-xs text-blue-600 mt-2">
                        Reviewed: {new Date(selectedSubmission.reviewedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Feedback Form */}
                {selectedSubmission.status === 'PENDING' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Rating (1-5 stars)
                      </label>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setRating(i + 1)}
                            className="transition-colors"
                          >
                            <Star 
                              className={`h-6 w-6 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Feedback
                      </label>
                      <Textarea
                        placeholder="Provide detailed feedback on the student's submission..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSubmitFeedback}
                        disabled={!feedback.trim() || rating === 0}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedSubmission(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a submission</h3>
                <p className="text-gray-600 text-center">
                  Choose a submission from the list to review and provide feedback
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}