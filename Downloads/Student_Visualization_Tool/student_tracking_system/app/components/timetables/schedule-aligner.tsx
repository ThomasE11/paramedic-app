
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Zap,
  Clock,
  Users,
  Calendar,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Filter,
  Star
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

interface FreeSlot {
  day: number;
  dayName: string;
  startTime: string;
  endTime: string;
  duration: number;
  availableStudents: string[];
  studentCount: number;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  slot: FreeSlot;
  priority: 'high' | 'medium' | 'low';
}

interface AlignmentResult {
  freeSlots: FreeSlot[];
  recommendations: Recommendation[];
  studentsAnalyzed: Array<{
    id: string;
    name: string;
    studentId: string;
  }>;
  totalSlots: number;
  parameters: {
    minDuration: number;
    workingHours: {
      start: string;
      end: string;
    };
    daysChecked: string[];
  };
}

interface ScheduleAlignerProps {
  students: Student[];
  onBack: () => void;
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

export function ScheduleAligner({ students, onBack }: ScheduleAlignerProps) {
  const [alignmentResult, setAlignmentResult] = useState<AlignmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parameters, setParameters] = useState({
    minDuration: 60,
    startTime: '08:00',
    endTime: '18:00',
    selectedDays: [1, 2, 3, 4, 5] // Weekdays by default
  });
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/schedules/align', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentIds: students.map(s => s.id),
          minDuration: parameters.minDuration,
          timeRange: {
            start: parameters.startTime,
            end: parameters.endTime
          },
          dayFilter: parameters.selectedDays
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAlignmentResult(data);
        toast({
          title: 'Analysis Complete',
          description: `Found ${data.totalSlots} available time slots for ${students.length} students`
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to analyze schedules',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong during analysis',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'low': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return Star;
      case 'medium': return TrendingUp;
      case 'low': return Lightbulb;
      default: return Clock;
    }
  };

  const handleDayToggle = (dayId: number) => {
    setParameters(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter(id => id !== dayId)
        : [...prev.selectedDays, dayId]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="glass-morphism border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="outline"
              className="rounded-xl border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Schedule Alignment</h1>
                <p className="text-gray-600">Find optimal meeting times for {students.length} students</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1 glass-morphism border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Analysis Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Students */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Selected Students ({students.length})
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {students.map(student => (
                  <div key={student.id} className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {student.fullName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                      {student.fullName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div>
              <Label htmlFor="duration" className="text-sm font-semibold text-gray-700 mb-2 block">
                Minimum Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={parameters.minDuration}
                onChange={(e) => setParameters(prev => ({ ...prev, minDuration: parseInt(e.target.value) || 60 }))}
                min="30"
                max="480"
                step="30"
                className="rounded-xl"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Start Time
                </Label>
                <Select
                  value={parameters.startTime}
                  onValueChange={(value) => setParameters(prev => ({ ...prev, startTime: value }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const time = `${i.toString().padStart(2, '0')}:00`;
                      return (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  End Time
                </Label>
                <Select
                  value={parameters.endTime}
                  onValueChange={(value) => setParameters(prev => ({ ...prev, endTime: value }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const time = `${i.toString().padStart(2, '0')}:00`;
                      return (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Day Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Days to Check
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map(day => (
                  <button
                    key={day.id}
                    onClick={() => handleDayToggle(day.id)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      parameters.selectedDays.includes(day.id)
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading || students.length < 2}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Schedules
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {alignmentResult ? (
            <>
              {/* AI Recommendations */}
              {alignmentResult.recommendations.length > 0 && (
                <Card className="glass-morphism border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {alignmentResult.recommendations.map((rec, index) => {
                      const Icon = getPriorityIcon(rec.priority);
                      return (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-xl bg-white/60"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 ${getPriorityColor(rec.priority)} rounded-xl flex items-center justify-center shadow-md`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                <Badge className={`${getPriorityColor(rec.priority)} text-white text-xs`}>
                                  {rec.priority.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {rec.slot.dayName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(rec.slot.startTime)} - {formatTime(rec.slot.endTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {rec.slot.studentCount} students
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* All Available Slots */}
              <Card className="glass-morphism border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Available Time Slots
                    </div>
                    <Badge variant="outline">
                      {alignmentResult.totalSlots} slots found
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alignmentResult.freeSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Common Free Time</h3>
                      <p className="text-gray-600">
                        Try adjusting your parameters or selecting fewer students
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {alignmentResult.freeSlots.slice(0, 10).map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold">
                              {slot.dayName.slice(0, 3)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {slot.dayName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatDuration(slot.duration)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {slot.studentCount} / {students.length} students
                              </div>
                            </div>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-teal-600"
                                style={{ width: `${(slot.studentCount / students.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="glass-morphism border-white/20 shadow-xl">
              <CardContent className="p-12 text-center">
                <Zap className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for Analysis</h3>
                <p className="text-gray-600">
                  Configure your parameters and click "Analyze Schedules" to find the best meeting times 
                  for your selected students using our AI-powered algorithm.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
