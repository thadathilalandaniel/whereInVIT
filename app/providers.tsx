'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId || clientId === 'placeholder_client_id.apps.googleusercontent.com') {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID must be a real configured value for Google authentication to work. Please set it in .env.local.');
  }
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
