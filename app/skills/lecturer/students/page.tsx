
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, Users, Clock, Star, MessageSquare, TrendingUp, Calendar, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import StudentCard from '@/components/lecturer/StudentCard';

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

export default function LecturerStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, sortBy]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/lecturer/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          const aCompleted = a.progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length;
          const bCompleted = b.progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length;
          return bCompleted - aCompleted;
        case 'time':
          const aTime = a.progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
          const bTime = b.progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
          return bTime - aTime;
        case 'reflections':
          return b.reflections.length - a.reflections.length;
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  };

  const getStudentStats = (student: Student) => {
    const totalProgress = student.progress.length;
    const completedSkills = student.progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length;
    const totalTime = student.progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
    const averageRating = student.reflections.length > 0 
      ? student.reflections.reduce((sum, r) => sum + r.rating, 0) / student.reflections.length
      : 0;

    return {
      totalProgress,
      completedSkills,
      totalTime,
      averageRating,
      completionRate: totalProgress > 0 ? (completedSkills / totalProgress) * 100 : 0,
    };
  };

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
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border/50">
        <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor individual student progress and performance
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Student Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="time">Time Spent</SelectItem>
                <SelectItem value="reflections">Reflections</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {filteredStudents.length} of {students.length} students
              </span>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                    <StudentCard key={student.id} student={student} />
                ))}
            </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground text-center">
              {students.length === 0 
                ? "No students have registered yet."
                : "No students match your search criteria. Try adjusting your filters."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Class Summary</CardTitle>
          <CardDescription>
            Overview of student performance across the class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-blue-700">Total Students</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {students.length > 0 ? 
                  (students.reduce((sum, student) => {
                    const stats = getStudentStats(student);
                    return sum + stats.completionRate;
                  }, 0) / students.length).toFixed(1) : 0
                }%
              </div>
              <div className="text-sm text-green-700">Avg. Completion</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {students.reduce((sum, student) => sum + student.reflections.length, 0)}
              </div>
              <div className="text-sm text-purple-700">Total Reflections</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(students.reduce((sum, student) => {
                  const stats = getStudentStats(student);
                  return sum + stats.totalTime;
                }, 0) / 60)}h
              </div>
              <div className="text-sm text-orange-700">Total Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
