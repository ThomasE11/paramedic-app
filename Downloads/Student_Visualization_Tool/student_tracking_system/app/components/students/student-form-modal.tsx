
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { StudentWithModule, StudentFormData } from '@/lib/types';
import { UserPlus, Edit3, Save, X, RefreshCw } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  student?: StudentWithModule | null;
  modules: Array<{ id: string; code: string; name: string }>;
}

export function StudentFormModal({
  isOpen,
  onClose,
  onSave,
  student,
  modules
}: StudentFormModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    moduleId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.studentId || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        moduleId: student.moduleId || ''
      });
    } else {
      setFormData({
        studentId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        moduleId: ''
      });
    }
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = student ? `/api/students/${student.id}` : '/api/students';
      const method = student ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: student 
            ? 'Student updated successfully' 
            : 'Student created successfully'
        });
        onSave();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save student',
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

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] glass-morphism border-white/20 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              {student ? <Edit3 className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {student ? 'Edit Student Profile' : 'Add New Student'}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {student ? 'Update student information and module assignment' : 'Enter student details and assign to a module'}
              </p>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-sm font-semibold text-gray-700">Student ID *</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => handleChange('studentId', e.target.value)}
                placeholder="e.g., H20401756"
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleId" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Module Assignment
                {student && <RefreshCw className="w-4 h-4 text-blue-500" />}
              </Label>
              <Select
                value={formData.moduleId}
                onValueChange={(value) => handleChange('moduleId', value)}
              >
                <SelectTrigger className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                  <SelectValue placeholder="Select Module" />
                </SelectTrigger>
                <SelectContent className="glass-morphism border-white/20 shadow-xl">
                  <SelectItem value="" className="font-medium">No Module</SelectItem>
                  {modules?.map((module) => (
                    <SelectItem key={module?.id} value={module?.id || ''} className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold">{module?.code}</span>
                        <span className="text-xs text-gray-600">{module?.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="student@hct.ac.ae"
              className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+971 50 123 4567"
              className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-3 rounded-xl border-gray-300 hover:bg-gray-50/80 font-semibold transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {student ? 'Update Student' : 'Create Student'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
