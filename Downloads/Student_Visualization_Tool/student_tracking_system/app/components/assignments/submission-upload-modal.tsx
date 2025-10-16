'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, User, Brain, CheckCircle } from 'lucide-react';

interface SubmissionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  assignment: any;
}

interface Student {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  module?: {
    code: string;
    name: string;
  };
}

export function SubmissionUploadModal({
  isOpen,
  onClose,
  onSave,
  assignment
}: SubmissionUploadModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && assignment) {
      fetchStudents();
      resetForm();
    }
  }, [isOpen, assignment]);

  const resetForm = () => {
    setSelectedStudent('');
    setFile(null);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchStudents = async () => {
    try {
      const moduleFilter = assignment?.module?.id ? `?moduleId=${assignment.module.id}` : '';
      const response = await fetch(`/api/students${moduleFilter}`);
      const data = await response.json();

      if (response.ok) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF, Word, or text files only.',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (60MB)
      if (selectedFile.size > 60 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload files smaller than 60MB.',
          variant: 'destructive'
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedStudent || !assignment) {
      toast({
        title: 'Missing information',
        description: 'Please select a student and upload a file.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'submission');
      formData.append('assignmentId', assignment.id);
      formData.append('studentId', selectedStudent);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      // Create submission record
      const submissionResponse = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          studentId: selectedStudent,
          fileName: uploadData.file.fileName,
          filePath: uploadData.file.filePath,
          fileSize: uploadData.file.fileSize,
          mimeType: uploadData.file.mimeType,
          extractedText: uploadData.file.extractedText
        })
      });

      const submissionData = await submissionResponse.json();

      if (!submissionResponse.ok) {
        throw new Error(submissionData.error || 'Failed to create submission');
      }

      setUploadComplete(true);
      toast({
        title: 'Upload successful',
        description: 'Submission uploaded successfully!'
      });

      // Auto-evaluate if rubric exists
      if (assignment.rubrics && assignment.rubrics.length > 0) {
        await handleAutoEvaluate(submissionData.submission.id, assignment.rubrics[0].id);
      }

    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAutoEvaluate = async (submissionId: string, rubricId: string) => {
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          rubricId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'AI Evaluation Complete',
          description: `Evaluation completed with score: ${data.evaluation.totalScore}/${assignment.maxScore}`
        });
      } else {
        toast({
          title: 'Evaluation Warning',
          description: data.message || 'Evaluation may require manual review',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Evaluation Failed',
        description: 'AI evaluation failed, manual review required',
        variant: 'destructive'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleClose = () => {
    if (uploadComplete) {
      onSave();
    }
    onClose();
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Submission: {assignment.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{assignment.type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Module: {assignment.module?.code} - {assignment.module?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Max Score: {assignment.maxScore} points
            </p>
          </div>

          {/* Student Selection */}
          <div>
            <Label htmlFor="student">Select Student *</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{student.fullName} ({student.studentId})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file">Upload Submission File *</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  border border-border rounded-lg p-3"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, Word (.doc, .docx), Text (.txt), Images (JPG, PNG). Max size: 60MB
              </p>
              {file && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Evaluation Notice */}
          {assignment.rubrics && assignment.rubrics.length > 0 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-700 dark:text-purple-300">AI Evaluation Available</span>
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                This assignment has a rubric. AI evaluation will run automatically after upload.
              </p>
            </div>
          )}

          {/* Upload Status */}
          {(isUploading || isEvaluating || uploadComplete) && (
            <div className="p-4 border rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {isUploading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                      <span>Uploading submission...</span>
                    </>
                  ) : uploadComplete ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Upload complete!</span>
                    </>
                  ) : null}
                </div>

                {isEvaluating && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                    <span>Running AI evaluation...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {uploadComplete ? 'Close' : 'Cancel'}
            </Button>
            {!uploadComplete && (
              <Button
                onClick={handleUpload}
                disabled={!file || !selectedStudent || isUploading || isEvaluating}
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                {isUploading ? 'Uploading...' : 'Upload & Evaluate'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}