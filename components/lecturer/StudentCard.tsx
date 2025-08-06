'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Clock, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Award,
  Calendar,
  Target,
  Brain,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  createdAt: string;
  progress: Array<{
    id: string;
    status: string;
    timeSpentMinutes: number;
    attempts: number;
    skill: {
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
        colorCode: string;
      };
    };
  }>;
  reflections: Array<{
    id: string;
    rating: number;
    createdAt: string;
    skill: {
      id: number;
      name: string;
    };
  }>;
  subjects: Array<{
    id: string;
    subjectId: number;
    enrolledAt: string;
    subject: {
      id: number;
      code: string;
      name: string;
      level: string;
      _count: {
        skills: number;
      };
    };
  }>;
}

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const calculateProgress = () => {
    const totalSkills = student.progress.length;
    if (totalSkills === 0) return 0;
    const completedSkills = student.progress.filter(
      (p) => p.status === 'COMPLETED' || p.status === 'MASTERED'
    ).length;
    return (completedSkills / totalSkills) * 100;
  };

  const getStats = () => {
    const totalSkills = student.progress.length;
    const completedSkills = student.progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length;
    const masteredSkills = student.progress.filter(p => p.status === 'MASTERED').length;
    const totalTime = student.progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
    const avgRating = student.reflections.length > 0 
      ? student.reflections.reduce((sum, r) => sum + r.rating, 0) / student.reflections.length
      : 0;

    return {
      totalSkills,
      completedSkills,
      masteredSkills,
      totalTime: Math.round(totalTime / 60), // Convert to hours
      avgRating,
      reflectionCount: student.reflections.length,
      completionRate: calculateProgress()
    };
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'from-emerald-500 to-emerald-600';
    if (rate >= 60) return 'from-blue-500 to-blue-600';
    if (rate >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getProgressTextColor = (rate: number) => {
    if (rate >= 80) return 'text-emerald-700';
    if (rate >= 60) return 'text-blue-700';
    if (rate >= 40) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const stats = getStats();

  return (
    <div className="group relative">
      <Card className="overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border-0 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 backdrop-blur-sm">
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content */}
        <div className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getProgressColor(stats.completionRate)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white font-bold text-lg">
                      {getInitials(student.name)}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <User className="h-3 w-3 text-gray-600" />
                  </div>
                </div>

                {/* Student Info */}
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {student.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-medium">{student.email}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    ID: {student.studentId}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats Badge */}
              <div className="text-right">
                <div className={`text-2xl font-bold ${getProgressTextColor(stats.completionRate)}`}>
                  {stats.completionRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.completedSkills}/{stats.totalSkills} Skills
                </span>
              </div>
              <div className="relative">
                <Progress value={stats.completionRate} className="h-3 bg-gray-200" />
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r ${getProgressColor(stats.completionRate)} transition-all duration-700`}
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 p-3 rounded-xl border border-blue-200/50">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Practice Time</span>
                </div>
                <div className="text-lg font-bold text-blue-800">{stats.totalTime}h</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/70 p-3 rounded-xl border border-purple-200/50">
                <div className="flex items-center space-x-2 mb-1">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Mastered</span>
                </div>
                <div className="text-lg font-bold text-purple-800">{stats.masteredSkills}</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/70 p-3 rounded-xl border border-green-200/50">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Reflections</span>
                </div>
                <div className="text-lg font-bold text-green-800">{stats.reflectionCount}</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/70 p-3 rounded-xl border border-yellow-200/50">
                <div className="flex items-center space-x-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Avg Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-yellow-800">{stats.avgRating.toFixed(1)}</span>
                  <div className="flex">{getRatingStars(Math.round(stats.avgRating))}</div>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {stats.completionRate >= 80 && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    High Performer
                  </Badge>
                )}
                {stats.masteredSkills > 0 && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                    <Award className="h-3 w-3 mr-1" />
                    Skills Expert
                  </Badge>
                )}
                {stats.reflectionCount >= 5 && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    <Brain className="h-3 w-3 mr-1" />
                    Reflective Learner
                  </Badge>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Enrolled {new Date(student.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Link href={`/lecturer/students/${student.id}`} className="flex-1">
                <Button 
                  variant="default" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
              
              <Link href={`/lecturer/students/${student.id}/analytics`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href={`/lecturer/students/${student.id}/messages`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-all duration-300"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </div>

        {/* Hover Effect Decorations */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
          <Zap className="h-8 w-8 text-blue-500" />
        </div>
        
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
          <Target className="h-6 w-6 text-purple-500" />
        </div>
      </Card>
    </div>
  );
};

export default StudentCard;