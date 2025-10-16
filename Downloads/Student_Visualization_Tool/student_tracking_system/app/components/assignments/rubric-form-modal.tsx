'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Clipboard, CheckCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RubricFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  assignment: any;
}

export function RubricFormModal({
  isOpen,
  onClose,
  onSave,
  assignment
}: RubricFormModalProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rubricText, setRubricText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (assignment && isOpen) {
      setTitle(`${assignment.title} - Rubric`);
      setFile(null);
      setRubricText('');
      setUploadProgress('');
    }
  }, [assignment, isOpen]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !assignment) return;

    setIsProcessing(true);
    setUploadProgress('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentId', assignment.id);
      formData.append('title', title);

      setUploadProgress('Extracting text from document...');

      const response = await fetch('/api/rubrics/create-from-upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadProgress('Rubric created successfully!');
        toast({
          title: 'Success',
          description: `Rubric "${data.rubric.title}" created with ${data.parsedStructure.criteria.length} criteria`,
          duration: 5000
        });
        setTimeout(() => {
          onSave();
          onClose();
        }, 1000);
      } else {
        throw new Error(data.error || 'Failed to create rubric');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload rubric',
        variant: 'destructive'
      });
      setUploadProgress('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextPaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rubricText.trim() || !assignment) return;

    setIsProcessing(true);
    setUploadProgress('Analyzing rubric text...');

    try {
      setUploadProgress('Parsing criteria and levels...');

      const response = await fetch('/api/rubrics/create-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.id,
          rubricText: rubricText,
          title: title
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUploadProgress('Rubric created successfully!');
        toast({
          title: 'Success',
          description: `Rubric "${data.rubric.title}" created with ${data.parsedStructure.criteria.length} criteria`,
          duration: 5000
        });
        setTimeout(() => {
          onSave();
          onClose();
        }, 1000);
      } else {
        throw new Error(data.error || 'Failed to create rubric');
      }
    } catch (error) {
      console.error('Parse error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to parse rubric text',
        variant: 'destructive'
      });
      setUploadProgress('');
    } finally {
      setIsProcessing(false);
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
          title: 'Invalid File Type',
          description: 'Please upload PDF, Word, or text files only',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (60MB)
      if (selectedFile.size > 60 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Maximum file size is 60MB',
          variant: 'destructive'
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Rubric for: {assignment.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <Clipboard className="w-4 h-4" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          {/* Upload File Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📤 Upload Complete Rubric</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Upload your rubric document and AI will automatically extract all criteria, levels, and scoring.
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file-title">Rubric Title *</Label>
                <Input
                  id="file-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter rubric title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="file-upload">Upload Rubric File *</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed"
                  >
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8" />
                        <span>Click to upload rubric</span>
                        <span className="text-xs text-muted-foreground">
                          PDF, Word, Text, or Images (Max 60MB)
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {uploadProgress && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!file || isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upload & Create Rubric'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Paste Text Tab */}
          <TabsContent value="paste" className="space-y-4 mt-4">
            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">📋 Paste Rubric Text</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Copy and paste your rubric text. AI will automatically structure all criteria, levels, and scoring.
              </p>
            </div>

            <form onSubmit={handleTextPaste} className="space-y-4">
              <div>
                <Label htmlFor="text-title">Rubric Title *</Label>
                <Input
                  id="text-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter rubric title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rubric-text">Paste Rubric Content *</Label>
                <Textarea
                  id="rubric-text"
                  value={rubricText}
                  onChange={(e) => setRubricText(e.target.value)}
                  placeholder="Paste your complete rubric here...&#10;&#10;Include all criteria, scoring levels, and descriptions.&#10;&#10;Example:&#10;Criterion 1: Critical Thinking (25 points)&#10;- Excellent (25 pts): Demonstrates exceptional analysis...&#10;- Good (20 pts): Shows strong analytical skills...&#10;- Satisfactory (15 pts): Meets basic requirements..."
                  rows={12}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Minimum 50 characters. Include criteria names, scoring levels, and descriptions.
                </p>
              </div>

              {uploadProgress && (
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button type="submit" disabled={rubricText.trim().length < 50 || isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Parse & Create Rubric'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
