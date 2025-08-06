'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, Calendar, BookOpen, TrendingUp, Target, CheckCircle, AlertCircle } from 'lucide-react';

interface FeedbackItem {
  id: string;
  skillId: string;
  skillName: string;
  skillCategory: {
    id: string;
    name: string;
    colorCode: string;
  };
  lecturerName: string;
  type: 'PRACTICAL' | 'THEORETICAL' | 'GENERAL';
  rating: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  comments: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StudentFeedback() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      // Mock feedback data for students
      const mockFeedback: FeedbackItem[] = [
        {
          id: 'feedback-1',
          skillId: 'skill-1',
          skillName: 'CPR Adult',
          skillCategory: {
            id: 'bls-1',
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          },
          lecturerName: 'Dr. Sarah Johnson',
          type: 'PRACTICAL',
          rating: 4,
          strengths: [
            'Excellent compression depth (5-6cm)',
            'Maintained proper rate (110 bpm)',
            'Good hand positioning throughout'
          ],
          improvements: [
            'Allow complete chest recoil between compressions',
            'Minimize interruptions during cycles'
          ],
          nextSteps: [
            'Practice with metronome for consistent timing',
            'Work on endurance to maintain quality longer'
          ],
          comments: 'Great improvement since last session! You\'re showing real confidence with the technique. Focus on the chest recoil and you\'ll be at expert level soon.',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'feedback-2',
          skillId: 'skill-2',
          skillName: 'AED Use',
          skillCategory: {
            id: 'bls-1',
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          },
          lecturerName: 'Prof. Michael Chen',
          type: 'PRACTICAL',
          rating: 5,
          strengths: [
            'Perfect pad placement',
            'Clear voice commands',
            'Followed all safety protocols',
            'Excellent timing with CPR cycles'
          ],
          improvements: [],
          nextSteps: [
            'Ready for advanced scenarios',
            'Consider peer mentoring opportunities'
          ],
          comments: 'Outstanding performance! You demonstrated mastery of AED use. Your safety awareness and communication were exemplary.',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'feedback-3',
          skillId: 'skill-3',
          skillName: 'IV Insertion',
          skillCategory: {
            id: 'als-1',
            name: 'Advanced Life Support',
            colorCode: '#EF4444',
          },
          lecturerName: 'Dr. Emily Rodriguez',
          type: 'PRACTICAL',
          rating: 3,
          strengths: [
            'Good sterile technique',
            'Proper equipment preparation',
            'Patient communication'
          ],
          improvements: [
            'Palpation technique needs refinement',
            'Needle insertion angle',
            'Confidence during procedure'
          ],
          nextSteps: [
            'Additional practice on training arms',
            'Review anatomy videos',
            'Practice with different vein types'
          ],
          comments: 'You\'re on the right track! IV insertion is challenging and requires lots of practice. Your sterile technique is excellent - now we need to work on the technical aspects.',
          isRead: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'feedback-4',
          skillId: 'general',
          skillName: 'General Performance',
          skillCategory: {
            id: 'general',
            name: 'Overall Assessment',
            colorCode: '#10B981',
          },
          lecturerName: 'Dr. Sarah Johnson',
          type: 'GENERAL',
          rating: 4,
          strengths: [
            'Consistent attendance and punctuality',
            'Proactive in asking questions',
            'Good teamwork skills',
            'Shows genuine care for patient safety'
          ],
          improvements: [
            'Study more between practical sessions',
            'Practice skills at home when possible'
          ],
          nextSteps: [
            'Prepare for upcoming assessments',
            'Consider additional certification courses'
          ],
          comments: 'You\'re developing into a skilled paramedic. Your attitude and dedication are commendable. Keep up the excellent work!',
          isRead: true,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
        }
      ];
      
      setFeedbackItems(mockFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (feedbackId: string) => {
    setFeedbackItems(prev => 
      prev.map(item => 
        item.id === feedbackId ? { ...item, isRead: true } : item
      )
    );
  };

  const filteredFeedback = feedbackItems.filter(item => {
    if (selectedSkill !== 'all' && item.skillId !== selectedSkill) {
      return false;
    }
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    return true;
  });

  const uniqueSkills = Array.from(new Set(feedbackItems.map(item => ({ id: item.skillId, name: item.skillName }))));

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PRACTICAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'THEORETICAL': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'GENERAL': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = feedbackItems.filter(item => !item.isRead).length;
  const averageRating = feedbackItems.length > 0 
    ? feedbackItems.reduce((sum, item) => sum + item.rating, 0) / feedbackItems.length 
    : 0;

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
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border/50">
        <h1 className="text-3xl font-bold text-foreground">My Feedback</h1>
        <p className="text-muted-foreground mt-2">
          Review feedback from instructors to track your progress and identify areas for improvement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{feedbackItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">New Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{feedbackItems.filter(item => item.rating >= 4).length}</p>
                <p className="text-sm text-muted-foreground">High Ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Skill
              </label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {uniqueSkills.map(skill => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Type
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PRACTICAL">Practical</SelectItem>
                  <SelectItem value="THEORETICAL">Theoretical</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedSkill('all');
                  setSelectedType('all');
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <Card 
            key={feedback.id} 
            className={`hover:shadow-md transition-shadow ${
              !feedback.isRead ? 'ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50/50 dark:bg-blue-900/10' : ''
            }`}
            onClick={() => !feedback.isRead && markAsRead(feedback.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: feedback.skillCategory.colorCode }}
                  />
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>{feedback.skillName}</span>
                      {!feedback.isRead && (
                        <Badge variant="destructive" className="text-xs">NEW</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <span>From: {feedback.lecturerName}</span>
                      <span>•</span>
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(feedback.createdAt)}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(feedback.type)}>
                    {feedback.type}
                  </Badge>
                  <div className={`flex items-center ${getRatingColor(feedback.rating)}`}>
                    {[...Array(feedback.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    {[...Array(5 - feedback.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    ))}
                    <span className="ml-1 text-sm">({feedback.rating}/5)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Comments */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Instructor Comments</h4>
                  <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">{feedback.comments}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Strengths */}
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Strengths
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Areas for Improvement */}
                  <div>
                    <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      Areas to Improve
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {feedback.improvements.length > 0 ? (
                        feedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            {improvement}
                          </li>
                        ))
                      ) : (
                        <li className="text-green-600 dark:text-green-400 italic">No areas for improvement identified!</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Next Steps */}
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Next Steps
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {feedback.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <Badge variant="outline">
                    {feedback.skillCategory.name}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Rating: {feedback.rating}/5 stars
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No feedback found</h3>
            <p className="text-muted-foreground text-center">
              {feedbackItems.length === 0 
                ? "You haven't received any feedback yet. Complete some practical sessions to start receiving instructor feedback!"
                : "No feedback matches your current filters. Try adjusting your criteria."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}