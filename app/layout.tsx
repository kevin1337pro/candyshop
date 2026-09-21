import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'FORME — Everyday Wear',
  description: 'Zeitgemäße Essentials. Entdecke die FORME Kleidungskollektion.',
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body id="top">{children}</body>
    </html>
  );
}
