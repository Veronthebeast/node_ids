import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'NodeIDs',
    template: '%s — NodeIDs',
  },
  description:
    'Professional infinite whiteboard — build flows with connected nodes',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-full font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
