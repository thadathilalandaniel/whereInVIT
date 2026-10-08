'use client';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

export default function Navbar() {
  const { profile, logout, refreshAuth } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile) {
      const fetchUnreadCount = async () => {
        try {
          const res = await fetchApi('/notifications/unread-count');
          setUnreadCount(res.unreadCount || 0);
        } catch (error) {
          console.error('Failed to fetch unread count', error);
        }
      };
      fetchUnreadCount();
      // Optionally could set up an interval here, but sticking to simple fetch on mount/profile change
    } else {
      setUnreadCount(0);
    }
  }, [profile]);


  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Lost', href: '/lost' },
    { name: 'Found', href: '/found' },
  ];

  return (
    <nav className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center h-[72px] md:h-[88px]">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center text-xl font-bold tracking-tight text-[#111111] uppercase">whereInVIT</Link>
            <div className="hidden md:ml-16 md:flex md:space-x-12">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`${pathname === link.href ? 'text-[#111111] font-semibold' : 'text-[#555555] hover:text-[#111111] font-medium'} text-xs tracking-widest uppercase transition-colors`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex md:items-center">
            {profile ? (
              <div className="flex items-center space-x-10">
                <Link href="/notifications" className="relative text-xs font-semibold tracking-widest uppercase text-[#555555] hover:text-[#111111] transition-colors">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="absolute -top-3 -right-4 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/messages" className="text-xs font-semibold tracking-widest uppercase text-[#555555] hover:text-[#111111] transition-colors">Messages</Link>
                <Link href="/items/new?type=LOST" className="text-xs font-semibold tracking-widest uppercase text-[#555555] hover:text-[#111111] transition-colors">Report Lost</Link>
                <Link href="/items/new?type=FOUND" className="text-xs font-semibold tracking-widest uppercase text-[#555555] hover:text-[#111111] transition-colors">Report Found</Link>
                <div className="flex items-center space-x-8 border-l border-[#E5E5E5] pl-8">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold text-[#111111] leading-tight">{profile.name}</span>
                    <span className="text-xs text-[#555555]">{profile.email}</span>
                  </div>
                  <button onClick={logout} className="text-xs font-bold tracking-widest uppercase text-[#111111] hover:text-[#555555] transition-colors">Logout</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Link href="/login" className="text-xs font-bold tracking-[0.2em] uppercase text-[#111111] hover:text-[#555555] transition-colors">
                  LOGIN
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} type="button" className="inline-flex items-center justify-center p-2 text-[#111111] hover:bg-[#F7F7F5] rounded focus:outline-none transition-colors">
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-white absolute w-full shadow-2xl">
          <div className="pt-2 pb-4 space-y-1 px-6">
            {navLinks.map(link => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`${pathname === link.href ? 'text-[#111111] font-bold' : 'text-[#555555] font-medium'} block py-4 text-xs tracking-widest uppercase border-b border-[#F7F7F5]`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {profile ? (
            <div className="pt-6 pb-8 border-t border-[#E5E5E5] px-6 bg-[#F7F7F5]">
              <div className="flex flex-col mb-6">
                <div className="text-sm font-bold text-[#111111]">{profile.name}</div>
                <div className="text-sm text-[#555555]">{profile.email}</div>
              </div>
              <div className="space-y-4">
                <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#555555] hover:text-[#111111]">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold tracking-widest uppercase text-[#555555] hover:text-[#111111]">Messages</Link>
                <Link href="/items/new?type=LOST" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold tracking-widest uppercase text-[#555555] hover:text-[#111111]">Report Lost</Link>
                <Link href="/items/new?type=FOUND" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold tracking-widest uppercase text-[#555555] hover:text-[#111111]">Report Found</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block pt-4 mt-2 w-full text-left text-xs font-bold tracking-widest uppercase text-[#111111] hover:text-[#555555] border-t border-[#E5E5E5]">Logout</button>
              </div>
            </div>
          ) : (
            <div className="py-8 px-6 border-t border-[#E5E5E5] bg-[#F7F7F5] flex justify-center">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold tracking-[0.2em] uppercase text-[#111111]">
                LOGIN
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
