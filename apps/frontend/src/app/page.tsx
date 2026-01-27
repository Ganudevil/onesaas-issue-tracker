'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If authenticated, go to issues.
    // If not, we can also go to issues (which will show Login prompt) or /login
    // Given previous logic sent everyone to /issues, we keep that.
    router.push('/issues');
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading Application...</p>
      <p className="text-sm text-gray-400 mt-2">Connecting to Keycloak...</p>
    </div>
  );
}
