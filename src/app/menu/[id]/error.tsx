'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Menu Page Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col items-center justify-center p-4 text-center fade-in">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-3">Oops! Something went wrong</h1>
      <p className="text-[#78716C] mb-8 text-lg max-w-md mx-auto">
        We encountered an issue while trying to display this menu. It might be due to incomplete or corrupted data from the AI.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-white border-2 border-[#E7E5E4] text-[#1a1a1a] px-6 py-3 rounded-xl font-bold hover:border-[#F97316] hover:text-[#F97316] transition-all duration-200"
        >
          Try Again
        </button>
        <Link 
          href="/" 
          className="bg-[#F97316] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#EA580C] shadow-md transition-all duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
