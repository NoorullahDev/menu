'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function GenerateMenu() {
  const [status, setStatus] = useState<'upload' | 'processing' | 'done'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; isPdf: boolean }[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currency, setCurrency] = useState('PKR');
  const [theme, setTheme] = useState<'midnight' | 'ivory' | 'crimson' | 'forest'>('midnight');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selectedFiles: FileList | File[]) => {
    const newFiles = Array.from(selectedFiles).filter(
      (file) => file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (newFiles.length === 0) return;

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, { url: e.target?.result as string, isPdf: false }]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setPreviews((prev) => [...prev, { url: '', isPdf: true }]);
      }
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (files.length === 0 || !restaurantName) return;
    
    setStatus('processing');

    try {
      // 1. Prepare FormData for API
      const formData = new FormData();
      formData.append('restaurantName', restaurantName);
      files.forEach((file) => {
        formData.append('files', file);
      });

      // 2. Call extraction API
      const apiResponse = await fetch('/api/extract-menu', {
        method: 'POST',
        body: formData
      });

      const result = await apiResponse.json();

      if (!apiResponse.ok || result.error) {
        throw new Error(result.error || 'Failed to extract menu data');
      }

      const menuData = result.data;

      // 3. Generate Slug
      const baseSlug = restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const slug = `${baseSlug}-${randomNum}`;

      // 4. Save to Supabase
      const { data, error } = await supabase.from('menus').insert({
        restaurant_name: menuData.restaurant_name,
        slug: slug,
        menu_data: { ...menuData, currency, theme }
      }).select().single();

      if (error) {
        throw new Error(error.message || 'Failed to save menu to database');
      }

      // 5. Update Status on Success
      setMenuId(data.slug);
      setStatus('done');

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong. Please try again.');
      setStatus('upload');
    }
  };

  const copyLink = () => {
    if (menuId) {
      const url = `${window.location.origin}/menu/${menuId}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-8 md:py-12 flex flex-col items-center fade-in text-zinc-100">
      <div className="w-full max-w-[600px] relative z-10">
        
        {/* BACK BUTTON */}
        <Link 
          href="/" 
          className="inline-flex items-center text-zinc-400 hover:text-amber-500 transition-all duration-200 mb-8 font-medium gap-2"
        >
          <span>←</span> Back to Dashboard
        </Link>

        {/* STATE 1: UPLOAD */}
        {status === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-100 mb-3">Create Client Menu</h1>
              <p className="text-zinc-400 text-lg">Upload PDFs or multiple images of the menu</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl border border-white/10">
              {/* UPLOAD AREA */}
              <div 
                className={`relative w-full min-h-64 border-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all p-4 ${
                  isDragging 
                    ? 'border-amber-500 bg-amber-500/10 border-solid' 
                    : files.length > 0 
                      ? 'border-amber-500/50 border-solid bg-black/20' 
                      : 'border-zinc-700 border-dashed bg-black/20 hover:border-amber-500 hover:bg-amber-500/5'
                }`}
                onClick={() => {
                  if (files.length === 0) fileInputRef.current?.click();
                }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <input 
                  type="file" 
                  accept="image/*, application/pdf" 
                  multiple
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(e.target.files);
                    }
                  }}
                />

                {files.length > 0 ? (
                  <div className="w-full h-full">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {previews.map((preview, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10 group">
                          {preview.isPdf ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-red-500 bg-red-500/10">
                              <span className="text-4xl mb-2">📄</span>
                              <span className="text-xs font-bold">PDF</span>
                            </div>
                          ) : (
                            <img 
                              src={preview.url} 
                              alt={`Preview ${idx + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button 
                            onClick={(e) => removeFile(idx, e)}
                            className="absolute top-2 right-2 bg-zinc-900/90 text-red-500 hover:text-red-400 p-1.5 rounded-full shadow-md transition-all z-10 border border-white/10 opacity-0 group-hover:opacity-100"
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="aspect-square rounded-xl border-2 border-dashed border-zinc-700 hover:border-amber-500 flex flex-col items-center justify-center text-zinc-500 hover:text-amber-500 transition-all cursor-pointer bg-white/5"
                      >
                        <span className="text-2xl mb-1">+</span>
                        <span className="text-xs font-bold">Add More</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-6 pointer-events-none">
                    <span className="text-5xl mb-4 text-zinc-600">📄</span>
                    <p className="text-lg font-bold text-zinc-200 mb-2">Click to upload PDFs or Images</p>
                    <p className="text-sm text-zinc-500">Supports: PDF, JPG, PNG, WEBP</p>
                    <p className="text-xs text-amber-500/70 mt-2 font-medium">You can select multiple files at once</p>
                  </div>
                )}
              </div>

              {/* RESTAURANT NAME */}
              <div className="mt-8">
                <label htmlFor="restaurantName" className="block text-sm font-bold text-zinc-300 mb-2">
                  Client / Restaurant Name
                </label>
                <input 
                  type="text" 
                  id="restaurantName"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. The Rustic Oven"
                  className="w-full bg-black/20 rounded-xl border border-zinc-700 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-zinc-100 placeholder-zinc-600"
                  required
                />
              </div>

              {/* CURRENCY & THEME */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currency" className="block text-sm font-bold text-zinc-300 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-black/20 rounded-xl border border-zinc-700 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-zinc-100 appearance-none"
                  >
                    <option value="PKR">PKR (₨)</option>
                    <option value="USD $">USD ($)</option>
                    <option value="EUR €">EUR (€)</option>
                    <option value="GBP £">GBP (£)</option>
                    <option value="INR ₹">INR (₹)</option>
                    <option value="Rs.">Rs.</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="theme" className="block text-sm font-bold text-zinc-300 mb-2">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="w-full bg-black/20 rounded-xl border border-zinc-700 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-zinc-100 appearance-none"
                  >
                    <option value="midnight">Midnight (Dark)</option>
                    <option value="ivory">Ivory (Light)</option>
                    <option value="crimson">Crimson (Red)</option>
                    <option value="forest">Forest (Green)</option>
                  </select>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                onClick={handleGenerate}
                disabled={files.length === 0 || !restaurantName.trim()}
                className="w-full mt-8 py-4 bg-amber-500 text-zinc-950 text-lg font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400 active:scale-[0.98] enabled:hover:scale-[1.02] enabled:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                Generate Menu ✨
              </button>
              
              <p className="text-center text-sm text-zinc-500 mt-4">
                ✨ Gemini 2.5 AI will read your PDF/Images and create the menu
              </p>
            </div>
          </div>
        )}

        {/* STATE 2: PROCESSING */}
        {status === 'processing' && (
          <ProcessingOverlay />
        )}

        {/* STATE 3: DONE */}
        {status === 'done' && (
          <div className="animate-in zoom-in-95 fade-in duration-500 bg-white/5 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mb-6 text-4xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              ✅
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-100 mb-2">Menu generated! 🎉</h2>
            <p className="text-xl text-amber-500 font-bold mb-4">{restaurantName}</p>
            
            <div className="bg-black/20 px-6 py-3 rounded-full mb-8 border border-white/5">
              <p className="text-zinc-400 font-medium">Successfully processed by MenuAI</p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Link 
                href={`/menu/${menuId}`}
                className="w-full py-4 bg-amber-500 text-zinc-950 text-lg font-bold rounded-xl hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] text-center flex items-center justify-center gap-2"
              >
                View Your Menu <span>→</span>
              </Link>
              
              <div className="flex gap-4">
                <Link 
                  href={`/edit/${menuId}`}
                  className="flex-1 py-3 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl hover:border-amber-500 hover:text-amber-500 transition-all duration-200 font-bold text-center"
                >
                  Edit Menu
                </Link>
                
                <button 
                  onClick={copyLink}
                  className="flex-1 py-3 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl hover:border-amber-500 hover:text-amber-500 transition-all duration-200 font-bold flex items-center justify-center gap-2 relative"
                >
                  {copySuccess ? 'Copied!' : 'Copy Link 🔗'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProcessingOverlay() {
  const messages = [
    "📄 Analyzing document structure...",
    "📝 Reading items and prices...",
    "🏷️ Categorizing dishes...",
    "🎨 Designing your menu...",
    "✨ Almost done..."
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-10 flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md w-full animate-in zoom-in-95 fade-in duration-300">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-[6px] border-zinc-800 rounded-full"></div>
          <div className="absolute inset-0 border-[6px] border-amber-500 rounded-full border-t-transparent animate-spin drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
        </div>
        <h3 className="text-2xl font-extrabold text-zinc-100 mb-3 text-center">AI is processing files...</h3>
        <div className="h-8 flex items-center justify-center">
          <p className="text-zinc-400 font-medium text-lg text-center animate-pulse">
            {messages[msgIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
