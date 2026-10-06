'use client';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import { useState } from 'react';
import { fetchApi } from '../lib/api';

export default function Home() {
  const { profile, loading, refreshAuth } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setAuthError(null);
      await fetchApi('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      await refreshAuth();
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during login');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="animate-pulse h-12 w-12 bg-[#a3e635] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow px-4 sm:px-6 py-12">
      <div className="p-8 bg-white rounded-xl shadow-lg max-w-2xl w-full text-center border border-gray-100">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">whereIn<span className="text-[#84cc16]">VIT</span></h1>
        <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto">
          The official campus Lost & Found platform. <br className="hidden sm:block" />
          Lost it? Find where it is in VIT.
        </p>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {authError}
          </div>
        )}

        {profile ? (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {profile.name.split(' ')[0]}!</h2>
            <p className="text-gray-500 mb-8">{profile.email}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/items/new?type=LOST" 
                className="flex items-center justify-center px-6 py-4 border-2 border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#1a1a1a] hover:bg-[#333] transition-colors"
              >
                Report Lost Item
              </Link>
              <Link 
                href="/items/new?type=FOUND" 
                className="flex items-center justify-center px-6 py-4 border-2 border-[#1a1a1a] rounded-lg shadow-sm text-base font-medium text-[#1a1a1a] bg-white hover:bg-gray-50 transition-colors"
              >
                Report Found Item
              </Link>
              <Link 
                href="/lost" 
                className="flex items-center justify-center px-6 py-4 border border-gray-200 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Browse Lost Feed
              </Link>
              <Link 
                href="/found" 
                className="flex items-center justify-center px-6 py-4 border border-gray-200 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Browse Found Feed
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-6 font-medium">Please sign in with your VIT student account to continue</p>
            <div className="inline-block transform transition hover:scale-105 duration-200">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setAuthError('Google authentication cancelled or failed')}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
