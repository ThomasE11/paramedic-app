'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AssignmentFormModal } from '@/components/assignments/assignment-form-modal';
import { RubricFormModal } from '@/components/assignments/rubric-form-modal';
import { SubmissionUploadModal } from '@/components/assignments/submission-upload-modal';
import { EvaluationViewModal } from '@/components/assignments/evaluation-view-modal';
import { RubricManagementModal } from '@/components/assignments/rubric-management-modal';
import { BatchUploadModal } from '@/components/assignments/batch-upload-modal';
import {
  Search,
  Plus,
  FileText,
  Upload,
  Eye,
  Users,
  CheckCircle,
  Clock,
  BookOpen,
  Brain,
  Filter,
  RefreshCw,
  Trash2,
  Power,
  MoreVertical,
  UploadCloud
} from 'lucide-react';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  type: string;
  dueDate?: string;
  maxScore: number;
  isActive: boolean;
  module: {
    code: string;
    name: string;
  };
  subject?: {
    code: string;
    name: string;
  };
  creator: {
    name: string;
  };
  rubrics: Array<{
    id: string;
    title: string;
    version: number;
  }>;
  submissions: Array<{
    id: string;
    studentId: string;
    status: string;
  }>;
  _count: {
    submissions: number;
    rubrics: number;
  };
}

interface Module {
  id: string;
  code: string;
  name: string;
}

export function AssignmentsContent() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [selectedModule, setSelectedModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);
  const [isRubricFormOpen, setIsRubricFormOpen] = useState(false);
  const [isSubmissionUploadOpen, setIsSubmissionUploadOpen] = useState(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);
  const [isEvaluationViewOpen, setIsEvaluationViewOpen] = useState(false);
  const [isRubricManagementOpen, setIsRubricManagementOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchModules();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchTerm, selectedModule, assignments]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assignments');
      const data = await response.json();

      if (response.ok) {
        setAssignments(data.assignments || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load assignments',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/modules');
      const data = await response.json();

      if (response.ok) {
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.module.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedModule !== 'all') {
      filtered = filtered.filter(assignment => assignment.module.code === selectedModule);
    }

    setFilteredAssignments(filtered);
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'case_reflection':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'skill_assessment':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'practical_evaluation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleCreateRubric = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsRubricFormOpen(true);
  };

  const handleUploadSubmission = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionUploadOpen(true);
  };

  const handleViewEvaluations = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsEvaluationViewOpen(true);
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
    if (!confirm(`Are you sure you want to delete "${assignment.title}"? This will permanently delete all ${assignment._count.submissions} submissions and ${assignment._count.rubrics} rubrics.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Assignment deleted successfully'
        });
        fetchAssignments();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete assignment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (assignment: Assignment) => {
    try {
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !assignment.isActive })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || `Assignment ${!assignment.isActive ? 'activated' : 'deactivated'}`
        });
        fetchAssignments();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update assignment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="glass-morphism border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search assignments..."
                  className="pl-10"
                />
              </div>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module.id} value={module.code}>
                      {module.code} - {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchAssignments()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setIsAssignmentFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">Loading assignments...</span>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Assignments Found</h3>
            <p className="text-muted-foreground">Create your first assignment to get started</p>
          </div>
        ) : (
          filteredAssignments.map(assignment => (
            <Card
              key={assignment.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid hsl(var(--border))'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg leading-tight line-clamp-2 flex-1">
                    {assignment.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!assignment.isActive && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        Inactive
                      </Badge>
                    )}
                    <Badge className={getStatusColor(assignment.type)}>
                      {assignment.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{assignment.module.code}</span>
                  </div>
                  {assignment.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {assignment.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-muted/30 rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold">{assignment._count.submissions}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Submissions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold">{assignment._count.rubrics}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rubrics</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleCreateRubric(assignment)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Rubric
                    </Button>
                    <Button
                      onClick={() => handleUploadSubmission(assignment)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setIsBatchUploadOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-green-500/50 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <UploadCloud className="w-3 h-3 mr-1" />
                    Batch Upload & Evaluate
                  </Button>
                </div>

                {assignment._count.rubrics > 0 && (
                  <Button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setIsRubricManagementOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Manage Rubrics ({assignment._count.rubrics})
                  </Button>
                )}

                <Button
                  onClick={() => handleViewEvaluations(assignment)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                  size="sm"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Evaluations
                </Button>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <Button
                    onClick={() => handleToggleActive(assignment)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Power className="w-3 h-3 mr-1" />
                    {assignment.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    onClick={() => handleDeleteAssignment(assignment)}
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <AssignmentFormModal
        isOpen={isAssignmentFormOpen}
        onClose={() => setIsAssignmentFormOpen(false)}
        onSave={() => {
          fetchAssignments();
          setIsAssignmentFormOpen(false);
        }}
        modules={modules}
      />

      <RubricFormModal
        isOpen={isRubricFormOpen}
        onClose={() => setIsRubricFormOpen(false)}
        onSave={() => {
          fetchAssignments();
          setIsRubricFormOpen(false);
        }}
        assignment={selectedAssignment}
      />

      <SubmissionUploadModal
        isOpen={isSubmissionUploadOpen}
        onClose={() => setIsSubmissionUploadOpen(false)}
        onSave={() => {
          fetchAssignments();
          setIsSubmissionUploadOpen(false);
        }}
        assignment={selectedAssignment}
      />

      <EvaluationViewModal
        isOpen={isEvaluationViewOpen}
        onClose={() => setIsEvaluationViewOpen(false)}
        assignment={selectedAssignment}
      />

      <RubricManagementModal
        isOpen={isRubricManagementOpen}
        onClose={() => setIsRubricManagementOpen(false)}
        assignment={selectedAssignment}
        onRubricDeleted={() => fetchAssignments()}
      />

      <BatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        assignment={selectedAssignment}
        rubrics={selectedAssignment?.rubrics || []}
        onUploadComplete={() => fetchAssignments()}
      />
    </div>
  );
}