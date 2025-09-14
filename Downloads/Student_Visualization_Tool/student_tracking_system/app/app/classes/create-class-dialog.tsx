
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Clock, MapPin, BookOpen, Users, Palette } from 'lucide-react';

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassCreated: () => void;
  modules: any[];
  subjects: any[];
  locations: any[];
}

const CLASS_TYPES = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Laboratory' },
  { value: 'practical', label: 'Practical' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'exam', label: 'Examination' },
  { value: 'seminar', label: 'Seminar' }
];

const CLASS_COLORS = [
  { value: '#3B82F6', label: 'Blue', color: 'bg-blue-500' },
  { value: '#10B981', label: 'Green', color: 'bg-green-500' },
  { value: '#F59E0B', label: 'Orange', color: 'bg-orange-500' },
  { value: '#EF4444', label: 'Red', color: 'bg-red-500' },
  { value: '#8B5CF6', label: 'Purple', color: 'bg-purple-500' },
  { value: '#06B6D4', label: 'Cyan', color: 'bg-cyan-500' }
];

export function CreateClassDialog({
  open,
  onOpenChange,
  onClassCreated,
  modules = [],
  subjects = [],
  locations = []
}: CreateClassDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    subjectId: '',
    locationId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    type: 'lecture',
    capacity: 30,
    notes: '',
    color: '#3B82F6',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringEndDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      // Validate time range
      if (formData.startTime >= formData.endTime) {
        toast({
          title: 'Error',
          description: 'End time must be after start time',
          variant: 'destructive'
        });
        return;
      }

      const payload = {
        ...formData,
        moduleId: formData.moduleId || null,
        subjectId: formData.subjectId || null,
        locationId: formData.locationId || null,
        recurringEndDate: formData.isRecurring && formData.recurringEndDate 
          ? formData.recurringEndDate 
          : null
      };

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Class created successfully'
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          moduleId: '',
          subjectId: '',
          locationId: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          type: 'lecture',
          capacity: 30,
          notes: '',
          color: '#3B82F6',
          isRecurring: false,
          recurringPattern: 'weekly',
          recurringEndDate: ''
        });
        
        onClassCreated();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create class',
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
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter subjects by selected module
  const filteredSubjects = formData.moduleId && Array.isArray(subjects)
    ? subjects.filter(subject => subject && subject.moduleId === formData.moduleId)
    : (Array.isArray(subjects) ? subjects : []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Create New Class
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Class Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Introduction to Emergency Medicine"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the class content"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Module</Label>
                <Select value={formData.moduleId} onValueChange={(value) => handleChange('moduleId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Module</SelectItem>
                    {Array.isArray(modules) && modules.map((module) => (
                      <SelectItem key={module?.id} value={module?.id}>
                        {module?.code} - {module?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject</Label>
                <Select 
                  value={formData.subjectId} 
                  onValueChange={(value) => handleChange('subjectId', value)}
                  disabled={!filteredSubjects || filteredSubjects.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Subject</SelectItem>
                    {filteredSubjects && filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Class Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Location</Label>
                <Select value={formData.locationId} onValueChange={(value) => handleChange('locationId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Location</SelectItem>
                    {Array.isArray(locations) && locations.map((location) => (
                      <SelectItem key={location?.id} value={location?.id}>
                        {location?.name} {location?.building && `(${location.building})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 30)}
                />
              </div>

              <div>
                <Label>Color</Label>
                <Select value={formData.color} onValueChange={(value) => handleChange('color', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.color}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes or instructions"
                rows={2}
              />
            </div>
          </div>

          {/* Recurring Options */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleChange('isRecurring', checked)}
              />
              <Label htmlFor="recurring" className="text-sm font-medium">
                Make this a recurring class
              </Label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <Label>Repeat Pattern</Label>
                  <Select 
                    value={formData.recurringPattern} 
                    onValueChange={(value) => handleChange('recurringPattern', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recurringEndDate">End Date</Label>
                  <Input
                    id="recurringEndDate"
                    type="date"
                    value={formData.recurringEndDate}
                    onChange={(e) => handleChange('recurringEndDate', e.target.value)}
                    min={formData.date}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Class'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
