import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Daymark — Local task planner',
  description: 'A calm, private task planner that keeps your day clear and focused.',
  openGraph: {
    title: 'Daymark — Local task planner',
    description: 'A calm, private task planner that keeps your day clear and focused.',
    type: 'website',
    images: [{ url: '/og.png', width: 1736, height: 906, alt: 'Daymark — Your day, clearly planned.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daymark — Local task planner',
    description: 'A calm, private task planner that keeps your day clear and focused.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
