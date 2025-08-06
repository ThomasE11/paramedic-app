
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Users, Plus, UserPlus, UserMinus, Search, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface Subject {
  id: number;
  code: string;
  name: string;
  level: string;
  description?: string;
  isActive: boolean;
  skills: Array<{
    skill: {
      id: number;
      name: string;
      difficultyLevel: string;
      isCritical: boolean;
    };
  }>;
  users: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      studentId: string;
    };
  }>;
  _count: {
    skills: number;
    users: number;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
}

export default function LecturerSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  
  // Enrollment modal state
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Subject creation modal state
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [createSubjectLoading, setCreateSubjectLoading] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    level: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [subjects, searchTerm, selectedLevel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects with enrollments
      const subjectsResponse = await fetch('/api/lecturer/subjects');
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData || []);
      
      // Fetch all students
      const studentsResponse = await fetch('/api/lecturer/students');
      const studentsData = await studentsResponse.json();
      setAllStudents(studentsData?.map((student: any) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        studentId: student.studentId
      })) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterSubjects = () => {
    let filtered = [...subjects];

    if (searchTerm) {
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(subject => subject.level === selectedLevel);
    }

    setFilteredSubjects(filtered);
  };

  const openEnrollmentModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedStudents([]);
    setStudentSearchTerm('');
    setIsEnrollmentModalOpen(true);
  };

  const handleStudentSelection = (studentId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleBulkEnrollment = async () => {
    if (!selectedSubject || selectedStudents.length === 0) {
      toast.error('Please select students to enroll');
      return;
    }

    try {
      setEnrollmentLoading(true);
      
      const response = await fetch('/api/lecturer/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedStudents,
          subjectIds: [selectedSubject.id]
        })
      });

      if (response.ok) {
        toast.success(`Successfully enrolled ${selectedStudents.length} students in ${selectedSubject.code}`);
        setIsEnrollmentModalOpen(false);
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to enroll students');
      }
    } catch (error) {
      console.error('Error enrolling students:', error);
      toast.error('Failed to enroll students');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleUnenrollStudent = async (subjectId: number, studentId: string, studentName: string) => {
    try {
      const response = await fetch(`/api/lecturer/enrollments?userId=${studentId}&subjectId=${subjectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success(`Successfully unenrolled ${studentName}`);
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to unenroll student');
      }
    } catch (error) {
      console.error('Error unenrolling student:', error);
      toast.error('Failed to unenroll student');
    }
  };

  const getAvailableStudents = () => {
    const enrolledStudentIds = selectedSubject?.users?.map(u => u.user.id) || [];
    const available = allStudents.filter(student => 
      !enrolledStudentIds.includes(student.id) &&
      (studentSearchTerm === '' || 
       student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
       student.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
       student.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase()))
    );
    return available;
  };

  const handleCreateSubject = async () => {
    if (!subjectForm.code || !subjectForm.name || !subjectForm.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreateSubjectLoading(true);
      
      const response = await fetch('/api/lecturer/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Subject ${subjectForm.code} created successfully`);
        setIsCreateSubjectModalOpen(false);
        setSubjectForm({ code: '', name: '', level: '', description: '' });
        fetchData(); // Refresh the subjects list
      } else {
        toast.error(data.error || 'Failed to create subject');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Failed to create subject');
    } finally {
      setCreateSubjectLoading(false);
    }
  };

  const resetCreateSubjectModal = () => {
    setSubjectForm({ code: '', name: '', level: '', description: '' });
    setIsCreateSubjectModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subject Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage student enrollments across {subjects.length} subjects
            </p>
          </div>
          <Dialog open={isCreateSubjectModalOpen} onOpenChange={setIsCreateSubjectModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Subject
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Subject Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="EMT-Basic">EMT-Basic</SelectItem>
                <SelectItem value="Paramedic">Paramedic</SelectItem>
                <SelectItem value="Advanced Paramedic">Advanced Paramedic</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {filteredSubjects.length} of {subjects.length} subjects
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subject.code}</CardTitle>
                  <CardDescription className="mt-1">
                    {subject.name}
                  </CardDescription>
                  <Badge variant="outline" className="mt-2">
                    {subject.level}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {subject._count.users}
                  </div>
                  <div className="text-xs text-muted-foreground">students</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                    <div className="text-lg font-semibold text-primary dark:text-primary">
                      {subject._count.skills}
                    </div>
                    <div className="text-xs text-primary/80 dark:text-primary/60">Skills</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {subject._count.users}
                    </div>
                    <div className="text-xs text-green-600/80 dark:text-green-400/80">Enrolled</div>
                  </div>
                </div>

                {/* Enrolled Students Preview */}
                {subject.users.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Enrolled Students</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {subject.users.slice(0, 5).map((enrollment) => (
                        <div key={enrollment.user.id} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{enrollment.user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {enrollment.user.studentId}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                            onClick={() => handleUnenrollStudent(subject.id, enrollment.user.id, enrollment.user.name)}
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {subject.users.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{subject.users.length - 5} more students
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEnrollmentModal(subject)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Enroll Students
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No subjects found</h3>
            <p className="text-muted-foreground text-center">
              {subjects.length === 0 
                ? "No subjects have been created yet."
                : "No subjects match your search criteria. Try adjusting your filters."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enrollment Modal */}
      <Dialog open={isEnrollmentModalOpen} onOpenChange={setIsEnrollmentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll Students in {selectedSubject?.code}</DialogTitle>
            <DialogDescription>
              Select students to enroll in {selectedSubject?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search available students */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search available students..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Available students list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getAvailableStudents().map((student) => (
                <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center space-x-2">
                      <span>{student.email}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {student.studentId}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {getAvailableStudents().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {allStudents.filter(s => !selectedSubject?.users?.some(u => u.user.id === s.id)).length === 0
                    ? "All students are already enrolled in this subject"
                    : "No students match your search criteria"
                  }
                </div>
              )}
            </div>

            {/* Selected count and actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEnrollmentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkEnrollment}
                  disabled={selectedStudents.length === 0 || enrollmentLoading}
                >
                  {enrollmentLoading ? 'Enrolling...' : `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subject Creation Modal */}
      <Dialog open={isCreateSubjectModalOpen} onOpenChange={resetCreateSubjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new HEM subject to the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Subject Code */}
            <div className="space-y-2">
              <Label htmlFor="subject-code">Subject Code *</Label>
              <Input
                id="subject-code"
                placeholder="e.g., HEM1234"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Format: HEM followed by 4 digits</p>
            </div>

            {/* Subject Name */}
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name *</Label>
              <Input
                id="subject-name"
                placeholder="e.g., Emergency Medical Technician - Basic Level"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="subject-level">Level *</Label>
              <Select
                value={subjectForm.level}
                onValueChange={(value) => setSubjectForm(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMT-Basic">EMT-Basic</SelectItem>
                  <SelectItem value="Paramedic">Paramedic</SelectItem>
                  <SelectItem value="Advanced Paramedic">Advanced Paramedic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="subject-description">Description</Label>
              <Textarea
                id="subject-description"
                placeholder="Optional subject description..."
                value={subjectForm.description}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-muted-foreground">* Required fields</p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={resetCreateSubjectModal}
                  disabled={createSubjectLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSubject}
                  disabled={createSubjectLoading || !subjectForm.code || !subjectForm.name || !subjectForm.level}
                >
                  {createSubjectLoading ? 'Creating...' : 'Create Subject'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
