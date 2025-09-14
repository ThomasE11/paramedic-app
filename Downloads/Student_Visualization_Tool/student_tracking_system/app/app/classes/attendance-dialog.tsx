
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck, 
  Users, 
  Search,
  Calendar,
  MapPin,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classSession: any;
  onAttendanceMarked: () => void;
}

interface AttendanceRecord {
  id?: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  duration?: number;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    studentId: string;
  };
}

const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600' },
  { value: 'excused', label: 'Excused', icon: UserCheck, color: 'text-blue-600' }
];

export function AttendanceDialog({
  open,
  onOpenChange,
  classSession,
  onAttendanceMarked
}: AttendanceDialogProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open && classSession) {
      fetchClassDetails();
    }
  }, [open, classSession]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/classes/${classSession.id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Convert attendance data to the format we need
        const attendanceRecords = data.attendance.map((att: any) => ({
          id: att.id,
          studentId: att.studentId,
          status: att.status,
          notes: att.notes || '',
          duration: att.duration || null,
          student: att.student
        }));
        
        setAttendance(attendanceRecords);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch class details',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch class details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const attendanceData = attendance.map(att => ({
        classSessionId: classSession.id,
        studentId: att.studentId,
        status: att.status,
        notes: att.notes || null,
        duration: att.duration || null
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendance: attendanceData })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Attendance marked successfully'
        });
        onAttendanceMarked();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to mark attendance',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredAttendance = attendance.filter(att =>
    att.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    att.student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStats = () => {
    const stats = attendance.reduce((acc, att) => {
      acc[att.status] = (acc[att.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const stats = getStatusStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Mark Attendance - {classSession.title}
          </DialogTitle>
          
          {/* Class Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(classSession.date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{classSession.startTime} - {classSession.endTime}</span>
            </div>
            {classSession.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{classSession.location.name}</span>
              </div>
            )}
            {classSession.module && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{classSession.module.code}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Stats & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-4">
                {ATTENDANCE_STATUSES.map(({ value, label, color }) => (
                  <div key={value} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color.replace('text-', 'bg-')}`} />
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
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Attendance List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredAttendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {attendance.length === 0 
                    ? 'No students enrolled in this class.'
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
                          {att.student.firstName[0]}{att.student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          {att.student.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {att.student.studentId}
                        </div>
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex gap-1">
                      {ATTENDANCE_STATUSES.map(({ value, label, icon: Icon, color }) => (
                        <Button
                          key={value}
                          size="sm"
                          variant={att.status === value ? 'default' : 'outline'}
                          onClick={() => updateAttendanceStatus(att.studentId, value)}
                          className={`
                            ${att.status === value 
                              ? `${color.replace('text-', 'bg-')} text-white hover:opacity-80` 
                              : `${color} hover:${color.replace('text-', 'bg-')}/10`
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="sr-only">{label}</span>
                        </Button>
                      ))}
                    </div>

                    {/* Notes */}
                    {(att.status === 'late' || att.status === 'excused' || att.notes) && (
                      <div className="w-48">
                        <Input
                          placeholder="Add notes..."
                          value={att.notes || ''}
                          onChange={(e) => updateAttendanceNotes(att.studentId, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || attendance.length === 0}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Attendance'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
