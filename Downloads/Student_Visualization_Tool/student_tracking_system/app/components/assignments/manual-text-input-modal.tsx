"use client";

import { useState } from 'react';
import { X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ManualTextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  studentName?: string;
  assignmentTitle?: string;
  currentText?: string;
  onSuccess?: () => void;
}

export function ManualTextInputModal({
  isOpen,
  onClose,
  submissionId,
  studentName,
  assignmentTitle,
  currentText,
  onSuccess
}: ManualTextInputModalProps) {
  const [text, setText] = useState(currentText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please enter submission text');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/${submissionId}/update-text`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extractedText: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update submission text');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update text');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manual Text Input
              </h2>
              {studentName && assignmentTitle && (
                <p className="text-sm text-gray-600">
                  {studentName} - {assignmentTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">PDF text extraction failed</p>
              <p>
                Please paste or type the submission text manually below. This will allow the AI to evaluate the submission properly.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type the submission content here..."
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Word count: {wordCount.toLocaleString()}</span>
              <span>Character count: {text.length.toLocaleString()}</span>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  Text updated successfully! You can now re-evaluate this submission.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim() || success}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Updated
              </>
            ) : (
              'Update Text & Reset for Re-evaluation'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
