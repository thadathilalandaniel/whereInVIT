export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
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
