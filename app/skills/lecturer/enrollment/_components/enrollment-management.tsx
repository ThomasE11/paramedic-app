
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Search, 
  Users, 
  BookOpen, 
  Plus, 
  UserPlus, 
  UserMinus,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string | null;
  subjects: {
    id: string;
    subject: {
      id: number;
      code: string;
      name: string;
      level: string;
    };
  }[];
}

interface Subject {
  id: number;
  code: string;
  name: string;
  level: string;
  _count: {
    users: number;
  };
}

export default function EnrollmentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBySubject, setFilterBySubject] = useState<string>('all');
  const [filterByEnrollment, setFilterByEnrollment] = useState<string>('all');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<string | null>(null);
  const [subjectEnrollments, setSubjectEnrollments] = useState<Set<number>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSubjectEnrollments, setBulkSubjectEnrollments] = useState<Set<number>>(new Set());
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isBulkEnrolling, setIsBulkEnrolling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, subjectsRes] = await Promise.all([
        fetch('/api/lecturer/students'),
        fetch('/api/lecturer/subjects')
      ]);

      if (studentsRes.ok && subjectsRes.ok) {
        const studentsData = await studentsRes.json();
        const subjectsData = await subjectsRes.json();
        setStudents(studentsData);
        setSubjects(subjectsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students?.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSubjectFilter = filterBySubject === 'all' || 
                                student.subjects.some(s => s.subject.id.toString() === filterBySubject);

    const matchesEnrollmentFilter = filterByEnrollment === 'all' ||
                                  (filterByEnrollment === 'enrolled' && student.subjects.length > 0) ||
                                  (filterByEnrollment === 'unenrolled' && student.subjects.length === 0);

    return matchesSearch && matchesSubjectFilter && matchesEnrollmentFilter;
  }) || [];

  const openSubjectModal = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentForModal(studentId);
      setSubjectEnrollments(new Set(student.subjects.map(s => s.subject.id)));
      setShowSubjectModal(true);
    }
  };

  const openBulkModal = () => {
    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }
    setBulkSubjectEnrollments(new Set());
    setShowBulkModal(true);
  };

  const saveStudentEnrollments = async () => {
    if (!selectedStudentForModal) return;

    setIsEnrolling(true);
    try {
      const enrolledSubjects = Array.from(subjectEnrollments);
      const response = await fetch(`/api/lecturer/students/${selectedStudentForModal}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectIds: enrolledSubjects })
      });

      if (response.ok) {
        toast.success('Student enrollments updated successfully');
        setShowSubjectModal(false);
        setSelectedStudentForModal(null);
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Failed to update enrollments: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating enrollments:', error);
      toast.error('Failed to update enrollments');
    } finally {
      setIsEnrolling(false);
    }
  };

  const saveBulkEnrollments = async () => {
    setIsBulkEnrolling(true);
    try {
      const studentIds = Array.from(selectedStudents);
      const subjectIds = Array.from(bulkSubjectEnrollments);
      
      const response = await fetch('/api/lecturer/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: studentIds, subjectIds })
      });

      if (response.ok) {
        toast.success(`Updated enrollments for ${studentIds.length} students`);
        setShowBulkModal(false);
        setSelectedStudents(new Set());
        setBulkSubjectEnrollments(new Set());
        fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Failed to update bulk enrollments: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating bulk enrollments:', error);
      toast.error('Failed to update bulk enrollments');
    } finally {
      setIsBulkEnrolling(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const selectAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">{students?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Available Subjects</p>
                <p className="text-2xl font-bold">{subjects?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Enrolled Students</p>
                <p className="text-2xl font-bold">
                  {students?.filter(s => s.subjects.length > 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserMinus className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Unassigned Students</p>
                <p className="text-2xl font-bold">
                  {students?.filter(s => s.subjects.length === 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterBySubject} onValueChange={setFilterBySubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects?.map(subject => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterByEnrollment} onValueChange={setFilterByEnrollment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by enrollment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="enrolled">Enrolled</SelectItem>
              <SelectItem value="unenrolled">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={selectAllStudents}
            disabled={filteredStudents.length === 0}
          >
            {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>
          <Button 
            onClick={openBulkModal} 
            disabled={selectedStudents.size === 0 || isBulkEnrolling || loading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Bulk Enroll ({selectedStudents.size})
          </Button>
        </div>
      </div>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredStudents.map(student => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedStudents.has(student.id)}
                    onCheckedChange={() => toggleStudentSelection(student.id)}
                  />
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {student.email} {student.studentId && `• ${student.studentId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {student.subjects.length > 0 ? (
                      student.subjects.map(enrollment => (
                        <Badge 
                          key={enrollment.id} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {enrollment.subject.code}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        No subjects assigned
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSubjectModal(student.id)}
                    disabled={isEnrolling || loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Subject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterBySubject !== 'all' || filterByEnrollment !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No students are available in the system.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Individual Student Subject Modal */}
      <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subject Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select subjects for {students?.find(s => s.id === selectedStudentForModal)?.name}
            </p>
            <div className="space-y-3">
              {subjects?.map(subject => (
                <div key={subject.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={subjectEnrollments.has(subject.id)}
                    onCheckedChange={(checked) => {
                      const newEnrollments = new Set(subjectEnrollments);
                      if (checked) {
                        newEnrollments.add(subject.id);
                      } else {
                        newEnrollments.delete(subject.id);
                      }
                      setSubjectEnrollments(newEnrollments);
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{subject.code}</p>
                    <p className="text-sm text-muted-foreground">{subject.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {subject.level}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSubjectModal(false)}
                disabled={isEnrolling}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveStudentEnrollments}
                disabled={isEnrolling}
              >
                {isEnrolling ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Enrollment Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Subject Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add selected subjects to {selectedStudents.size} students
            </p>
            <div className="space-y-3">
              {subjects?.map(subject => (
                <div key={subject.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={bulkSubjectEnrollments.has(subject.id)}
                    onCheckedChange={(checked) => {
                      const newEnrollments = new Set(bulkSubjectEnrollments);
                      if (checked) {
                        newEnrollments.add(subject.id);
                      } else {
                        newEnrollments.delete(subject.id);
                      }
                      setBulkSubjectEnrollments(newEnrollments);
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{subject.code}</p>
                    <p className="text-sm text-muted-foreground">{subject.name}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {subject.level} • {subject._count?.users || 0} enrolled
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowBulkModal(false)}
                disabled={isBulkEnrolling}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveBulkEnrollments} 
                disabled={bulkSubjectEnrollments.size === 0 || isBulkEnrolling}
              >
                {isBulkEnrolling ? 'Enrolling...' : 'Enroll Students'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
