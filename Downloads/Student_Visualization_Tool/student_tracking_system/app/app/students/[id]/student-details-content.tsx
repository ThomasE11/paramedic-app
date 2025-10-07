
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NoteFormModal } from '@/components/students/note-form-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Mail,
  Phone,
  Plus,
  Edit,
  Trash2,
  FileText,
  Activity,
  User,
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { StudentWithModule, NoteWithStudent } from '@/lib/types';
import { AIEmailAssistant } from '@/components/ai/AIEmailAssistant';
import { StudentAttendanceSummary } from '@/components/students/StudentAttendanceSummary';
import { StudentAttendanceDetail } from '@/components/students/StudentAttendanceDetail';
import { EducationalAIAssistant } from '@/components/ai/EducationalAIAssistant';

interface StudentDetailsContentProps {
  student: any;
}

export function StudentDetailsContent({ student: initialStudent }: StudentDetailsContentProps) {
  const [student, setStudent] = useState(initialStudent);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [deleteNote, setDeleteNote] = useState<any>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showEducationalAI, setShowEducationalAI] = useState(false);
  const [showAttendanceDetail, setShowAttendanceDetail] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailClick = () => {
    // Open AI Assistant for intelligent email composition
    setShowAIAssistant(true);
  };

  const handlePhoneClick = () => {
    if (student?.phone) {
      window.open(`tel:${student.phone}`, '_blank');
    }
  };

  const refreshStudentData = async () => {
    try {
      const response = await fetch(`/api/students/${student?.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setStudent(data.student);
      }
    } catch (error) {
      console.error('Failed to refresh student data:', error);
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteNote) return;

    try {
      const response = await fetch(`/api/notes/${deleteNote.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Note deleted successfully'
        });
        refreshStudentData();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete note',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setDeleteNote(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'behavior':
        return 'bg-red-100 text-red-800';
      case 'attendance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_created':
        return <User className="w-4 h-4 text-green-500" />;
      case 'student_updated':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'note_added':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'note_updated':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'note_deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleExportPDF = async () => {
    if (!student?.id) return;

    setIsGeneratingPDF(true);
    try {
      // Fetch data for PDF
      const response = await fetch(`/api/students/${student.id}/export-pdf`);
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }

      const data = await response.json();

      // Dynamically import PDF generator to reduce bundle size
      const { generateStudentProgressPDF, downloadPDF } = await import('@/lib/pdf-generator');

      // Generate PDF
      const pdfBlob = await generateStudentProgressPDF(data);

      // Download PDF
      const fileName = `${student.fullName.replace(/\s+/g, '_')}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBlob, fileName);

      toast({
        title: 'Success',
        description: 'PDF report generated successfully'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="glass-morphism rounded-3xl p-4 sm:p-6 shadow-2xl">
        {/* Back Button and Actions - Full width on mobile */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/students')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="w-full sm:w-auto border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? 'Generating...' : 'Export PDF Report'}
          </Button>
        </div>

        {/* Student Info Section */}
        <div className="flex flex-col gap-4">
          {/* Student Name - Responsive typography */}
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight break-words">
              {student?.fullName || 'Unknown Student'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Student ID: {student?.studentId || 'N/A'}
            </p>
          </div>

          {/* Contact Buttons - Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
            <Button
              variant="default"
              onClick={handleEmailClick}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white h-11 sm:h-10"
            >
              <Mail className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">AI Email Assistant</span>
              <span className="xs:hidden">Email AI</span>
            </Button>
            <Button
              variant="default"
              onClick={() => setShowEducationalAI(true)}
              className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white h-11 sm:h-10"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Educational AI</span>
              <span className="xs:hidden">Edu AI</span>
            </Button>
            {student?.phone && (
              <Button
                variant="default"
                onClick={handlePhoneClick}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white h-11 sm:h-10"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Call Student</span>
                <span className="xs:hidden">Call</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Info */}
        <div className="glass-morphism rounded-3xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              Student Information
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-foreground text-sm sm:text-base break-words">{student?.fullName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground text-sm sm:text-base break-words leading-relaxed">{student?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-foreground text-sm sm:text-base">{student?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Module</label>
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-foreground font-medium text-sm sm:text-base">
                    {student?.module?.code || 'No Module'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {student?.module?.name || ''}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Joined</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground text-sm sm:text-base">
                  {student?.createdAt 
                    ? format(new Date(student.createdAt), 'MMM d, yyyy')
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div>
          <StudentAttendanceSummary
            studentId={student?.id}
            onViewDetails={() => setShowAttendanceDetail(true)}
          />
        </div>
      </div>

      {/* Full width sections */}
      <div className="space-y-6">
        {/* Notes */}
        <div className="glass-morphism rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Notes ({student?.notes?.length || 0})
            </h2>
            <Button 
              size="sm" 
              onClick={() => {
                setSelectedNote(null);
                setIsNoteFormOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Add Note</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {student?.notes?.length ? (
              student.notes.map((note: any) => (
                <div key={note?.id} className="bg-muted/50 backdrop-blur-xl border border-border rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm sm:text-base break-words">{note?.title || 'Untitled'}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                        <Badge variant="outline" className={`${getCategoryColor(note?.category || 'general')} text-xs`}>
                          {note?.category || 'general'}
                        </Badge>
                        <span className="text-xs text-muted-foreground break-words">
                          by {note?.user?.name} • {' '}
                          {note?.createdAt 
                            ? format(new Date(note.createdAt), 'MMM d, yyyy at h:mm a')
                            : 'Unknown time'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedNote(note);
                          setIsNoteFormOpen(true);
                        }}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteNote(note)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{note?.content || 'No content'}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
                No notes yet. Add the first note to track this student's progress.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="glass-morphism rounded-3xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Recent Activities
          </h2>
        </div>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {student?.activities?.length ? (
            student.activities.map((activity: any) => (
              <div key={activity?.id} className="flex items-start gap-3 p-3 bg-muted/50 backdrop-blur-xl border border-border rounded-2xl">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity?.type || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-foreground break-words leading-relaxed">{activity?.description || 'No description'}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {activity?.createdAt
                      ? format(new Date(activity.createdAt), 'MMM d, yyyy at h:mm a')
                      : 'Unknown time'
                    }
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4 text-sm sm:text-base">No activities recorded</p>
          )}
        </div>
      </div>

      {/* Email Communication History */}
      <div className="glass-morphism rounded-3xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-muted-foreground" />
            Email Communication History
          </h2>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {student?.emailLogs?.length ? (
            student.emailLogs.map((emailLog: any) => (
              <div key={emailLog?.id} className="bg-muted/50 backdrop-blur-xl border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm sm:text-base break-words flex items-center gap-2">
                      {emailLog?.subject || 'No Subject'}
                      <Badge
                        variant={emailLog?.status === 'sent' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {emailLog?.status || 'unknown'}
                      </Badge>
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs w-fit bg-blue-50 text-blue-700 border-blue-200">
                        {emailLog?.emailType?.replace('_', ' ') || 'general'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {emailLog?.sentAt
                          ? format(new Date(emailLog.sentAt), 'MMM d, yyyy at h:mm a')
                          : 'Unknown time'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-background/50 rounded-xl">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {emailLog?.body?.length > 200
                      ? `${emailLog.body.substring(0, 200)}...`
                      : emailLog?.body || 'No content'
                    }
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
              No emails sent yet. Use the AI Email Assistant to communicate with this student.
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      <NoteFormModal
        isOpen={isNoteFormOpen}
        onClose={() => setIsNoteFormOpen(false)}
        onSave={() => {
          refreshStudentData();
          setIsNoteFormOpen(false);
        }}
        studentId={student?.id || ''}
        note={selectedNote}
      />

      {/* AI Email Assistant */}
      <AIEmailAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        student={student ? {
          id: student.id,
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          module: student.module
        } : undefined}
        context={{
          attendanceRate: student?.attendanceRate,
          recentAttendance: student?.recentAttendance,
          notes: student?.notes?.map((note: any) => note.content).filter(Boolean)
        }}
      />

      {/* Educational AI Assistant */}
      <EducationalAIAssistant
        isOpen={showEducationalAI}
        onClose={() => setShowEducationalAI(false)}
        moduleContext={student?.module ? {
          code: student.module.code,
          name: student.module.name,
          id: student.module.id
        } : undefined}
        studentContext={student ? {
          id: student.id,
          name: student.fullName,
          module: student.module,
          attendanceRate: student?.attendanceRate
        } : undefined}
      />

      {/* Student Attendance Detail */}
      {showAttendanceDetail && student?.id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <StudentAttendanceDetail
              studentId={student.id}
              onClose={() => setShowAttendanceDetail(false)}
            />
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteNote} onOpenChange={() => setDeleteNote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNote}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
