import React from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ClientMenuDisplay from '@/components/ClientMenuDisplay';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  const { data } = await supabase
    .from('menus')
    .select('restaurant_name')
    .eq('slug', id)
    .single();

  return {
    title: data?.restaurant_name ? `${data.restaurant_name} - MenuAI` : 'Menu Not Found - MenuAI',
    description: 'View our beautiful online menu',
  };
}

export default async function MenuPage({ params }: Props) {
  const { id } = await params;

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const currentUrl = `${protocol}://${host}/menu/${id}`;

  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('slug', id)
    .single();

  if (error || !data || !data.menu_data) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-3xl font-extrabold text-zinc-100 mb-3">Menu not found</h1>
        <p className="text-zinc-400 mb-8 text-lg">This menu may have been removed or the link is incorrect</p>
        <Link 
          href="/" 
          className="bg-amber-500 text-zinc-950 px-8 py-3 rounded-xl font-bold hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-200"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const menuData = data.menu_data;

  return (
    <div className="font-sans fade-in print:bg-white">
      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block text-center py-8 border-b-2 border-black mb-8">
        <h1 className="text-4xl font-extrabold text-black">{menuData.restaurant_name}</h1>
        <p className="text-gray-800 mt-2 font-medium">Scan to view the menu instantly</p>
      </div>

      {/* MENU CONTENT */}
      {/* MENU CONTENT (Client Component for Ordering) */}
      <ClientMenuDisplay menuData={menuData} />


    </div>
  );
}
