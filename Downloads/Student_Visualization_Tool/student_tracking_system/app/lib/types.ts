
import { Student, Module, Note, Activity, User } from '@prisma/client';

export type StudentWithModule = Student & {
  module: Module | null;
  notes: Note[];
  activities: Activity[];
};

export type ModuleWithStudents = Module & {
  students: Student[];
};

export type NoteWithStudent = Note & {
  student: Student;
  user: User;
};

export interface StudentFormData {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  moduleId?: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  category: 'academic' | 'behavior' | 'attendance' | 'general';
}

export interface DashboardStats {
  totalStudents: number;
  moduleStats: {
    moduleId: string;
    moduleCode: string;
    moduleName: string;
    studentCount: number;
  }[];
  recentActivities: (Activity & {
    student: {
      id: string;
      fullName: string;
      module: {
        code: string;
        name: string;
      } | null;
    };
  })[];
}

export interface SearchFilters {
  search: string;
  moduleId: string;
  sortBy: 'firstName' | 'name' | 'module' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}
