
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EMS Training Studio',
  description: 'Comprehensive Emergency Medical Services Training Management Platform - Three-Tier Architecture integrating Skills Management, Clinical Practice, and Equipment Management',
  keywords: 'EMS, Emergency Medical Services, Paramedic Training, Skills Management, Clinical Practice, Equipment Management, Medical Education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
