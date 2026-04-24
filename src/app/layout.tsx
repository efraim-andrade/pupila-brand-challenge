import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/shared/components/layout/AppShell';
import { StoreHydrator } from '@/shared/components/StoreHydrator';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Pupila Brand Zone',
  description: 'Visual reference management for branding projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased" suppressHydrationWarning>
        <StoreHydrator />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
