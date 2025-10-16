'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  modules: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  assignment?: any;
}

interface FormData {
  title: string;
  description: string;
  type: string;
  moduleId: string;
  subjectId?: string;
  dueDate: string;
  maxScore: number;
  allowResubmission: boolean;
  autoEvaluate: boolean;
}

export function AssignmentFormModal({
  isOpen,
  onClose,
  onSave,
  modules,
  assignment
}: AssignmentFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'case_reflection',
    moduleId: '',
    dueDate: '',
    maxScore: 100,
    allowResubmission: false,
    autoEvaluate: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title || '',
        description: assignment.description || '',
        type: assignment.type || 'case_reflection',
        moduleId: assignment.moduleId || '',
        subjectId: assignment.subjectId || '',
        dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
        maxScore: assignment.maxScore || 100,
        allowResubmission: assignment.allowResubmission || false,
        autoEvaluate: assignment.autoEvaluate || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'case_reflection',
        moduleId: '',
        dueDate: '',
        maxScore: 100,
        allowResubmission: false,
        autoEvaluate: false
      });
    }
  }, [assignment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = assignment ? `/api/assignments/${assignment.id}` : '/api/assignments';
      const method = assignment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: assignment ? 'Assignment updated successfully' : 'Assignment created successfully'
        });
        onSave();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save assignment',
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? 'Edit Assignment' : 'Create New Assignment'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Assignment Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case_reflection">Case Reflection</SelectItem>
                  <SelectItem value="skill_assessment">Skill Assessment</SelectItem>
                  <SelectItem value="practical_evaluation">Practical Evaluation</SelectItem>
                  <SelectItem value="written_assignment">Written Assignment</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="module">Module *</Label>
              <Select
                value={formData.moduleId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, moduleId: value }))}
              >
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

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="maxScore">Maximum Score</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                max="1000"
                value={formData.maxScore}
                onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 100 }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="allowResubmission" className="text-base font-medium">
                  Allow Resubmissions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Students can submit multiple times for this assignment
                </p>
              </div>
              <Switch
                id="allowResubmission"
                checked={formData.allowResubmission}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowResubmission: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="space-y-0.5">
                <Label htmlFor="autoEvaluate" className="text-base font-medium">
                  Auto-Evaluate Submissions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically evaluate submissions with AI when uploaded via batch upload
                </p>
              </div>
              <Switch
                id="autoEvaluate"
                checked={formData.autoEvaluate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoEvaluate: checked }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter assignment description and instructions..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (assignment ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}