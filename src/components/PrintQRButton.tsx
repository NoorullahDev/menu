'use client';
import { useEffect } from 'react';

export default function PrintQRButton() {
  useEffect(() => {
    // Automatically trigger print dialogue when the flyer finishes rendering
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button 
      onClick={() => window.print()}
      className="bg-amber-500 text-zinc-950 px-6 py-3 rounded-full font-bold hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2"
    >
      🖨️ Print Flyer
    </button>
  );
}
