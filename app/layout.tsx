import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lex Aureon | Constitutional AI Governance',
  description: 'State-space control system for language generation. Constitutional AI governance powered by the Aureonics framework.',
  openGraph: {
    title: 'Lex Aureon — Govern AI. Ensure Trust. Defend Truth.',
    description: 'Constitutional AI governance. Real-time CBF control, Lyapunov stability, cryptographic audit receipts.',
    images: [{ url: '/logo.png', width: 1080, height: 1080 }],
    url: 'https://lexaureon.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lex Aureon — Constitutional AI Governance',
    description: 'C+R+S=1. Every AI output governed, audited, proven.',
    images: ['/logo.png'],
  },
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
        {children}
      </body>
    </html>
  );
}
