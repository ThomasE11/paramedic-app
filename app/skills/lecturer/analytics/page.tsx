
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Clock, Users, Download, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

interface AnalyticsData {
  totalStudents: number;
  totalSkills: number;
  totalProgress: number;
  progressByStatus: {
    NOT_STARTED: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    MASTERED: number;
  };
  progressByCategory: Array<{
    categoryId: number;
    categoryName: string;
    colorCode: string;
    totalSkills: number;
    completedProgress: number;
    inProgressProgress: number;
  }>;
  timeByCategory: Array<{
    categoryId: number;
    categoryName: string;
    totalTime: number;
  }>;
  studentCompletionRates: Array<{
    studentId: string;
    studentName: string;
    totalSkills: number;
    completedSkills: number;
    completionRate: number;
    totalTimeSpent: number;
  }>;
}

export default function LecturerAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('completion');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/lecturer/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Failed to load analytics</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  // Prepare chart data
  const statusData = [
    { name: 'Completed', value: analytics.progressByStatus.COMPLETED, color: '#4ade80' },
    { name: 'Mastered', value: analytics.progressByStatus.MASTERED, color: '#06b6d4' },
    { name: 'In Progress', value: analytics.progressByStatus.IN_PROGRESS, color: '#f59e0b' },
    { name: 'Not Started', value: analytics.progressByStatus.NOT_STARTED, color: '#6b7280' },
  ];

  const categoryProgressData = analytics.progressByCategory.map(cat => ({
    category: cat.categoryName.split(' ')[0],
    completed: cat.completedProgress,
    inProgress: cat.inProgressProgress,
    total: cat.totalSkills * analytics.totalStudents,
    completionRate: cat.totalSkills > 0 ? (cat.completedProgress / (cat.totalSkills * analytics.totalStudents)) * 100 : 0,
  }));

  const timeData = analytics.timeByCategory.map(cat => ({
    category: cat.categoryName.split(' ')[0],
    time: Math.round(cat.totalTime / 60), // Convert to hours
  }));

  const studentPerformanceData = analytics.studentCompletionRates
    .sort((a, b) => b.completionRate - a.completionRate)
    .map(student => ({
      name: student.studentName.split(' ')[0],
      completionRate: student.completionRate,
      timeSpent: Math.round(student.totalTimeSpent / 60),
    }));

  const averageCompletion = analytics.studentCompletionRates.length > 0
    ? analytics.studentCompletionRates.reduce((sum, student) => sum + student.completionRate, 0) / analytics.studentCompletionRates.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive insights into student learning and skill development
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {averageCompletion.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(analytics.timeByCategory.reduce((sum, cat) => sum + cat.totalTime, 0) / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Combined across all students
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.totalStudents > 0 ? 
                ((analytics.totalProgress / (analytics.totalStudents * analytics.totalSkills)) * 100).toFixed(1) : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Skills actively practiced
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Mastered</CardTitle>
            <BarChart3 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analytics.progressByStatus.MASTERED}
            </div>
            <p className="text-xs text-muted-foreground">
              Skills at mastery level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category Focus
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {analytics.progressByCategory.map(category => (
                    <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Primary Metric
              </label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completion">Completion Rate</SelectItem>
                  <SelectItem value="time">Time Spent</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="progress">Progress Speed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedMetric('completion');
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Progress Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Distribution</CardTitle>
            <CardDescription>Student progress across all skills</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Completion rates by skill category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#4ade80" name="Completed" />
                <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Investment */}
        <Card>
          <CardHeader>
            <CardTitle>Time Investment by Category</CardTitle>
            <CardDescription>Hours spent practicing each skill category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} hours`, 'Time']} />
                <Bar dataKey="time" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
            <CardDescription>Individual completion rates and time investment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentPerformanceData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#8b5cf6" name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Insights</CardTitle>
            <CardDescription>
              Detailed breakdown of each skill category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.progressByCategory.map((category) => {
                const totalPossible = category.totalSkills * analytics.totalStudents;
                const completionRate = totalPossible > 0 ? (category.completedProgress / totalPossible) * 100 : 0;
                const engagementRate = totalPossible > 0 ? ((category.completedProgress + category.inProgressProgress) / totalPossible) * 100 : 0;

                return (
                  <div key={category.categoryId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.colorCode }}
                        />
                        <h3 className="font-medium">{category.categoryName}</h3>
                      </div>
                      <Badge variant="outline">
                        {category.totalSkills} skills
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Completion Rate</span>
                          <span className="font-medium">{completionRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Engagement Rate</span>
                          <span className="font-medium">{engagementRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${engagementRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>
              Key observations and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Average completion rate of {averageCompletion.toFixed(1)}%</li>
                  <li>• {analytics.progressByStatus.MASTERED} skills at mastery level</li>
                  <li>• High engagement in {analytics.progressByCategory.reduce((max, cat) => 
                    (cat.completedProgress + cat.inProgressProgress) > (max.completedProgress + max.inProgressProgress) ? cat : max
                  ).categoryName}</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Areas for Improvement</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• {analytics.progressByStatus.NOT_STARTED} skills not yet started</li>
                  <li>• Consider additional support for {analytics.progressByCategory.reduce((min, cat) => 
                    (cat.completedProgress / (cat.totalSkills * analytics.totalStudents)) < (min.completedProgress / (min.totalSkills * analytics.totalStudents)) ? cat : min
                  ).categoryName}</li>
                  <li>• Encourage reflection note submissions</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Focus on skills with low completion rates</li>
                  <li>• Provide additional resources for struggling students</li>
                  <li>• Celebrate high performers to motivate others</li>
                  <li>• Consider peer learning opportunities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
