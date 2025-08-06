'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  Target,
  BookOpen,
  Trophy
} from 'lucide-react';
import Link from 'next/link';

interface MasteryData {
  masteredSkills: any[];
  inProgressSkills: any[];
  masteryRequests: any[];
  stats: {
    masteredCount: number;
    inProgressCount: number;
    pendingRequestsCount: number;
    approvedRequestsCount: number;
    rejectedRequestsCount: number;
    totalPracticeTime: number;
    totalAttempts: number;
  };
  recentActivity: any[];
}

export default function StudentMasteryPage() {
  const [masteryData, setMasteryData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mastered');

  useEffect(() => {
    fetchMasteryData();
  }, []);

  const fetchMasteryData = async () => {
    try {
      const response = await fetch('/api/student/mastery');
      const data = await response.json();
      if (data.success) {
        setMasteryData(data.mastery);
      }
    } catch (error) {
      console.error('Error fetching mastery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMastery = async (skillId: number) => {
    try {
      const response = await fetch('/api/mastery-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId,
          requestMessage: 'I believe I have sufficient practice and understanding of this skill.',
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh data
        fetchMasteryData();
        alert('Mastery request submitted successfully! Instructors have been notified.');
      } else {
        alert(result.error || 'Failed to submit mastery request');
      }
    } catch (error) {
      console.error('Error submitting mastery request:', error);
      alert('Failed to submit mastery request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!masteryData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No mastery data available
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start practicing skills to see your mastery progress.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl" />
            <div className="relative">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    My Mastery Progress
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                    Track your skill mastery journey and request competency assessments
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {masteryData.stats.masteredCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Skills Mastered</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {masteryData.stats.inProgressCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">In Progress</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatTime(masteryData.stats.totalPracticeTime)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Practice Time</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {masteryData.stats.totalAttempts}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Attempts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="mastered" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Skills Mastered ({masteryData.stats.masteredCount})</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Ready for Mastery ({masteryData.stats.inProgressCount})</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>My Requests ({masteryData.masteryRequests.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Mastered Skills Tab */}
          <TabsContent value="mastered">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masteryData.masteredSkills.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No skills mastered yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete your practice and request mastery assessment to see skills here.
                  </p>
                </div>
              ) : (
                masteryData.masteredSkills.map((progress) => (
                  <Card key={progress.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: progress.skill.category?.colorCode }}
                          />
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <Star className="h-3 w-3 mr-1" />
                            Mastered
                          </Badge>
                        </div>
                        <Calendar className="h-4 w-4 text-gray-500" />
                      </div>
                      <CardTitle className="text-lg">{progress.skill.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {progress.skill.category?.name} • Mastered on{' '}
                        {new Date(progress.completionDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Practice Time:</span>
                          <span>{formatTime(progress.totalTimeSpentMinutes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Attempts:</span>
                          <span>{progress.totalAttempts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Complete Attempts:</span>
                          <span>{progress.completeAttempts}</span>
                        </div>
                      </div>
                      <Link href={`/student/skills/${progress.skill.id}`} className="block mt-4">
                        <Button variant="outline" className="w-full">
                          View Skill Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Skills Ready for Mastery Tab */}
          <TabsContent value="progress">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masteryData.inProgressSkills.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No skills ready for mastery
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete at least one full practice session (including quiz) to request mastery.
                  </p>
                </div>
              ) : (
                masteryData.inProgressSkills.map((progress) => {
                  const hasActiveRequest = masteryData.masteryRequests.some(
                    req => req.skillId === progress.skillId && ['PENDING', 'UNDER_REVIEW'].includes(req.status)
                  );
                  
                  return (
                    <Card key={progress.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: progress.skill.category?.colorCode }}
                            />
                            <Badge className={progress.status === 'COMPLETED' ? 
                              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            }>
                              {progress.status === 'COMPLETED' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {progress.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{progress.skill.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {progress.skill.category?.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex justify-between">
                            <span>Complete Attempts:</span>
                            <span className="font-medium">{progress.completeAttempts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Practice Time:</span>
                            <span>{formatTime(progress.completeTimeMinutes)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Practice:</span>
                            <span>
                              {progress.lastAttemptDate 
                                ? new Date(progress.lastAttemptDate).toLocaleDateString()
                                : 'Never'
                              }
                            </span>
                          </div>
                        </div>
                        
                        {hasActiveRequest ? (
                          <Badge className="w-full justify-center py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Mastery Request Pending
                          </Badge>
                        ) : (
                          <Button 
                            onClick={() => handleRequestMastery(progress.skillId)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            disabled={progress.completeAttempts === 0}
                          >
                            <Award className="h-4 w-4 mr-2" />
                            Request Mastery Assessment
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Mastery Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-4">
              {masteryData.masteryRequests.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No mastery requests yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Submit your first mastery request when you feel confident about a skill.
                  </p>
                </div>
              ) : (
                masteryData.masteryRequests.map((request) => (
                  <Card key={request.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: request.skill.category?.colorCode }}
                          />
                          <div>
                            <CardTitle className="text-lg">{request.skill.name}</CardTitle>
                            <CardDescription>{request.skill.category?.name}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Requested</div>
                          <div className="font-medium">
                            {new Date(request.requestDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Practice Time</div>
                          <div className="font-medium">{formatTime(request.totalPracticeTime)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Attempts</div>
                          <div className="font-medium">{request.totalAttempts}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Avg Score</div>
                          <div className="font-medium">
                            {request.averageScore ? `${Math.round(request.averageScore)}%` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      {request.instructorNotes && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-4">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Instructor Feedback:
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {request.instructorNotes}
                          </div>
                          {request.instructor && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              - {request.instructor.name}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}