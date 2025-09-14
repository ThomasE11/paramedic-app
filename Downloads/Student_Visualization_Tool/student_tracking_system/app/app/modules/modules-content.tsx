
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Users, Search, Mail, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ModuleWithStudents } from '@/lib/types';

export function ModulesContent() {
  const [modules, setModules] = useState<ModuleWithStudents[]>([]);
  const [filteredModules, setFilteredModules] = useState<ModuleWithStudents[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules?.map((module) => (
            <Card key={module?.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {module?.code || 'Unknown Code'}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1">
                        <Users className="w-3 h-3 mr-1" />
                        {module?.students?.length || 0} students
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {module?.name || 'No name available'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {module?.description || 'No description available'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmailModule(module)}
                    className="flex-1"
                    disabled={!module?.students?.length}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportModule(module)}
                    className="flex-1"
                    disabled={!module?.students?.length}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                {module?.students?.length ? (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Recent Students:</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {module.students.slice(0, 5).map((student) => (
                        <div key={student?.id} className="text-sm text-gray-600 flex justify-between">
                          <span className="truncate">{student?.fullName || 'Unknown'}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {student?.studentId || 'N/A'}
                          </span>
                        </div>
                      ))}
                      {(module?.students?.length || 0) > 5 && (
                        <p className="text-xs text-gray-500">
                          ...and {(module?.students?.length || 0) - 5} more students
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No students enrolled</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
