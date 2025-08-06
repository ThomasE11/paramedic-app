'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RoleLoginPage from '@/components/auth/RoleLoginPage';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    console.log('Has redirected:', hasRedirected);
    
    setDebugInfo(`Status: ${status}, User: ${session?.user?.email || 'none'}, Role: ${session?.user?.role || 'none'}`);

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
        redirectPath = '/skills/lecturer/dashboard';
      } else {
        console.error('Unknown user role:', user.role);
        redirectPath = '/skills/student/dashboard'; // Default fallback
      }
      
      if (redirectPath) {
        console.log('Redirecting to:', redirectPath);
        setHasRedirected(true);
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          router.push(redirectPath);
        }, 100);
      }
    }
  }, [session, status, router, hasRedirected]);

  // Show loading during authentication check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading authentication...</div>
          <div className="text-xs text-gray-400 mt-2">{debugInfo}</div>
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
          <div className="text-xs text-gray-400 mt-2">{debugInfo}</div>
          <div className="text-xs text-gray-500 mt-1">
            Role: {session?.user?.role} | Email: {session?.user?.email}
          </div>
        </div>
      </div>
    );
  }

  // Final fallback - should rarely reach here
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="text-center">
        <div className="text-red-600 font-semibold mb-4">Unexpected State</div>
        <div className="text-xs text-gray-500">
          Status: {status} | Has Redirected: {hasRedirected.toString()}
        </div>
        <div className="text-xs text-gray-500">
          User: {session?.user?.email || 'none'} | Role: {session?.user?.role || 'none'}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    );
  }
}