import React from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { headers } from 'next/headers';
import Link from 'next/link';
import PrintQRButton from '@/components/PrintQRButton';

export default async function QRFlyerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const currentUrl = `${protocol}://${host}/menu/${id}`;

  const { data } = await supabase
    .from('menus')
    .select('restaurant_name')
    .eq('slug', id)
    .single();

  if (!data) {
    return <div className="p-10 text-center font-sans">Menu not found</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans print:bg-white print:p-0">
      <div className="bg-white max-w-2xl w-full shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:h-screen print:rounded-none flex flex-col justify-between">
        
        {/* Header Ribbon */}
        <div className="bg-amber-500 text-center py-12 px-6 print:py-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-zinc-950 tracking-tight uppercase print:text-black">
            {data.restaurant_name}
          </h1>
          <p className="text-amber-950 font-bold tracking-[0.3em] mt-4 uppercase text-xl">Digital Menu</p>
        </div>

        {/* Content Body */}
        <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl font-extrabold text-zinc-800 mb-4 print:text-black">Scan to Order</h2>
          <p className="text-zinc-500 text-xl mb-12 max-w-md mx-auto print:text-gray-600">Open your phone's camera and point it at this code to view our menu instantly.</p>
          
          <div className="p-8 bg-white border-8 border-zinc-100 rounded-[3rem] mb-16 print:border-gray-200">
            <div className="w-80 h-80">
              <QRCodeSVG value={currentUrl} width="100%" height="100%" fgColor="#09090b" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 text-center py-6 border-t border-zinc-100 print:border-t-0 print:bg-white">
          <p className="text-zinc-400 font-bold tracking-widest uppercase">Powered by MenuAI</p>
        </div>

      </div>
      
      {/* Print Controls (Hidden on Print) */}
      <div className="fixed bottom-8 right-8 print:hidden flex gap-4">
        <Link href={`/edit/${id}`} className="bg-zinc-800 text-white px-6 py-3 rounded-full font-bold hover:bg-zinc-700 shadow-lg transition-all flex items-center justify-center">
          ← Back
        </Link>
        <PrintQRButton />
      </div>
    </div>
  );
}
