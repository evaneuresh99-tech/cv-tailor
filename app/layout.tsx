import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CV Tailor — Evan Dharmasena',
  description: 'AI-powered CV tailoring and job matching',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Nav />
        <main className="max-w-screen-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
