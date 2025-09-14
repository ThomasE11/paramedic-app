'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertTriangle,
  Eye,
  StickyNote,
  BarChart3
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AttendanceRecord {
  id: string;
  status: string;
  notes?: string;
  markedAt: string;
  classSession: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
  };
}

interface AttendanceStatistics {
  overview: {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number;
    punctualityRate: number;
  };
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
}

interface StudentAttendanceSummaryProps {
  studentId: string;
  onViewDetails: () => void;
}

const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'excused', label: 'Excused', icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-100' }
];

export function StudentAttendanceSummary({ studentId, onViewDetails }: StudentAttendanceSummaryProps) {
  const [attendanceData, setAttendanceData] = useState<{
    attendance: AttendanceRecord[];
    statistics: AttendanceStatistics;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceData();
  }, [studentId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Get last 3 months of data with statistics
      const params = new URLSearchParams({
        includeStats: 'true',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });

      const response = await fetch(`/api/students/${studentId}/attendance?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      } else {
        throw new Error('Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attendanceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p>No attendance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = attendanceData.statistics.overview;
  const alerts = attendanceData.statistics.alerts || [];
  const recentAttendance = attendanceData.attendance.slice(0, 5);

  const getStatusIcon = (status: string) => {
    const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status);
    const Icon = statusConfig?.icon || CheckCircle;
    return <Icon className={`w-4 h-4 ${statusConfig?.color || 'text-gray-500'}`} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Attendance Summary (Last 3 Months)
          </div>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                  alert.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{stats.totalSessions}</div>
            <div className="text-xs text-blue-700">Total Sessions</div>
          </div>

          {ATTENDANCE_STATUSES.map(status => (
            <div key={status.value} className={`text-center p-3 ${status.bgColor} rounded-lg`}>
              <div className={`text-xl font-bold ${status.color}`}>
                {stats[`${status.value}Count`] || 0}
              </div>
              <div className={`text-xs ${status.color}`}>{status.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance Rate */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Overall Attendance Rate</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{stats.attendanceRate}%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Punctuality Rate</div>
              <div className="text-xl font-bold text-blue-600">{stats.punctualityRate}%</div>
            </div>
          </div>
        </div>

        {/* Recent Pattern */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Attendance Pattern
          </h4>

          {recentAttendance.length > 0 ? (
            <div className="space-y-2">
              {recentAttendance.map(record => (
                <div key={record.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <div className="text-sm font-medium">
                        {format(parseISO(record.classSession.date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.classSession.title} • {record.classSession.startTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-xs ${
                      ATTENDANCE_STATUSES.find(s => s.value === record.status)?.color || 'text-gray-600'
                    }`}>
                      {ATTENDANCE_STATUSES.find(s => s.value === record.status)?.label || record.status}
                    </Badge>

                    {record.notes && (
                      <StickyNote className="w-3 h-3 text-yellow-500" title={record.notes} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent attendance records
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Full History
            </Button>
            {stats.attendanceRate < 85 && (
              <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Follow Up
              </Button>
            )}
          </div>
        </div>

        {/* Notes Summary */}
        {attendanceData.attendance.some(record => record.notes) && (
          <div className="pt-3 border-t">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Recent Attendance Notes
            </h4>
            <div className="space-y-1">
              {attendanceData.attendance
                .filter(record => record.notes)
                .slice(0, 3)
                .map(record => (
                  <div key={record.id} className="text-sm text-gray-600 italic p-2 bg-yellow-50 rounded border-l-2 border-yellow-300">
                    <span className="font-medium text-yellow-800">
                      {format(parseISO(record.classSession.date), 'MMM d')}:
                    </span>
                    {' "' + record.notes + '"'}
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}