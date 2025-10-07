'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Rubric {
  id: string;
  title: string;
  description?: string;
  version: number;
  fileName?: string;
  isActive: boolean;
  createdAt: string;
  creator: {
    name: string;
  };
  _count?: {
    evaluations: number;
  };
}

interface Assignment {
  id: string;
  title: string;
  rubrics: Rubric[];
}

interface RubricManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onRubricDeleted?: () => void;
}

export function RubricManagementModal({
  isOpen,
  onClose,
  assignment,
  onRubricDeleted
}: RubricManagementModalProps) {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewRubricData, setViewRubricData] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && assignment) {
      fetchRubrics();
    }
  }, [isOpen, assignment]);

  const fetchRubrics = async () => {
    if (!assignment) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/assignments/${assignment.id}`);
      const data = await response.json();

      if (response.ok && data.assignment) {
        setRubrics(data.assignment.rubrics || []);
      }
    } catch (error) {
      console.error('Failed to fetch rubrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRubric = async (rubric: Rubric) => {
    try {
      const response = await fetch(`/api/rubrics/${rubric.id}`);
      const data = await response.json();

      if (response.ok && data.rubric) {
        setViewRubricData(data.rubric);
        setShowViewDialog(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load rubric details',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load rubric',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRubric = async () => {
    if (!selectedRubric) return;

    try {
      const response = await fetch(`/api/rubrics/${selectedRubric.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Rubric deleted successfully'
        });
        setShowDeleteDialog(false);
        setSelectedRubric(null);
        fetchRubrics();
        onRubricDeleted?.();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete rubric',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rubric',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Manage Rubrics - {assignment?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {rubrics.length} {rubrics.length === 1 ? 'rubric' : 'rubrics'} attached
              </p>
              <Button
                onClick={fetchRubrics}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : rubrics.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rubrics</h3>
                <p className="text-muted-foreground">Add a rubric to this assignment to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rubrics.map((rubric) => (
                  <div
                    key={rubric.id}
                    className="border rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm truncate">{rubric.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            v{rubric.version}
                          </Badge>
                          {rubric.isActive && (
                            <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                          )}
                        </div>

                        {rubric.fileName && (
                          <p className="text-xs text-muted-foreground mb-2 truncate">
                            📄 {rubric.fileName}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{rubric.creator.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(rubric.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                          {rubric._count && rubric._count.evaluations > 0 && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>{rubric._count.evaluations} evaluations</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewRubric(rubric)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedRubric(rubric);
                            setShowDeleteDialog(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rubric?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRubric?.title}"?
              {selectedRubric?._count?.evaluations && selectedRubric._count.evaluations > 0 ? (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-900 dark:text-blue-100 text-sm font-medium mb-1">
                    ℹ️ Grades will be preserved
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    This rubric has {selectedRubric._count.evaluations} evaluation(s). The rubric will be removed, but all grades and feedback will be kept.
                  </p>
                </div>
              ) : (
                <p className="mt-2">This action cannot be undone.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRubric}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Rubric
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Rubric Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rubric Details</DialogTitle>
          </DialogHeader>

          {viewRubricData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{viewRubricData.title}</h3>
                {viewRubricData.description && (
                  <p className="text-sm text-muted-foreground">{viewRubricData.description}</p>
                )}
              </div>

              {viewRubricData.extractedText && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-semibold mb-2 text-sm">Rubric Content</h4>
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {viewRubricData.extractedText}
                  </pre>
                </div>
              )}

              {viewRubricData.criteria && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Criteria</h4>
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(viewRubricData.criteria, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
