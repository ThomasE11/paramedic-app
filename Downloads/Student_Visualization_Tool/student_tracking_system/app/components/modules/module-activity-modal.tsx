'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, Users, MapPin, Clock, Target, FileText } from 'lucide-react';

interface ModuleActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  module: {
    id: string;
    code: string;
    name: string;
  };
  activity?: any;
}

export function ModuleActivityModal({
  isOpen,
  onClose,
  onSave,
  module,
  activity
}: ModuleActivityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    activityType: 'seminar',
    date: '',
    duration: '',
    targetAudience: '',
    description: '',
    objectives: '',
    outcomes: '',
    facilitator: '',
    location: '',
    studentCount: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        activityType: activity.activityType || 'seminar',
        date: activity.date ? new Date(activity.date).toISOString().split('T')[0] : '',
        duration: activity.duration?.toString() || '',
        targetAudience: activity.targetAudience || '',
        description: activity.description || '',
        objectives: activity.objectives?.join('\n') || '',
        outcomes: activity.outcomes || '',
        facilitator: activity.facilitator || '',
        location: activity.location || '',
        studentCount: activity.studentCount?.toString() || '',
        notes: activity.notes || ''
      });
    } else {
      setFormData({
        title: '',
        activityType: 'seminar',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        targetAudience: `Third-Year ${module.code} Students`,
        description: '',
        objectives: '',
        outcomes: '',
        facilitator: '',
        location: '',
        studentCount: '',
        notes: ''
      });
    }
  }, [activity, module, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = activity
        ? `/api/module-activities/${activity.id}`
        : '/api/module-activities';

      const method = activity ? 'PUT' : 'POST';

      const objectivesArray = formData.objectives
        .split('\n')
        .map(obj => obj.trim())
        .filter(obj => obj.length > 0);

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          title: formData.title,
          activityType: formData.activityType,
          date: formData.date,
          duration: formData.duration ? parseInt(formData.duration) : null,
          targetAudience: formData.targetAudience,
          description: formData.description,
          objectives: objectivesArray,
          outcomes: formData.outcomes,
          facilitator: formData.facilitator || undefined,
          location: formData.location,
          studentCount: formData.studentCount ? parseInt(formData.studentCount) : null,
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || `Activity ${activity ? 'updated' : 'logged'} successfully`
        });
        onSave();
        onClose();
      } else {
        throw new Error(data.error || 'Failed to save activity');
      }
    } catch (error) {
      console.error('Activity save error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save activity',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Edit' : 'Log'} Module Activity - {module.code}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Activity Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Paramedic Professional Practice Seminar"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Activity Type *</Label>
              <Select
                value={formData.activityType}
                onValueChange={(value) => setFormData({ ...formData, activityType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="simulation">Simulation</SelectItem>
                  <SelectItem value="lecture">Guest Lecture</SelectItem>
                  <SelectItem value="fieldtrip">Field Trip</SelectItem>
                  <SelectItem value="presentation">Student Presentation</SelectItem>
                  <SelectItem value="discussion">Group Discussion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <div className="relative">
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="120"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <div className="relative">
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="Third-Year Paramedic Students"
                />
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="facilitator">Facilitator/Instructor</Label>
              <Input
                id="facilitator"
                value={formData.facilitator}
                onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
                placeholder="Your name (auto-filled)"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Room, Building, or Campus"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="studentCount">Number of Students</Label>
              <div className="relative">
                <Input
                  id="studentCount"
                  type="number"
                  value={formData.studentCount}
                  onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                  placeholder="30"
                />
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief overview of the activity..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="objectives">
              <Target className="inline h-4 w-4 mr-1" />
              Learning Objectives (one per line)
            </Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              placeholder="Objective 1&#10;Objective 2&#10;Objective 3"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="outcomes">Outcomes & Key Takeaways</Label>
            <Textarea
              id="outcomes"
              value={formData.outcomes}
              onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
              placeholder="What did students learn or achieve from this activity?"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">
              <FileText className="inline h-4 w-4 mr-1" />
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes, observations, or follow-up actions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `${activity ? 'Update' : 'Log'} Activity`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
