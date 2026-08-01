// API client helper sending httpOnly credentials and handling errors gracefully

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Check if token exists in localStorage fallback
  const token = localStorage.getItem('ai365_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // send httpOnly cookie
  });

  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = typeof data === 'object' && data.error ? data.error : 'An API error occurred.';
    throw new Error(errorMsg);
  }

  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    try {
      window.dispatchEvent(new CustomEvent('ai365_data_updated'));
      localStorage.setItem('ai365_last_update', Date.now().toString());
    } catch (e) {
      // ignore storage access errors if any
    }
  }

  return data as T;
}
