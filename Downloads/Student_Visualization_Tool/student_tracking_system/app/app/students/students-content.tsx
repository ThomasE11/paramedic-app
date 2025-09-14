
'use client';

import { useState, useEffect } from 'react';
import { StudentSearch } from '@/components/students/student-search';
import { StudentCard } from '@/components/students/student-card';
import { StudentFormModal } from '@/components/students/student-form-modal';
import { BulkEmailDialog } from '@/components/email/bulk-email-dialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { StudentWithModule, SearchFilters } from '@/lib/types';
import { Download } from 'lucide-react';

export function StudentsContent() {
  const [students, setStudents] = useState<StudentWithModule[]>([]);
  const [modules, setModules] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithModule | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentWithModule | null>(null);
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    moduleId: 'all',
    sortBy: 'firstName',
    sortOrder: 'asc'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchModules();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams({
        search: filters.search,
        moduleId: filters.moduleId === 'all' ? '' : filters.moduleId,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`/api/students?${params}`);
      const data = await response.json();

      if (response.ok) {
        setStudents(data.students || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load students',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong loading students',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/modules');
      const data = await response.json();

      if (response.ok) {
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error('Failed to load modules:', error);
    }
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleEditStudent = (student: StudentWithModule) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleBulkEmail = () => {
    setIsBulkEmailOpen(true);
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudent) return;

    try {
      const response = await fetch(`/api/students/${deleteStudent.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Student deleted successfully'
        });
        fetchStudents();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete student',
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
      setDeleteStudent(null);
    }
  };

  const handleExport = () => {
    try {
      const csvContent = [
        ['Student ID', 'Full Name', 'Email', 'Phone', 'Module Code', 'Module Name'].join(','),
        ...students.map(student => [
          student?.studentId || '',
          student?.fullName || '',
          student?.email || '',
          student?.phone || '',
          student?.module?.code || '',
          student?.module?.name || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Students exported successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export students',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 glass-morphism rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 sm:h-80 glass-morphism rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StudentSearch
        filters={filters}
        onFiltersChange={setFilters}
        onAddStudent={handleAddStudent}
        onExport={handleExport}
        onBulkEmail={handleBulkEmail}
        modules={modules}
        students={students || []}
      />

      {students?.length === 0 ? (
        <div className="text-center py-12 glass-morphism rounded-lg">
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.moduleId !== 'all' 
              ? 'No students found matching your criteria'
              : 'No students found'
            }
          </p>
          <Button onClick={handleAddStudent}>Add First Student</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
          {students?.map((student) => (
            <StudentCard
              key={student?.id}
              student={student}
              onEdit={handleEditStudent}
              onDelete={setDeleteStudent}
            />
          ))}
        </div>
      )}

      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={() => {
          fetchStudents();
          setIsFormOpen(false);
        }}
        student={selectedStudent}
        modules={modules}
      />

      <AlertDialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteStudent?.fullName}? This action cannot be undone.
              All notes and activities associated with this student will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStudent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkEmailDialog
        open={isBulkEmailOpen}
        onOpenChange={setIsBulkEmailOpen}
        students={students || []}
        modules={modules}
      />
    </div>
  );
}
