
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')
    ? undefined
    : PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }

        console.log('[AUTH] Attempting login for:', credentials.email);
        console.log('[AUTH] DATABASE_URL exists:', !!process.env.DATABASE_URL);

        // Demo mode - allow specific test credentials when no database is available
        if (process.env.ENABLE_DEMO_MODE === 'true' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
          console.log('Demo mode: Checking credentials');

          // Original credentials as requested
          if (credentials.email === 'elias@twetemo.com' && credentials.password === 'test123') {
            return {
              id: Date.now().toString(),
              email: 'elias@twetemo.com',
              name: 'Elias Thomas',
              role: 'instructor'
            };
          }

          return null;
        }

        try {
          console.log('[AUTH] Querying database for user...');
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log('[AUTH] User found:', !!user);

          if (!user || !user.password) {
            console.log('[AUTH] User not found or no password');
            return null;
          }

          console.log('[AUTH] Comparing passwords...');
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log('[AUTH] Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('[AUTH] Invalid password');
            return null;
          }

          console.log('[AUTH] Login successful for:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('[AUTH] Error during authentication:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};
