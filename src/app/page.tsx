'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface MenuRow {
  id: number;
  restaurant_name: string;
  slug: string;
  created_at: string;
}

export default function Home() {
  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchMenus() {
      try {
        const { data, error } = await supabase
          .from('menus')
          .select('id, restaurant_name, slug, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMenus(data || []);
      } catch (err) {
        console.error('Error fetching menus:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenus();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/login';
  };

  const deleteMenu = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        const { error } = await supabase.from('menus').delete().eq('id', id);
        if (error) throw error;
        setMenus(menus.filter(m => m.id !== id));
      } catch (err) {
        console.error('Error deleting menu:', err);
        alert('Failed to delete menu.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 selection:bg-amber-500/30">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-300">✨</span>
            <span className="text-amber-500 font-bold text-xl flex items-center gap-2 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              MenuAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/generate" 
              className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-zinc-950 rounded-lg font-bold hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] text-sm active:scale-95"
            >
              <span className="text-lg leading-none">+</span> New Menu Project
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-zinc-400 hover:text-red-400 transition-colors font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - TOP */}
      <section className="pt-32 pb-16 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Glowing Orbs background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-[#09090b] to-[#09090b] -z-20"></div>
        
        {/* Added animate-float for subtle motion effect */}
        <div className="container mx-auto max-w-4xl relative z-10 animate-in zoom-in-95 fade-in duration-1000 delay-300 fill-mode-both animate-float">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Welcome to Menu AI
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-zinc-100">
            Digitalize your menu in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">60 Seconds</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload a photo or PDF of any menu. Our Gemini 2.5 AI instantly extracts it into a premium, mobile-optimized online catalog with a smart, auto-updating QR code.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS SECTION - MIDDLE */}
      <section className="py-16 px-4 relative border-t border-white/5 bg-[#09090b]/50 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-500 fill-mode-both" id="how-it-works">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-100">How The Workflow Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Three simple steps to transform the dining experience.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-8 md:gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0 -translate-y-1/2 z-0"></div>

            <StepCard number="1" title="Scan or Upload" desc="Upload multiple images or a PDF of the menu from your computer." />
            <StepCard number="2" title="AI Extraction" desc="Gemini AI detects every dish, price, and category effortlessly." />
            <StepCard number="3" title="Live Updates" desc="Manage all menus here. Any edits automatically update the live QR codes." />
          </div>
        </div>
      </section>

      {/* SUBTLE DIVIDER */}
      <div className="w-full flex justify-center py-8">
        <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
      </div>

      {/* SAVED PROJECTS & NEW MENU - BOTTOM */}
      <section className="py-12 pb-24 px-4 relative z-10 animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-zinc-100">Saved Projects</h2>
              <p className="text-zinc-400 mt-2">Manage your digitized menus</p>
            </div>
            <Link 
              href="/generate" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-zinc-950 rounded-xl font-bold hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95"
            >
              <span className="text-xl leading-none">+</span> New Menu Project
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-white/5 rounded-2xl border border-white/10"></div>
              ))}
            </div>
          ) : menus.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
              <span className="text-6xl mb-4 opacity-50">📂</span>
              <h3 className="text-xl font-bold text-zinc-300 mb-2">No projects found</h3>
              <p className="text-zinc-500">Create your first menu project to see it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map((menu) => (
                <div key={menu.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-white/10 transition-all group flex flex-col h-full shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl -mr-10 -mt-10 rounded-full group-hover:bg-amber-500/20 transition-all"></div>
                  
                  <div className="flex-1 mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-zinc-100 mb-1 line-clamp-1">{menu.restaurant_name}</h3>
                    <p className="text-xs text-zinc-500 font-medium mb-4">
                      Created: {new Date(menu.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-auto relative z-10">
                    <Link 
                      href={`/menu/${menu.slug}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 py-2 bg-black/40 text-zinc-300 rounded-lg hover:text-amber-500 hover:bg-black/60 font-semibold text-sm transition-all border border-white/5"
                    >
                      <span>👁️</span> View
                    </Link>
                    <Link 
                      href={`/edit/${menu.slug}`}
                      className="flex items-center justify-center gap-2 py-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 font-semibold text-sm transition-all border border-amber-500/20"
                    >
                      <span>✏️</span> Edit
                    </Link>
                    <Link 
                      href={`/qr/${menu.slug}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 py-2 bg-black/40 text-zinc-300 rounded-lg hover:text-amber-500 hover:bg-black/60 font-semibold text-sm transition-all border border-white/5 col-span-2 mt-1"
                    >
                      <span>🖨️</span> Print QR Code
                    </Link>
                    <button 
                      onClick={() => deleteMenu(menu.id, menu.restaurant_name)}
                      className="flex items-center justify-center py-2 text-red-400 bg-red-400/5 hover:bg-red-500 hover:text-white rounded-lg font-semibold text-sm transition-all border border-red-500/10 col-span-2 mt-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-white/5 text-center bg-[#09090b]">
        <div className="container mx-auto">
          <p className="text-zinc-500 mb-2 font-medium">Built with precision for modern dining management</p>
          <p className="text-zinc-600 text-sm">© 2026 MenuAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex-1 relative z-10 w-full max-w-sm group">
      <div className="h-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-500 hover:bg-white/5 hover:border-amber-500/30 hover:-translate-y-2 shadow-lg hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)]">
        <div className="w-14 h-14 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all duration-300">
          {number}
        </div>
        <h3 className="text-xl font-bold mb-3 text-zinc-100 group-hover:text-amber-500 transition-colors">{title}</h3>
        <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">{desc}</p>
      </div>
    </div>
  );
}
