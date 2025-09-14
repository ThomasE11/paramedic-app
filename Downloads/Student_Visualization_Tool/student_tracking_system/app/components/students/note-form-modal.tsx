
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { NoteWithStudent, NoteFormData } from '@/lib/types';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  studentId: string;
  note?: NoteWithStudent | null;
}

export function NoteFormModal({
  isOpen,
  onClose,
  onSave,
  studentId,
  note
}: NoteFormModalProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    category: 'general'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        category: (note.category as 'academic' | 'behavior' | 'attendance' | 'general') || 'general'
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'general'
      });
    }
  }, [note, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = note ? `/api/notes/${note.id}` : '/api/notes';
      const method = note ? 'PUT' : 'POST';
      const body = note 
        ? formData 
        : { ...formData, studentId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: note ? 'Note updated successfully' : 'Note added successfully'
        });
        onSave();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save note',
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {note ? 'Edit Note' : 'Add New Note'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                category: value as 'academic' | 'behavior' | 'attendance' | 'general' 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter note title"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Note Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your note here..."
              rows={5}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (note ? 'Update' : 'Add Note')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
