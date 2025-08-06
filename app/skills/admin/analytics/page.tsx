'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock, 
  Target,
  Activity,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  userActivity: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
  };
  skillsData: {
    totalSkills: number;
    completedSkills: number;
    averageScore: number;
    popularSkills: Array<{name: string; completions: number}>;
  };
  engagementMetrics: {
    avgSessionDuration: string;
    totalSessions: number;
    reflectionCount: number;
    videoAnalyses: number;
  };
  performanceMetrics: {
    passRate: number;
    averageAttempts: number;
    improvementRate: number;
  };
}

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userActivity: {
      totalUsers: 156,
      activeUsers: 89,
      newUsers: 12,
      userGrowth: 8.2
    },
    skillsData: {
      totalSkills: 88,
      completedSkills: 1247,
      averageScore: 82.3,
      popularSkills: [
        { name: 'CPR & Defibrillation', completions: 89 },
        { name: 'IV Access', completions: 76 },
        { name: 'Airway Management', completions: 68 },
        { name: 'Trauma Assessment', completions: 54 },
        { name: 'ECG Interpretation', completions: 47 }
      ]
    },
    engagementMetrics: {
      avgSessionDuration: '24m 18s',
      totalSessions: 342,
      reflectionCount: 156,
      videoAnalyses: 89
    },
    performanceMetrics: {
      passRate: 78.5,
      averageAttempts: 2.3,
      improvementRate: 15.7
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshAnalytics = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const exportData = () => {
    // Simulate export functionality
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into system usage and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={refreshAnalytics} disabled={isLoading}>
            <Activity className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userActivity.totalUsers}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(analyticsData.userActivity.userGrowth)}
              <span className={getTrendColor(analyticsData.userActivity.userGrowth)}>
                {analyticsData.userActivity.userGrowth > 0 ? '+' : ''}{analyticsData.userActivity.userGrowth}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userActivity.activeUsers}</div>
            <div className="text-xs text-muted-foreground">
              {Math.round((analyticsData.userActivity.activeUsers / analyticsData.userActivity.totalUsers) * 100)}% of total users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.engagementMetrics.avgSessionDuration}</div>
            <div className="text-xs text-muted-foreground">
              {analyticsData.engagementMetrics.totalSessions} total sessions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performanceMetrics.passRate}%</div>
            <div className="flex items-center space-x-1 text-xs">
              {getTrendIcon(analyticsData.performanceMetrics.improvementRate)}
              <span className={getTrendColor(analyticsData.performanceMetrics.improvementRate)}>
                {analyticsData.performanceMetrics.improvementRate > 0 ? '+' : ''}{analyticsData.performanceMetrics.improvementRate}%
              </span>
              <span className="text-muted-foreground">improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Skills</CardTitle>
            <CardDescription>Most frequently practiced skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.skillsData.popularSkills.map((skill, index) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium">{skill.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{skill.completions} completions</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(skill.completions / analyticsData.skillsData.popularSkills[0].completions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Learning outcomes and assessment results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-lg font-bold">{analyticsData.skillsData.averageScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analyticsData.skillsData.averageScore}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pass Rate</span>
                  <span className="text-lg font-bold">{analyticsData.performanceMetrics.passRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${analyticsData.performanceMetrics.passRate}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analyticsData.skillsData.completedSkills}</div>
                  <div className="text-xs text-muted-foreground">Total Completions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analyticsData.performanceMetrics.averageAttempts}</div>
                  <div className="text-xs text-muted-foreground">Avg. Attempts</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>How users interact with the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.engagementMetrics.totalSessions}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analyticsData.engagementMetrics.reflectionCount}</div>
              <div className="text-sm text-muted-foreground">Reflections Written</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.engagementMetrics.videoAnalyses}</div>
              <div className="text-sm text-muted-foreground">Video Analyses</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analyticsData.userActivity.newUsers}</div>
              <div className="text-sm text-muted-foreground">New Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current system status and health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-muted-foreground">Offline</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Application</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="font-medium">Development Mode</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}