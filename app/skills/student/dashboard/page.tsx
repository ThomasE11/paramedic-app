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
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight">Learning Dashboard</h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mt-1 font-light">
                    Master paramedic skills with precision and confidence
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-light text-slate-900 dark:text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalSkills}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Skills</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all categories</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedSkills + stats.masteredSkills}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Completed</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Skills completed</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{Math.round(stats.totalTimeSpent / 60)}h</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Time Spent</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.totalTimeSpent} minutes total</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.averageScore}/10</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Average Score</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Self-assessment</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
        </div>

        {/* Modern Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Progress Overview</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your skill completion status</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/student/skills" className="group">
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Continue Learning</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pick up where you left off</p>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
            </div>
          </Link>

          <Link href="/student/progress" className="group">
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">View Progress</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">See detailed progress analytics</p>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
            </div>
          </Link>

          <Link href="/student/reflections" className="group">
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Reflections</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-white">{stats.inProgressSkills}</span> skills in progress
              </p>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
            </div>
          </Link>
        </div>

        {/* Modern Categories Overview */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skill Categories</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Overview of all available skill categories</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const skillsWithProgress = category.skills.filter(skill => skill.progress);
              const completedCount = skillsWithProgress.filter(skill => 
                skill.progress?.status === 'COMPLETED' || skill.progress?.status === 'MASTERED'
              ).length;
              const progressPercentage = category.skills.length > 0 ? (completedCount / category.skills.length) * 100 : 0;

              return (
                <Link key={category.id} href={`/student/skills?category=${category.id}`} className="group">
                  <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl border border-white/30 dark:border-slate-700/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm" 
                          style={{ backgroundColor: category.colorCode }}
                        />
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                          {category.name}
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-xs bg-white/50 dark:bg-slate-700/50">
                        {completedCount}/{category.skills.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={progressPercentage} className="h-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-900 dark:text-white">{Math.round(progressPercentage)}%</span> complete
                      </p>
                    </div>
                    <div 
                      className="absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"
                      style={{ background: `linear-gradient(45deg, ${category.colorCode}, ${category.colorCode}88)` }}
                    ></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}