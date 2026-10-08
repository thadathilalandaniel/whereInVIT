'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi, getImageUrl } from '../lib/api';

const fallbackImages = [
  {
    id: 'fb-1',
    image: "/images/carousel/media_1791307310818.jpg",
    label: "FOUND ITEM",
    title: ["WIRELESS", "HEADPHONES"]
  },
  {
    id: 'fb-2',
    image: "/images/carousel/media_1791307320445.jpg",
    label: "LOST ITEM",
    title: ["STATIONERY", "POUCH"]
  },
  {
    id: 'fb-3',
    image: "/images/carousel/media_1791307329436.png",
    label: "FOUND ITEM",
    title: ["SCIENTIFIC", "CALCULATOR"]
  },
  {
    id: 'fb-4',
    image: "/images/carousel/media_1791307338815.jpg",
    label: "LOST ITEM",
    title: ["LEATHER", "WATCH"]
  },
  {
    id: 'fb-5',
    image: "/images/carousel/media_1791307345277.png",
    label: "FOUND ITEM",
    title: ["WIRED", "EARPHONES"]
  },
  {
    id: 'fb-6',
    image: "/images/carousel/media_1791308466128.jpg",
    label: "LOST ITEM",
    title: ["CASIO", "CALCULATOR"]
  },
  {
    id: 'fb-7',
    image: "/images/carousel/media_1791308466334.jpg",
    label: "FOUND ITEM",
    title: ["APPLE", "CHARGER"]
  },
  {
    id: 'fb-8',
    image: "/images/carousel/media_1791308466342.jpg",
    label: "LOST ITEM",
    title: ["WATER", "BOTTLE"]
  },
  {
    id: 'fb-9',
    image: "/images/carousel/media_1791308466347.jpg",
    label: "FOUND ITEM",
    title: ["MEN'S", "WATCH"]
  },
  {
    id: 'fb-10',
    image: "/images/carousel/media_1791308466318.jpg",
    label: "FOUND ITEM",
    title: ["APPLE", "EARPODS"]
  }
];
const categoryFallbackMap: Record<string, string> = {
  'ID & Access Cards': 'https://images.unsplash.com/photo-1589828131808-115acbd7f461?w=600&h=400&fit=crop&q=80',
  'Keys': 'https://images.unsplash.com/photo-1506804886640-20a271708892?w=600&h=400&fit=crop&q=80',
  'Wallets & Card Holders': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=400&fit=crop&q=80',
  'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop&q=80',
  'Books': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop&q=80',
  'Bags & Backpacks': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop&q=80',
  'Earphones & Headphones': '/images/carousel/media_1791307310818.jpg',
  'Chargers & Cables': '/images/carousel/media_1791308466334.jpg',
  'Calculators': '/images/carousel/media_1791307329436.png',
  'Laptops & Tablets': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&q=80',
  'Water Bottles & Flasks': '/images/carousel/media_1791308466342.jpg',
  'Spectacles': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=400&fit=crop&q=80',
  'Stationery': '/images/carousel/media_1791307320445.jpg',
  'USB & Storage Devices': 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&h=400&fit=crop&q=80',
  'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop&q=80',
  'Sports Equipment': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop&q=80',
  'Jewellery & Accessories': '/images/carousel/media_1791307338815.jpg',
  'Umbrellas': 'https://images.unsplash.com/photo-1559239855-3f309a6fc4ba?w=600&h=400&fit=crop&q=80',
  'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&q=80',
};

const getFallbackImageForCategory = (categoryName?: string) => {
  if (!categoryName) return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop&q=80';
  return categoryFallbackMap[categoryName] || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop&q=80';
};

