'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  tagline?: string;
  categories: MenuCategory[];
  prep_time?: string;
  theme?: string;
  currency?: string;
}

// 12 Premium Themes
export const THEMES: Record<string, any> = {
  midnight: {
    bg: 'bg-[#09090b]', text: 'text-zinc-100', textMuted: 'text-zinc-400', textDark: 'text-zinc-500',
    accentBg: 'bg-amber-500', accentText: 'text-black', accentBorder: 'border-amber-500', accentTextOnly: 'text-amber-500',
    cardBg: 'bg-[#141414]', cardBorder: 'border-white/5', cardHover: 'hover:bg-white/5',
    inputBg: 'bg-white/5', inputBorder: 'border-white/10', headerBg: 'bg-[#09090b]/90',
    shadow: 'shadow-[0_4px_15px_rgba(0,0,0,0.5)]', accentGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', divider: 'border-white/10'
  },
  ivory: {
    bg: 'bg-[#FAF9F6]', text: 'text-stone-900', textMuted: 'text-stone-500', textDark: 'text-stone-400',
    accentBg: 'bg-[#BFA15F]', accentText: 'text-white', accentBorder: 'border-[#BFA15F]', accentTextOnly: 'text-[#BFA15F]',
    cardBg: 'bg-white', cardBorder: 'border-stone-200', cardHover: 'hover:bg-stone-50',
    inputBg: 'bg-white', inputBorder: 'border-stone-200', headerBg: 'bg-[#FAF9F6]/90',
    shadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.05)]', accentGlow: 'shadow-[0_0_20px_rgba(191,161,95,0.3)]', divider: 'border-stone-200'
  },
  crimson: {
    bg: 'bg-[#4A0E0E]', text: 'text-rose-50', textMuted: 'text-rose-200/80', textDark: 'text-rose-200/50',
    accentBg: 'bg-[#D4AF37]', accentText: 'text-[#4A0E0E]', accentBorder: 'border-[#D4AF37]', accentTextOnly: 'text-[#D4AF37]',
    cardBg: 'bg-[#5e1212]', cardBorder: 'border-rose-400/20', cardHover: 'hover:bg-[#701616]',
    inputBg: 'bg-black/20', inputBorder: 'border-rose-400/30', headerBg: 'bg-[#4A0E0E]/95',
    shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.3)]', accentGlow: 'shadow-[0_0_20px_rgba(212,175,55,0.3)]', divider: 'border-rose-500/30'
  },
  forest: {
    bg: 'bg-[#154734]', text: 'text-emerald-50', textMuted: 'text-emerald-100/80', textDark: 'text-emerald-100/50',
    accentBg: 'bg-[#F2C94C]', accentText: 'text-[#154734]', accentBorder: 'border-[#F2C94C]', accentTextOnly: 'text-[#F2C94C]',
    cardBg: 'bg-[#1a5941]', cardBorder: 'border-emerald-400/20', cardHover: 'hover:bg-[#1f6b4e]',
    inputBg: 'bg-black/20', inputBorder: 'border-emerald-400/30', headerBg: 'bg-[#154734]/95',
    shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.3)]', accentGlow: 'shadow-[0_0_20px_rgba(242,201,76,0.3)]', divider: 'border-emerald-500/30'
  },
  cafe: {
    bg: 'bg-[#F5E6D3]', text: 'text-[#4A3728]', textMuted: 'text-[#6B503B]', textDark: 'text-[#8B6E57]',
    accentBg: 'bg-[#8B5A2B]', accentText: 'text-[#F5E6D3]', accentBorder: 'border-[#8B5A2B]', accentTextOnly: 'text-[#8B5A2B]',
    cardBg: 'bg-[#FFF9F0]', cardBorder: 'border-[#E0D0BB]', cardHover: 'hover:bg-[#FDF3E6]',
    inputBg: 'bg-white/60', inputBorder: 'border-[#E0D0BB]', headerBg: 'bg-[#F5E6D3]/95',
    shadow: 'shadow-[0_6px_25px_rgba(139,90,43,0.15)]', accentGlow: 'shadow-[0_0_15px_rgba(139,90,43,0.3)]', divider: 'border-[#D9C4AB]'
  },
  ocean: {
    bg: 'bg-[#0F2027]', text: 'text-cyan-50', textMuted: 'text-cyan-200/70', textDark: 'text-cyan-500/50',
    accentBg: 'bg-[#00D2FF]', accentText: 'text-[#0F2027]', accentBorder: 'border-[#00D2FF]', accentTextOnly: 'text-[#00D2FF]',
    cardBg: 'bg-[#16303B]', cardBorder: 'border-cyan-500/20', cardHover: 'hover:bg-[#1C3D4A]',
    inputBg: 'bg-black/30', inputBorder: 'border-cyan-500/30', headerBg: 'bg-[#0F2027]/95',
    shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.4)]', accentGlow: 'shadow-[0_0_20px_rgba(0,210,255,0.4)]', divider: 'border-cyan-900'
  },
  sunset: {
    bg: 'bg-[#2A0800]', text: 'text-orange-50', textMuted: 'text-orange-200/80', textDark: 'text-orange-500/50',
    accentBg: 'bg-[#FF7E5F]', accentText: 'text-black', accentBorder: 'border-[#FF7E5F]', accentTextOnly: 'text-[#FF7E5F]',
    cardBg: 'bg-[#401205]', cardBorder: 'border-orange-500/20', cardHover: 'hover:bg-[#521808]',
    inputBg: 'bg-black/30', inputBorder: 'border-orange-500/30', headerBg: 'bg-[#2A0800]/95',
    shadow: 'shadow-[0_8px_30px_rgba(0,0,0,0.5)]', accentGlow: 'shadow-[0_0_25px_rgba(255,126,95,0.4)]', divider: 'border-orange-900/50'
  },
  neon: {
    bg: 'bg-[#050505]', text: 'text-pink-50', textMuted: 'text-pink-200/70', textDark: 'text-pink-500/50',
    accentBg: 'bg-[#FF00FF]', accentText: 'text-black', accentBorder: 'border-[#FF00FF]', accentTextOnly: 'text-[#FF00FF]',
    cardBg: 'bg-[#111]', cardBorder: 'border-pink-500/20', cardHover: 'hover:bg-[#1a1a1a]',
    inputBg: 'bg-black/50', inputBorder: 'border-pink-500/30', headerBg: 'bg-[#050505]/95',
    shadow: 'shadow-[0_8px_30px_rgba(255,0,255,0.15)]', accentGlow: 'shadow-[0_0_25px_rgba(255,0,255,0.6)]', divider: 'border-pink-900/40'
  },
  minimal: {
    bg: 'bg-[#FFFFFF]', text: 'text-black', textMuted: 'text-gray-600', textDark: 'text-gray-400',
    accentBg: 'bg-black', accentText: 'text-white', accentBorder: 'border-black', accentTextOnly: 'text-black',
    cardBg: 'bg-gray-50', cardBorder: 'border-gray-200', cardHover: 'hover:bg-gray-100',
    inputBg: 'bg-white', inputBorder: 'border-gray-300', headerBg: 'bg-white/95',
    shadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.06)]', accentGlow: 'shadow-[0_0_15px_rgba(0,0,0,0.15)]', divider: 'border-gray-200'
  },
  vintage: {
    bg: 'bg-[#F4ECD8]', text: 'text-[#4A3219]', textMuted: 'text-[#705234]', textDark: 'text-[#967657]',
    accentBg: 'bg-[#5E3A21]', accentText: 'text-[#F4ECD8]', accentBorder: 'border-[#5E3A21]', accentTextOnly: 'text-[#5E3A21]',
    cardBg: 'bg-[#EAE0C8]', cardBorder: 'border-[#D4C3A3]', cardHover: 'hover:bg-[#DFD3B4]',
    inputBg: 'bg-[#F4ECD8]', inputBorder: 'border-[#D4C3A3]', headerBg: 'bg-[#F4ECD8]/95',
    shadow: 'shadow-[0_6px_20px_rgba(94,58,33,0.1)]', accentGlow: 'shadow-[0_0_15px_rgba(94,58,33,0.3)]', divider: 'border-[#D4C3A3]'
  },
  rustic: {
    bg: 'bg-[#2E1F1A]', text: 'text-orange-50', textMuted: 'text-orange-200/70', textDark: 'text-orange-400/40',
    accentBg: 'bg-[#FFB300]', accentText: 'text-[#2E1F1A]', accentBorder: 'border-[#FFB300]', accentTextOnly: 'text-[#FFB300]',
    cardBg: 'bg-[#3A2822]', cardBorder: 'border-[#593E35]', cardHover: 'hover:bg-[#47312A]',
    inputBg: 'bg-black/30', inputBorder: 'border-[#593E35]', headerBg: 'bg-[#2E1F1A]/95',
    shadow: 'shadow-[0_8px_25px_rgba(0,0,0,0.5)]', accentGlow: 'shadow-[0_0_20px_rgba(255,179,0,0.4)]', divider: 'border-[#4A322A]'
  },
  bubblegum: {
    bg: 'bg-[#FFE4E1]', text: 'text-[#872657]', textMuted: 'text-[#B03060]', textDark: 'text-[#DB7093]',
    accentBg: 'bg-[#FF69B4]', accentText: 'text-white', accentBorder: 'border-[#FF69B4]', accentTextOnly: 'text-[#FF69B4]',
    cardBg: 'bg-[#FFF0F5]', cardBorder: 'border-[#FFB6C1]', cardHover: 'hover:bg-[#FFF]',
    inputBg: 'bg-white/60', inputBorder: 'border-[#FFB6C1]', headerBg: 'bg-[#FFE4E1]/95',
    shadow: 'shadow-[0_6px_25px_rgba(255,105,180,0.2)]', accentGlow: 'shadow-[0_0_20px_rgba(255,105,180,0.4)]', divider: 'border-[#FFC0CB]'
  }
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
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
        <motion.div 
          initial={{ opacity: 0, y: -30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pt-12 pb-8 px-4 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${t.text} drop-shadow-lg`}>
              {menuData.restaurant_name}
            </h1>
            
            {menuData.tagline && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={`mt-3 text-lg md:text-xl italic font-medium tracking-wide ${t.accentTextOnly} opacity-90`}
              >
                {menuData.tagline}
              </motion.p>
            )}

            <motion.div 
              initial={{ scaleX: 0 }} 
              animate={{ scaleX: 1 }} 
              transition={{ delay: 0.3, duration: 0.6 }}
              className={`w-20 h-1.5 ${t.accentBg} mx-auto mt-6 rounded-full opacity-90 ${t.accentGlow}`}
            />
          </div>
        </motion.div>

        {/* Search and Filter Sticky Header */}
        <div className={`sticky top-0 z-30 ${t.headerBg} backdrop-blur-xl border-b ${t.divider} print:hidden shadow-lg transition-colors duration-500`}>
          <div className="max-w-3xl mx-auto px-4 py-4">
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="relative mb-5"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${t.textDark}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for your favorite dishes..."
                className={`w-full pl-12 pr-4 py-4 ${t.inputBg} border ${t.inputBorder} rounded-2xl focus:ring-2 focus:ring-opacity-50 focus:${t.accentBorder} ${t.text} placeholder-${t.textDark} outline-none transition-all font-medium text-lg`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
            
            {/* Category Pills */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="flex overflow-x-auto gap-3 pb-2 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setActiveCategory('All')}
                className={`relative flex-shrink-0 px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm tracking-wide overflow-hidden ${
                  activeCategory === 'All' 
                    ? `${t.accentText} border-transparent` 
                    : `bg-transparent border ${t.divider} ${t.textMuted} hover:${t.text} ${t.cardHover}`
                }`}
              >
                {activeCategory === 'All' && (
                  <motion.div layoutId="activeTab" className={`absolute inset-0 ${t.accentBg} ${t.accentGlow} rounded-full -z-10`} />
                )}
                <span className="relative z-10">All</span>
              </button>
              
              {menuData.categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`relative flex-shrink-0 px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm tracking-wide overflow-hidden ${
                    activeCategory === cat.name 
                      ? `${t.accentText} border-transparent` 
                      : `bg-transparent border ${t.divider} ${t.textMuted} hover:${t.text} ${t.cardHover}`
                  }`}
                >
                  {activeCategory === cat.name && (
                    <motion.div layoutId="activeTab" className={`absolute inset-0 ${t.accentBg} ${t.accentGlow} rounded-full -z-10`} />
                  )}
                  <span className="relative z-10">{cat.name}</span>
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Prep Time Banner */}
          {menuData.prep_time && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className={`bg-black/5 border ${t.accentBorder} rounded-2xl p-5 mb-8 flex items-center justify-center gap-3 ${t.accentTextOnly} font-bold text-lg shadow-sm`}
            >
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Estimated Prep Time: <strong>{menuData.prep_time}</strong></span>
            </motion.div>
          )}

          {filteredCategories.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center py-20 ${t.textDark} font-medium text-xl`}>
              No items found matching your search. 🍽️
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeCategory + searchQuery} 
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            >
              {filteredCategories.map((category: MenuCategory, index: number) => (
                <div key={index} className="mb-12 first:mt-2">
                  
                  {/* Category Header */}
                  {activeCategory === 'All' && (
                    <motion.div variants={itemVariants} className="flex items-center mb-6">
                      <h2 className={`text-3xl font-extrabold ${t.text} tracking-wide flex items-center gap-3`}>
                        {category.name}
                        <div className={`h-[2px] flex-1 ${t.accentBg} opacity-20 ml-4 rounded-full`}></div>
                      </h2>
                    </motion.div>
                  )}
                  
                  {/* Category Items */}
                  <div className="flex flex-col gap-5">
                    {category.items?.map((item: MenuItem, itemIdx: number) => (
                      <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        key={itemIdx} 
                        className={`${t.cardBg} border ${t.cardBorder} rounded-3xl overflow-hidden flex flex-row w-full ${t.cardHover} transition-colors p-5 gap-5 items-center shadow-md hover:${t.shadow} cursor-pointer group`}
                      >
                        {/* Dynamic Image - Enhanced premium border */}
                        <div className={`w-[110px] h-[110px] rounded-2xl overflow-hidden shrink-0 ${t.shadow} border-2 ${t.divider} group-hover:${t.accentBorder} transition-colors relative`}>
                          <DynamicFoodImage itemName={item.name} categoryName={category.name} customImage={item.custom_image} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-start gap-2 mb-1">
                            {/* Veg/Non-Veg Indicator */}
                            {item.is_veg !== undefined && (
                              <div className={`mt-1.5 flex-shrink-0 w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              </div>
                            )}
                            <h3 className={`font-bold ${t.text} text-xl leading-tight tracking-wide group-hover:${t.accentTextOnly} transition-colors`}>
                              {item.name}
                            </h3>
                          </div>
                          
                          {item.description && (
                            <p className={`text-sm md:text-base ${t.textMuted} line-clamp-2 mt-1.5 leading-relaxed font-medium`}>
                              {item.description}
                            </p>
                          )}
                          
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`font-extrabold ${t.accentTextOnly} text-xl`}>
                              {menuData.currency || 'PKR'} {item.price}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <motion.footer 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className={`py-12 text-center px-4 mt-8 border-t ${t.divider} print:hidden`}
        >
          <p className={`${t.textDark} font-bold text-lg mb-2`}>Thank you, visit again!</p>
          <p className={`text-sm ${t.textMuted} opacity-70`}>Powered by MenuAI</p>
        </motion.footer>
      </div>
    </>
  );
}
