import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { ToastContainer } from '../shared/ui/toast/ToastContainer';

export const metadata: Metadata = {
  title: "DocScan",
  description: "Digitalización de documentos con OCR inteligente",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <QueryProvider>
          <AuthWrapper>{children}</AuthWrapper>
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
