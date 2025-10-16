'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
  rubrics: any[];
  onUploadComplete: () => void;
}

export function BatchUploadModal({
  isOpen,
  onClose,
  assignment,
  rubrics,
  onUploadComplete
}: BatchUploadModalProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  // Initialize autoEvaluate from assignment settings
  const [autoEvaluate, setAutoEvaluate] = useState(assignment?.autoEvaluate ?? false);
  const [selectedRubricId, setSelectedRubricId] = useState<string>('');

  // Update autoEvaluate when assignment changes
  useEffect(() => {
    if (assignment?.autoEvaluate !== undefined) {
      setAutoEvaluate(assignment.autoEvaluate);
    }
  }, [assignment?.autoEvaluate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select files to upload',
        variant: 'destructive'
      });
      return;
    }

    if (autoEvaluate && !selectedRubricId) {
      toast({
        title: 'Rubric required',
        description: 'Please select a rubric for auto-evaluation',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadResults(null);
    setEvaluationResults(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('assignmentId', assignment.id);
      formData.append('autoEvaluate', autoEvaluate.toString());
      if (autoEvaluate && selectedRubricId) {
        formData.append('rubricId', selectedRubricId);
      }

      const response = await fetch('/api/submissions/batch-upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResults(data);

        toast({
          title: 'Upload Complete',
          description: data.message
        });

        // If auto-evaluate is enabled and we have successful uploads, trigger evaluation
        if (autoEvaluate && data.autoEvaluate?.submissionIds?.length > 0) {
          await handleBatchEvaluation(data.autoEvaluate.submissionIds, selectedRubricId);
        }

        onUploadComplete();
      } else {
        toast({
          title: 'Upload Failed',
          description: data.error || 'Failed to upload files',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'An error occurred during upload',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBatchEvaluation = async (submissionIds: string[], rubricId: string) => {
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/evaluate/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionIds,
          rubricId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEvaluationResults(data);

        toast({
          title: 'Evaluation Complete',
          description: data.message
        });

        onUploadComplete();
      } else {
        toast({
          title: 'Evaluation Failed',
          description: data.error || 'Failed to evaluate submissions',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      toast({
        title: 'Evaluation Error',
        description: 'An error occurred during evaluation',
        variant: 'destructive'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setUploadResults(null);
    setEvaluationResults(null);
    // Reset to assignment's default autoEvaluate setting
    setAutoEvaluate(assignment?.autoEvaluate ?? false);
    setSelectedRubricId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Batch Upload Submissions - {assignment?.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Upload multiple student submissions at once. Files must be named with student IDs (e.g., H00123456.pdf)
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto-Evaluation Option */}
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <Label htmlFor="auto-evaluate" className="font-semibold">
                  Auto-Evaluate After Upload
                </Label>
              </div>
              <Switch
                id="auto-evaluate"
                checked={autoEvaluate}
                onCheckedChange={setAutoEvaluate}
              />
            </div>

            {autoEvaluate && (
              <div className="space-y-2">
                <Label>Select Rubric</Label>
                <Select value={selectedRubricId} onValueChange={setSelectedRubricId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a rubric..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rubrics.map((rubric) => (
                      <SelectItem key={rubric.id} value={rubric.id}>
                        {rubric.title} (v{rubric.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Each submission will be evaluated independently with isolated context
                </p>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                id="batch-file-upload"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="batch-file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-semibold mb-1">Click to select files</p>
                <p className="text-sm text-muted-foreground">
                  PDF, Word, Text, or Image files (max 60MB each)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Filename format: H00123456.pdf (student ID)
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">
                  Selected Files ({files.length})
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Results */}
          {uploadResults && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                Upload Results
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">{uploadResults.summary.successful}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Uploaded</p>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">{uploadResults.summary.failed}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Failed</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">{uploadResults.summary.skipped}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Skipped</p>
                </div>
              </div>

              {uploadResults.results.failed.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-sm font-semibold text-red-600">Failed Files:</h5>
                  {uploadResults.results.failed.map((fail: any, idx: number) => (
                    <div key={idx} className="text-xs bg-red-50 dark:bg-red-950/20 p-2 rounded">
                      <p className="font-semibold">{fail.fileName}</p>
                      <p className="text-muted-foreground">{fail.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Evaluation Results */}
          {evaluationResults && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Evaluation Results
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">{evaluationResults.summary.successful}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Evaluated</p>
                </div>

                <div className="bg-muted p-3 rounded">
                  <p className="font-semibold">{evaluationResults.summary.averageTime}ms</p>
                  <p className="text-xs text-muted-foreground mt-1">Avg. Time</p>
                </div>
              </div>

              {evaluationResults.results && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {evaluationResults.results.map((result: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-xs ${
                        result.success
                          ? 'bg-green-50 dark:bg-green-950/20'
                          : 'bg-red-50 dark:bg-red-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{result.studentName}</span>
                        {result.success ? (
                          <Badge variant="outline" className="text-xs">
                            {result.evaluation.percentage.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-red-600 text-xs">{result.error}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {uploadResults ? 'Close' : 'Cancel'}
            </Button>
            {!uploadResults && (
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading || isEvaluating}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {files.length} File{files.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
