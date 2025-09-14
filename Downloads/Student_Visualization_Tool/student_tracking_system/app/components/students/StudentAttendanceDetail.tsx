'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Download,
  StickyNote,
  BarChart3,
  Target,
  Award
} from 'lucide-react';
import { format, parseISO, isWithinInterval, subMonths } from 'date-fns';

interface StudentAttendanceDetailProps {
  studentId: string;
  onClose: () => void;
}

interface AttendanceRecord {
  id: string;
  status: string;
  notes?: string;
  markedAt: string;
  classSession: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    module: {
      code: string;
      name: string;
    };
    location?: {
      name: string;
      building?: string;
    };
  };
  marker?: {
    name: string;
  };
}

interface StudentData {
  student: {
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    module: {
      code: string;
      name: string;
    };
  };
  attendance: AttendanceRecord[];
  statistics?: {
    overview: {
      totalSessions: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      excusedCount: number;
      attendanceRate: number;
      punctualityRate: number;
    };
    monthlyTrends: Array<{
      month: string;
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      attendanceRate: number;
    }>;
    recentPattern: Array<{
      date: string;
      status: string;
      notes?: string;
    }>;
    alerts: Array<{
      type: string;
      message: string;
      severity: string;
    }>;
  };
}

const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' },
  { value: 'excused', label: 'Excused', icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' }
];

export function StudentAttendanceDetail({ studentId, onClose }: StudentAttendanceDetailProps) {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'last3months' | 'custom'>('last3months');
  const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, [studentId, dateFilter, startDate, endDate]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        includeStats: 'true'
      });

      if (dateFilter === 'last3months') {
        params.append('startDate', format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
        params.append('endDate', format(new Date(), 'yyyy-MM-dd'));
      } else if (dateFilter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/students/${studentId}/attendance?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
      } else {
        throw new Error('Failed to fetch student attendance data');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load student attendance data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportStudentData = () => {
    if (!studentData?.attendance.length) {
      toast({
        title: 'No Data',
        description: 'No attendance data to export',
        variant: 'destructive'
      });
      return;
    }

    const csvContent = [
      ['Date', 'Class Title', 'Module', 'Status', 'Notes', 'Class Time', 'Location', 'Marked By', 'Marked At'],
      ...studentData.attendance.map(record => [
        format(parseISO(record.classSession.date), 'yyyy-MM-dd'),
        record.classSession.title,
        record.classSession.module.code,
        record.status,
        record.notes || '',
        `${record.classSession.startTime} - ${record.classSession.endTime}`,
        record.classSession.location?.name || '',
        record.marker?.name || '',
        record.markedAt ? format(parseISO(record.markedAt), 'yyyy-MM-dd HH:mm') : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${studentData.student.studentId}_${studentData.student.fullName.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Student Not Found</h3>
            <p className="text-gray-500 mb-4">Unable to load student attendance data.</p>
            <Button onClick={onClose}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = studentData.statistics?.overview;
  const alerts = studentData.statistics?.alerts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                  {studentData.student.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{studentData.student.fullName}</h1>
                <p className="text-gray-600">ID: {studentData.student.studentId}</p>
                <p className="text-sm text-gray-500">
                  {studentData.student.module.code} - {studentData.student.module.name}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Date Filter */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex gap-2">
              <Button
                variant={dateFilter === 'last3months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('last3months')}
              >
                Last 3 Months
              </Button>
              <Button
                variant={dateFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('all')}
              >
                All Time
              </Button>
              <Button
                variant={dateFilter === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('custom')}
              >
                Custom Range
              </Button>
            </div>

            {dateFilter === 'custom' && (
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={exportStudentData}
              disabled={!studentData.attendance.length}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2 mb-6">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    alert.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                    'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats.totalSessions}</div>
                <div className="text-sm text-blue-700">Total Sessions</div>
              </div>

              {ATTENDANCE_STATUSES.map(status => (
                <div key={status.value} className={`text-center p-4 ${status.bgColor} rounded-lg`}>
                  <div className={`text-3xl font-bold ${status.color}`}>
                    {stats[`${status.value}Count`] || 0}
                  </div>
                  <div className={`text-sm ${status.color}`}>{status.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-semibold text-green-800">Attendance Rate</span>
                </div>
                <div className="text-4xl font-bold text-green-600">{stats.attendanceRate}%</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-800">Punctuality Rate</span>
                </div>
                <div className="text-4xl font-bold text-blue-600">{stats.punctualityRate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trends */}
      {studentData.statistics?.monthlyTrends && studentData.statistics.monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Monthly Attendance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentData.statistics.monthlyTrends.map(trend => (
                <div key={trend.month} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{format(new Date(trend.month + '-01'), 'MMMM yyyy')}</h3>
                      <p className="text-sm text-gray-600">{trend.total} total sessions</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        trend.attendanceRate >= 90 ? 'text-green-600' :
                        trend.attendanceRate >= 75 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {trend.attendanceRate}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-sm">
                    {ATTENDANCE_STATUSES.map(status => (
                      <div key={status.value} className="text-center">
                        <div className={`font-semibold ${status.color}`}>
                          {trend[status.value] || 0}
                        </div>
                        <div className="text-xs text-gray-500">{status.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Attendance History ({studentData.attendance.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {studentData.attendance.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No attendance records found for the selected period.
              </div>
            ) : (
              studentData.attendance.map(record => {
                const status = ATTENDANCE_STATUSES.find(s => s.value === record.status);
                const StatusIcon = status?.icon || CheckCircle;

                return (
                  <div key={record.id} className={`border rounded-lg p-4 ${status?.borderColor} hover:bg-gray-50`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-semibold">
                            {format(parseISO(record.classSession.date), 'EEEE, MMM d, yyyy')}
                          </div>
                          <Badge variant="secondary" className={`${status?.color} ${status?.bgColor} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status?.label}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 mb-1">
                          <strong>{record.classSession.title}</strong> • {record.classSession.module.code}
                        </div>

                        <div className="text-xs text-gray-500 flex items-center gap-4">
                          <span>{record.classSession.startTime} - {record.classSession.endTime}</span>
                          <span>{record.classSession.type}</span>
                          {record.classSession.location && (
                            <span>{record.classSession.location.name}</span>
                          )}
                        </div>

                        {record.notes && (
                          <div className="mt-2 flex items-start gap-2">
                            <StickyNote className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 italic">"{record.notes}"</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right text-xs text-gray-400">
                        {record.marker && (
                          <div>Marked by {record.marker.name}</div>
                        )}
                        <div>{format(parseISO(record.markedAt), 'MMM d, HH:mm')}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}