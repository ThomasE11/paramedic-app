'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Activity,
  ArrowRight,
  BarChart
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface LecturerAnalytics {
  totalStudents: number;
  totalSkills: number;
  totalProgress: number;
  totalReflections: number;
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
  studentCompletionRates: Array<{
    studentId: string;
    studentName: string;
    totalSkills: number;
    completedSkills: number;
    completionRate: number;
    totalTimeSpent: number;
  }>;
  recentActivity: {
    recentProgress: Array<any>;
    recentReflections: Array<any>;
  };
}

export default function LecturerDashboard() {
  const [analytics, setAnalytics] = useState<LecturerAnalytics | null>(null);
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
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Failed to load analytics</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  const statusData = [
    { name: 'Completed', value: analytics.progressByStatus.COMPLETED, color: '#4ade80' },
    { name: 'Mastered', value: analytics.progressByStatus.MASTERED, color: '#06b6d4' },
    { name: 'In Progress', value: analytics.progressByStatus.IN_PROGRESS, color: '#f59e0b' },
    { name: 'Not Started', value: analytics.progressByStatus.NOT_STARTED, color: '#6b7280' },
  ];

  const categoryData = analytics.progressByCategory.map(cat => ({
    name: cat.categoryName.split(' ')[0],
    completed: cat.completedProgress,
    inProgress: cat.inProgressProgress,
    total: cat.totalSkills * analytics.totalStudents,
  }));

  const topPerformers = analytics.studentCompletionRates
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5);

  const averageCompletion = analytics.studentCompletionRates.length > 0
    ? analytics.studentCompletionRates.reduce((sum, student) => sum + student.completionRate, 0) / analytics.studentCompletionRates.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 dark:border-slate-800/50 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 dark:text-white tracking-tight">Instructor Portal</h1>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 mt-1 font-light">
                    Monitor student progress and analyze learning outcomes
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-light text-slate-900 dark:text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalStudents}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Students</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active learners</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalSkills}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Skills Available</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all categories</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.totalProgress}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Progress Records</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Student attempts</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{analytics.totalReflections}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Reflections</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Shared reflections</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
        </div>

        {/* Modern Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Overall Progress Status</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Student progress across all skills</p>
              </div>
            </div>
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
                  label={({ name, percent }) => `${name} ${(percent).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Progress by Category</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Student engagement across skill categories</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  tickLine={false}
                  className="text-slate-600 dark:text-slate-400"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  tickLine={false}
                  className="text-slate-600 dark:text-slate-400"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modern Quick Actions and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Performers</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Students with highest completion rates</p>
              </div>
            </div>
            <div className="space-y-3">
              {topPerformers.map((student, index) => (
                <div key={student.studentId} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium shadow-md">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{student.studentName}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {student.completionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {student.completedSkills}/{student.totalSkills} skills
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/lecturer/students" className="group mt-4 block">
              <div className="w-full py-3 px-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/60 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-white/30 dark:border-slate-700/50">
                <span className="text-sm font-medium text-slate-900 dark:text-white">View All Students</span>
                <ArrowRight className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Class Overview</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Key metrics for the entire class</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Average Completion</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {averageCompletion.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Total Progress Records</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {analytics.totalProgress}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Engagement Rate</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {analytics.totalStudents > 0 ? 
                    ((analytics.totalProgress / (analytics.totalStudents * analytics.totalSkills)) * 100).toFixed(1) : 0
                  }%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Reflection Rate</span>
                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                  {analytics.totalProgress > 0 ? 
                    ((analytics.totalReflections / analytics.totalProgress) * 100).toFixed(1) : 0
                  }%
                </span>
              </div>
            </div>
            <Link href="/lecturer/analytics" className="group mt-4 block">
              <div className="w-full py-3 px-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/60 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-white/30 dark:border-slate-700/50">
                <span className="text-sm font-medium text-slate-900 dark:text-white">View Detailed Analytics</span>
                <ArrowRight className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Latest student progress and reflections</p>
              </div>
            </div>
            <div className="space-y-3">
              {analytics.recentActivity.recentReflections.slice(0, 3).map((reflection, index) => (
                <div key={reflection.id} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-violet-500 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {reflection.user.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      Reflected on {reflection.skill.name}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(reflection.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {analytics.recentActivity.recentProgress.slice(0, 2).map((progress, index) => (
                <div key={progress.id} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {progress.user.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {progress.status.replace('_', ' ').toLowerCase()} {progress.skill.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {progress.timeSpentMinutes} minutes practiced
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/lecturer/notifications" className="group mt-4 block">
              <div className="w-full py-3 px-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/60 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-white/30 dark:border-slate-700/50">
                <span className="text-sm font-medium text-slate-900 dark:text-white">View All Activity</span>
                <ArrowRight className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </div>
        </div>

        {/* Modern Category Progress Overview */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Category Progress Overview</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Detailed breakdown of student progress by skill category</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.progressByCategory.map((category) => {
              const totalPossible = category.totalSkills * analytics.totalStudents;
              const completionRate = totalPossible > 0 ? (category.completedProgress / totalPossible) * 100 : 0;
              
              return (
                <div key={category.categoryId} className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl border border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: category.colorCode }}
                      />
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">{category.categoryName}</h4>
                    </div>
                    <Badge variant="outline" className="text-xs bg-white/50 dark:bg-slate-700/50">
                      {category.totalSkills} skills
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Completion Rate</span>
                      <span className="font-medium text-slate-900 dark:text-white">{completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{category.completedProgress} completed</span>
                      <span>{category.inProgressProgress} in progress</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}