'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

interface MenuItem {
  name: string;
  description: string;
  price: number | '';
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

export default function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data, error } = await supabase
          .from('menus')
          .select('*')
          .eq('slug', id)
          .single();

        if (error) throw error;
        if (data && data.menu_data) {
          setMenuData(data.menu_data);
        } else {
          setErrorMsg("Menu not found.");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setErrorMsg("Failed to load menu.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchMenu();
    setMenuUrl(`${window.location.origin}/menu/${id}`);
  }, [id]);

  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!menuData) return;
    setMenuData({ ...menuData, restaurant_name: e.target.value });
  };

  const handleCategoryNameChange = (catIndex: number, newName: string) => {
    if (!menuData) return;
    const newData = JSON.parse(JSON.stringify(menuData));
    newData.categories[catIndex].name = newName;
    setMenuData(newData);
  };

  const handleItemChange = (catIndex: number, itemIndex: number, field: keyof MenuItem, value: string) => {
    if (!menuData) return;
    const newData = JSON.parse(JSON.stringify(menuData));
    if (field === 'price') {
      newData.categories[catIndex].items[itemIndex][field] = value === '' ? '' : Number(value);
    } else {
      newData.categories[catIndex].items[itemIndex][field] = value;
    }
    setMenuData(newData);
  };

  const handleImageUpload = (catIndex: number, itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        handleItemChange(catIndex, itemIndex, 'custom_image', dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addItem = (catIndex: number) => {
    if (!menuData) return;
    const newData = JSON.parse(JSON.stringify(menuData));
    newData.categories[catIndex].items.push({ name: "", description: "", price: 0 });
    setMenuData(newData);
  };

  const deleteItem = (catIndex: number, itemIndex: number) => {
    if (!menuData) return;
    const newData = JSON.parse(JSON.stringify(menuData));
    newData.categories[catIndex].items.splice(itemIndex, 1);
    setMenuData(newData);
  };

  const addCategory = () => {
    if (!menuData) return;
    const newData = JSON.parse(JSON.stringify(menuData));
    newData.categories.push({ name: "", items: [{ name: "", description: "", price: 0 }] });
    setMenuData(newData);
  };

  const deleteCategory = (catIndex: number) => {
    if (!menuData) return;
    if (confirm("Are you sure you want to delete this category?")) {
      const newData = JSON.parse(JSON.stringify(menuData));
      newData.categories.splice(catIndex, 1);
      setMenuData(newData);
    }
  };

  const handleSave = async () => {
    if (!menuData) return;
    
    try {
      const { error } = await supabase
        .from('menus')
        .update({ 
          menu_data: menuData,
          restaurant_name: menuData.restaurant_name,
          updated_at: new Date().toISOString()
        })
        .eq('slug', id);

      if (error) throw error;
      
      setSaveStatus({ type: 'success', message: "Menu updated successfully! ✓" });
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveStatus({ type: 'error', message: err.message || "Failed to update menu. Please try again." });
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const downloadQR = () => {
    const svgElement = document.getElementById('menu-qr-code');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width || 200;
      canvas.height = img.height || 200;
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        const filename = menuData?.restaurant_name?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'menu';
        downloadLink.download = `${filename}-qr.png`;
        downloadLink.href = pngUrl;
        downloadLink.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] pb-24 font-sans animate-pulse text-zinc-100">
        {/* TOP BAR SKELETON */}
        <div className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
            <div className="h-6 bg-zinc-800 w-24 rounded-lg"></div>
            <div className="h-6 bg-zinc-800 w-24 rounded-lg"></div>
            <div className="h-10 bg-zinc-800 w-32 rounded-xl"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl mt-8">
          <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 p-6 mb-8">
            <div className="h-4 bg-zinc-800 w-32 rounded-md mb-2"></div>
            <div className="h-12 bg-zinc-800 w-full rounded-xl"></div>
          </div>

          <div className="space-y-6">
            {[1, 2].map((catIndex) => (
              <div key={catIndex} className="bg-white/5 rounded-2xl shadow-sm border border-white/10 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="h-8 bg-zinc-800 w-1/3 rounded-lg"></div>
                  <div className="h-8 bg-zinc-800 w-24 rounded-lg"></div>
                </div>

                <div className="space-y-4">
                  {[1, 2].map((itemIndex) => (
                    <div key={itemIndex} className="flex gap-4 items-start bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <div className="h-4 bg-zinc-800 w-20 rounded-md mb-1"></div>
                            <div className="h-10 bg-zinc-800 w-full rounded-lg"></div>
                          </div>
                          <div className="w-full sm:w-32 shrink-0">
                            <div className="h-4 bg-zinc-800 w-16 rounded-md mb-1"></div>
                            <div className="h-10 bg-zinc-800 w-full rounded-lg"></div>
                          </div>
                        </div>
                        <div>
                          <div className="h-4 bg-zinc-800 w-32 rounded-md mb-1"></div>
                          <div className="h-16 bg-zinc-800 w-full rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg || !menuData) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 text-center text-zinc-100">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-3xl font-extrabold text-zinc-100 mb-3">Menu not found</h1>
        <p className="text-zinc-400 mb-8 text-lg">This menu may have been removed or the link is incorrect</p>
        <Link href="/" className="bg-amber-500 text-zinc-950 px-8 py-3 rounded-xl font-bold hover:bg-amber-400 shadow-md transition-all duration-200">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] pb-24 font-sans fade-in text-zinc-100">
      {/* TOP BAR */}
      <div className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <Link href={`/menu/${id}`} className="text-zinc-400 hover:text-amber-500 transition-all duration-200 font-medium flex items-center gap-2">
            <span>←</span> <span className="hidden sm:inline">Back to Menu</span>
          </Link>
          <h1 className="text-xl font-bold text-zinc-100">Edit Menu</h1>
          <button onClick={handleSave} className="bg-amber-500 text-zinc-950 px-6 py-2 rounded-xl font-bold hover:bg-amber-400 transition-all duration-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            Save Changes
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-8 relative">
        {/* TOAST MESSAGE */}
        {saveStatus && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-2 font-bold text-white border ${saveStatus.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 backdrop-blur-md' : 'bg-red-500/20 border-red-500/50 text-red-400 backdrop-blur-md'}`}>
            {saveStatus.message}
          </div>
        )}

        {/* LOCALHOST WARNING BANNER */}
        {menuUrl.includes('localhost') && (
          <div className="bg-amber-500/10 border border-amber-500/50 rounded-2xl p-4 mb-8 flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-amber-500">Testing on mobile?</h4>
              <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
                Your QR code is currently encoding <code className="bg-black/40 px-1.5 py-0.5 rounded text-zinc-400">localhost</code>, which your phone cannot connect to. 
                Please open <code className="bg-black/40 px-1.5 py-0.5 rounded font-bold text-amber-400">http://192.168.100.34:3000</code> in your browser instead so the QR code generates the correct network link!
              </p>
            </div>
          </div>
        )}

        {/* RESTAURANT SETTINGS */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 p-6 mb-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Restaurant Name</label>
            <input 
              type="text" 
              value={menuData.restaurant_name}
              onChange={handleRestaurantNameChange}
              className="w-full text-2xl font-bold bg-black/20 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-zinc-100"
              placeholder="Restaurant Name"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-4 border-t border-white/10">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Estimated Prep Time</label>
              <input 
                type="text" 
                value={menuData.prep_time || ''}
                onChange={(e) => setMenuData({ ...menuData, prep_time: e.target.value })}
                className="w-full font-medium bg-black/20 border border-zinc-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-zinc-100"
                placeholder="e.g. 15-20 minutes"
              />
              <p className="text-xs text-zinc-500 mt-1">Shown to customers while viewing the menu.</p>
            </div>
          </div>
          {/* THEME SELECTOR */}
          <div className="pt-6 border-t border-white/10 mt-6">
            <label className="block text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wide">Menu Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'midnight', name: 'Midnight', bg: 'bg-[#09090b]', accent: 'bg-amber-500' },
                { id: 'ivory', name: 'Ivory', bg: 'bg-[#FAF9F6]', accent: 'bg-[#BFA15F]' },
                { id: 'crimson', name: 'Crimson', bg: 'bg-[#4A0E0E]', accent: 'bg-[#D4AF37]' },
                { id: 'forest', name: 'Forest', bg: 'bg-[#154734]', accent: 'bg-[#F2C94C]' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setMenuData({ ...menuData, theme: theme.id as any })}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    (menuData.theme || 'midnight') === theme.id 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-white/5 bg-black/20 hover:border-white/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full mb-2 flex overflow-hidden border border-white/20 shadow-md ${theme.bg}`}>
                    <div className={`w-1/2 h-full`}></div>
                    <div className={`w-1/2 h-full ${theme.accent}`}></div>
                  </div>
                  <span className="text-xs font-bold text-zinc-300">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CATEGORIES SECTION */}
        <div className="space-y-6">
          {menuData.categories.map((category, catIndex) => (
            <div key={catIndex} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 p-4 sm:p-6 transition-all">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <input 
                  type="text"
                  value={category.name}
                  onChange={(e) => handleCategoryNameChange(catIndex, e.target.value)}
                  className="text-xl font-bold text-amber-500 bg-transparent border-b-2 border-transparent hover:border-zinc-700 focus:border-amber-500 focus:outline-none p-1 transition-colors w-2/3 sm:w-1/2"
                  placeholder="Category Name"
                />
                <button 
                  onClick={() => deleteCategory(catIndex)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all duration-200"
                >
                  Delete Category
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-4 items-start bg-black/20 p-4 rounded-xl border border-white/5 group">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Item Name */}
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-zinc-500 mb-1">Item Name</label>
                          <input 
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(catIndex, itemIndex, 'name', e.target.value)}
                            className="w-full bg-black/20 border border-zinc-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-zinc-100 font-medium"
                            placeholder="e.g. Samosa"
                          />
                        </div>
                        {/* Price */}
                        <div className="w-full sm:w-32 shrink-0">
                          <label className="block text-xs font-semibold text-zinc-500 mb-1">Price (Rs.)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">Rs.</span>
                            <input 
                              type="number"
                              value={item.price === 0 ? '' : item.price}
                              onChange={(e) => handleItemChange(catIndex, itemIndex, 'price', e.target.value)}
                              className="w-full bg-black/20 border border-zinc-800 rounded-lg p-2 pl-9 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-amber-500 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Description (optional)</label>
                        <textarea 
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleItemChange(catIndex, itemIndex, 'description', e.target.value)}
                          className="w-full bg-black/20 border border-zinc-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none text-zinc-300 text-sm"
                          placeholder="Brief description of the item..."
                        />
                      </div>
                      
                      {/* Custom Image Upload */}
                      <div className="flex items-center gap-4 mt-2">
                        {item.custom_image && (
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                            <img src={item.custom_image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <input 
                            type="file"
                            accept="image/*"
                            id={`image-upload-${catIndex}-${itemIndex}`}
                            className="hidden"
                            onChange={(e) => handleImageUpload(catIndex, itemIndex, e)}
                          />
                          <label 
                            htmlFor={`image-upload-${catIndex}-${itemIndex}`}
                            className="cursor-pointer text-xs font-bold text-amber-500 border border-amber-500/30 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg transition-all inline-block"
                          >
                            {item.custom_image ? 'Change Image' : 'Upload Image'}
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delete Item Button */}
                    <button 
                      onClick={() => deleteItem(catIndex, itemIndex)}
                      className="text-zinc-600 hover:text-red-400 mt-6 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-200 opacity-100 sm:opacity-50 sm:group-hover:opacity-100"
                      title="Delete Item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              <button 
                onClick={() => addItem(catIndex)}
                className="mt-4 text-amber-500 font-semibold text-sm border border-amber-500/20 hover:bg-amber-500/10 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1"
              >
                <span>+</span> Add Item
              </button>
            </div>
          ))}
        </div>

        {/* Add Category Button */}
        <button 
          onClick={addCategory}
          className="w-full mt-6 py-4 border-2 border-dashed border-zinc-700 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5 rounded-xl font-bold transition-all duration-200 text-lg flex items-center justify-center gap-2"
        >
          <span>+</span> Add Category
        </button>

        {/* Bottom Save Button */}
        <div className="mt-12 mb-8 flex justify-end">
          <button onClick={handleSave} className="bg-amber-500 text-zinc-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95">
            Save Changes
          </button>
        </div>

        {/* QR CODE & PDF DOWNLOAD SECTION */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 p-6 sm:p-8 mt-12 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0">
            {menuUrl && (
              <QRCodeSVG 
                id="menu-qr-code"
                value={menuUrl} 
                size={200} 
                level="M"
                includeMargin={true}
              />
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <h3 className="text-2xl font-bold text-zinc-100">Share & Export Your Menu</h3>
            <p className="text-zinc-400">Download the QR code to print for your tables, or print out a beautiful ready-made Scanner Flyer.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2 items-center justify-center md:justify-start">
              <button 
                onClick={downloadQR}
                className="bg-amber-500 text-zinc-950 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                Download QR (PNG)
              </button>
              
              <Link 
                href={`/qr/${id}`}
                target="_blank"
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 px-6 py-3 rounded-xl font-bold hover:bg-zinc-700 hover:border-zinc-500 transition-all duration-200 flex items-center justify-center gap-2"
              >
                🖨️ Print QR Scanner Flyer
              </Link>
            </div>
            
            {menuUrl && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-sm font-medium text-zinc-500 mr-2">URL:</span>
                <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-amber-500 hover:underline break-all">
                  {menuUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
