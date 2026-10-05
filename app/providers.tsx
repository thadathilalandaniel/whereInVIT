'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
  // Use the env var safely with a fallback so it's never an empty string 
  // if not configured, or allow it to be undefined to prevent the GSI logger error 
  // actually GSI logger requires it, so we provide the placeholder explicitly if missing.
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'placeholder_client_id.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
