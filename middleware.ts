// Temporarily disable all middleware to test basic functionality
export { default } from 'next-auth/middleware'

export const config = {
  // Only protect specific paths, not the root
  matcher: [
    '/skills/((?!$).*)',  // Protect all /skills/* routes but not /skills itself
  ]
}