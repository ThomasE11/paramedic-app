
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Plus,
  Edit,
  RefreshCw
} from 'lucide-react';

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
  notes?: string;
}

interface Schedule {
  id: string;
  student: Student;
  semester: string;
  academicYear: string;
  entries: ScheduleEntry[];
}

interface ScheduleViewerProps {
  student: Student;
  schedule?: Schedule;
  onBack: () => void;
  onRefresh: () => void;
}

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 7, name: 'Sunday', short: 'Sun' }
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

export function ScheduleViewer({ student, schedule, onBack, onRefresh }: ScheduleViewerProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { toast } = useToast();

  const getModuleColor = (moduleCode?: string) => {
    switch (moduleCode) {
      case 'HEM3903': return 'from-blue-500 to-purple-500';
      case 'HEM2903': return 'from-green-500 to-teal-500';
      case 'HEM3923': return 'from-orange-500 to-red-500';
      case 'AEM230': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lecture': return 'bg-blue-500';
      case 'lab': return 'bg-green-500';
      case 'clinical': return 'bg-red-500';
      case 'practical': return 'bg-orange-500';
      case 'tutorial': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getEntriesForDay = (dayOfWeek: number) => {
    if (!schedule) return [];
    return schedule.entries
      .filter(entry => entry.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getGridPosition = (startTime: string, endTime: string) => {
    const startIndex = TIME_SLOTS.indexOf(startTime);
    const endIndex = TIME_SLOTS.indexOf(endTime);
    
    if (startIndex === -1 || endIndex === -1) return null;
    
    return {
      gridRow: `${startIndex + 2} / ${endIndex + 2}`,
      gridColumn: '1 / -1'
    };
  };

  const createSampleSchedule = async () => {
    // This would typically create a sample/template schedule
    toast({
      title: 'Feature Coming Soon',
      description: 'Schedule creation and editing will be available in the next update',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="glass-morphism border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="rounded-xl border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>

            <div className="flex items-center gap-3">
              <Button
                onClick={onRefresh}
                variant="outline"
                className="rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    view === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    view === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List View
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${getModuleColor(student.module?.code)} rounded-2xl flex items-center justify-center shadow-lg`}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.fullName}</h1>
              <p className="text-gray-600">Student ID: {student.studentId}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="badge-info">
                  {student.module?.code || 'No Module'}
                </Badge>
                {schedule && (
                  <Badge className="badge-success">
                    {schedule.entries.length} classes scheduled
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Content */}
      {!schedule || schedule.entries.length === 0 ? (
        <Card className="glass-morphism border-white/20 shadow-xl">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schedule Available</h3>
            <p className="text-gray-600 mb-6">
              This student doesn't have a timetable yet. You can create one or import from the system.
            </p>
            <Button
              onClick={createSampleSchedule}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {view === 'grid' && (
            <Card className="glass-morphism border-white/20 shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Timetable
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-[800px] grid grid-cols-8 bg-white">
                    {/* Time column header */}
                    <div className="bg-gray-50 border-b border-r border-gray-200 p-4 font-semibold text-gray-900 text-center">
                      Time
                    </div>
                    
                    {/* Day headers */}
                    {DAYS.slice(0, 7).map(day => (
                      <div
                        key={day.id}
                        className="bg-gray-50 border-b border-r border-gray-200 p-4 font-semibold text-gray-900 text-center"
                      >
                        <div>{day.short}</div>
                        <div className="text-xs text-gray-600 mt-1">{day.name}</div>
                      </div>
                    ))}
                    
                    {/* Time slots and schedule entries */}
                    {TIME_SLOTS.map((time, timeIndex) => (
                      <React.Fragment key={time}>
                        {/* Time label */}
                        <div className="border-b border-r border-gray-200 p-2 text-sm text-gray-600 text-center bg-gray-50">
                          {formatTime(time)}
                        </div>
                        
                        {/* Day columns */}
                        {DAYS.slice(0, 7).map(day => {
                          const entries = getEntriesForDay(day.id);
                          const entryForThisSlot = entries.find(entry => 
                            entry.startTime <= time && entry.endTime > time
                          );
                          
                          return (
                            <div
                              key={`${day.id}-${time}`}
                              className="border-b border-r border-gray-200 min-h-[60px] relative"
                            >
                              {entryForThisSlot && entryForThisSlot.startTime === time && (
                                <div
                                  className={`absolute inset-1 ${getTypeColor(entryForThisSlot.type)} text-white p-2 rounded-lg shadow-sm text-xs`}
                                  style={{
                                    height: `${(TIME_SLOTS.indexOf(entryForThisSlot.endTime) - TIME_SLOTS.indexOf(entryForThisSlot.startTime)) * 60 - 4}px`
                                  }}
                                >
                                  <div className="font-semibold truncate">{entryForThisSlot.title}</div>
                                  <div className="opacity-90 truncate">
                                    {formatTime(entryForThisSlot.startTime)} - {formatTime(entryForThisSlot.endTime)}
                                  </div>
                                  {entryForThisSlot.location && (
                                    <div className="opacity-80 truncate text-xs">
                                      {entryForThisSlot.location.name}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {view === 'list' && (
            <div className="space-y-6">
              {DAYS.map(day => {
                const dayEntries = getEntriesForDay(day.id);
                
                return (
                  <Card key={day.id} className="glass-morphism border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {day.name}
                        </div>
                        <Badge variant="outline">
                          {dayEntries.length} classes
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dayEntries.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No classes scheduled</p>
                      ) : (
                        <div className="space-y-4">
                          {dayEntries.map(entry => (
                            <div
                              key={entry.id}
                              className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-gray-200/50"
                            >
                              <div className={`w-4 h-16 ${getTypeColor(entry.type)} rounded-full`}></div>
                              
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                  </div>
                                  {entry.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {entry.location.name}
                                    </div>
                                  )}
                                  {entry.instructor && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      {entry.instructor}
                                    </div>
                                  )}
                                  {entry.subject && (
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="w-4 h-4" />
                                      {entry.subject.code}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <Badge className={`${getTypeColor(entry.type)} text-white`}>
                                {entry.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
