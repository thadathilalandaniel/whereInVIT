'use client';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Lost Items', href: '/lost' },
    { name: 'Found Items', href: '/found' },
  ];

  return (
    <nav className="bg-[#1a1a1a] shadow-sm border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center text-xl font-bold text-white">whereInVIT</Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`${pathname === link.href ? 'border-[#a3e635] text-white' : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            {profile ? (
              <div className="flex items-center space-x-6">
                <Link href="/items/new?type=LOST" className="text-sm font-medium text-gray-300 hover:text-white">Report Lost</Link>
                <Link href="/items/new?type=FOUND" className="text-sm font-medium text-gray-300 hover:text-white">Report Found</Link>
                <div className="flex items-center space-x-4 border-l border-[#333] pl-6">
                  <span className="text-sm text-gray-300">{profile.name}</span>
                  <button onClick={logout} className="text-sm font-medium text-[#a3e635] hover:text-[#b4f052]">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/" className="text-sm font-medium text-[#a3e635] hover:text-[#b4f052]">Log in</Link>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#333] focus:outline-none">
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#333]">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map(link => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`${pathname === link.href ? 'bg-[#333] border-[#a3e635] text-white' : 'border-transparent text-gray-400 hover:bg-[#222] hover:border-gray-500 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {profile ? (
            <div className="pt-4 pb-3 border-t border-[#333]">
              <div className="px-4 flex flex-col">
                <div className="text-base font-medium text-white">{profile.name}</div>
                <div className="text-sm font-medium text-gray-400">{profile.email}</div>
              </div>
              <div className="mt-3 space-y-1">
                <Link href="/items/new?type=LOST" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-[#333]">Report Lost</Link>
                <Link href="/items/new?type=FOUND" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-[#333]">Report Found</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-base font-medium text-[#a3e635] hover:text-[#b4f052] hover:bg-[#333]">Logout</button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-[#333]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-base font-medium text-[#a3e635] hover:text-[#b4f052] hover:bg-[#333]">Log in</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
