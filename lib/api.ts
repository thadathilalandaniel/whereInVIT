export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function getImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  
  const host = API_BASE_URL.replace(/\/api$/, '');
  return `${host}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const headers = isFormData ? { ...options.headers } : { 'Content-Type': 'application/json', ...options.headers };
  const defaultOptions: RequestInit = {
    ...options,
    headers,
  };
  if (typeof window !== 'undefined') {
    defaultOptions.credentials = 'include';
  }
  const response = await fetch(url, defaultOptions);
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  if (response.status === 204) return null;
  return response.json();
}
