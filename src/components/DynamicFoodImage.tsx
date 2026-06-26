'use client';

import React, { useState, useEffect } from 'react';

export default function DynamicFoodImage({ itemName, categoryName, customImage }: { itemName: string, categoryName?: string, customImage?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      if (customImage) {
        setImageUrl(customImage);
        setLoading(false);
        return;
      }

      try {
        // Search Wikipedia for the exact food name
        const query = encodeURIComponent(itemName);
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=0&gsrlimit=1&prop=pageimages&format=json&pithumbsize=600&origin=*`);
        const data = await res.json();
        
        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages) as any[];
          if (pages.length > 0 && pages[0].thumbnail) {
            setImageUrl(pages[0].thumbnail.source);
            setLoading(false);
            return;
          }
        }
        
        // If Wikipedia fails, fallback to a nice generic premium image based on category
        const fallback = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80';
        setImageUrl(fallback);
      } catch (err) {
        console.error("Image fetch failed", err);
        setImageUrl('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80');
      } finally {
        setLoading(false);
      }
    }
    
    fetchImage();
  }, [itemName, customImage]);

  if (loading) {
    return (
      <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-700">
        <span className="text-3xl">🍽️</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={imageUrl || ''} 
      alt={itemName}
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}