export function HeroCarousel() {
  const [carouselSlides, setCarouselSlides] = useState<any[]>(fallbackImages);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(1200);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleResize = () => setScreenWidth(window.innerWidth);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    
    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', handleMotionChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        // Fetch recent active items (limit 20 to have enough selection)
        const res = await fetchApi('/items?limit=20&status=ACTIVE');
        const items = res?.items || [];
        
        if (items.length === 0) {
          setCarouselSlides(fallbackImages);
          return;
        }

        const uniqueItems = [];
        const seenIds = new Set();
        for (const item of items) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueItems.push(item);
          }
        }

        const mappedSlides = uniqueItems.map((item: any, idx: number) => {
          let titleStr = item.title || 'ITEM';
          let titleParts = titleStr.trim().toUpperCase().split(' ');
          let part1 = titleParts[0] || '';
          let part2 = titleParts.slice(1).join(' ');
          
          if (!part2 && part1.length > 12) {
            part2 = part1.substring(12);
            part1 = part1.substring(0, 12) + '-';
          }
          if (part1.length > 18) part1 = part1.substring(0, 18);
          if (part2.length > 25) part2 = part2.substring(0, 25) + '...';
          
          // Get correct fallback based on category
          const categoryName = item.category?.name || '';
          const categoryFallback = getFallbackImageForCategory(categoryName);

          return {
            id: item.id,
            image: getImageUrl(item.imageUrl) || null,
            fallbackImage: categoryFallback,
            label: item.type === 'LOST' ? 'LOST ITEM' : 'FOUND ITEM',
            title: [part1, part2].filter(Boolean),
            originalItem: item
          };
        });

        // Prioritize items with actual uploaded images
        const withImages = mappedSlides.filter((s: any) => s.image !== null);
        const withoutImages = mappedSlides.filter((s: any) => s.image === null).map((s: any) => ({
          ...s,
          image: s.fallbackImage // Resolve image field for those missing it
        }));

        const finalSlides = [...withImages, ...withoutImages];

        // Pad with fallback images if we have less than 8 items total to ensure carousel looks full
        if (finalSlides.length > 0 && finalSlides.length < 8) {
          let fallbackIndex = 0;
          while (finalSlides.length < 8) {
            const fallback = fallbackImages[fallbackIndex % fallbackImages.length];
            // Only add fallback padding if it's not a duplicate of an existing item
            finalSlides.push({
              ...fallback,
              id: `fallback-pad-${fallbackIndex}`
            });
            fallbackIndex++;
          }
        }

        setCarouselSlides(finalSlides.length > 0 ? finalSlides : fallbackImages);
      } catch (err) {
        console.error('Error fetching items for carousel:', err);
        setCarouselSlides(fallbackImages);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadItems();
  }, []);

  // Autoplay
  useEffect(() => {
    if (prefersReducedMotion || isLoading) return;
    
    const timer = setInterval(() => {
      setActiveIndex((prev: number) => prev + 1);
    }, 2400);
    
    return () => clearInterval(timer);
  }, [prefersReducedMotion, isLoading]);

  const getSlideStyle = (offset: number) => {
    const absOffset = Math.abs(offset);
    const isCenter = offset === 0;
    const sign = Math.sign(offset);
    
    let centerWidth = 600;
    let centerHeight = 400;
    let sideWidth = 170;
    let sideHeight = 290;
    let gap = 24;

    if (screenWidth < 768) {
      centerWidth = screenWidth - 60;
      centerHeight = centerWidth * (400/600);
      sideWidth = centerWidth * 0.4;
      sideHeight = centerHeight * 0.75;
      gap = 12;
    } else if (screenWidth < 1024) {
      centerWidth = 500;
      centerHeight = 333;
      sideWidth = 140;
      sideHeight = 240;
      gap = 20;
    }

    let x = 0;
    let zIndex = 20 - absOffset;
    let opacity = 1;
    let filter = 'brightness(1) saturate(1)';
    
    if (isCenter) {
      x = 0;
      opacity = 1;
    } else {
      const firstOffset = centerWidth / 2 + gap + sideWidth / 2;
      const additionalOffset = (absOffset - 1) * (sideWidth + gap);
      x = sign * (firstOffset + additionalOffset);
      
      opacity = Math.max(1 - (absOffset * 0.2), 0);
      filter = `brightness(${Math.max(1 - absOffset * 0.15, 0.4)}) saturate(${Math.max(1 - absOffset * 0.1, 0.5)})`;
    }
    
    if (absOffset > 3) {
      opacity = 0;
    }

    const transitionRule = prefersReducedMotion ? 'none' : 'all 550ms cubic-bezier(0.22, 1, 0.36, 1)';

    return {
      position: 'absolute' as const,
      left: '50%',
      top: '50%',
      transform: `translate(calc(-50% + ${x}px), -50%)`,
      width: `${isCenter ? centerWidth : sideWidth}px`,
      height: `${isCenter ? centerHeight : sideHeight}px`,
      opacity,
      filter,
      zIndex,
      transition: transitionRule,
      borderRadius: isCenter ? '24px' : '16px',
      boxShadow: isCenter ? '0 25px 50px -12px rgba(0,0,0,0.8)' : '0 10px 20px -10px rgba(0,0,0,0.2)',
    };
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-transparent flex items-center justify-center pt-4 md:pt-0">
        <div className="relative flex items-center justify-center w-full h-full opacity-60 animate-pulse">
          <div className="hidden lg:block absolute left-[15%] w-[170px] h-[290px] bg-[#E5E5E5] rounded-[16px]"></div>
          <div className="absolute w-[90%] md:w-[600px] h-[333px] md:h-[400px] bg-[#E5E5E5] rounded-[24px]"></div>
          <div className="hidden lg:block absolute right-[15%] w-[170px] h-[290px] bg-[#E5E5E5] rounded-[16px]"></div>
        </div>
      </div>
    );
  }

  const visibleIndices = Array.from({ length: 11 }, (_, i) => activeIndex - 5 + i);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-transparent flex items-center justify-center select-none pt-4 md:pt-0">
      
      {/* Carousel Track */}
      <div className="relative w-full h-full z-10 flex items-center justify-center">
        {visibleIndices.map(vIndex => {
          const slideIndex = ((vIndex % carouselSlides.length) + carouselSlides.length) % carouselSlides.length;
          const slide = carouselSlides[slideIndex];
          const offset = vIndex - activeIndex;
          const style = getSlideStyle(offset);
          const isCenter = offset === 0;

          return (
            <div 
              key={`${vIndex}-${slide.id}`} 
              style={style} 
              className="group overflow-hidden bg-[#F7F7F5]"
            >
              <img 
                src={slide.image} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out" 
                alt={slide.title.join(' ')} 
                draggable={false}
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const fallbackSrc = slide.fallbackImage || fallbackImages[vIndex % fallbackImages.length].image;
                  if (img.src !== fallbackSrc && !img.src.includes(fallbackSrc)) {
                    img.src = fallbackSrc;
                  }
                }}
              />
              
              <div 
                className="absolute inset-0 bg-black pointer-events-none transition-opacity" 
                style={{ opacity: isCenter ? 0 : 0.2, transitionDuration: '550ms' }} 
              />
              
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 pointer-events-none"
                style={{ 
                  opacity: isCenter ? 1 : 0, 
                  transition: prefersReducedMotion ? 'none' : 'opacity 550ms cubic-bezier(0.22, 1, 0.36, 1)' 
                }}
              >
                <p className="text-white/80 text-xs font-bold tracking-[0.2em] mb-2 uppercase"
                   style={{ transform: isCenter ? 'translateY(0)' : 'translateY(10px)', transition: prefersReducedMotion ? 'none' : 'transform 550ms ease-out' }}>
                  {slide.label}
                </p>
                <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight"
                    style={{ transform: isCenter ? 'translateY(0)' : 'translateY(10px)', transition: prefersReducedMotion ? 'none' : 'transform 550ms ease-out 50ms' }}>
                  {slide.title[0]}<br className={slide.title[1] ? 'block' : 'hidden'}/>{slide.title[1]}
                </h2>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
