
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, TrendingUp, Star, BookOpen, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { StudentProgress, CategoryWithSkills, ProgressStats } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

export default function StudentProgressPage() {
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [categories, setCategories] = useState<CategoryWithSkills[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progressResponse, categoriesResponse] = await Promise.all([
        fetch('/api/progress'),
        fetch('/api/categories?includeSkills=true'),
      ]);

      const progressData = await progressResponse.json();
      const categoriesData = await categoriesResponse.json();

      setProgress(progressData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProgress = () => {
    let filtered = progress;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.skill?.categoryId === parseInt(selectedCategory));
    }

    if (selectedPeriod !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoff.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(p => 
        p.lastAttemptDate && new Date(p.lastAttemptDate) >= cutoff
      );
    }

    return filtered;
  };

  const filteredProgress = getFilteredProgress();

  // Calculate stats
  const stats = {
    totalSkills: categories.reduce((acc, cat) => acc + cat.skills.length, 0),
    completedSkills: filteredProgress.filter(p => p.status === 'COMPLETED').length,
    masteredSkills: filteredProgress.filter(p => p.status === 'MASTERED').length,
    inProgressSkills: filteredProgress.filter(p => p.status === 'IN_PROGRESS').length,
    totalTimeSpent: filteredProgress.reduce((acc, p) => acc + p.timeSpentMinutes, 0),
    averageScore: filteredProgress.filter(p => p.selfAssessmentScore).length > 0 
      ? filteredProgress.filter(p => p.selfAssessmentScore).reduce((acc, p) => acc + (p.selfAssessmentScore || 0), 0) / filteredProgress.filter(p => p.selfAssessmentScore).length
      : 0,
  };

  // Chart data
  const categoryProgressData = categories.map(cat => ({
    name: cat.name.split(' ')[0], // Shorten names
    total: cat.skills.length,
    completed: filteredProgress.filter(p => 
      p.skill?.categoryId === cat.id && 
      (p.status === 'COMPLETED' || p.status === 'MASTERED')
    ).length,
    inProgress: filteredProgress.filter(p => 
      p.skill?.categoryId === cat.id && 
      p.status === 'IN_PROGRESS'
    ).length,
  }));

  const statusData = [
    { name: 'Completed', value: stats.completedSkills, color: '#4ade80' },
    { name: 'Mastered', value: stats.masteredSkills, color: '#06b6d4' },
    { name: 'In Progress', value: stats.inProgressSkills, color: '#f59e0b' },
    { name: 'Not Started', value: stats.totalSkills - stats.completedSkills - stats.masteredSkills - stats.inProgressSkills, color: '#6b7280' },
  ];

  const timeSpentData = categories.map(cat => ({
    name: cat.name.split(' ')[0],
    time: filteredProgress
      .filter(p => p.skill?.categoryId === cat.id)
      .reduce((acc, p) => acc + p.timeSpentMinutes, 0),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'MASTERED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl" />
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Progress Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
                Track your learning journey and skill development
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
              Filter Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Time Period
                </label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedPeriod('all');
                  }}
                  className="w-full h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl hover:bg-white/90 dark:hover:bg-slate-800/90"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Skills Practiced</h3>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{filteredProgress.length}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Out of {stats.totalSkills} total skills
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Completion Rate</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.totalSkills > 0 ? Math.round(((stats.completedSkills + stats.masteredSkills) / stats.totalSkills) * 100) : 0}%
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {stats.completedSkills + stats.masteredSkills} skills completed
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Time Invested</h3>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{Math.round(stats.totalTimeSpent / 60)}h</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {stats.totalTimeSpent} minutes total
            </p>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Score</h3>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.averageScore ? stats.averageScore.toFixed(1) : 'N/A'}/10
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Self-assessment average
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="relative">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Progress by Category</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Completion status across skill categories</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#4ade80" name="Completed" />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                  <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="relative">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Overall Progress</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Your skill completion breakdown</p>
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
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="relative">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Time Spent by Category</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Practice time distribution</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} minutes`, 'Time']} />
                  <Bar dataKey="time" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="relative">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Progress Summary</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Key metrics at a glance</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Completion</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {stats.totalSkills > 0 ? Math.round(((stats.completedSkills + stats.masteredSkills) / stats.totalSkills) * 100) : 0}%
                  </span>
                </div>
                <Progress value={stats.totalSkills > 0 ? ((stats.completedSkills + stats.masteredSkills) / stats.totalSkills) * 100 : 0} />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-green-50/80 dark:bg-green-900/20 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedSkills}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.masteredSkills}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Mastered</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50/80 dark:bg-yellow-900/20 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgressSkills}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">In Progress</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                      {stats.totalSkills - stats.completedSkills - stats.masteredSkills - stats.inProgressSkills}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-400">Not Started</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Progress List */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
          <div className="relative">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Detailed Progress</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Individual skill progress and performance
            </p>
            <div className="space-y-4">
              {filteredProgress.map((progressItem) => (
                <div key={progressItem.id} className="flex items-center justify-between p-6 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30 rounded-2xl backdrop-blur-sm">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: progressItem.skill?.category?.colorCode }}
                      />
                      <h3 className="font-semibold text-slate-900 dark:text-white">{progressItem.skill?.name}</h3>
                      <Badge className={`${getStatusColor(progressItem.status)} backdrop-blur-sm`}>
                        {progressItem.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                      <span>{progressItem.attempts} attempts</span>
                      <span>{progressItem.timeSpentMinutes} minutes</span>
                      {progressItem.selfAssessmentScore && (
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {progressItem.selfAssessmentScore}/10
                        </span>
                      )}
                      {progressItem.lastAttemptDate && (
                        <span>
                          Last: {new Date(progressItem.lastAttemptDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      {progressItem.completedSteps?.length || 0} / {progressItem.skill?.steps?.length || 0} steps
                    </div>
                    <Progress 
                      value={(progressItem.completedSteps?.length || 0) / (progressItem.skill?.steps?.length || 1) * 100} 
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {filteredProgress.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No progress data</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto">
                  No progress found for the selected filters. Try adjusting your criteria or start practicing some skills!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
