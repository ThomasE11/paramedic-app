'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Users,
  Search,
  Calendar,
  BookOpen,
  Save,
  Download,
  History,
  TrendingUp,
  Eye,
  FileDown,
  CalendarRange,
  Filter,
  StickyNote
} from 'lucide-react';
import { format } from 'date-fns';
import { HistoricalAttendanceReview } from '@/components/attendance/HistoricalAttendanceReview';

interface Module {
  id: string;
  code: string;
  name: string;
  description?: string;
  students: Student[];
}

interface Student {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  studentId?: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  student: Student;
}

const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-600' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-600' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-600' },
  { value: 'excused', label: 'Excused', icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-600' }
];

export function AttendanceContent() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [studentAttendancePatterns, setStudentAttendancePatterns] = useState<any[]>([]);
  const [showStudentPatterns, setShowStudentPatterns] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showHistoricalReview, setShowHistoricalReview] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<'day' | 'month' | 'custom' | 'all'>('all');
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');
  const [exportIncludeNotes, setExportIncludeNotes] = useState(true);
  const [exportGroupBy, setExportGroupBy] = useState<'student' | 'date'>('student');
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      loadExistingAttendance();
    }
  }, [selectedModule, selectedDate]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/modules');
      
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
        
        // Auto-select AEM230 if available
        const aem230 = data.modules?.find((m: Module) => m.code === 'AEM230');
        if (aem230) {
          setSelectedModule(aem230.id);
        } else if (data.modules?.length > 0) {
          setSelectedModule(data.modules[0].id);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch modules',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch modules',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    if (!selectedModule || !selectedDate) return;
    
    try {
      setLoading(true);
      
      // Try to find existing class session for this module and date
      const classesResponse = await fetch(`/api/classes?moduleId=${selectedModule}&date=${selectedDate}`);
      
      if (classesResponse.ok) {
        const classes = await classesResponse.json();
        
        // If there's an existing class session for today, load its attendance
        if (classes && classes.length > 0) {
          const classSession = classes[0]; // Take the first class for this date
          
          // Fetch attendance for this class session
          const attendanceResponse = await fetch(`/api/attendance?classSessionId=${classSession.id}`);
          
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            
            if (attendanceData && attendanceData.length > 0) {
              // Convert existing attendance data to our format
              const existingAttendance = attendanceData.map((att: any) => ({
                studentId: att.studentId,
                status: att.status,
                notes: att.notes || '',
                student: att.student
              }));
              
              setAttendance(existingAttendance);
              setIsExistingData(true);
              
              toast({
                title: 'Existing attendance loaded',
                description: `Found saved attendance for ${format(new Date(selectedDate), 'MMM d, yyyy')}`
              });
              return; // Exit early if we found existing data
            }
          }
        }
      }
      
      // If no existing attendance found, initialize with defaults
      setIsExistingData(false);
      initializeAttendance();
    } catch (error) {
      console.error('Error loading existing attendance:', error);
      // Fall back to initializing with defaults
      setIsExistingData(false);
      initializeAttendance();
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendance = () => {
    const module = modules.find(m => m.id === selectedModule);
    if (module) {
      const attendanceRecords = module.students.map(student => ({
        studentId: student.id,
        status: 'present' as const,
        notes: '',
        student: student
      }));
      setAttendance(attendanceRecords);
    }
  };

  const updateAttendanceStatus = (studentId: string, status: string) => {
    setAttendance(prev => 
      prev.map(att => 
        att.studentId === studentId 
          ? { ...att, status: status as any }
          : att
      )
    );
  };

  const updateAttendanceNotes = (studentId: string, notes: string) => {
    setAttendance(prev => 
      prev.map(att => 
        att.studentId === studentId 
          ? { ...att, notes }
          : att
      )
    );
  };

  const markAllAsPresent = () => {
    setAttendance(prev => 
      prev.map(att => ({ ...att, status: 'present' as any }))
    );
  };

  const markAllAsAbsent = () => {
    setAttendance(prev => 
      prev.map(att => ({ ...att, status: 'absent' as any }))
    );
  };

  const saveAttendance = async () => {
    if (!selectedModule) {
      toast({
        title: 'Error',
        description: 'Please select a module',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: 'Error',
        description: 'Please select a date',
        variant: 'destructive'
      });
      return;
    }

    if (attendance.length === 0) {
      toast({
        title: 'Error',
        description: 'No students to record attendance for',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      const moduleData = modules.find(m => m.id === selectedModule);
      let classSession;

      // Check if class session already exists for this date/module
      if (isExistingData) {
        // Try to find the existing class session
        const classesResponse = await fetch(`/api/classes?moduleId=${selectedModule}&date=${selectedDate}`);
        if (classesResponse.ok) {
          const classes = await classesResponse.json();
          if (classes && classes.length > 0) {
            classSession = classes[0];
          }
        }
      }

      // If no existing class session, create a new one
      if (!classSession) {
        const classSessionResponse = await fetch('/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `${moduleData?.code} - ${format(new Date(selectedDate), 'MMM d, yyyy')}`,
            description: `Attendance for ${moduleData?.name}`,
            moduleId: selectedModule,
            date: selectedDate,
            startTime: '08:00',
            endTime: '09:30',
            type: 'lecture',
            status: 'completed'
          })
        });

        if (!classSessionResponse.ok) {
          const errorData = await classSessionResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create class session');
        }

        classSession = await classSessionResponse.json();
      }

      // Validate class session was created/found
      if (!classSession || !classSession.id) {
        throw new Error('Class session is invalid');
      }

      // Save the attendance (the API handles upserts)
      const attendanceData = attendance.map(att => ({
        classSessionId: classSession.id,
        studentId: att.studentId,
        status: att.status,
        notes: att.notes || null
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendance: attendanceData })
      });

      if (response.ok) {
        const savedData = await response.json();
        setIsExistingData(true); // Mark as existing data after successful save

        toast({
          title: 'Success',
          description: `Attendance ${isExistingData ? 'updated' : 'saved'} successfully for ${moduleData?.code} on ${format(new Date(selectedDate), 'MMM d, yyyy')} (${savedData.length} records)`
        });

        // Reload to confirm persistence
        await loadExistingAttendance();
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        console.error('Attendance save error:', error);

        toast({
          title: 'Failed to save attendance',
          description: error.error || error.message || 'Please check your connection and try again',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Attendance save error:', error);

      toast({
        title: 'Error',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!selectedModule) return;
    
    try {
      setLoading(true);
      
      // Fetch all class sessions for this module
      const classesResponse = await fetch(`/api/classes?moduleId=${selectedModule}`);
      
      if (classesResponse.ok) {
        const classes = await classesResponse.json();
        
        // Get attendance for each class session
        const historyPromises = classes.map(async (classSession: any) => {
          const attendanceResponse = await fetch(`/api/attendance?classSessionId=${classSession.id}`);
          
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            return {
              date: classSession.date,
              title: classSession.title,
              attendance: attendanceData,
              totalStudents: attendanceData.length,
              present: attendanceData.filter((att: any) => att.status === 'present').length,
              absent: attendanceData.filter((att: any) => att.status === 'absent').length,
              late: attendanceData.filter((att: any) => att.status === 'late').length,
              excused: attendanceData.filter((att: any) => att.status === 'excused').length
            };
          }
          return null;
        });
        
        const history = await Promise.all(historyPromises);
        const validHistory = history.filter(item => item !== null).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setAttendanceHistory(validHistory);
        
        // Calculate student-level attendance patterns
        if (validHistory.length > 0) {
          const module = modules.find(m => m.id === selectedModule);
          if (module) {
            const studentPatterns = module.students.map((student: any) => {
              const studentAttendanceRecords = validHistory.reduce((acc: any[], session) => {
                const studentRecord = session.attendance.find((att: any) => att.studentId === student.id);
                if (studentRecord) {
                  acc.push({
                    date: session.date,
                    status: studentRecord.status,
                    notes: studentRecord.notes
                  });
                }
                return acc;
              }, []);
              
              const totalSessions = studentAttendanceRecords.length;
              const presentCount = studentAttendanceRecords.filter(r => r.status === 'present').length;
              const lateCount = studentAttendanceRecords.filter(r => r.status === 'late').length;
              const absentCount = studentAttendanceRecords.filter(r => r.status === 'absent').length;
              const excusedCount = studentAttendanceRecords.filter(r => r.status === 'excused').length;
              
              return {
                student,
                totalSessions,
                presentCount,
                lateCount,
                absentCount,
                excusedCount,
                attendanceRate: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
                records: studentAttendanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              };
            });
            
            // Sort by attendance rate (lowest first for attention)
            setStudentAttendancePatterns(studentPatterns.sort((a, b) => a.attendanceRate - b.attendanceRate));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAttendance = () => {
    const module = modules.find(m => m.id === selectedModule);
    if (!module) return;

    const csvContent = [
      ['Student ID', 'Student Name', 'Email', 'Status', 'Notes'],
      ...attendance.map(att => [
        att.student.studentId || att.student.id,
        att.student.fullName || att.student.name || '',
        att.student.email,
        att.status,
        att.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${module.code}-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAdvancedExport = async () => {
    if (!selectedModule) {
      toast({
        title: 'Error',
        description: 'Please select a module first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setExporting(true);

      const params = new URLSearchParams({
        moduleId: selectedModule,
        groupBy: exportGroupBy,
        includeNotes: exportIncludeNotes.toString()
      });

      if (exportDateRange === 'day') {
        params.append('dateRange', 'day');
        params.append('specificDate', exportStartDate || selectedDate);
      } else if (exportDateRange === 'month') {
        params.append('dateRange', 'month');
        params.append('specificDate', exportStartDate || selectedDate);
      } else if (exportDateRange === 'custom' && exportStartDate && exportEndDate) {
        params.append('startDate', exportStartDate);
        params.append('endDate', exportEndDate);
      } else {
        params.append('dateRange', 'all');
      }

      const response = await fetch(`/api/attendance/export?${params.toString()}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Get filename from response headers or generate one
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'attendance_export.csv';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        setShowExportDialog(false);
        toast({
          title: 'Success',
          description: 'Attendance data exported successfully'
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Error',
        description: 'Failed to export attendance data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const filteredAttendance = attendance.filter(att => {
    const name = att.student.fullName || att.student.name || '';
    const studentId = att.student.studentId || att.student.id;
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           att.student.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusStats = () => {
    const stats = attendance.reduce((acc, att) => {
      acc[att.status] = (acc[att.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const stats = getStatusStats();
  const selectedModuleData = modules.find(m => m.id === selectedModule);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show historical review if requested
  if (showHistoricalReview) {
    return (
      <HistoricalAttendanceReview
        modules={modules}
        onClose={() => setShowHistoricalReview(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Module and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Attendance Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.code} - {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {selectedModuleData && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedModuleData.code} - {selectedModuleData.name}</h3>
                  <p className="text-muted-foreground">{selectedModuleData.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Students: {selectedModuleData.students.length}
                  </p>
                </div>
                {isExistingData && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    ✓ Saved Data
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedModule && attendance.length > 0 && (
        <>
          {/* Stats and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4">
                  {ATTENDANCE_STATUSES.map(({ value, label, color, bgColor }) => (
                    <div key={value} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${bgColor}`} />
                      <span className="text-sm font-medium">
                        {label}: {stats[value] || 0}
                      </span>
                    </div>
                  ))}
                  <div className="text-sm font-medium text-gray-600">
                    Total: {attendance.length}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllAsPresent}
                    className="text-green-600 hover:bg-green-50"
                  >
                    Mark All Present
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllAsAbsent}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Mark All Absent
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportAttendance}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Quick Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowExportDialog(true)}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Advanced Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowHistory(!showHistory);
                      if (!showHistory) {
                        fetchAttendanceHistory();
                      }
                    }}
                  >
                    <History className="w-4 h-4 mr-2" />
                    {showHistory ? 'Hide Quick History' : 'Quick History'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowHistoricalReview(true)}
                  >
                    <CalendarRange className="w-4 h-4 mr-2" />
                    Historical Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowStudentPatterns(!showStudentPatterns);
                      if (!showStudentPatterns && attendanceHistory.length === 0) {
                        fetchAttendanceHistory();
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showStudentPatterns ? 'Hide Student Patterns' : 'Student Patterns'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance History */}
          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Attendance History - {selectedModuleData?.code}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No attendance history found for this module.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {attendanceHistory.map((session, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {format(new Date(session.date), 'MMM d, yyyy')}
                            </h4>
                            <p className="text-sm text-gray-600">{session.title}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {Math.round((session.present / session.totalStudents) * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {session.present}/{session.totalStudents} present
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-600"></div>
                            <span>Present: {session.present}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-600"></div>
                            <span>Absent: {session.absent}</span>
                          </div>
                          {session.late > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                              <span>Late: {session.late}</span>
                            </div>
                          )}
                          {session.excused > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                              <span>Excused: {session.excused}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Summary Statistics */}
                    {attendanceHistory.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Overall Statistics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {attendanceHistory.length}
                            </div>
                            <div className="text-blue-700">Total Sessions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {Math.round(
                                (attendanceHistory.reduce((sum, session) => sum + session.present, 0) /
                                attendanceHistory.reduce((sum, session) => sum + session.totalStudents, 0)) * 100
                              )}%
                            </div>
                            <div className="text-green-700">Avg Attendance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {Math.max(...attendanceHistory.map(s => Math.round((s.present / s.totalStudents) * 100)))}%
                            </div>
                            <div className="text-purple-700">Best Session</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {attendanceHistory.reduce((sum, session) => sum + session.present, 0)}
                            </div>
                            <div className="text-orange-700">Total Present</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Student Attendance Patterns */}
          {showStudentPatterns && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Individual Student Attendance Patterns - {selectedModuleData?.code}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentAttendancePatterns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No attendance patterns available. View history first to generate patterns.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {studentAttendancePatterns.map((pattern, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {pattern.student.fullName || pattern.student.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              ID: {pattern.student.studentId || pattern.student.id}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              pattern.attendanceRate >= 90 ? 'text-green-600' :
                              pattern.attendanceRate >= 75 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {pattern.attendanceRate}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {pattern.totalSessions} sessions
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{pattern.presentCount}</div>
                            <div className="text-gray-500">Present</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-yellow-600">{pattern.lateCount}</div>
                            <div className="text-gray-500">Late</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-600">{pattern.absentCount}</div>
                            <div className="text-gray-500">Absent</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{pattern.excusedCount}</div>
                            <div className="text-gray-500">Excused</div>
                          </div>
                        </div>
                        
                        {/* Recent attendance history for this student */}
                        {pattern.records.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Recent Sessions:</p>
                            <div className="flex flex-wrap gap-1">
                              {pattern.records.slice(0, 8).map((record: any, recordIndex: number) => (
                                <div
                                  key={recordIndex}
                                  className={`
                                    w-6 h-6 rounded text-xs flex items-center justify-center text-white font-medium
                                    ${record.status === 'present' ? 'bg-green-500' :
                                      record.status === 'late' ? 'bg-yellow-500' :
                                      record.status === 'absent' ? 'bg-red-500' :
                                      'bg-blue-500'
                                    }
                                  `}
                                  title={`${format(new Date(record.date), 'MMM d')} - ${record.status}${record.notes ? ': ' + record.notes : ''}`}
                                >
                                  {record.status === 'present' ? 'P' :
                                   record.status === 'late' ? 'L' :
                                   record.status === 'absent' ? 'A' : 'E'}
                                </div>
                              ))}
                              {pattern.records.length > 8 && (
                                <div className="text-xs text-gray-500 self-center ml-2">
                                  +{pattern.records.length - 8} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Attendance List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Mark Attendance - {format(new Date(selectedDate), 'MMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredAttendance.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {attendance.length === 0 
                      ? 'No students enrolled in this module.'
                      : 'No students match your search.'
                    }
                  </div>
                ) : (
                  filteredAttendance.map((att) => (
                    <div
                      key={att.studentId}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                            {(att.student.fullName || att.student.name || att.student.email)[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="font-medium text-gray-900">
                            {att.student.fullName || att.student.name || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {att.student.studentId || att.student.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {att.student.email}
                          </div>
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex gap-1">
                        {ATTENDANCE_STATUSES.map(({ value, label, icon: Icon, color, bgColor }) => (
                          <Button
                            key={value}
                            size="sm"
                            variant={att.status === value ? 'default' : 'outline'}
                            onClick={() => updateAttendanceStatus(att.studentId, value)}
                            className={`
                              ${att.status === value 
                                ? `${bgColor} text-white hover:opacity-80` 
                                : `${color} hover:${bgColor}/10`
                              }
                            `}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="sr-only">{label}</span>
                          </Button>
                        ))}
                      </div>

                      {/* Notes - Always visible for better note management */}
                      <div className="w-56">
                        <div className="relative">
                          <Input
                            placeholder="Add attendance notes..."
                            value={att.notes || ''}
                            onChange={(e) => updateAttendanceNotes(att.studentId, e.target.value)}
                            className="text-sm pr-8"
                          />
                          {att.notes && (
                            <StickyNote className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-6 border-t mt-6">
                <Button
                  onClick={saveAttendance}
                  disabled={saving || attendance.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex-1"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isExistingData ? 'Updating' : 'Saving'} Attendance...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isExistingData ? 'Update' : 'Save'} Attendance for {format(new Date(selectedDate), 'MMM d, yyyy')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Advanced Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-blue-600" />
              Advanced Attendance Export
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Module Selection Info */}
            {selectedModuleData && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">{selectedModuleData.code} - {selectedModuleData.name}</h3>
                <p className="text-sm text-blue-700">Exporting data for this module</p>
              </div>
            )}

            {/* Date Range Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Date Range</Label>
              <Select value={exportDateRange} onValueChange={(value: any) => setExportDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time (Complete History)</SelectItem>
                  <SelectItem value="day">Single Day</SelectItem>
                  <SelectItem value="month">Single Month</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>

              {/* Date inputs based on selection */}
              {exportDateRange === 'day' && (
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Input
                    type="date"
                    value={exportStartDate || selectedDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                  />
                </div>
              )}

              {exportDateRange === 'month' && (
                <div className="space-y-2">
                  <Label>Select Month</Label>
                  <Input
                    type="month"
                    value={exportStartDate || selectedDate.substring(0, 7)}
                    onChange={(e) => setExportStartDate(e.target.value + '-01')}
                  />
                </div>
              )}

              {exportDateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Export Options</Label>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeNotes"
                    checked={exportIncludeNotes}
                    onCheckedChange={(checked) => setExportIncludeNotes(checked as boolean)}
                  />
                  <Label htmlFor="includeNotes" className="cursor-pointer">
                    Include attendance notes and comments
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Group Data By</Label>
                <Select value={exportGroupBy} onValueChange={(value: any) => setExportGroupBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student (Detailed per-student records)</SelectItem>
                    <SelectItem value="date">Date (Daily summaries)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Export Summary */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">Export Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Module:</strong> {selectedModuleData?.code} - {selectedModuleData?.name}</p>
                <p><strong>Date Range:</strong> {
                  exportDateRange === 'all' ? 'All available data' :
                  exportDateRange === 'day' ? `Single day: ${exportStartDate || selectedDate}` :
                  exportDateRange === 'month' ? `Month: ${exportStartDate ? format(new Date(exportStartDate), 'MMMM yyyy') : 'Current month'}` :
                  exportDateRange === 'custom' ? `${exportStartDate} to ${exportEndDate}` : 'Not specified'
                }</p>
                <p><strong>Format:</strong> CSV (Comma-separated values)</p>
                <p><strong>Grouping:</strong> {exportGroupBy === 'student' ? 'By Student' : 'By Date'}</p>
                <p><strong>Notes:</strong> {exportIncludeNotes ? 'Included' : 'Not included'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
                disabled={exporting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdvancedExport}
                disabled={exporting || (exportDateRange === 'custom' && (!exportStartDate || !exportEndDate))}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Export Attendance
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}