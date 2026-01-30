import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "oneSAAS Issue Tracker",
  description: "Track and manage your project issues efficiently.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-screen bg-slate-50">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
