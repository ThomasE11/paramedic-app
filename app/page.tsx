'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HomePage from '@/components/studio/HomePage';
import RoleLoginPage from '@/components/auth/RoleLoginPage';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect once and if we have a session and it's not loading
    if (status === 'authenticated' && session?.user && !hasRedirected) {
      const user = session.user;
      
      console.log('User authenticated:', user);
      console.log('User role:', user.role);
      
      let redirectPath = '';
      
      if (user.role === 'ADMIN') {
        redirectPath = '/skills/admin/dashboard';
      } else if (user.role === 'STUDENT') {
        redirectPath = '/skills/student/dashboard';
      } else if (user.role === 'LECTURER') {
        // Check if lecturer is in student view mode
        const viewMode = (user as any).viewMode || 'lecturer';
        if (viewMode === 'student') {
          redirectPath = '/skills/student/dashboard';
        } else {
          redirectPath = '/skills/lecturer/dashboard';
        }
      }
      
      if (redirectPath) {
        console.log('Redirecting to:', redirectPath);
        setHasRedirected(true);
        router.push(redirectPath);
      }
    }
  }, [session, status, router, hasRedirected]);

  // Show loading during authentication check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (status === 'unauthenticated' || !session) {
    return <RoleLoginPage />;
  }

  // If authenticated but redirect hasn't happened yet, show redirecting message
  if (status === 'authenticated' && !hasRedirected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  // Fallback - should rarely reach here
  return <HomePage />;
}