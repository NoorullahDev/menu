'use client';

import React, { useState, useMemo } from 'react';
import DynamicFoodImage from '@/components/DynamicFoodImage';

interface MenuItem {
  name: string;
  description: string;
  price: number;
  is_veg?: boolean;
  custom_image?: string;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface MenuData {
  restaurant_name: string;
  categories: MenuCategory[];
  prep_time?: string;
  theme?: 'midnight' | 'ivory' | 'crimson' | 'forest';
}

const THEMES = {
  midnight: {
    bg: 'bg-[#09090b]',
    text: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    textDark: 'text-zinc-500',
    accentBg: 'bg-amber-500',
    accentText: 'text-black',
    accentBorder: 'border-amber-500',
    accentTextOnly: 'text-amber-500',
    cardBg: 'bg-[#141414]',
    cardBorder: 'border-white/5',
    cardHover: 'hover:bg-white/5',
    inputBg: 'bg-white/5',
    inputBorder: 'border-white/10',
    headerBg: 'bg-[#09090b]/90',
    shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.5)]',
    accentGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    divider: 'border-white/10'
  },
  ivory: {
    bg: 'bg-[#FAF9F6]',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    textDark: 'text-stone-400',
    accentBg: 'bg-[#BFA15F]',
    accentText: 'text-white',
    accentBorder: 'border-[#BFA15F]',
    accentTextOnly: 'text-[#BFA15F]',
    cardBg: 'bg-white',
    cardBorder: 'border-stone-200',
    cardHover: 'hover:bg-stone-50',
    inputBg: 'bg-white',
    inputBorder: 'border-stone-200',
    headerBg: 'bg-[#FAF9F6]/90',
    shadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    accentGlow: 'shadow-[0_0_20px_rgba(191,161,95,0.3)]',
    divider: 'border-stone-200'
  },
  crimson: {
    bg: 'bg-[#4A0E0E]',
    text: 'text-rose-50',
    textMuted: 'text-rose-200/80',
    textDark: 'text-rose-200/50',
    accentBg: 'bg-[#D4AF37]',
    accentText: 'text-[#4A0E0E]',
    accentBorder: 'border-[#D4AF37]',
    accentTextOnly: 'text-[#D4AF37]',
    cardBg: 'bg-[#5e1212]',
    cardBorder: 'border-rose-400/20',
    cardHover: 'hover:bg-[#701616]',
    inputBg: 'bg-black/20',
    inputBorder: 'border-rose-400/30',
    headerBg: 'bg-[#4A0E0E]/95',
    shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
    accentGlow: 'shadow-[0_0_20px_rgba(212,175,55,0.3)]',
    divider: 'border-rose-500/30'
  },
  forest: {
    bg: 'bg-[#154734]',
    text: 'text-emerald-50',
    textMuted: 'text-emerald-100/80',
    textDark: 'text-emerald-100/50',
    accentBg: 'bg-[#F2C94C]',
    accentText: 'text-[#154734]',
    accentBorder: 'border-[#F2C94C]',
    accentTextOnly: 'text-[#F2C94C]',
    cardBg: 'bg-[#1a5941]',
    cardBorder: 'border-emerald-400/20',
    cardHover: 'hover:bg-[#1f6b4e]',
    inputBg: 'bg-black/20',
    inputBorder: 'border-emerald-400/30',
    headerBg: 'bg-[#154734]/95',
    shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.3)]',
    accentGlow: 'shadow-[0_0_20px_rgba(242,201,76,0.3)]',
    divider: 'border-emerald-500/30'
  }
};

