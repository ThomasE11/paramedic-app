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
  Shield,
  Settings,
  Database,
  Activity,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalSkills: 88, // From our knowledge of the system
    totalProgress: 0,
    totalReflections: 0,
    systemHealth: 'healthy',
    databaseStatus: 'offline'
  });

  useEffect(() => {
    // Since database is offline, we'll show mock data
    setStats({
      totalUsers: 156,
      totalStudents: 142,
      totalLecturers: 14,
      totalSkills: 88,
      totalProgress: 1247,
      totalReflections: 398,
      systemHealth: 'healthy',
      databaseStatus: 'offline'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        
        {/* Modern Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl blur opacity-30"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-light text-slate-900 dark:text-white tracking-tight">Control Center</h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mt-1 font-light">
                    Advanced system administration and oversight
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

        {/* Modern System Status Alert */}
        <div className="bg-amber-50/80 dark:bg-amber-900/30 backdrop-blur-xl border border-amber-200/50 dark:border-amber-800/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Development Mode</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Database connection is offline. Using hardcoded authentication and mock data for testing purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Users</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.totalStudents} students, {stats.totalLecturers} lecturers</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalSkills}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Skills Available</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all categories</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalProgress}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">Progress Records</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Student practice sessions</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
          
          <div className="group relative">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className={`h-6 w-6 text-white`} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 capitalize">{stats.systemHealth}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">System Health</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Database: {stats.databaseStatus}</p>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          </div>
        </div>

        {/* Modern Development Authentication Info */}
        <div className="bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Development Authentication</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Available test accounts for development and testing</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-4 rounded-xl border border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-purple-700 dark:text-purple-300">Admin</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Email: john@doe.com</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Password: johndoe123</p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-4 rounded-xl border border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-blue-700 dark:text-blue-300">Lecturer</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Email: lecturer@test.com</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Password: lecturer123</p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-4 rounded-xl border border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2 shadow-md">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Student</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Email: student@test.com</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Password: student123</p>
            </div>
          </div>
        </div>

        {/* Modern Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">System Management</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Configure system settings and preferences</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Database className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Database Status</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">System Settings</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Health Check</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Management</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Manage students, lecturers, and permissions</p>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/lecturer/students" className="block">
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">View All Users</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Manage Roles</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Send Notifications</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Content Management</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Manage skills, categories, and learning content</p>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/student/skills" className="block">
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">View All Skills</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Analytics Reports</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Quality Assurance</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Modern Test Navigation */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Test Different Views</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Switch between different user role views for testing</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/student/dashboard" className="group">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Student Dashboard</span>
                </div>
              </div>
            </Link>
            <Link href="/lecturer/dashboard" className="group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Lecturer Dashboard</span>
                </div>
              </div>
            </Link>
            <Link href="/auth/signin" className="group">
              <div className="bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/60 border border-white/50 dark:border-slate-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white">Sign Out & Test Login</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}