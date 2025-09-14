
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  ExternalLink,
  Star,
  Trophy
} from 'lucide-react';
import { StudentWithModule } from '@/lib/types';
import Link from 'next/link';
import { SendEmailDialog } from '@/components/email/send-email-dialog';
import Image from 'next/image';

interface StudentCardProps {
  student: StudentWithModule;
  onEdit: (student: StudentWithModule) => void;
  onDelete: (student: StudentWithModule) => void;
}

export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const handleEmailClick = () => {
    setEmailDialogOpen(true);
  };

  const handlePhoneClick = () => {
    if (student?.phone) {
      window.open(`tel:${student.phone}`, '_blank');
    }
  };

  // Get module-specific styling inspired by Disney cards
  const getModuleStyle = (moduleCode?: string) => {
    switch (moduleCode) {
      case 'HEM3903':
        return {
          bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
          text: 'text-white',
          accent: 'from-blue-300 to-blue-500',
          badge: 'bg-blue-100 text-blue-800',
          shadow: 'shadow-blue-200/50'
        };
      case 'HEM2903':
        return {
          bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
          text: 'text-white',
          accent: 'from-emerald-300 to-emerald-500',
          badge: 'bg-emerald-100 text-emerald-800',
          shadow: 'shadow-emerald-200/50'
        };
      case 'HEM3923':
        return {
          bg: 'bg-gradient-to-br from-orange-400 to-red-500',
          text: 'text-white',
          accent: 'from-orange-300 to-red-400',
          badge: 'bg-orange-100 text-orange-800',
          shadow: 'shadow-red-200/50'
        };
      case 'AEM230':
        return {
          bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
          text: 'text-white',
          accent: 'from-purple-300 to-purple-500',
          badge: 'bg-purple-100 text-purple-800',
          shadow: 'shadow-purple-200/50'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-400 to-slate-600',
          text: 'text-white',
          accent: 'from-slate-300 to-slate-500',
          badge: 'bg-slate-100 text-slate-800',
          shadow: 'shadow-slate-200/50'
        };
    }
  };

  // Generate student avatar based on their name
  const getStudentAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return initials || 'ST';
  };

  // Get GPA color
  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-yellow-300';
    if (gpa >= 3.0) return 'text-blue-200';
    if (gpa >= 2.5) return 'text-green-200';
    return 'text-gray-300';
  };

  const moduleStyle = getModuleStyle(student?.module?.code);
  const avatarInitials = getStudentAvatar(student?.fullName || 'Student');

  return (
    <div className={`relative rounded-3xl p-4 sm:p-6 ${moduleStyle.bg} ${moduleStyle.shadow} shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 group cursor-pointer overflow-hidden min-h-[280px] sm:min-h-[300px] flex flex-col backdrop-blur-sm`}>
      {/* Enhanced Decorative Elements */}
      <div className="hidden sm:block absolute top-4 right-4 opacity-30">
        <div className="w-20 h-20 rounded-full bg-white/25 blur-xl animate-pulse"></div>
      </div>
      <div className="hidden sm:block absolute -bottom-4 -left-4 opacity-20">
        <div className="w-32 h-32 rounded-full bg-white/15 blur-2xl"></div>
      </div>
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>

      {/* Header with Menu */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 min-w-0 flex-1 mr-2">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">
            {student?.module?.name || 'Student'}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-white/20 text-white border-none h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full transition-all flex-shrink-0"
            >
              <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="glass-morphism shadow-xl rounded-2xl w-48"
            sideOffset={5}
          >
            <DropdownMenuItem asChild className="hover:bg-muted rounded-xl">
              <Link href={`/students/${student?.id}`} className="font-medium text-foreground">
                <ExternalLink className="w-4 h-4 mr-3 text-muted-foreground" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(student)} className="hover:bg-muted rounded-xl font-medium text-foreground">
              <Edit className="w-4 h-4 mr-3 text-muted-foreground" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(student)}
              className="text-red-600 focus:text-red-700 hover:bg-red-50 rounded-xl font-medium"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Delete Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Student Avatar - Responsive size */}
      <div className="flex justify-center mb-4 sm:mb-6 relative z-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 shadow-xl">
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            {avatarInitials}
          </span>
        </div>
      </div>

      {/* Student Info - Responsive text sizes with better contrast */}
      <div className="text-center mb-4 sm:mb-6 relative z-10 flex-grow">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight px-1 drop-shadow-sm">
          {student?.fullName || student?.firstName || 'Unknown'}
        </h3>
        <p className="text-white/95 font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 drop-shadow-sm">
          {student?.module?.code || 'No Module'}
        </p>
        <p className="text-white/80 text-xs sm:text-sm font-medium drop-shadow-sm">
          ID: {student?.studentId || 'N/A'}
        </p>
        
        {/* GPA Display */}
        {student?.currentGPA && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Trophy className={`w-3 h-3 sm:w-4 sm:h-4 ${getGPAColor(student.currentGPA)}`} />
            <span className={`text-xs sm:text-sm font-semibold ${getGPAColor(student.currentGPA)}`}>
              GPA: {student.currentGPA.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons - Mobile optimized */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto relative z-10">
        <Button
          onClick={handleEmailClick}
          size="sm"
          className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white border border-white/30 rounded-xl h-9 sm:h-10 font-medium transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
        >
          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden xs:inline">Email</span>
          <span className="xs:hidden">@</span>
        </Button>
        <Link href={`/students/${student?.id}`} className="flex-1">
          <Button
            size="sm"
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 rounded-xl h-9 sm:h-10 font-medium transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">View</span>
            <span className="xs:hidden">👁</span>
          </Button>
        </Link>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300 rounded-3xl"></div>
      
      {/* Email Dialog */}
      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        students={student ? [{
          id: student.id,
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          fullName: student.fullName || '',
          email: student.email || '',
          studentId: student.studentId || ''
        }] : []}
        defaultSubject={`Message for ${student?.firstName || 'Student'}`}
        defaultMessage={`Dear ${student?.firstName || 'Student'},\n\nI hope this message finds you well.\n\nBest regards,\nYour Instructor`}
      />
    </div>
  );
}
