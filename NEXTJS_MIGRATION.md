# Next.js Migration Reference

When you create your Next.js app, structure your `src/app` folder like this to match the functionality:

## 1. Global Layout (`src/app/layout.tsx`)
Wrap your children in the AuthProvider.

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // You need to port AuthContext

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "oneSAAS Issue Tracker",
  description: "Pilot System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
           {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 2. Main Page (`src/app/page.tsx`)

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) router.push('/issues');
      else router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return <main className="p-24">Loading...</main>;
}
```

## 3. Issues Page (`src/app/issues/page.tsx`)

```tsx
'use client';
import { IssueList } from '@/components/pages/IssueList'; // You might need to move IssueList to components
import { Navbar } from '@/components/Navbar';

export default function IssuesPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <IssueList />
      </div>
    </>
  );
}
```
