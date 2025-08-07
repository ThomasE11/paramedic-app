
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Skills Matrix - Paramedic Training',
  description: 'Master paramedic skills with precision and confidence through our comprehensive training platform',
  keywords: 'EMS, Emergency Medical Services, Paramedic Training, Skills Management, Clinical Practice, Equipment Management, Medical Education',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} mobile-container`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
