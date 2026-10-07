'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { HeroCarousel } from '../components/HeroCarousel';
import { useAuth } from '../components/AuthProvider';

function ItemCard({ item }: { item: any }) {
  return (
    <Link href={`/items/${item.id}`} className="group block border border-[#E5E5E5] bg-white hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F5]">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#555555] text-sm uppercase tracking-widest">No Image</div>
        )}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-[#111111]">
          {item.category?.name || 'Item'}
        </div>
      </div>
      <div className="p-6 md:p-8">
        <p className="text-xs text-[#555555] tracking-[0.15em] uppercase mb-3 line-clamp-1">{item.venue?.name || 'VIT Campus'}</p>
        <h3 className="text-lg md:text-xl font-bold text-[#111111] mb-3 line-clamp-1">{item.title}</h3>
        <p className="text-sm text-[#555555] line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="mt-8 pt-5 border-t border-[#E5E5E5] flex justify-between items-center text-xs uppercase tracking-widest font-bold text-[#111111]">
          <span>View Details</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const lostRes = await fetchApi('/items?type=LOST');
        const foundRes = await fetchApi('/items?type=FOUND');
        if (lostRes?.items) setLostItems(lostRes.items.slice(0, 4));
        if (foundRes?.items) setFoundItems(foundRes.items.slice(0, 4));
      } catch (err) {
        console.error('Error fetching recent items:', err);
      }
    };
    loadItems();
  }, []);

  return (
    <div className="w-full min-h-screen bg-white selection:bg-[#111111] selection:text-white">
      
      {/* 1. TOP OF HOMEPAGE — MAIN HERO */}
      <section className="w-full min-h-[85vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 relative bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col items-center text-center">
          <p className="text-[#111111] text-xs font-bold tracking-[0.4em] mb-12 uppercase">whereInVIT</p>
          <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-extrabold text-[#111111] tracking-tighter leading-[0.85] mb-10">
            LOST IT?<br />FIND IT.
          </h1>
          <p className="text-[#555555] text-lg md:text-xl font-medium tracking-wide max-w-xl mb-16 leading-relaxed">
            A smarter Lost & Found experience<br className="hidden md:block" />built for the VIT campus.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link href="/items/new?type=LOST" className="w-full sm:w-auto bg-[#111111] text-white px-10 py-5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors border border-[#111111]">
              REPORT LOST ITEM
            </Link>
            <Link href="/items/new?type=FOUND" className="w-full sm:w-auto bg-white text-[#111111] px-10 py-5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#F7F7F5] transition-colors border border-[#E5E5E5] hover:border-[#111111]">
              REPORT FOUND ITEM
            </Link>
          </div>
        </div>
      </section>

      {/* WHITESPACE / SEPARATOR */}
      <div className="w-full h-16 md:h-24 bg-[#F7F7F5]"></div>

      {/* CAROUSEL SECTION INTRODUCTION */}
      <section className="w-full bg-[#F7F7F5] px-6 md:px-12 pb-16">
        <div className="max-w-[1600px] mx-auto text-center border-t border-[#E5E5E5] pt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111111] tracking-tight mb-4 uppercase">
            RECENTLY REPORTED<br className="md:hidden" />
            <span className="hidden md:inline"> — </span>LOST & FOUND
          </h2>
          <p className="text-[#555555] text-sm tracking-wide">
            A visual overview of items recently reported across the VIT campus.
          </p>
        </div>
      </section>

      {/* EDITORIAL IMAGE CAROUSEL SECTION */}
      <div className="bg-[#F7F7F5] pb-24 md:pb-32">
        <HeroCarousel />
      </div>

      {/* SECTION 1: LOST ITEMS */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <p className="text-[#555555] text-xs font-bold tracking-[0.25em] mb-4 uppercase">Missing on campus</p>
            <h2 className="text-4xl md:text-6xl font-extrabold text-[#111111] tracking-tight">LOST.</h2>
          </div>
          <Link href="/lost" className="mt-8 md:mt-0 text-xs font-bold tracking-widest uppercase text-[#111111] hover:text-[#555555] transition-colors border-b-2 border-[#111111] hover:border-[#555555] pb-1 inline-block">
            View All Lost Items
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {lostItems.map((item: any) => (
            <ItemCard key={item.id} item={item} />
          ))}
          {lostItems.length === 0 && (
            <p className="text-[#555555] col-span-full py-12 border border-[#E5E5E5] text-center uppercase tracking-widest text-sm font-semibold">No lost items reported recently.</p>
          )}
        </div>
      </section>

      {/* SECTION 2: FOUND ITEMS */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-[#E5E5E5]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <p className="text-[#555555] text-xs font-bold tracking-[0.25em] mb-4 uppercase">Discovered on campus</p>
            <h2 className="text-4xl md:text-6xl font-extrabold text-[#111111] tracking-tight">FOUND.</h2>
          </div>
          <Link href="/found" className="mt-8 md:mt-0 text-xs font-bold tracking-widest uppercase text-[#111111] hover:text-[#555555] transition-colors border-b-2 border-[#111111] hover:border-[#555555] pb-1 inline-block">
            View All Found Items
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {foundItems.map((item: any) => (
            <ItemCard key={item.id} item={item} />
          ))}
          {foundItems.length === 0 && (
            <p className="text-[#555555] col-span-full py-12 border border-[#E5E5E5] text-center uppercase tracking-widest text-sm font-semibold">No found items reported recently.</p>
          )}
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-24 md:py-40 bg-white border-y border-[#E5E5E5]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <p className="text-[#555555] text-xs font-bold tracking-[0.25em] mb-4 uppercase text-center">Process</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight text-center mb-20 md:mb-32">HOW WHEREINVIT WORKS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            {[
              { num: '01', title: 'REPORT', desc: 'Securely log your lost or found item with comprehensive details and images.' },
              { num: '02', title: 'VERIFY', desc: 'Our platform matches reports and requires rigorous proof of ownership.' },
              { num: '03', title: 'CONNECT', desc: 'Securely communicate to arrange a safe meeting directly on campus.' },
              { num: '04', title: 'RETURN', desc: 'Hand over the item and close the report successfully.' }
            ].map(step => (
              <div key={step.num} className="bg-white p-8 md:p-12 hover:bg-[#F7F7F5] transition-colors group">
                <span className="block text-5xl font-light text-[#E5E5E5] group-hover:text-[#111111] transition-colors mb-8 md:mb-12">{step.num}</span>
                <h3 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-[#111111] mb-4">{step.title}</h3>
                <p className="text-[#555555] text-sm md:text-base leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CAMPUS COVERAGE */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="mb-20">
          <p className="text-[#555555] text-xs font-bold tracking-[0.25em] mb-4 uppercase">Locations</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight">CAMPUS COVERAGE</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-16 gap-x-12">
          {[
            'ACADEMIC BLOCKS', 'HOSTELS', 'CENTRAL LIBRARY', 
            'FOOD & DINING', 'SPORTS & FITNESS', 'CAMPUS SPOTS'
          ].map(location => (
            <div key={location} className="border-t-2 border-[#111111] pt-6 group cursor-default">
              <h3 className="text-xl md:text-2xl font-bold text-[#111111] tracking-tight transition-transform group-hover:translate-x-2">{location}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: CALL TO ACTION */}
      <section className="py-32 md:py-48 bg-[#0D0D0D] text-white text-center px-6 border-t border-[#111111]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-24 md:gap-12">
          <div className="flex-1 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">LOST SOMETHING?</h2>
            <p className="text-white/60 mb-12 text-lg md:text-xl font-light">Report it so the community can help you find it.</p>
            <Link href="/items/new?type=LOST" className="inline-block bg-white text-[#111111] px-10 py-5 text-sm font-bold tracking-[0.2em] uppercase hover:bg-[#F7F7F5] hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Report Lost Item
            </Link>
          </div>
          
          <div className="w-full md:w-px h-px md:h-64 bg-white/20"></div>
          
          <div className="flex-1 text-left md:pl-12">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">FOUND SOMETHING?</h2>
            <p className="text-white/60 mb-12 text-lg md:text-xl font-light">Help return it to its rightful owner securely.</p>
            <Link href="/items/new?type=FOUND" className="inline-block bg-white text-[#111111] px-10 py-5 text-sm font-bold tracking-[0.2em] uppercase hover:bg-[#F7F7F5] hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Report Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E5E5E5] py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-[#555555] text-xs font-semibold tracking-widest uppercase">
        <p>© 2026 whereInVIT.</p>
        <p className="mt-4 md:mt-0">Designed for the VIT Campus.</p>
      </footer>
    </div>
  );
}
