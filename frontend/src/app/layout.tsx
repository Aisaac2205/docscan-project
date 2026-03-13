import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocScan - OCR Scanner",
  description: "Digitalización de documentos con OCR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
