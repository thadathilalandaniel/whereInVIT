'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';
import { useState } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const nextPath = searchParams.get('next');

  // Validate next path is internal relative
  const isValidNext = nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//');
  const redirectUrl = isValidNext ? nextPath : '/';

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError(null);
      await fetchApi('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      await refreshAuth();
      router.push(redirectUrl as string);
    } catch (err: any) {
      if (err.message === 'Only @vitstudent.ac.in emails are allowed') {
        setError('Only @vitstudent.ac.in accounts are allowed.');
      } else {
        setError('Sign-in failed. Please use your @vitstudent.ac.in Google account.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6 selection:bg-[#111111] selection:text-white">
      <div className="w-full max-w-md bg-white border border-[#E5E5E5] p-8 md:p-12 shadow-2xl text-center">
        <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-[#111111] mb-2">whereInVIT</h1>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight mb-4">Sign in to continue</h2>
        <p className="text-sm text-[#555555] leading-relaxed mb-8">
          Use your VIT student Google account to continue.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Sign-in failed. Please try again.')}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <p className="text-[10px] font-bold tracking-widest text-[#555555] uppercase mt-8">
          Only @vitstudent.ac.in accounts are accepted.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center text-sm tracking-widest uppercase font-bold text-[#555555]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
