'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LPHeader } from '@/shared/ui/landing/LPHeader';
import { LandingContent } from '@/shared/ui/landing/LandingContent';
import { LPFooter } from '@/shared/ui/landing/LPFooter';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LPHeader />
      <main className="flex-1">
        <LandingContent />
      </main>
      <LPFooter />
    </div>
  );
}
