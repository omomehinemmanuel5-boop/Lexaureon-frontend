import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lex Aureon | Governed AI Execution",
  description: "State-space control system for language generation. Real-time monitoring, correction, and governance.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
