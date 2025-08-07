'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trophy, TrendingUp, Play, CheckCircle, AlertCircle, BarChart3, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CategoryWithSkills, ProgressStats } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function StudentDashboard() {
  const [categories, setCategories] = useState<CategoryWithSkills[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalSkills: 0,
    completedSkills: 0,
    masteredSkills: 0,
    inProgressSkills: 0,
    totalTimeSpent: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesResponse, progressResponse] = await Promise.all([
        fetch('/api/categories?includeSkills=true'),
        fetch('/api/progress'),
      ]);

      // Check if responses are OK
      if (!categoriesResponse.ok) {
        console.error('Categories API failed:', categoriesResponse.status);
        throw new Error('Failed to fetch categories');
      }
      
      if (!progressResponse.ok) {
        console.error('Progress API failed:', progressResponse.status);
        throw new Error('Failed to fetch progress');
      }

      const categoriesData = await categoriesResponse.json();
      const progressData = await progressResponse.json();

      // Ensure we have valid data
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Calculate stats with safety checks
      const validCategories = Array.isArray(categoriesData) ? categoriesData : [];
      const validProgress = Array.isArray(progressData) ? progressData : [];
      
      const totalSkills = validCategories.reduce((acc: number, cat: CategoryWithSkills) => {
        return acc + (Array.isArray(cat.skills) ? cat.skills.length : 0);
      }, 0);
      
      const completedSkills = validProgress.filter((p: any) => p.status === 'COMPLETED').length;
      const masteredSkills = validProgress.filter((p: any) => p.status === 'MASTERED').length;
      const inProgressSkills = validProgress.filter((p: any) => p.status === 'IN_PROGRESS').length;
      const totalTimeSpent = validProgress.reduce((acc: number, p: any) => acc + (p.timeSpentMinutes || 0), 0);
      
      const progressWithScores = validProgress.filter((p: any) => p.selfAssessmentScore);
      const averageScore = progressWithScores.length > 0 
        ? progressWithScores.reduce((acc: number, p: any) => acc + p.selfAssessmentScore, 0) / progressWithScores.length
        : 0;

      setStats({
        totalSkills,
        completedSkills,
        masteredSkills,
        inProgressSkills,
        totalTimeSpent,
        averageScore: Math.round(averageScore * 10) / 10,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default empty state instead of crashing
      setCategories([]);
      setStats({
        totalSkills: 0,
        completedSkills: 0,
        masteredSkills: 0,
        inProgressSkills: 0,
        totalTimeSpent: 0,
        averageScore: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const progressData = [
    { name: 'Completed', value: stats.completedSkills, color: '#4ade80' },
    { name: 'Mastered', value: stats.masteredSkills, color: '#06b6d4' },
    { name: 'In Progress', value: stats.inProgressSkills, color: '#f59e0b' },
    { name: 'Not Started', value: stats.totalSkills - stats.completedSkills - stats.masteredSkills - stats.inProgressSkills, color: '#6b7280' },
  ];

  const categoryData = Array.isArray(categories) ? categories.map(cat => ({
    name: cat.name || 'Unknown',
    total: Array.isArray(cat.skills) ? cat.skills.length : 0,
    completed: Array.isArray(cat.skills) ? cat.skills.filter(skill => 
      skill.progress?.status === 'COMPLETED' || skill.progress?.status === 'MASTERED'
    ).length : 0,
  })) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 dark:border-slate-800/50 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-4xl font-light text-slate-900 dark:text-white tracking-tight">
                    Learning Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-lg text-slate-600 dark:text-slate-300 mt-1 font-light leading-snug">
                    Master paramedic skills with precision and confidence
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0 min-w-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-light text-slate-900 dark:text-white truncate">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.totalSkills}</div>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Skills</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all categories</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedSkills + stats.masteredSkills}</div>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Completed</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Skills completed</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{Math.round(stats.totalTimeSpent / 60)}h</div>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Time Spent</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.totalTimeSpent} minutes total</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.averageScore}/10</div>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Average Score</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Self-assessment</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
        </div>

        {/* Modern Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center sm:mr-3 shadow-lg flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Progress Overview</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Your skill completion status</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ fontSize: 12, paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Category Progress</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completion by skill category</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ bottom: 60 }}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  tickLine={false}
                  className="text-slate-600 dark:text-slate-400"
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'currentColor' }}
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
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#6b7280" radius={[4, 4, 0, 0]} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modern Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/skills/student/skills" className="group">
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1 sm:mb-2">Continue Learning</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Pick up where you left off</p>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
            </div>
          </Link>

          <Link href="/skills/student/progress" className="group">
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1 sm:mb-2">View Progress</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">See detailed progress analytics</p>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
            </div>
          </Link>

          <Link href="/skills/student/mastery" className="group sm:col-span-2 lg:col-span-1">
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1 sm:mb-2">Mastery Progress</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-white">{stats.masteredSkills}</span> skills mastered • <span className="font-medium text-slate-900 dark:text-white">{stats.inProgressSkills}</span> in progress
              </p>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
            </div>
          </Link>
        </div>

        {/* Modern Categories Overview */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Skill Categories</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Overview of all available skill categories</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((category) => {
              const skillsWithProgress = category.skills?.filter(skill => skill.progress) || [];
              const completedCount = skillsWithProgress.filter(skill => 
                skill.progress?.status === 'COMPLETED' || skill.progress?.status === 'MASTERED'
              ).length;
              const totalSkills = category.skills?.length || 0;
              const progressPercentage = totalSkills > 0 ? (completedCount / totalSkills) * 100 : 0;

              return (
                <Link key={category.id} href={`/skills/student/skills?category=${category.id}`} className="group">
                  <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-lg sm:rounded-xl border border-white/30 dark:border-slate-700/50 p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" 
                          style={{ backgroundColor: category.colorCode }}
                        />
                        <h4 className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {category.name}
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-xs bg-white/50 dark:bg-slate-700/50 flex-shrink-0 ml-2">
                        {completedCount}/{totalSkills}
                      </Badge>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Progress value={progressPercentage} className="h-1.5 sm:h-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-900 dark:text-white">{Math.round(progressPercentage)}%</span> complete
                      </p>
                    </div>
                    <div 
                      className="absolute -inset-0.5 rounded-lg sm:rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"
                      style={{ background: `linear-gradient(45deg, ${category.colorCode}, ${category.colorCode}88)` }}
                    ></div>
                  </div>
                </Link>
              );
            })}
            
            {categories.length === 0 && (
              <div className="col-span-full text-center py-8 sm:py-12">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-2">No categories available</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Check back later for available skill categories.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}