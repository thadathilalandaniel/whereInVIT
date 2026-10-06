'use client';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Lost Items', href: '/lost' },
    { name: 'Found Items', href: '/found' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16">
        <div className="flex">
          <Link href="/" className="flex-shrink-0 flex items-center text-xl font-bold text-gray-900">whereInVIT</Link>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} className={`${pathname === link.href ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>{link.name}</Link>
            ))}
          </div>
        </div>
        <div className="flex items-center">
          {profile ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{profile.name}</span>
              <Link href="/items/new" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md">Post Item</Link>
              <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-gray-700">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">Log in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
