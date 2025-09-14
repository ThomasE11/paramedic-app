'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Users,
  TrendingUp,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  BarChart3,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface HistoricalAttendanceReviewProps {
  modules: any[];
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
    module: {
      code: string;
      name: string;
    };
    location?: {
      name: string;
      building?: string;
    };
  };
  student: {
    id: string;
    studentId: string;
    fullName: string;
  };
  marker?: {
    name: string;
  };
}

const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'excused', label: 'Excused', icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-100' }
];

export function HistoricalAttendanceReview({ modules, onClose }: HistoricalAttendanceReviewProps) {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');
  const { toast } = useToast();

  const fetchHistoricalData = async () => {
    if (!selectedModule) {
      toast({
        title: 'Module Required',
        description: 'Please select a module to view historical attendance',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        moduleId: selectedModule
      });

      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/attendance?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      } else {
        throw new Error('Failed to fetch historical data');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load historical attendance data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance data based on search and status
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = record.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.classSession.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group data by date for summary view
  const summaryData = filteredData.reduce((acc: any, record) => {
    const date = format(parseISO(record.classSession.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = {
        date,
        classTitle: record.classSession.title,
        records: [],
        stats: { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
      };
    }
    acc[date].records.push(record);
    acc[date].stats[record.status]++;
    acc[date].stats.total++;
    return acc;
  }, {});

  const summaryArray = Object.values(summaryData).sort((a: any, b: any) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const exportHistoricalData = () => {
    if (filteredData.length === 0) {
      toast({
        title: 'No Data',
        description: 'No attendance data to export',
        variant: 'destructive'
      });
      return;
    }

    const csvContent = [
      ['Date', 'Student ID', 'Student Name', 'Class Title', 'Module', 'Status', 'Notes', 'Marked By', 'Marked At'],
      ...filteredData.map(record => [
        format(parseISO(record.classSession.date), 'yyyy-MM-dd'),
        record.student.studentId,
        record.student.fullName,
        record.classSession.title,
        record.classSession.module.code,
        record.status,
        record.notes || '',
        record.marker?.name || '',
        record.markedAt ? format(parseISO(record.markedAt), 'yyyy-MM-dd HH:mm') : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const moduleCode = modules.find(m => m.id === selectedModule)?.code || 'module';
    a.download = `historical_attendance_${moduleCode}_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate overall statistics
  const overallStats = filteredData.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });

  const attendanceRate = overallStats.total > 0 ?
    Math.round((overallStats.present / overallStats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Historical Attendance Review
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.code} - {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchHistoricalData}
                disabled={loading || !selectedModule}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Load Data
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Search and View Controls */}
          {attendanceData.length > 0 && (
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search students or classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ATTENDANCE_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  List View
                </Button>
                <Button
                  variant={viewMode === 'summary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('summary')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Summary
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={exportHistoricalData}
                disabled={filteredData.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {attendanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Statistics ({format(parseISO(startDate), 'MMM d')} - {format(parseISO(endDate), 'MMM d, yyyy')})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{overallStats.total}</div>
                <div className="text-sm text-blue-700">Total Records</div>
              </div>
              {ATTENDANCE_STATUSES.map(status => (
                <div key={status.value} className={`text-center p-4 ${status.bgColor} rounded-lg`}>
                  <div className={`text-2xl font-bold ${status.color}`}>
                    {overallStats[status.value] || 0}
                  </div>
                  <div className={`text-sm ${status.color}`}>{status.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{attendanceRate}%</div>
                  <div className="text-sm text-gray-600">Overall Attendance Rate</div>
                </div>
                {attendanceRate < 75 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">Low attendance rate</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Display */}
      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {viewMode === 'list' ? 'Detailed Records' : 'Daily Summaries'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredData.length} records)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {viewMode === 'list' ? (
                // List View
                filteredData.map(record => {
                  const status = ATTENDANCE_STATUSES.find(s => s.value === record.status);
                  const StatusIcon = status?.icon || CheckCircle;

                  return (
                    <div key={record.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                            {record.student.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="font-medium">{record.student.fullName}</div>
                          <div className="text-sm text-gray-500">
                            ID: {record.student.studentId}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="font-medium">
                            {format(parseISO(record.classSession.date), 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.classSession.startTime} - {record.classSession.endTime}
                          </div>
                        </div>

                        <div className="text-center min-w-32">
                          <div className="font-medium text-sm">{record.classSession.title}</div>
                          <div className="text-xs text-gray-500">{record.classSession.module.code}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={`${status?.color} ${status?.bgColor} border-0`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status?.label}
                        </Badge>

                        {record.notes && (
                          <div className="text-xs text-gray-600 max-w-32 truncate" title={record.notes}>
                            "{record.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Summary View
                summaryArray.map((summary: any) => (
                  <div key={summary.date} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {format(parseISO(summary.date), 'EEEE, MMM d, yyyy')}
                        </h3>
                        <p className="text-sm text-gray-600">{summary.classTitle}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {Math.round((summary.stats.present / summary.stats.total) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {summary.stats.present}/{summary.stats.total} present
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-sm">
                      {ATTENDANCE_STATUSES.map(status => (
                        <div key={status.value} className="text-center">
                          <div className={`font-semibold ${status.color}`}>
                            {summary.stats[status.value] || 0}
                          </div>
                          <div className="text-xs text-gray-500">{status.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {attendanceData.length === 0 && !loading && selectedModule && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Attendance Data</h3>
            <p className="text-gray-500">
              No attendance records found for the selected criteria. Try adjusting the date range or module selection.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}