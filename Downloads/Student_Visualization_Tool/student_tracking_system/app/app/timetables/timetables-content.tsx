
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScheduleViewer } from '@/components/timetables/schedule-viewer';
import { ScheduleAligner } from '@/components/timetables/schedule-aligner';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Calendar,
  Users,
  Clock,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Zap
} from 'lucide-react';

// Smart name display utility for professional presentation
const formatStudentName = (fullName: string, displayMode: 'first' | 'smart' | 'initials' = 'smart') => {
  if (!fullName) return 'Unknown';

  const names = fullName.trim().split(' ').filter(name => name.length > 0);

  switch (displayMode) {
    case 'first':
      return names[0] || 'Unknown';

    case 'initials':
      // Show first name + initials of other names
      if (names.length === 1) return names[0];
      const firstName = names[0];
      const initials = names.slice(1).map(name => name.charAt(0).toUpperCase()).join('.');
      return `${firstName} ${initials}.`;

    case 'smart':
    default:
      // Smart truncation based on length and number of names
      if (fullName.length <= 18) {
        return fullName;
      }

      // For very long names, use first name + last initial
      if (fullName.length > 25) {
        const firstName = names[0];
        const lastName = names[names.length - 1];
        return `${firstName} ${lastName.charAt(0)}.`;
      }

      // For moderately long names, show first two names
      if (names.length >= 2) {
        return `${names[0]} ${names[1]}`;
      }

      return names[0];
  }
};

interface Student {
  id: string;
  fullName: string;
  studentId: string;
  email: string;
  module?: {
    code: string;
    name: string;
  };
}

interface Schedule {
  id: string;
  student: Student;
  semester: string;
  academicYear: string;
  entries: ScheduleEntry[];
}

interface ScheduleEntry {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: string;
  instructor?: string;
  location?: {
    name: string;
  };
  subject?: {
    code: string;
    name: string;
  };
  color?: string;
}

export function TimetablesContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [activeView, setActiveView] = useState<'search' | 'schedule' | 'align'>('search');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchSchedules();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, moduleFilter, students]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students?include=module');
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
        description: 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/schedules');
      const data = await response.json();
      
      if (response.ok) {
        setSchedules(data.schedules || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load schedules',
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

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (moduleFilter !== 'all') {
      filtered = filtered.filter(student => student.module?.code === moduleFilter);
    }

    setFilteredStudents(filtered);
  };

  const getModules = () => {
    const modules = students
      .filter(s => s.module)
      .map(s => s.module!)
      .filter((module, index, array) => 
        array.findIndex(m => m.code === module.code) === index
      );
    return modules;
  };

  const getStudentSchedule = (studentId: string) => {
    return schedules.find(s => s.student.id === studentId);
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setActiveView('schedule');
  };

  const handleMultiSelect = (student: Student) => {
    const isSelected = selectedStudents.some(s => s.id === student.id);
    
    if (isSelected) {
      setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents(prev => [...prev, student]);
    }
  };

  const handleStartAlignment = () => {
    if (selectedStudents.length < 2) {
      toast({
        title: 'Select Students',
        description: 'Please select at least 2 students to find common free times',
        variant: 'destructive'
      });
      return;
    }
    
    setActiveView('align');
  };

  const views = [
    { id: 'search', label: 'Search Students', icon: Search },
    { id: 'schedule', label: 'View Schedule', icon: Calendar },
    { id: 'align', label: 'AI Schedule Alignment', icon: Zap }
  ];

  const getModuleStyle = (moduleCode?: string) => {
    switch (moduleCode) {
      case 'HEM3903': return 'from-blue-500 to-purple-500';
      case 'HEM2903': return 'from-green-500 to-teal-500';
      case 'HEM3923': return 'from-orange-500 to-red-500';
      case 'AEM230': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <Card className="glass-morphism border-white/20 shadow-xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {views.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base touch-manipulation ${
                  activeView === id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xs:inline">{label}</span>
                <span className="xs:hidden">{label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
          
          {selectedStudents.length > 0 && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                    {selectedStudents.length} students selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStudents([])}
                    className="rounded-xl text-xs sm:text-sm"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleStartAlignment}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-xs sm:text-sm"
                    size="sm"
                  >
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Find Common Times</span>
                    <span className="sm:hidden">Find Times</span>
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedStudents.map(student => (
                  <Badge
                    key={student.id}
                    className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-3 py-1 rounded-full"
                    title={student.fullName}
                  >
                    {formatStudentName(student.fullName, 'initials')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content based on active view */}
      {activeView === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card className="glass-morphism border-white/20 shadow-xl">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">
                    Search Students
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Name, ID, or email..."
                      className="pl-10 rounded-xl min-h-[44px] text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">
                    Module
                  </label>
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger className="rounded-xl min-h-[44px] text-sm sm:text-base">
                      <SelectValue placeholder="All modules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {getModules().map(module => (
                        <SelectItem key={module.code} value={module.code}>
                          {module.code} - {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-border/50">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <strong>Total:</strong> {filteredStudents.length} students
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    <strong>Selected:</strong> {selectedStudents.length} for alignment
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student List */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8 sm:py-12">
                  <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-muted-foreground text-sm sm:text-base">Loading students...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="col-span-full text-center py-8 sm:py-12">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Students Found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredStudents.map(student => {
                  const schedule = getStudentSchedule(student.id);
                  const isSelected = selectedStudents.some(s => s.id === student.id);
                  
                  return (
                    <Card
                      key={student.id}
                      className={`group relative overflow-hidden transition-all duration-300 cursor-pointer border-0 touch-manipulation ${
                        isSelected
                          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/25 scale-[0.98] sm:scale-100'
                          : 'hover:shadow-lg sm:hover:-translate-y-1'
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid hsl(var(--border))'
                      }}
                    >
                      {/* Decorative gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardContent className="relative p-4 sm:p-6">
                        {/* Header with avatar and checkbox */}
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className={`relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${getModuleStyle(student.module?.code)} rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-base sm:text-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                              {student.fullName.charAt(0)}
                              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-foreground leading-tight text-base sm:text-lg mb-1 truncate" title={student.fullName}>
                                {formatStudentName(student.fullName, 'smart')}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                ID: {student.studentId}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0 ml-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleMultiSelect(student)}
                              className="w-5 h-5 text-blue-600 rounded-md border-2 border-muted-foreground/30 focus:ring-blue-500 focus:ring-2 transition-all touch-manipulation"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Info section with improved spacing */}
                        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                          <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-xs sm:text-sm font-medium text-foreground">Module</span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-semibold px-2 sm:px-3 py-1 text-xs">
                              {student.module?.code || 'No Module'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${schedule ? 'bg-green-500' : 'bg-orange-500'}`} />
                              <span className="text-sm font-medium text-foreground">Schedule</span>
                            </div>
                            <Badge className={schedule
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                            }>
                              {schedule ? `${schedule.entries.length} classes` : 'No schedule'}
                            </Badge>
                          </div>
                        </div>

                        {/* Action button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudentSelect(student);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Timetable
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === 'schedule' && selectedStudent && (
        <ScheduleViewer
          student={selectedStudent}
          schedule={getStudentSchedule(selectedStudent.id)}
          onBack={() => setActiveView('search')}
          onRefresh={fetchSchedules}
        />
      )}

      {activeView === 'align' && (
        <ScheduleAligner
          students={selectedStudents}
          onBack={() => setActiveView('search')}
        />
      )}
    </div>
  );
}
