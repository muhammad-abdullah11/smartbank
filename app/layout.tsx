'use client'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "@/Components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  const authRoutes = [
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/login',
    '/register',
  ];
  
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {!isAuthRoute && <Navbar />}
        <main className={`${!isAuthRoute ? 'lg:ml-64' : ''} min-h-screen bg-gray-50`}>
          {children}
        </main>
      </body>
    </html>
  );
}
