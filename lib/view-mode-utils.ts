
import { useSession } from 'next-auth/react';

// Hook to check if user is in lecturer preview mode
export function useIsLecturerPreview() {
  const { data: session } = useSession();
  return session?.user?.role === 'LECTURER' && session?.user?.viewMode === 'student';
}

// Utility to modify API calls for preview mode
export function getPreviewModeHeaders(isLecturerPreview: boolean) {
  return isLecturerPreview ? { 'X-Preview-Mode': 'true' } : {};
}

// Utility to modify data for preview mode
export function withPreviewMode<T extends Record<string, any>>(data: T, isLecturerPreview: boolean): T & { isPreview?: boolean } {
  return isLecturerPreview ? { ...data, isPreview: true } : { ...data };
}

// Utility to determine if actions should be persisted
export function shouldPersistAction(isLecturerPreview: boolean, actionType: 'progress' | 'reflection' | 'quiz'): boolean {
  // For now, we'll still persist lecturer actions but mark them as preview
  // In a real system, you might want to not persist certain actions
  return true;
}

// Utility to get display warnings for preview mode
export function getPreviewWarnings(isLecturerPreview: boolean) {
  if (!isLecturerPreview) return null;
  
  return {
    progress: "Your progress in preview mode will be saved separately from student data.",
    reflection: "Your reflections in preview mode are for demonstration purposes only.",
    quiz: "Your quiz attempts in preview mode won't affect student statistics."
  };
}
