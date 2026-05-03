import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lex Aureon — AI that governs itself',
  description:
    'Constitutional AI Governance system. Monitors AI outputs using 3 mathematical invariants constrained to a probability simplex. Built on the Aureonics framework.',
  openGraph: {
    title: 'Lex Aureon — AI that governs itself',
    description:
      'Lex Aureon monitors constitutional stability in real time — detecting drift before failure.',
    type: 'website',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
