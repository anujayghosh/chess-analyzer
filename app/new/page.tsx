'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAnalysisPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/');
  }, [router]);
  
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p>Redirecting to analysis page...</p>
      </div>
    </div>
  );
} 