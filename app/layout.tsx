import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Candy Corner — Dein Sweet Spot in Essen',
  description:
    'Süß, sauer, crunchy. Süßigkeiten, Snacks und Drinks zur Lieferung oder Abholung in Essen.',
  icons: { icon: '/images/candy-corner-logo.png' },
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
