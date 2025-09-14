
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp,
  TrendingDown,
  Trophy,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Target,
  Award,
  RefreshCw,
  Calendar,
  FileText
} from 'lucide-react';

interface Grade {
  id: string;
  grade: string;
  gradePoints: number;
  creditHours: number;
  examType?: string;
  examDate?: string;
  comments?: string;
  student: {
    id: string;
    fullName: string;
    studentId: string;
  };
  subject: {
    id: string;
    code: string;
    name: string;
    credits?: number;
  };
  module?: {
    id: string;
    code: string;
    name: string;
  };
}

interface GradeTrackerProps {
  studentId?: string;
  moduleId?: string;
  showAddGrade?: boolean;
  title?: string;
}

const GRADE_OPTIONS = [
  { value: 'A+', label: 'A+ (4.0)', points: 4.0, color: 'bg-green-500' },
  { value: 'A', label: 'A (3.7)', points: 3.7, color: 'bg-green-400' },
  { value: 'A-', label: 'A- (3.3)', points: 3.3, color: 'bg-green-300' },
  { value: 'B+', label: 'B+ (3.0)', points: 3.0, color: 'bg-blue-500' },
  { value: 'B', label: 'B (2.7)', points: 2.7, color: 'bg-blue-400' },
  { value: 'B-', label: 'B- (2.3)', points: 2.3, color: 'bg-blue-300' },
  { value: 'C+', label: 'C+ (2.0)', points: 2.0, color: 'bg-yellow-500' },
  { value: 'C', label: 'C (1.7)', points: 1.7, color: 'bg-yellow-400' },
  { value: 'C-', label: 'C- (1.3)', points: 1.3, color: 'bg-yellow-300' },
  { value: 'D+', label: 'D+ (1.0)', points: 1.0, color: 'bg-orange-500' },
  { value: 'D', label: 'D (0.7)', points: 0.7, color: 'bg-red-400' },
  { value: 'F', label: 'F (0.0)', points: 0.0, color: 'bg-red-500' }
];

const EXAM_TYPES = [
  'midterm',
  'final',
  'assignment',
  'quiz',
  'project',
  'practical',
  'clinical'
];

