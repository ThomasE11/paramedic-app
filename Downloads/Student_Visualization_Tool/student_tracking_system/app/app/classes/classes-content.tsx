
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, Clock, MapPin, BookOpen, CheckCircle, Mail, Bell } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { CreateClassDialog } from './create-class-dialog';
import { AttendanceDialog } from './attendance-dialog';
import { SendEmailDialog } from '@/components/email/send-email-dialog';
import { useToast } from '@/hooks/use-toast';

interface ClassSession {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: string;
  status: string;
  capacity?: number;
  notes?: string;
  color?: string;
  module?: {
    id: string;
    code: string;
    name: string;
  };
  subject?: {
    id: string;
    code: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
    building?: string;
  };
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  attendance: any[];
  _count: {
    attendance: number;
  };
}

export function ClassesContent() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [activeTab, setActiveTab] = useState('today');
  const [reminderStudents, setReminderStudents] = useState<any[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchModules();
    fetchSubjects();
    fetchLocations();
  }, []);

  const fetchClasses = async (date?: string) => {
    try {
      const params = new URLSearchParams();
      if (date) {
        params.append('date', date);
      }
      
      const response = await fetch(`/api/classes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setClasses([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch classes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/modules');
      if (response.ok) {
        const data = await response.json();
        setModules(Array.isArray(data) ? data : []);
      } else {
        setModules([]);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      setModules([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(Array.isArray(data) ? data : []);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(Array.isArray(data) ? data : []);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setLocations([]);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    let date: string | undefined;
    
    switch (value) {
      case 'today':
        date = new Date().toISOString().split('T')[0];
        break;
      case 'tomorrow':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        date = tomorrow.toISOString().split('T')[0];
        break;
      case 'week':
        date = undefined; // Show all classes
        break;
    }
    
    setSelectedDate(date || '');
    fetchClasses(date);
  };

  const handleCreateClass = () => {
    fetchClasses(selectedDate);
    setCreateDialogOpen(false);
  };

  const handleMarkAttendance = (classSession: ClassSession) => {
    setSelectedClass(classSession);
    setAttendanceDialogOpen(true);
  };

  const handleAttendanceMarked = () => {
    fetchClasses(selectedDate);
    setAttendanceDialogOpen(false);
    setSelectedClass(null);
  };

  const handleSendReminder = async (classSession: ClassSession) => {
    try {
      // Get students enrolled in this class's module
      if (classSession.module?.id) {
        const response = await fetch(`/api/students?moduleId=${classSession.module.id}`);
        if (response.ok) {
          const data = await response.json();
          const students = (data.students || data || []).map((s: any) => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            fullName: s.fullName,
            email: s.email,
            studentId: s.studentId
          }));
          
          setReminderStudents(students);
          setSelectedClass(classSession);
          setEmailDialogOpen(true);
        }
      } else {
        toast({
          title: 'No Students',
          description: 'This class is not associated with a specific module',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch students for reminder',
        variant: 'destructive'
      });
    }
  };

  const handleReminderSent = () => {
    setEmailDialogOpen(false);
    setSelectedClass(null);
    setReminderStudents([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className="w-4 h-4" />;
      case 'lab':
        return <Users className="w-4 h-4" />;
      case 'practical':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const getAttendanceStats = (classSession: ClassSession) => {
    const total = classSession._count.attendance;
    const present = classSession.attendance.filter(a => a.status === 'present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, total, percentage };
  };

  const filteredClasses = classes.filter(cls => {
    if (activeTab === 'week') return true;
    
    const classDate = new Date(cls.date).toISOString().split('T')[0];
    return classDate === selectedDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-mobile">
      {/* Action Bar */}
      <div className="flex-mobile-center gap-mobile-sm mb-6">
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Class
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="glass-morphism border-white/20 mb-6">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-mobile">
          {filteredClasses.length === 0 ? (
            <Card className="glass-morphism border-white/20">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Classes Scheduled
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'today' 
                    ? "You don't have any classes today."
                    : activeTab === 'tomorrow'
                    ? "You don't have any classes tomorrow."
                    : "You don't have any classes this week."
                  }
                </p>
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-mobile-sm">
              {filteredClasses.map((classSession) => {
                const stats = getAttendanceStats(classSession);
                
                return (
                  <Card 
                    key={classSession.id} 
                    className="glass-morphism border-white/20 hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex-mobile-center gap-mobile-sm">
                        <div className="flex items-center gap-2 flex-1">
                          {getTypeIcon(classSession.type)}
                          <CardTitle className="text-mobile-lg font-semibold">
                            {classSession.title}
                          </CardTitle>
                        </div>
                        <Badge className={getStatusColor(classSession.status)}>
                          {classSession.status}
                        </Badge>
                      </div>
                      
                      {classSession.description && (
                        <p className="text-mobile-xs text-gray-600 mt-2">
                          {classSession.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-mobile-xs">
                      {/* Class Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-mobile-xs text-mobile-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateDisplay(classSession.date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{classSession.startTime} - {classSession.endTime}</span>
                          <span className="text-gray-400">({classSession.duration}min)</span>
                        </div>
                        
                        {classSession.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{classSession.location.name}</span>
                            {classSession.location.building && (
                              <span className="text-gray-400">({classSession.location.building})</span>
                            )}
                          </div>
                        )}
                        
                        {(classSession.module || classSession.subject) && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>
                              {classSession.module ? `${classSession.module.code} - ${classSession.module.name}` : ''}
                              {classSession.subject ? ` / ${classSession.subject.code}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Attendance Stats */}
                      {stats.total > 0 && (
                        <div className="mt-4 p-3 bg-gray-50/80 rounded-lg">
                          <div className="flex-mobile-center gap-mobile-xs">
                            <div className="flex items-center gap-2 flex-1">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-mobile-xs text-gray-700">
                                Attendance: {stats.present}/{stats.total} ({stats.percentage}%)
                              </span>
                            </div>
                            
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${stats.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200/50">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleMarkAttendance(classSession)}
                            disabled={classSession.status === 'cancelled'}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {stats.total > 0 ? 'Update Attendance' : 'Mark Attendance'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(classSession)}
                            disabled={classSession.status === 'cancelled'}
                            className="hover:bg-blue-50 border-blue-200 text-blue-600"
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Send Reminder
                          </Button>
                          
                          {classSession.notes && (
                            <Badge variant="outline" className="text-mobile-xs">
                              Has Notes
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateClassDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onClassCreated={handleCreateClass}
        modules={modules}
        subjects={subjects}
        locations={locations}
      />

      {selectedClass && (
        <AttendanceDialog
          open={attendanceDialogOpen}
          onOpenChange={setAttendanceDialogOpen}
          classSession={selectedClass}
          onAttendanceMarked={handleAttendanceMarked}
        />
      )}

      {/* Class Reminder Email Dialog */}
      {selectedClass && reminderStudents.length > 0 && (
        <SendEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          students={reminderStudents}
          defaultSubject={`Class Reminder: ${selectedClass.title} - ${format(parseISO(selectedClass.date), 'MMM d, yyyy')}`}
          defaultMessage={`Dear Students,

This is a friendly reminder about your upcoming class:

📚 Class: ${selectedClass.title}
📅 Date: ${format(parseISO(selectedClass.date), 'EEEE, MMMM d, yyyy')}
🕐 Time: ${selectedClass.startTime} - ${selectedClass.endTime}
${selectedClass.location ? `📍 Location: ${selectedClass.location.name}` : ''}

Please make sure to arrive on time and bring all necessary materials for the session.

If you have any questions or concerns, please don't hesitate to reach out.

Best regards,
Your Instructor`}
          type="class_reminder"
          classId={selectedClass.id}
        />
      )}
    </div>
  );
}
