
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Users, 
  User,
  CheckCircle,
  AlertCircle,
  Filter,
  Globe
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  studentId: string;
  module: {
    id: string;
    code: string;
    name: string;
  } | null;
}

interface BulkEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  modules: any[];
}

export function BulkEmailDialog({
  open,
  onOpenChange,
  students,
  modules
}: BulkEmailDialogProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<'english' | 'arabic'>('english');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  // Filter students based on module selection
  const filteredStudents = filterModule === 'all' 
    ? students 
    : students.filter(s => s.module?.id === filterModule);

  const selectedStudentData = filteredStudents.filter(s => 
    selectedStudents.includes(s.id)
  );

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim() || selectedStudents.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please select students and enter both subject and message',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'general',
          recipients: selectedStudents,
          subject: subject.trim(),
          message: message.trim(),
          language
        })
      });

      const data = await response.json();

      if (data.needsSetup) {
        toast({
          title: 'Gmail Not Configured',
          description: 'Please set up Gmail integration first',
          variant: 'destructive'
        });
        return;
      }

      if (data.success) {
        setResult(data);
        toast({
          title: 'Bulk Emails Sent Successfully! 📧',
          description: `Sent ${data.emailsSent} emails to students`
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send emails',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Bulk email error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send emails. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setSelectedStudents([]);
      setSubject('');
      setMessage('');
      setResult(null);
      setLanguage('english');
      setFilterModule('all');
      onOpenChange(false);
    }
  };

  const getLanguageTemplate = (lang: 'english' | 'arabic') => {
    if (lang === 'arabic') {
      return {
        subject: 'إعلان مهم من برنامج الخدمات الطبية الطارئة',
        message: `الطلاب الأعزاء،

أتمنى أن تكونوا جميعاً بخير وصحة جيدة.

[اكتب رسالتك هنا]

مع أطيب التحيات،
مدرسكم في برنامج الخدمات الطبية الطارئة
كلية التقنية العليا - العين`
      };
    } else {
      return {
        subject: 'Important Announcement from HCT Al Ain EMS Program',
        message: `Dear Students,

I hope this message finds you well.

[Write your message here]

Best regards,
Your HCT Al Ain EMS Instructor`
      };
    }
  };

  const handleLanguageChange = (newLanguage: 'english' | 'arabic') => {
    setLanguage(newLanguage);
    const template = getLanguageTemplate(newLanguage);
    if (!subject || subject === getLanguageTemplate(language === 'english' ? 'arabic' : 'english').subject) {
      setSubject(template.subject);
    }
    if (!message || message === getLanguageTemplate(language === 'english' ? 'arabic' : 'english').message) {
      setMessage(template.message);
    }
  };

  // Initialize with English template
  useEffect(() => {
    if (open && !subject && !message) {
      const template = getLanguageTemplate('english');
      setSubject(template.subject);
      setMessage(template.message);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Bulk Email to Students
          </DialogTitle>
        </DialogHeader>

        {result ? (
          // Success Result
          <div className="space-y-6">
            <div className="text-center p-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Bulk Emails Sent Successfully!
              </h3>
              <p className="text-green-700">
                Successfully sent <strong>{result.emailsSent}</strong> emails
                {result.errors && result.errors.length > 0 && (
                  <span className="text-orange-600">
                    {' '}with {result.errors.length} errors
                  </span>
                )}
              </p>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <strong>Some emails failed to send:</strong>
                </div>
                <ul className="text-orange-700 text-sm space-y-1">
                  {result.errors.map((error: any, index: number) => (
                    <li key={index}>
                      Student ID: {error.studentId} - {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          // Email Composition
          <div className="space-y-6">
            {/* Language and Module Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4" />
                  Email Language
                </Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="arabic">العربية (Arabic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4" />
                  Filter by Module
                </Label>
                <Select value={filterModule} onValueChange={setFilterModule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.code} - {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Student Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Select Students ({selectedStudents.length}/{filteredStudents.length})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-2 p-3 border rounded-lg bg-gray-50">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{student.fullName}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {student.studentId} • {student.module?.code || 'No Module'}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {student.email}
                    </Badge>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No students found for selected module
                  </div>
                )}
              </div>

              {selectedStudentData.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Selected students:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedStudentData.slice(0, 5).map((student) => (
                      <Badge key={student.id} variant="secondary" className="text-xs">
                        {student.fullName}
                      </Badge>
                    ))}
                    {selectedStudentData.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedStudentData.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="mt-1"
                disabled={sending}
                style={{ direction: language === 'arabic' ? 'rtl' : 'ltr' }}
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={8}
                className="mt-1"
                disabled={sending}
                style={{ direction: language === 'arabic' ? 'rtl' : 'ltr' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your message will be formatted with HCT branding when sent.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !message.trim() || selectedStudents.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to {selectedStudents.length} Students
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
