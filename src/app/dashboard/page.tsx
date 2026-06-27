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

export default function Dashboard() {
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold text-xl">MenuAI Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/generate" 
              className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded-lg hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              + Create Menu
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg hover:border-red-500 hover:text-red-500 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Your Menus</h1>
          <p className="text-zinc-400">Manage, edit, and share your generated client menus.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/10"></div>
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
            <span className="text-6xl mb-4">📄</span>
            <h2 className="text-2xl font-bold text-zinc-200 mb-2">No menus created yet</h2>
            <p className="text-zinc-400 mb-6">Click the button below to scan your first menu.</p>
            <Link 
              href="/generate" 
              className="px-6 py-3 bg-amber-500 text-zinc-950 font-bold rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              Create New Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <div key={menu.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 transition-all group flex flex-col h-full shadow-lg">
                <div className="flex-1 mb-6">
                  <h3 className="text-xl font-bold text-zinc-100 mb-1">{menu.restaurant_name}</h3>
                  <p className="text-xs text-zinc-500 font-medium font-mono mb-4">
                    Created: {new Date(menu.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Link 
                    href={`/menu/${menu.slug}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 font-semibold text-sm transition-all border border-zinc-700"
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
                    className="flex items-center justify-center gap-2 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 font-semibold text-sm transition-all border border-zinc-700 col-span-2 mt-1"
                  >
                    <span>🖨️</span> Print QR
                  </Link>
                  <button 
                    onClick={() => deleteMenu(menu.id, menu.restaurant_name)}
                    className="flex items-center justify-center py-2 text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg font-semibold text-sm transition-all border border-red-500/10 col-span-2 mt-1"
                  >
                    Delete Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
