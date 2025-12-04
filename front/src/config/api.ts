// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const API_BASE = `${API_URL}/api`;

/**
 * Wrapper around fetch for API calls that ensures:
 * - Credentials are included for cookies
 * - /api prefix is added if not present
 * - URLs are absolute if they start with /
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
  let finalUrl = url;
  
  // Add /api prefix for relative paths without it
  if (url.startsWith('/') && !url.startsWith('/api/')) {
    finalUrl = `/api${url}`;
  }
  
  // Ensure credentials are included
  const finalOptions = {
    ...options,
    credentials: 'include' as const
  };
  
  return fetch(finalUrl, finalOptions);
}
