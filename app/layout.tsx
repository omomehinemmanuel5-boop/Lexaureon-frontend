import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';

export const metadata: Metadata = {
  title: 'Lex Aureon | Constitutional AI Governance',
  description: 'State-space control system for language generation. Constitutional AI governance powered by the Aureonics framework.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