export default function ClientMenuDisplay({ menuData }: { menuData: MenuData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const themeKey = menuData.theme || 'midnight';
  const t = THEMES[themeKey] || THEMES.midnight;

  // Filter items based on search and category
  const filteredCategories = useMemo(() => {
    return menuData.categories.map(category => {
      const filteredItems = category.items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
      });
      return { ...category, items: filteredItems };
    }).filter(category => {
      if (activeCategory === 'All') return category.items.length > 0;
      return category.name === activeCategory && category.items.length > 0;
    });
  }, [menuData, searchQuery, activeCategory]);

  return (
    <>
      <div className={`${t.bg} min-h-screen ${t.text} font-sans pb-10 transition-colors duration-500`}>
        {/* Restaurant Header */}
        <div className="pt-10 pb-6 px-4 text-center">
          <h1 className={`text-3xl font-bold tracking-wide ${t.text} drop-shadow-md`}>
            {menuData.restaurant_name}
          </h1>
          <div className={`w-16 h-1 ${t.accentBg} mx-auto mt-4 rounded-full opacity-80`}></div>
        </div>

        {/* Search and Filter Sticky Header */}
        <div className={`sticky top-0 z-30 ${t.headerBg} backdrop-blur-md border-b ${t.divider} print:hidden shadow-lg transition-colors duration-500`}>
          <div className="max-w-3xl mx-auto px-4 py-4">
            {/* Search Bar */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${t.textDark}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for your favorite dishes..."
                className={`w-full pl-11 pr-4 py-3.5 ${t.inputBg} border ${t.inputBorder} rounded-2xl focus:ring-2 focus:ring-opacity-50 focus:${t.accentBorder} ${t.text} placeholder-${t.textDark} outline-none transition-all font-medium`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Pills */}
            <div className="flex overflow-x-auto gap-3 pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                onClick={() => setActiveCategory('All')}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm tracking-wide ${
                  activeCategory === 'All' 
                    ? `${t.accentBg} ${t.accentText} ${t.accentGlow} border-transparent` 
                    : `bg-transparent border ${t.divider} ${t.textMuted} hover:${t.text} ${t.cardHover}`
                }`}
              >
                All
              </button>
              {menuData.categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm tracking-wide ${
                    activeCategory === cat.name 
                      ? `${t.accentBg} ${t.accentText} ${t.accentGlow} border-transparent` 
                      : `bg-transparent border ${t.divider} ${t.textMuted} hover:${t.text} ${t.cardHover}`
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Prep Time Banner */}
          {menuData.prep_time && (
            <div className={`bg-black/5 border ${t.accentBorder} rounded-2xl p-4 mb-8 flex items-center justify-center gap-3 ${t.accentTextOnly} font-medium`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Estimated Prep Time: <strong>{menuData.prep_time}</strong></span>
            </div>
          )}

          {filteredCategories.length === 0 && (
            <div className={`text-center py-16 ${t.textDark} font-medium text-lg`}>
              No items found matching your search.
            </div>
          )}

          {filteredCategories.map((category: MenuCategory, index: number) => (
            <div key={index} className="mb-10 first:mt-2">
              {/* Category Header */}
              {activeCategory === 'All' && (
                <div className="flex items-center mb-6">
                  <h2 className={`text-2xl font-bold ${t.text} tracking-wide`}>
                    {category.name}
                  </h2>
                </div>
              )}
              
              {/* Category Items */}
              <div className="flex flex-col gap-5">
                {category.items?.map((item: MenuItem, itemIdx: number) => {
                  return (
                    <div 
                      key={itemIdx} 
                      className={`${t.cardBg} border ${t.cardBorder} rounded-3xl overflow-hidden flex flex-row w-full ${t.cardHover} transition-colors p-4 gap-4 items-center shadow-lg`}
                    >
                      {/* Dynamic Image - Circular format for a premium look */}
                      <div className={`w-[100px] h-[100px] rounded-full overflow-hidden shrink-0 ${t.shadow} border ${t.divider} relative`}>
                        <DynamicFoodImage itemName={item.name} categoryName={category.name} customImage={item.custom_image} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-start gap-2 mb-1">
                          {/* Veg/Non-Veg Indicator */}
                          {item.is_veg !== undefined && (
                            <div className={`mt-1.5 flex-shrink-0 w-3 h-3 border rounded-sm flex items-center justify-center ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                          )}
                          <h3 className={`font-bold ${t.text} text-lg leading-tight tracking-wide`}>{item.name}</h3>
                        </div>
                        
                        {item.description && (
                          <p className={`text-sm ${t.textMuted} line-clamp-2 mt-1 leading-relaxed`}>
                            {item.description}
                          </p>
                        )}
                        
                        <span className={`font-extrabold ${t.accentTextOnly} mt-2 block text-lg`}>
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </main>

        {/* FOOTER */}
        <footer className={`py-10 text-center px-4 mt-8 border-t ${t.divider} print:hidden`}>
          <p className={`${t.textDark} font-bold mb-6`}>Thank you, visit again!</p>
        </footer>
      </div>
    </>
  );
}