export function GradeTracker({ studentId, moduleId, showAddGrade = false, title = 'Grade Tracker' }: GradeTrackerProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [newGrade, setNewGrade] = useState({
    studentId: studentId || '',
    subjectId: '',
    moduleId: moduleId || '',
    grade: '',
    creditHours: 3,
    examType: '',
    examDate: '',
    comments: ''
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchGrades();
    fetchSubjects();
    if (!studentId) {
      fetchStudents();
    }
  }, [studentId, moduleId]);

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentId) params.set('studentId', studentId);
      if (moduleId) params.set('moduleId', moduleId);

      const response = await fetch(`/api/grades?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setGrades(data.grades || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load grades',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      if (response.ok) {
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleAddGrade = async () => {
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGrade)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Grade added successfully'
        });
        setIsAddModalOpen(false);
        resetNewGrade();
        fetchGrades();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to add grade',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const handleEditGrade = async () => {
    if (!editingGrade) return;

    try {
      const response = await fetch('/api/grades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGrade.id,
          grade: newGrade.grade,
          creditHours: newGrade.creditHours,
          examType: newGrade.examType,
          examDate: newGrade.examDate,
          comments: newGrade.comments
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Grade updated successfully'
        });
        setEditingGrade(null);
        resetNewGrade();
        fetchGrades();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update grade',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    try {
      const response = await fetch(`/api/grades?id=${gradeId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Grade deleted successfully'
        });
        fetchGrades();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete grade',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const resetNewGrade = () => {
    setNewGrade({
      studentId: studentId || '',
      subjectId: '',
      moduleId: moduleId || '',
      grade: '',
      creditHours: 3,
      examType: '',
      examDate: '',
      comments: ''
    });
  };

  const openEditModal = (grade: Grade) => {
    setEditingGrade(grade);
    setNewGrade({
      studentId: grade.student.id,
      subjectId: grade.subject.id,
      moduleId: grade.module?.id || '',
      grade: grade.grade,
      creditHours: grade.creditHours,
      examType: grade.examType || '',
      examDate: grade.examDate ? new Date(grade.examDate).toISOString().split('T')[0] : '',
      comments: grade.comments || ''
    });
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    
    const totalQualityPoints = grades.reduce((sum, grade) => sum + (grade.gradePoints * grade.creditHours), 0);
    const totalCredits = grades.reduce((sum, grade) => sum + grade.creditHours, 0);
    
    return totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  };

  const getGradeColor = (grade: string) => {
    const gradeOption = GRADE_OPTIONS.find(option => option.value === grade);
    return gradeOption?.color || 'bg-gray-500';
  };

  const getGPAStatus = (gpa: number) => {
    if (gpa >= 3.5) return { status: 'Excellent', color: 'text-green-600', icon: Trophy };
    if (gpa >= 3.0) return { status: 'Good', color: 'text-blue-600', icon: Target };
    if (gpa >= 2.0) return { status: 'Satisfactory', color: 'text-yellow-600', icon: Award };
    return { status: 'Needs Improvement', color: 'text-red-600', icon: TrendingDown };
  };

  const currentGPA = calculateGPA();
  const { status, color, icon: StatusIcon } = getGPAStatus(currentGPA);

  return (
    <div className="space-y-6">
      {/* GPA Summary */}
      <Card className="glass-morphism border-white/20 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold text-gray-900">{currentGPA.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`w-5 h-5 ${color}`} />
                    <Badge className={`${color.replace('text-', 'bg-').replace('-600', '-100')} ${color} border-0`}>
                      {status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {grades.reduce((sum, g) => sum + g.creditHours, 0)} total credit hours
                </p>
              </div>
            </div>
            
            {showAddGrade && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Grade
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-morphism border-white/20 shadow-2xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {editingGrade ? 'Edit Grade' : 'Add New Grade'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    {!studentId && (
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Student</Label>
                        <Select value={newGrade.studentId} onValueChange={(value) => setNewGrade(prev => ({ ...prev, studentId: value }))}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map(student => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.fullName} ({student.studentId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Subject</Label>
                      <Select value={newGrade.subjectId} onValueChange={(value) => setNewGrade(prev => ({ ...prev, subjectId: value }))}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.code} - {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Grade</Label>
                        <Select value={newGrade.grade} onValueChange={(value) => setNewGrade(prev => ({ ...prev, grade: value }))}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Credit Hours</Label>
                        <Input
                          type="number"
                          min="1"
                          max="6"
                          value={newGrade.creditHours}
                          onChange={(e) => setNewGrade(prev => ({ ...prev, creditHours: parseInt(e.target.value) || 1 }))}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Exam Type</Label>
                      <Select value={newGrade.examType} onValueChange={(value) => setNewGrade(prev => ({ ...prev, examType: value }))}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXAM_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Exam Date</Label>
                      <Input
                        type="date"
                        value={newGrade.examDate}
                        onChange={(e) => setNewGrade(prev => ({ ...prev, examDate: e.target.value }))}
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Comments</Label>
                      <Input
                        value={newGrade.comments}
                        onChange={(e) => setNewGrade(prev => ({ ...prev, comments: e.target.value }))}
                        className="rounded-xl"
                        placeholder="Optional comments"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setEditingGrade(null);
                        resetNewGrade();
                      }}
                      className="flex-1 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingGrade ? handleEditGrade : handleAddGrade}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl"
                    >
                      {editingGrade ? 'Update' : 'Add'} Grade
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grades List */}
      <Card className="glass-morphism border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Grade History ({grades.length} grades)
            </CardTitle>
            <Button
              onClick={fetchGrades}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading grades...</span>
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Grades Yet</h3>
              <p className="text-gray-600">Start tracking academic performance by adding grades</p>
            </div>
          ) : (
            <div className="space-y-3">
              {grades.map(grade => (
                <div
                  key={grade.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white/60 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 ${getGradeColor(grade.grade)} rounded-xl flex items-center justify-center text-white font-bold shadow-md`}>
                      {grade.grade}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {grade.subject.code} - {grade.subject.name}
                      </h4>
                      {!studentId && (
                        <p className="text-sm text-gray-600 truncate">
                          {grade.student.fullName} ({grade.student.studentId})
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {grade.creditHours} credits
                        </Badge>
                        {grade.examType && (
                          <Badge variant="outline" className="text-xs">
                            {grade.examType}
                          </Badge>
                        )}
                        {grade.examDate && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(grade.examDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      {grade.comments && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          <FileText className="w-3 h-3 inline mr-1" />
                          {grade.comments}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="text-right flex-1 sm:flex-initial">
                      <div className="text-lg font-bold text-gray-900">
                        {grade.gradePoints.toFixed(1)} pts
                      </div>
                    </div>
                    
                    {showAddGrade && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(grade)}
                          className="rounded-xl"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteGrade(grade.id)}
                          className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
