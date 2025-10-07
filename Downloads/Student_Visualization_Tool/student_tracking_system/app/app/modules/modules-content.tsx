
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Users, Search, Mail, Download, Calendar, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ModuleWithStudents } from '@/lib/types';
import { ModuleActivityTimeline } from '@/components/modules/module-activity-timeline';
import Link from 'next/link';

export function ModulesContent() {
  const [modules, setModules] = useState<ModuleWithStudents[]>([]);
  const [filteredModules, setFilteredModules] = useState<ModuleWithStudents[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = modules?.filter(module =>
        module?.code?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        module?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
      ) || [];
      setFilteredModules(filtered);
    } else {
      setFilteredModules(modules);
    }
  }, [searchTerm, modules]);

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/modules');
      const data = await response.json();

      if (response.ok) {
        setModules(data.modules || []);
        setFilteredModules(data.modules || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load modules',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong loading modules',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailModule = (module: ModuleWithStudents) => {
    if (!module?.students?.length) {
      toast({
        title: 'No Students',
        description: 'This module has no students to email',
        variant: 'destructive'
      });
      return;
    }

    const emails = module.students
      .filter(student => student?.email)
      .map(student => student.email)
      .join(';');
    
    if (emails) {
      const subject = encodeURIComponent(`${module.code} - ${module.name} Announcement`);
      const body = encodeURIComponent(`Dear Students,\n\n`);
      window.open(`mailto:${emails}?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const handleExportModule = (module: ModuleWithStudents) => {
    if (!module?.students?.length) {
      toast({
        title: 'No Students',
        description: 'This module has no students to export',
        variant: 'destructive'
      });
      return;
    }

    try {
      const csvContent = [
        ['Student ID', 'Full Name', 'Email', 'Phone'].join(','),
        ...module.students.map(student => [
          student?.studentId || '',
          student?.fullName || '',
          student?.email || '',
          student?.phone || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${module.code}_students_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: `${module.code} students exported successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export students',
        variant: 'destructive'
      });
    }
  };

  const getNextDeadline = (module: any) => {
    if (!module?.submissionSchedule?.timeline) return null;

    const now = new Date();
    const upcoming = module.submissionSchedule.timeline.find((entry: any) => {
      const deadline = new Date(entry.date + 'T23:59:59');
      return deadline >= now;
    });

    return upcoming;
  };

  const getUpcomingCount = (module: any) => {
    const deadline = getNextDeadline(module);
    return deadline ? deadline.items.length : 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-white rounded-lg border animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-lg border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search modules by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      {filteredModules?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {searchTerm ? 'No modules found matching your search' : 'No modules found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredModules?.map((module) => {
            const nextDeadline = getNextDeadline(module);
            const upcomingCount = getUpcomingCount(module);
            const hasSubmissionSchedule = module?.submissionSchedule?.timeline;

            return (
              <div key={module?.id} className="space-y-4">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">
                              {module?.code || 'Unknown Code'} - {module?.name || 'No name available'}
                            </CardTitle>
                            {hasSubmissionSchedule && (
                              <Link href={`/modules/${module.id}`}>
                                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  View Schedule
                                </Badge>
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {module?.students?.length || 0} students
                            </Badge>
                            {nextDeadline && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                <Clock className="w-3 h-3 mr-1" />
                                {upcomingCount} upcoming submission{upcomingCount !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmailModule(module)}
                          disabled={!module?.students?.length}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportModule(module)}
                          disabled={!module?.students?.length}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Activities
                          {expandedModule === module.id ? (
                            <ChevronUp className="w-4 h-4 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-2" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {module?.description || 'No description available'}
                    </p>

                    {/* Quick Deadline Preview */}
                    {nextDeadline && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold text-orange-900 mb-1">
                              Next Deadline: {new Date(nextDeadline.date + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-orange-800 space-y-1">
                              {nextDeadline.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="text-lg">{item.emoji}</span>
                                  <span>{item.title}</span>
                                  {item.mandatory && (
                                    <Badge className="bg-red-100 text-red-700 text-xs border-red-200">
                                      MANDATORY
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                            <Link href={`/modules/${module.id}`}>
                              <Button variant="link" className="text-orange-700 hover:text-orange-900 p-0 h-auto mt-2">
                                View full submission schedule →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Activity Timeline - Expanded Section */}
                {expandedModule === module.id && (
                  <ModuleActivityTimeline
                    moduleId={module.id}
                    moduleCode={module.code}
                    moduleName={module.name}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
