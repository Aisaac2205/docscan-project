import type { Metadata } from "next";
import "./globals.css";
import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import { ToastContainer } from '../shared/ui/toast/ToastContainer';

export const metadata: Metadata = {
  title: "DocScan",
  description: "Digitalización de documentos con OCR inteligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthWrapper>{children}</AuthWrapper>
        <ToastContainer />
      </body>
    </html>
  );
}
