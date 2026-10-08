'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push('/login?next=/admin');
      } else if (profile.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="text-sm font-semibold tracking-widest uppercase text-[#555555]">Authenticating...</div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Overview', href: '/admin' },
    { name: 'Items', href: '/admin/items' },
    { name: 'Reports', href: '/admin/reports' },
    { name: 'Claims', href: '/admin/claims' },
    { name: 'Users', href: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-[#E5E5E5] flex flex-col">
        <div className="p-6 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-bold tracking-widest uppercase text-[#111111]">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${
                  isActive 
                    ? 'bg-[#111111] text-white' 
                    : 'text-[#555555] hover:bg-[#F7F7F5] hover:text-[#111111]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
