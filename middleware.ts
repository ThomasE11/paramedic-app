import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Just ensure authentication, let the client-side handle redirects
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow public pages
        if (pathname === '/' || pathname.startsWith('/auth/')) {
          return true;
        }
        
        // Require authentication for skills routes
        if (pathname.startsWith('/skills/')) {
          return !!token;
        }
        
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all routes except API routes, static files, and Next.js internals
    '/((?!api|_next/static|_next/image|favicon.ico|design-bg-video.mp4|.*\\..*$).*)',
  ],
};